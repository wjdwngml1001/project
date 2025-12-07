// frontend/src/pages/StudentCode.tsx
import { useEffect, useState } from 'react';
import { initBlockly, getWorkspace, currentXml } from '../blockly/bridge';
import { astFromWorkspace, toEntryProject } from '../blockly/generator';
import { connectSocket, tabId } from '../realtime/socket';
import * as Blockly from 'blockly';

type StoredPlan = {
  name: string;
  goal: string;
  summary: string;
  ast: any[];
  xml: string;
};

export default function StudentCode() {
  const [plan, setPlan] = useState<StoredPlan | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // 1) 학생 대시보드에서 저장해 둔 계획 읽기
    const raw = localStorage.getItem('studentPlan');
    let parsed: StoredPlan | null = null;
    if (raw) {
      try {
        parsed = JSON.parse(raw);
      } catch {
        parsed = null;
      }
    }
    if (!parsed) {
      parsed = {
        name: '',
        goal: '',
        summary: '',
        ast: [],
        xml: '',
      };
    }
    setPlan(parsed);

    // 2) Blockly 초기화
    const ws = initBlockly('blocklyDiv') as Blockly.WorkspaceSvg;
    setReady(true);

    // 저장된 AST가 있으면 간단히 다시 그려주기
    if (parsed.ast && Array.isArray(parsed.ast)) {
      parsed.ast.forEach((b: any) => {
        try {
          const block = ws.newBlock(b.type);
          if (b.fields) {
            Object.entries(b.fields).forEach(([k, v]) => {
              const f = block.getField(k);
              if (f) f.setValue(String(v));
            });
          }
          (block as any).initSvg?.();
          (block as any).render?.();
        } catch (e) {
          console.warn('블록 복원 중 오류', b, e);
        }
      });
    }

    // 3) 이름 결정 (입력한 이름 우선, 없으면 tabId 기반)
    const baseId = tabId();
    const studentName =
      parsed.name && parsed.name.trim()
        ? parsed.name.trim()
        : `학생-${baseId.slice(0, 8)}`;

    // 4) 소켓 연결 (학생 역할)
    const sock = connectSocket('student', '3A', studentName);

    // 5) 접속 시점에 현재 계획 정보를 서버에 한 번 보내기
    sock.emit('student:plan', {
      tabId: baseId,
      classId: '3A',
      name: studentName,
      goal: parsed.goal || '',
      summary: parsed.summary || '',
    });

    // 6) 주기적으로 블록 화면 썸네일을 교사에게 보냄
    const shot = setInterval(() => {
      const wsNow = getWorkspace() as Blockly.WorkspaceSvg | null;
      if (!wsNow) return;
      const svg = wsNow.getParentSvg();
      if (!svg) return;

      const xml = new XMLSerializer().serializeToString(svg);
      const svg64 = btoa(unescape(encodeURIComponent(xml)));
      const dataUrl = 'data:image/svg+xml;base64,' + svg64;

      sock.emit('student:thumb', {
        tabId: baseId,
        classId: '3A',
        name: studentName,
        thumb: dataUrl,
      });
    }, 4000);

    // 교사 공지 수신
    sock.on('announcement', (msg: string) => {
      alert('[교사 공지]\n\n' + msg);
    });

    return () => {
      clearInterval(shot);
      sock.off('announcement');
    };
  }, []);

  // 현재 워크스페이스 상태를 저장 + 서버에 알리기
  const onSavePlan = () => {
    const ws = getWorkspace() as Blockly.WorkspaceSvg | null;
    if (!ws) return;

    const ast = astFromWorkspace(ws);
    const xml = currentXml();

    const baseId = tabId();

    const newPlan: StoredPlan = {
      name: plan?.name || '',
      goal: plan?.goal || '',
      summary:
        plan?.summary ||
        (plan?.goal
          ? `${plan.goal} 목표에 맞게 블록 구성을 저장했습니다.`
          : '현재 블록 구성을 저장했습니다.'),
      ast,
      xml,
    };

    setPlan(newPlan);
    localStorage.setItem('studentPlan', JSON.stringify(newPlan));

    const studentName =
      newPlan.name && newPlan.name.trim()
        ? newPlan.name.trim()
        : `학생-${baseId.slice(0, 8)}`;

    const sock = connectSocket('student', '3A', studentName);
    sock.emit('student:plan', {
      tabId: baseId,
      classId: '3A',
      name: studentName,
      goal: newPlan.goal,
      summary: newPlan.summary,
    });

    alert('현재 계획이 저장되었습니다.');
  };

  // 엔트리 JSON 내보내기 (기존 기능 유지)
  const onDownloadEntryJson = () => {
    const ws = getWorkspace() as Blockly.WorkspaceSvg | null;
    if (!ws) return;

    const ast = astFromWorkspace(ws);
    const entryJson = toEntryProject(ast);

    const blob = new Blob([JSON.stringify(entryJson, null, 2)], {
      type: 'application/json',
    });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `entry_project_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const displayName = plan?.name?.trim() || '학생';

  return (
    <div style={{ padding: 16 }}>
      <h2>학생 코딩 (Blockly)</h2>

      <div style={{ marginBottom: 8, fontSize: 14 }}>
        <div>
          <b>{displayName}</b>의 목표:{' '}
          {plan?.goal && plan.goal.trim() ? plan.goal : '(목표 정보 없음)'}
        </div>
        <div>
          <b>요약 :</b>{' '}
          {plan?.summary && plan.summary.trim()
            ? plan.summary
            : '(AI 요약 결과가 아직 없습니다.)'}
        </div>
      </div>

      <div
        id="blocklyDiv"
        style={{
          width: '100%',
          height: '70vh',
          border: '1px solid #ddd',
          borderRadius: 8,
        }}
      />

      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        <button disabled={!ready} onClick={onSavePlan}>
          현재 계획 저장
        </button>
        <button disabled={!ready} onClick={onDownloadEntryJson}>
          엔트리 JSON 내보내기
        </button>
      </div>
    </div>
  );
}

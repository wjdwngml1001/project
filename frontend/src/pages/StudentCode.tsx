// frontend/src/pages/StudentCode.tsx
import { useEffect, useState } from 'react';
import * as Blockly from 'blockly';
import { initBlockly, getWorkspace } from '../blockly/bridge';
import { BlockNode } from '../blockly/blocks';
import { connectSocket, tabId } from '../realtime/socket';

type StoredPlan = {
  studentName: string;
  goalText: string;
  summary: string;
  ast: BlockNode[];
  xml?: string;
};

function applyAstToWorkspace(ws: Blockly.WorkspaceSvg, ast: BlockNode[]) {
  ws.clear();

  let x = 20;
  let y = 20;

  const buildChain = (
    node: BlockNode,
    attachConn?: Blockly.Connection | null,
    px = x,
    py = y,
  ): any => {
    const block = ws.newBlock(node.type) as any;
    if (!block) return null;

    // 필드 설정
    if (node.fields) {
      Object.entries(node.fields).forEach(([key, val]) => {
        try {
          block.setFieldValue(String(val), key);
        } catch {
          // 해당 필드 없는 블록이면 무시
        }
      });
    }

    block.initSvg();
    block.render();

    if (attachConn) {
      // 이전 블록과 연결
      attachConn.connect(block.previousConnection);
    } else {
      block.moveBy(px, py);
    }

    // 반복문 등 내부 블록 처리
    if (node.inner && block.getInput('DO')) {
      let innerNode: BlockNode | null | undefined = node.inner;
      let prevInnerBlock: any = null;
      const inputConn = block.getInput('DO')?.connection || null;

      while (innerNode) {
        const innerBlock = ws.newBlock(innerNode.type) as any;
        if (innerNode.fields) {
          Object.entries(innerNode.fields).forEach(([k, v]) => {
            try {
              innerBlock.setFieldValue(String(v), k);
            } catch {}
          });
        }
        innerBlock.initSvg();
        innerBlock.render();

        if (!prevInnerBlock) {
          // 첫 번째 내부 블록은 DO에 연결
          if (inputConn) {
            inputConn.connect(innerBlock.previousConnection);
          }
        } else {
          // 이후 블록은 앞 블록 아래에 연결
          prevInnerBlock.nextConnection?.connect(innerBlock.previousConnection);
        }

        prevInnerBlock = innerBlock;
        innerNode = innerNode.next || null;
      }
    }

    // 다음 블록 체인
    if (node.next) {
      buildChain(node.next, block.nextConnection, px, py + 80);
    }

    return block;
  };

  ast.forEach((node) => {
    buildChain(node, undefined, x, y);
    y += 120; // 다음 루트 블록은 아래쪽에 배치
  });
}

export default function StudentCode() {
  const [ready, setReady] = useState(false);
  const [name, setName] = useState<string>('');
  const [goal, setGoal] = useState<string>('');
  const [summary, setSummary] = useState<string>('');

  useEffect(() => {
    const ws = initBlockly('blocklyDiv');
    setReady(true);

    // 1) localStorage 에 저장된 계획 불러오기
    const stored = localStorage.getItem('currentPlan');
    if (stored) {
      try {
        const plan: StoredPlan = JSON.parse(stored);
        if (plan.studentName) setName(plan.studentName);
        if (plan.goalText) setGoal(plan.goalText);
        if (plan.summary) setSummary(plan.summary);
        if (plan.ast && Array.isArray(plan.ast)) {
          applyAstToWorkspace(ws, plan.ast);
        }
      } catch {
        // 파싱 실패 시 무시
      }
    }

    // 2) 소켓 연결 (student)
    const sock = connectSocket('student', '3A', '학생-' + tabId());

    // 주기적으로 상태 전송 (학생이 살아있다는 ping)
    const ping = setInterval(() => {
      const latest = localStorage.getItem('currentPlan');
      let goalText = goal;
      let sum = summary;
      if (latest) {
        try {
          const p: StoredPlan = JSON.parse(latest);
          if (p.goalText) goalText = p.goalText;
          if (p.summary) sum = p.summary;
        } catch {}
      }
      sock.emit('student:ping', {
        id: tabId(),
        name: name || '학생-' + tabId(),
        goal: goalText,
        summary: sum,
      });
    }, 5000);

    // 썸네일 전송 (교사 대시보드용)
    const shot = setInterval(() => {
      const w = getWorkspace() as any;
      if (!w) return;
      const svg = w.getParentSvg && w.getParentSvg();
      if (!svg) return;

      let xml = new XMLSerializer().serializeToString(svg);

      xml = xml.replace(/fill="#000000"/g,'fill="#ffffff"');
      
      const svg64 = btoa(unescape(encodeURIComponent(xml)));
      const dataUrl = 'data:image/svg+xml;base64,' + svg64;

      const latest = localStorage.getItem('currentPlan');
      let goalText = goal;
      let sum = summary;
      if (latest) {
        try {
          const p: StoredPlan = JSON.parse(latest);
          if (p.goalText) goalText = p.goalText;
          if (p.summary) sum = p.summary;
        } catch {}
      }

      sock.emit('student:thumb', {
        id: tabId(),
        name: name || '학생-' + tabId(),
        goal: goalText,
        summary: sum,
        thumb: dataUrl,
      });
    }, 4000);

    // 교사 공지 팝업
    sock.on('announcement', (msg: string) => {
      alert('[교사 공지]\n\n' + msg);
    });

    return () => {
      clearInterval(ping);
      clearInterval(shot);
      sock.off('announcement');
      // sock.disconnect() 는 라우트 이동할 때마다 연결 끊어버리니 사용하지 않음
    };
  }, []);

  const onSave = () => {
    const ws = getWorkspace();
    if (!ws) return;
    const dom = Blockly.Xml.workspaceToDom(ws);
    const xmlText = Blockly.Xml.domToText(dom);

    const latest = localStorage.getItem('currentPlan');
    let plan: StoredPlan = {
      studentName: name,
      goalText: goal,
      summary,
      ast: [],
      xml: xmlText,
    };

    if (latest) {
      try {
        const p = JSON.parse(latest);
        plan = {
          studentName: p.studentName || name,
          goalText: p.goalText || goal,
          summary: p.summary || summary,
          ast: p.ast || [],
          xml: xmlText,
        };
      } catch {
        // 무시
      }
    }

    localStorage.setItem('currentPlan', JSON.stringify(plan));
    alert('현재 블록 상태를 저장했습니다.');
  };

  const onDownloadJson = () => {
    const ws = getWorkspace();
    if (!ws) return;
    const dom = Blockly.Xml.workspaceToDom(ws);
    const xmlText = Blockly.Xml.domToText(dom);

    const data = {
      studentName: name,
      goalText: goal,
      summary,
      xml: xmlText,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `plan_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>학생 코딩 (Blockly)</h2>
      <div style={{ marginBottom: 8, fontSize: 14 }}>
        <div>
          <b>{name || '학생'}</b>의 목표
        </div>
        <div style={{ marginTop: 4 }}>목표: {goal || '(대시보드에서 입력)'}</div>
        <div style={{ marginTop: 4 }}>
          요약: {summary || 'AI 요약 결과가 없습니다. (대시보드에서 계획 생성 시 표시됩니다.)'}
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
        <button disabled={!ready} onClick={onSave}>
          현재 계획 저장
        </button>
        <button disabled={!ready} onClick={onDownloadJson}>
          현재 블록을 JSON으로 내보내기
        </button>
      </div>
    </div>
  );
}

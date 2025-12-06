// frontend/src/pages/StudentDashboard.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { connectSocket, tabId } from '../realtime/socket';

type BlockNode = {
  type: string;
  fields?: Record<string, string | number>;
  next?: BlockNode | null;
  inner?: BlockNode | null;
};

function makePlanAst(goal: string): BlockNode[] {
  const lower = goal.toLowerCase();
  const ast: BlockNode[] = [];

  // 1) 시작 블록
  if (goal.includes('스페이스') || lower.includes('space')) {
    ast.push({
      type: 'event_when_key_pressed',
      fields: { KEY: 'space' },
      next: null,
    });
  } else {
    ast.push({
      type: 'event_when_flag_clicked',
      fields: {},
      next: null,
    });
  }

  // 2) 몸통 부분
  const body: BlockNode[] = [];

  if (goal.includes('인사') || goal.includes('안녕') || lower.includes('hello')) {
    body.push({
      type: 'looks_say',
      fields: { TEXT: '안녕!' },
    });
  }

  if (goal.includes('반복') || goal.includes('계속') || lower.includes('repeat')) {
    const inner: BlockNode = body.length
      ? { ...body[0], next: null }
      : {
          type: 'motion_movesteps',
          fields: { STEPS: 10 },
        };

    ast[0].next = {
      type: 'control_repeat',
      fields: { TIMES: 10 },
      inner,
      next: null,
    };
  } else {
    if (!ast[0].next && body.length) {
      ast[0].next = { ...body[0], next: null };
    }
  }

  return ast;
}

function makeSummary(goal: string): string {
  if (!goal.trim()) return '학습 목표가 입력되지 않았습니다.';
  return `입력한 목표를 바탕으로, 스프라이트가 "${goal}"를 수행할 수 있도록 기본 시작 블록과 말하기/이동/반복 구조를 추천합니다.`;
}

export default function StudentDashboard() {
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [suggestText, setSuggestText] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // 최초 한 번만 student 소켓 연결(있다면 재사용)
    const sock = connectSocket('student', '3A', '학생-' + tabId());
    // 굳이 핑은 StudentCode에서 보내도 되고, 여기선 계획만 전송
    return () => {
      // 여기서는 disconnect 하지 않음 (탭 살아있는 동안 유지)
      sock.off('announcement');
    };
  }, []);

  const onGenerate = () => {
    if (!name.trim()) {
      alert('학생 이름을 입력해 주세요.');
      return;
    }
    if (!goal.trim()) {
      alert('학습 목표를 입력해 주세요.');
      return;
    }

    const ast = makePlanAst(goal);
    const summary = makeSummary(goal);

    // 학생에게 보일 "자연어 요약"
    setSuggestText(summary);

    // localStorage에 현재 계획 저장 → StudentCode에서 불러와서 블록 세팅
    const plan = { studentName: name, goalText: goal, summary, ast };
    localStorage.setItem('currentPlan', JSON.stringify(plan));

    // 교사에게도 현재 학생 상태(이름/목표/요약)를 소켓으로 전송
    const sock = connectSocket('student', '3A', '학생-' + tabId());
    sock.emit('student:plan', {
      id: tabId(),
      name,
      goal,
      summary,
    });

    // 바로 코딩 화면으로 이동
    navigate('/student/code');
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>학생 대시보드</h2>

      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: 8 }}>
            이름
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: '100%', marginTop: 4 }}
              placeholder="예: 홍길동"
            />
          </label>

          <label style={{ display: 'block', marginBottom: 8 }}>
            오늘의 학습 목표(자연어로 적어보세요)
            <textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              style={{ width: '100%', height: 120, marginTop: 4 }}
              placeholder='예: "스페이스바를 누르면 고양이가 안녕이라고 말하게 만들고 싶어요."'
            />
          </label>

          <button onClick={onGenerate}>계획 생성 & 코딩 시작하기</button>
        </div>

        <div style={{ flex: 1 }}>
          <h4>AI 계획 요약</h4>
          <div
            style={{
              border: '1px solid #ddd',
              borderRadius: 8,
              padding: 8,
              minHeight: 120,
              background: '#fafafa',
              fontSize: 14,
            }}
          >
            {suggestText || '계획을 생성하면 여기에서 요약과 추천 전략이 보입니다.'}
          </div>
        </div>
      </div>
    </div>
  );
}

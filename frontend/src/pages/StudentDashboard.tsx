// frontend/src/pages/StudentDashboard.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

type PlanBlock = {
  type: string;
  fields?: Record<string, any>;
};

// ── 규칙 기반 fallback 계획 ─────────────────────
//  (LLM 실패하거나 서버가 규칙 기반으로 응답했을 때 사용)
function makeFallbackPlan(goal: string, name: string): {
  summary: string;
  blocks: PlanBlock[];
} {
  const g = goal || '고양이가 인사하는 프로그램';

  let blocks: PlanBlock[] = [];

  if (g.includes('스페이스') || g.includes('스페이스바')) {
    blocks = [
      { type: 'event_when_key_pressed', fields: { KEY: 'SPACE' } },
    ];
  } else if (g.includes('오른쪽') || g.includes('시계')) {
    // ✅ blocks.ts 의 타입 이름과 맞춤
    blocks = [
      { type: 'event_when_flag_clicked' },
      { type: 'motion_turn_right', fields: { DEG: 90 } },
    ];
  } else if (g.includes('반복') || g.includes('여러 번')) {
    blocks = [
      { type: 'event_when_flag_clicked' },
      { type: 'control_repeat', fields: { TIMES: 10 } },
      { type: 'motion_movesteps', fields: { STEPS: 10 } },
    ];
  } else {
    blocks = [
      { type: 'event_when_flag_clicked' },
    ];
  }

  const summary =
    `${name || '학생'}의 자연어 목표를 간단 규칙으로 분석하여 ` +
    `시작 블록과 기본 동작 블록을 추천했습니다. ` +
    `필요한 움직임/생김새/흐름 블록은 왼쪽 카테고리에서 직접 찾아 사용해 보세요.`;

  return { summary, blocks };
}

// ── LLM 호출 함수 ───────────────────────────────
const BASE =
  import.meta.env.VITE_REALTIME_URL || 'http://localhost:7070';

async function callNl2Plan(name: string, goal: string) {
  try {
    const res = await fetch(`${BASE}/api/nl2plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, goal }),
    });

    if (!res.ok) {
      throw new Error(`status ${res.status}`);
    }

    const data = await res.json();
    if (!data || !Array.isArray(data.blocks)) {
      throw new Error('invalid data');
    }

    // 혹시 LLM이 KEY를 "space" 같이 소문자로 줄 수도 있으니 한 번 정규화
    data.blocks.forEach((b: any) => {
      if (b.type === 'event_when_key_pressed' && b.fields?.KEY) {
        const v = String(b.fields.KEY).toLowerCase();
        if (v === 'space' || v === '스페이스바' || v === '스페이스') {
          b.fields.KEY = 'SPACE';
        } else if (v === 'up' || v === '위' || v === '위쪽 화살표') {
          b.fields.KEY = 'UP';
        } else if (v === 'down' || v === '아래' || v === '아래쪽 화살표') {
          b.fields.KEY = 'DOWN';
        } else if (v === 'left' || v === '왼쪽 화살표') {
          b.fields.KEY = 'LEFT';
        } else if (v === 'right' || v === '오른쪽 화살표') {
          b.fields.KEY = 'RIGHT';
        }
      }
    });

    return {
      summary: data.summary as string,
      blocks: data.blocks as PlanBlock[],
    };
  } catch (e) {
    console.warn('LLM 호출 실패, 규칙 기반으로 대체', e);
    return null;
  }
}

export default function StudentDashboard() {
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onGeneratePlan = async () => {
    if (!goal.trim()) {
      alert('학습 목표를 입력해 주세요.');
      return;
    }

    setLoading(true);

    // 1) LLM 먼저 시도
    const llmResult = await callNl2Plan(name, goal);

    const { summary, blocks } =
      llmResult ?? makeFallbackPlan(goal, name);

    // 2) StudentCode / Teacher 공통으로 쓰는 저장 형식
    const stored = {
      name,
      goal,
      summary,
      ast: blocks,
      xml: '',
    };
    localStorage.setItem('studentPlan', JSON.stringify(stored));

    setLoading(false);
    navigate('/student/code');
  };

  return (
    <div style={{ padding: 16, maxWidth: 800, margin: '0 auto' }}>
      <h2>학생 대시보드</h2>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          marginTop: 12,
          marginBottom: 24,
        }}
      >
        <div>
          <label style={{ display: 'block', marginBottom: 4 }}>이름</label>
          <input
            style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
            placeholder="이름을 입력하세요."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 4 }}>학습 목표 (자연어)</label>
          <textarea
            style={{
              width: '100%',
              minHeight: 80,
              padding: 8,
              borderRadius: 4,
              border: '1px solid #ccc',
              resize: 'vertical',
            }}
            placeholder="예) 스페이스바를 누르면 고양이가 '안녕'이라고 말하게 만들고 싶어요."
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
          />
        </div>

        <button
          onClick={onGeneratePlan}
          disabled={loading}
          style={{
            padding: '10px 16px',
            borderRadius: 6,
            border: 'none',
            background: loading ? '#9ca3af' : '#2563eb',
            color: '#fff',
            fontWeight: 600,
            cursor: loading ? 'default' : 'pointer',
          }}
        >
          {loading ? 'AI가 계획을 만드는 중…' : '계획 생성하고 코딩 화면으로 이동'}
        </button>
      </div>

      <p style={{ fontSize: 13, color: '#666' }}>
        ※ 현재는 OpenAI LLM을 우선 사용하여 "시작 블록"과 추천 카테고리를 생성하고,
        실패 시 간단한 규칙 기반 계획으로 대체합니다.
      </p>
    </div>
  );
}

// frontend/src/pages/StudentDashboard.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

type PlanBlock = {
  type: string
  fields?: Record<string, any>
}

/** 간단 규칙 기반 계획 생성 (HTTP / LLM 없이도 항상 동작) */
function makeFallbackPlan(goal: string, name: string): {
  summary: string
  blocks: PlanBlock[]
} {
  const g = goal || '고양이가 인사하는 프로그램'

  let blocks: PlanBlock[] = []

  if (g.includes('스페이스') || g.includes('스페이스바')) {
    // 스페이스바 입력 → 키 이벤트 + 말하기
    blocks = [
      { type: 'event_when_key_pressed', fields: { KEY: 'space' } },
      { type: 'looks_say', fields: { TEXT: '안녕!' } },
    ]
  } else if (g.includes('오른쪽') || g.includes('시계')) {
    // 회전 관련 목표
    blocks = [
      { type: 'event_when_flag_clicked' },
      { type: 'control_repeat', fields: { TIMES: 4 } },
      { type: 'motion_turnright', fields: { DEG: 90 } },
    ]
  } else if (g.includes('반복') || g.includes('여러 번')) {
    blocks = [
      { type: 'event_when_flag_clicked' },
      { type: 'control_repeat', fields: { TIMES: 10 } },
      { type: 'motion_movesteps', fields: { STEPS: 10 } },
    ]
  } else {
    // 기본 인사 시나리오
    blocks = [
      { type: 'event_when_flag_clicked' },
      { type: 'looks_say', fields: { TEXT: '시작!' } },
    ]
  }

  const summary =
    `${name || '학생'}의 자연어 목표를 분석하여 ` +
    `이벤트 블록과 움직임/생김새 블록을 중심으로 기본 구조를 구성했습니다.`

  return { summary, blocks }
}

export default function StudentDashboard() {
  const [name, setName] = useState('')
  const [goal, setGoal] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const onGeneratePlan = async () => {
    if (!goal.trim()) {
      alert('학습 목표를 입력해 주세요.')
      return
    }

    setLoading(true)

    // === 1) LLM 없이 로컬 규칙 기반으로 항상 계획 생성 ===
    const { summary, blocks } = makeFallbackPlan(goal, name)

    // === 2) StudentCode / Teacher가 함께 쓰는 plan 저장 ===
    const stored = {
      name,
      goal,
      summary,
      ast: blocks,
      xml: '', // 실제 블록을 찍은 후에 StudentCode에서 다시 저장 가능
    }
    localStorage.setItem('studentPlan', JSON.stringify(stored))

    // UX상 살짝 딜레이 후 이동 (로딩 느낌만)
    setTimeout(() => {
      setLoading(false)
      navigate('/student/code')
    }, 400)
  }

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
        ※ 현재 프로토타입은 간단한 규칙 기반으로 블록 계획을 자동 생성합니다.
        추후 OpenAI API 등을 연동하여 실제 LLM이 계획과 블록 구조를 생성하도록 확장할 수 있습니다.
      </p>
    </div>
  )
}

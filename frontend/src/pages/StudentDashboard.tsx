import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../store'
import { getSocket } from '../realtime/socket'
import Toast from '../components/Toast'

export default function StudentDashboard() {
  const [goal, setGoal] = useState('')
  const [toast, setToast] = useState<string|null>(null)
  const nav = useNavigate()
  const [suggestions, setSuggestions] = useState<string[]>([]); // ✅ 이렇게 useState로
  const [input, setInput] = useState("");

  const onGenerate = () => {
    if (!goal.trim()) { setToast('학습 목표를 입력해주세요.'); return }
    // 매우 단순한 11주차 DSL 샘플: 이동/말하기/반복 문장 키워드 기반
    const text = goal.toLowerCase()
    const blocks: { block:string; params:any[] }[] = [{ block:'when_start', params:[] }]

    const moveMatch = text.match(/(\d+)\s*(칸|step|걸음|앞으로)/) || text.match(/앞으로\s*(\d+)\s*칸/)
    const sayMatch = text.match(/(안녕|hello|말해|인사)/)
    const repeatMatch = text.match(/(\d+)\s*번\s*반복|repeat\s*(\d+)/)
    const generated = [`${input} 실습 예제`, `${input} 퀴즈`, `${input} 복습문제`];
    if (repeatMatch) {
      const n = Number(repeatMatch[1] || repeatMatch[2] || 3)
      blocks.push({ block:'repeat', params:[n] })
    }
    if (moveMatch) {
      const steps = Number(moveMatch[1] || 10)
      blocks.push({ block:'move_steps', params:[steps] })
    }
    if (sayMatch) {
      blocks.push({ block:'say', params:['안녕!', 2] })
    }

    if (blocks.length === 1) {
      // 기본 추천
      blocks.push({ block:'move_steps', params:[10] })
      blocks.push({ block:'say', params:['안녕!', 2] })
    }

    setSuggestions(generated);
    getSocket()?.emit('student:goal', { goal, blocks })
    setToast('목표에 맞는 추천 블록이 생성되었습니다!')
  }

  return (
    <div className="sd-layout">
      <section className="sd-left">
        <h2 style={{ fontSize:'1.2rem', margin:0, marginBottom:8 }}>🧠 학습 목표 입력</h2>
        <p className="muted" style={{ fontSize:'.9rem', marginTop:0, marginBottom:10 }}>
          예: “고양이가 앞으로 10칸 이동하고 인사하기”
        </p>

        <textarea
          className="sd-textarea"
          value={goal}
          onChange={(e)=>setGoal(e.target.value)}
          placeholder="학습 목표를 입력하세요..."
        />
        <div style={{ textAlign:'right', marginTop:10 }}>
          <button className="sd-btn" onClick={onGenerate}>🎯 계획 생성</button>
        </div>
      </section>

      <section className="sd-right">
        <div>
          <div className="panel-header">📊 학습 진행 요약</div>
          <ul style={{ fontSize:'.9rem', lineHeight:1.6, paddingLeft:18, margin:0, marginTop:8 }}>
            <li>최근 학습: 반복문 기초</li>
            <li>진도율: 80%</li>
            <li>다음 과제: 변수 만들기</li>
          </ul>
        </div>
        <button className="go" onClick={()=>nav('/student/code')}>▶ 블록 코딩으로 이동</button>
      </section>

      {toast && <Toast text={toast} />}
    </div>
  )
}

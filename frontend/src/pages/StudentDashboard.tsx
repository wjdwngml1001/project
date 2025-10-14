import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../store'
import ToDoCard from '../components/ToDoCard'
import { plan } from '../api/mock'
import { useEffect } from 'react'
import { connectSocket, getSocket } from '../realtime/socket'
import Toast from '../components/Toast'

const [toast, setToast] = useState<string|null>(null)
useEffect(()=>{
  const s = getSocket()
  const handler = (p:any) => setToast(p.message)
  s?.on('broadcast', handler)
  return () => { s?.off('broadcast', handler) }
}, [])


export default function StudentDashboard() {
  const classId = '3A'
  const studentId = 'S01'

  useEffect(() => {
    const s = connectSocket('student', classId, studentId)
    s.emit('student:state', { classId, studentId, screen: 'dashboard', status: 'ok' })
  }, [])
  
  const nav = useNavigate()
  const { nl, level, setNL, setLevel, tasks, suggestions, setPlan } = useApp()
  const [loading, setLoading] = useState(false)
  const [hint, setHint] = useState<string | null>(null)

  async function onConvert() {
    setLoading(true)
    const res = await plan(nl, level)
    setPlan(res.tasks, res.suggestions)
    setLoading(false)
    setHint('계획이 생성되었습니다. 이제 코딩 화면에서 조립을 시작해 보세요!')
  }

  return (
    <div className="container">
      <div className="left">
        <div className="h1">학생 대시보드 (계획/추천/힌트)</div>

        <div className="card">
          <div className="small">자연어 입력</div>
          <textarea className="input" rows={4} value={nl} onChange={e=>setNL(e.target.value)} />
          <div className="row" style={{marginTop:8}}>
            <select className="badge" value={level} onChange={e=>setLevel(e.target.value as any)}>
              <option value="A">레벨 A(저학년)</option>
              <option value="B">레벨 B(고학년)</option>
            </select>
            <button className="btn" onClick={onConvert} disabled={loading}>
              {loading ? '변환 중…' : '계획 만들기'}
            </button>
            <button className="btn" onClick={()=>nav('/student/code')}>코딩하러 가기 →</button>
          </div>
          {hint && <div className="small" style={{marginTop:8}}>{hint}</div>}
        </div>

        <div className="card">
          <div className="small">할 일 카드</div>
          {tasks.length===0 && <div className="small">계획 만들기를 먼저 실행하세요.</div>}
          {tasks.map((t,i)=><ToDoCard key={t.id} text={`${i+1}. ${t.text}`} done={false} />)}
        </div>
      </div>

      <div className="right">
        <div className="h1">추천 블록(미리 보기)</div>
        <div className="card">
          <div className="small">다음 화면에서 조립하게 됩니다.</div>
          <div className="row" style={{marginTop:8}}>
            {suggestions.length===0
              ? <span className="small">계획 생성 후 확인됩니다.</span>
              : suggestions.map((s,i)=>(
                <span key={i} className="badge">
                  {s.block==='when_start'?'시작(깃발)':
                   s.block==='move_steps'?`이동(${s.params[0]})`:
                   `말하기("${s.params[0]}", ${s.params[1]}s)`}
                </span>
              ))
            }
          </div>
          <div className="small" style={{marginTop:8}}>힌트: 반복되는 동작이 3회 이상이면 ‘반복’으로 묶어 보세요.</div>
        </div>
      </div>
    </div>
  )
}

// JSX 하단에:
{toast && <Toast text={toast} />}
import { useEffect, useMemo, useState } from "react"
import { connectSocket } from "../realtime/socket"

type LogItem = { sid:string; type:string; time:number; meta?:any }
type StudentState = { sid:string; screen:string; status:string; time:number }

export default function Teacher() {
  const [broadcast, setBroadcast] = useState("")
  const [logs, setLogs] = useState<LogItem[]>([])
  const [states, setStates] = useState<Record<string, StudentState>>({})

  const s = useMemo(()=>connectSocket('teacher', '3A', 'T01'), [])
  useEffect(()=>{
    s.on('student:state', (st:StudentState)=>{
      setStates(prev=>({...prev, [st.sid]: st}))
    })
    s.on('student:log', (lg:LogItem)=>{
      setLogs(prev=>[lg, ...prev].slice(0,200))
    })
    return ()=>{ s.off('student:state'); s.off('student:log') }
  }, [s])

  function sendBroadcast() {
    if(!broadcast.trim()) return
    s.emit('teacher:broadcast', { classId:'3A', message:broadcast })
    setBroadcast("")
  }

  const list = Object.values(states).sort((a,b)=>b.time-a.time)

  return (
    <div className="teacher-layout">
      {/* 좌측: 반/방송/요약 */}
      <section className="panel t-left">
        <div className="panel-header">방송 메시지</div>
        <textarea
          className="tinyarea"
          placeholder="예: 모두 코드 실행을 멈추고 스택을 점검해 보세요."
          value={broadcast}
          onChange={e=>setBroadcast(e.target.value)}
        />
        <button className="btn wide" onClick={sendBroadcast}>📢 방송 보내기</button>

        <div className="panel-header" style={{marginTop:12}}>실시간 학생 수</div>
        <div className="metric">{list.length} 명</div>

        <div className="panel-header" style={{marginTop:12}}>최근 로그 Top 8</div>
        <div className="loglist">
          {logs.slice(0,8).map((l,i)=>(
            <div key={i} className="logrow">
              <span className="tag">{l.sid}</span>
              <span className="muted">{l.type}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 우측: 학생 그리드 */}
      <section className="panel t-right">
        <div className="panel-header">학생 화면 현황</div>
        <div className="grid">
          {list.map(st=>(
            <div key={st.sid} className="tile">
              <div className="tile-top">
                <span className="tag">{st.sid}</span>
                <span className={`badge ${st.screen==='code'?'blue':'gray'}`}>{st.screen}</span>
              </div>
              <div className="muted">{new Date(st.time).toLocaleTimeString()}</div>
              <div className="muted small">상태: {st.status}</div>
              <button className="btn tiny" onClick={()=>s.emit('teacher:focus', {sid:st.sid})}>화면 보기</button>
            </div>
          ))}
          {list.length===0 && <div className="muted">아직 접속한 학생이 없습니다.</div>}
        </div>
      </section>
    </div>
  )
}

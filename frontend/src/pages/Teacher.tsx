import { useEffect, useState } from 'react'
import { connectSocket } from '../realtime/socket'

export default function Teacher() {
  const [data, setData] = useState<any>({ thumbnails: [], misconceptions: [] })
  const [msg, setMsg] = useState('반복되는 동작은 반복 블록으로 묶어보세요!')
  const classId = '3A'

  useEffect(() => {
    const s = connectSocket('teacher', classId)
    s.on('connected', () => {
      // 연결 직후 별도 작업 필요시 작성
    })
    s.on('overview', (payload) => {
      setData(payload)
    })
    s.on('student:update', (u) => {
      // 선택: 수신 즉시 UI 반영(overview 주기 브로드캐스트가 있으므로 없어도 됨)
      setData((prev:any) => {
        const thumbs = [...(prev.thumbnails||[])]
        const idx = thumbs.findIndex((t:any)=>t.studentId===u.studentId)
        if (idx>=0) thumbs[idx] = { ...thumbs[idx], screen: u.screen, status: u.status }
        else thumbs.push({ studentId: u.studentId, screen: u.screen, status: u.status||'ok' })
        return { ...prev, thumbnails: thumbs }
      })
    })
    s.on('presence', (p) => {
      // join/leave 이벤트 반영(선택)
    })
    return () => {
      s.off('overview')
      s.off('student:update')
      s.off('presence')
    }
  }, [])

  function sendBroadcast() {
    const s = connectSocket('teacher', classId)
    s.emit('teacher:broadcast', { classId, message: msg })
    alert('학생들에게 공지가 전송되었습니다.')
  }

  return (
    <div style={{padding:16}}>
      <div className="h1">교사 대시보드 (실시간)</div>

      <div className="card">
        <div className="small">오개념 히트맵(요약)</div>
        <div className="row">
          {(data.misconceptions||[]).map((m:any)=>
            <span key={m.type} className="badge">
              {m.type==='repeat_missing'?'반복누락': m.type==='coord_confused'?'좌표혼동':'조건내부비어있음'}: <b>{m.count}</b>
            </span>
          )}
        </div>
      </div>

      <div className="card">
        <div className="small">학생 썸네일(실시간 상태)</div>
        <div className="grid">
          {(data.thumbnails||[]).map((t:any)=>
            <div key={t.studentId} className="thumb">
              {t.studentId} · {t.status==='ok'?'✅':(t.status==='slow'?'⏳':'⚠️')}
              <span style={{marginLeft:6, fontSize:11, color:'#475569'}}>
                ({t.screen==='code'?'코딩':'대시보드'})
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="small">브로드캐스트</div>
        <div className="row">
          <input className="input" value={msg} onChange={e=>setMsg(e.target.value)} />
          <button className="btn" onClick={sendBroadcast}>보내기</button>
        </div>
        <div className="small" style={{marginTop:8}}>
          ※ 학생 측에서는 토스트로 수신되게 연결하세요(예: StudentCode/StudentDashboard에서 'broadcast' 수신 시 Toast 표시).
        </div>
      </div>
    </div>
  )
}

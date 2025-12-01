import { useEffect, useState } from 'react'
import { connectSocket } from '../realtime/socket'

type StudentInfo = { id: string; name: string; lastSeen: number; thumb?: string }

export default function Teacher() {
  const [list, setList] = useState<StudentInfo[]>([])
  const [count, setCount] = useState(0)
  const [focus, setFocus] = useState<StudentInfo | null>(null)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    const sock = connectSocket('teacher', '3A')
    sock.on('presence', (snap: {count:number; students: StudentInfo[]}) => {
      setCount(snap.count)
      setList(snap.students.sort((a,b)=> (b.lastSeen - a.lastSeen)))
    })
    return () => { sock.off('presence') }
  }, [])

  const onSend = () => {
    const sock = connectSocket('teacher', '3A')
    if (!msg.trim()) return
    sock.emit('announcement', msg.trim())
    setMsg('')
  }

  return (
    <div style={{ padding:16 }}>
      <h2>교사 대시보드</h2>
      <div style={{display:'flex', gap:12, alignItems:'center', marginBottom:12}}>
        <b>현재 접속 학생 수: {count}</b>
        <input value={msg} onChange={e=>setMsg(e.target.value)} placeholder="공지 내용 입력" style={{flex:1}} />
        <button onClick={onSend}>공지 보내기</button>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px,1fr))', gap:12}}>
        {list.map(s => (
          <div key={s.id} onClick={()=> setFocus(s)}
               style={{border:'1px solid #ddd', borderRadius:8, padding:8, cursor:'pointer', background:'#fff'}}>
            <div style={{fontWeight:600, marginBottom:6}}>{s.name} <span style={{fontSize:12, opacity:.6}}>({s.id.slice(0,6)})</span></div>
            <div style={{height:140, display:'flex', alignItems:'center', justifyContent:'center', background:'#f8fafc', borderRadius:6}}>
              {s.thumb ? <img src={s.thumb} alt="thumb" style={{maxWidth:'100%', maxHeight:'100%'}}/> : <span style={{fontSize:12, color:'#64748b'}}>썸네일 없음</span>}
            </div>
            <div style={{fontSize:12, opacity:.7, marginTop:6}}>last seen: {new Date(s.lastSeen).toLocaleTimeString()}</div>
          </div>
        ))}
      </div>

      {focus && (
        <div onClick={()=>setFocus(null)} style={{
          position:'fixed', inset:0, background:'rgba(0,0,0,.45)', display:'flex', alignItems:'center', justifyContent:'center'
        }}>
          <div style={{background:'#fff', padding:12, borderRadius:8, maxWidth:'90vw', maxHeight:'90vh'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8}}>
              <b>{focus.name} 화면</b>
              <button onClick={()=>setFocus(null)}>닫기</button>
            </div>
            {focus.thumb ? <img src={focus.thumb} style={{maxWidth:'85vw', maxHeight:'80vh'}}/> : <div>썸네일 없음</div>}
          </div>
        </div>
      )}
    </div>
  )
}

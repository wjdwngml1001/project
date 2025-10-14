import { useNavigate } from 'react-router-dom'
import { useApp } from '../store'
import BlockChip from '../components/BlockChip'
import Toast from '../components/Toast'
import { useState } from 'react'
import { useEffect } from 'react'
import { connectSocket, getSocket } from '../realtime/socket'

const [toast, setToast] = useState<string|null>(null)
useEffect(()=>{
  const s = getSocket()
  const handler = (p:any) => setToast(p.message)
  s?.on('broadcast', handler)
  return () => { s?.off('broadcast', handler) }
}, [])


export default function StudentCode() {
  const classId = '3A'
  const studentId = 'S01'

  useEffect(() => {
    const s = connectSocket('student', classId, studentId)
    s.emit('student:state', { classId, studentId, screen: 'code', status: 'ok' })
  }, [])
    
  const nav = useNavigate()
  const { suggestions, stack, addBlock } = useApp()
  const [toast, setToast] = useState<string | null>(null)

  function onAdd(s:{block:string;params:any[]}) {
    const label = s.block==='move_steps'
      ? `이동(${s.params[0]})`
      : s.block==='say'
      ? `말하기("${s.params[0]}", ${s.params[1]}s)`
      : '시작(깃발)'
    addBlock(label)
  }

  function runPartial() {
    if(stack.length===0){ setToast('스택이 비어 있어요. 대시보드의 추천 블록을 참고해 추가해 보세요.'); return }
    const seq = stack.map(s=>s.label).join(' → ')
    if(/이동\(.+\)\s+이동\(.+\)\s+이동\(.+\)/.test(seq)) {
      setToast('동일 동작이 반복돼요. 반복 블록으로 묶어보세요!')
    } else if(seq.includes('말하기') && !seq.includes('이동')) {
      setToast('좌표/이동을 먼저 배치하면 더 자연스러워요.')
    } else {
      setToast('잘했어요! 실행이 예상대로 동작합니다.')
    }
  }

  return (
    <div className="container">
      <div className="left">
        <div className="h1">학생 코딩 (블록 조립/부분 실행)</div>

        <div className="card">
          <div className="small">추천 블록</div>
          <div className="row">
            {suggestions.length===0
              ? <span className="small">대시보드에서 계획을 먼저 생성하세요.</span>
              : suggestions.map((s,i)=>
                <BlockChip key={i}
                  label={s.block==='when_start'?'시작(깃발)': s.block==='move_steps'?`이동(${s.params[0]})`:`말하기("${s.params[0]}", ${s.params[1]}s)`}
                  onAdd={()=>onAdd(s)}
                />
              )
            }
          </div>
        </div>

        <div className="card">
          <div className="small">워크스페이스(목업)</div>
          {stack.length===0
            ? <div className="small">추천 블록을 클릭해 스택을 채워 보세요.</div>
            : <div className="row">{stack.map((s,i)=><span key={i} className="badge">{s.label}</span>)}</div>}
          <div style={{marginTop:8}} className="row">
            <button className="btn" onClick={runPartial}>부분 실행</button>
            <button className="btn" onClick={()=>nav('/student/dashboard')}>← 대시보드로</button>
          </div>
          <div className="small" style={{marginTop:8}}>※ 최종본에서는 Entry 워크스페이스에 실제 블록이 삽입됩니다.</div>
        </div>
      </div>

      <div className="right">
        <div className="h1">실행 미리보기</div>
        <div className="card">
          <div className="small">현재 스택 흐름</div>
          <div className="row">{stack.map((s,i)=><span key={i} className="badge">{s.label}</span>)}</div>
        </div>
      </div>

      {toast && <Toast text={toast} />}
    </div>
  )
}
// JSX 하단에:
{toast && <Toast text={toast} />}
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useApp } from "../store"
import BlockChip from "../components/BlockChip"
import Toast from "../components/Toast"
import { connectSocket, getSocket } from "../realtime/socket"
import { getParam } from "../realtime/query"
import { initEntry, isEntryReady, loadProjectJson, exportProject } from "../entry/entryBridge"

export default function StudentCode() {
  const nav = useNavigate()
  const { suggestions, stack, addBlock } = useApp()
  const [toast, setToast] = useState<string|null>(null)

  const classId = getParam('class','3A')
  const studentId = getParam('sid','S01')

  useEffect(() => {
    const s = connectSocket('student', classId, studentId)
    s.emit('student:state', {classId, studentId, screen:'code', status:'ok'})
    const handler = (p:any)=>setToast(p.message)
    s.on('broadcast', handler)
    return ()=>{ s.off('broadcast', handler) }
  }, [])

  function onAdd(s:{block:string;params:any[]}) {
    const label = s.block==='move_steps' ? `이동(${s.params[0]})`
               : s.block==='say' ? `말하기("${s.params[0]}", ${s.params[1]}s)` : '시작(깃발)'
    addBlock(label)
    getSocket()?.emit('student:log', {classId, studentId, type:'block_added', meta:{label}})
  }

  function runPartial() {
    if(!stack.length){ setToast('스택이 비었어요. 추천 블록을 추가해보세요.'); return }
    const seq = stack.map(s=>s.label).join(' → ')
    if(/이동\(.+\)\s+이동\(.+\)\s+이동\(.+\)/.test(seq)) setToast('동일 동작 반복! 반복 블록을 고려하세요.')
    else if(seq.includes('말하기') && !seq.includes('이동')) setToast('이동/좌표를 먼저 배치하면 자연스러워요.')
    else setToast('좋아요! 예상대로 동작해요.')
    getSocket()?.emit('student:log', {classId, studentId, type:'run_partial', meta:{seq}})
  }

  function buildProjectFromSuggestions(sugs:{block:string;params:any[]}[]) {
    const mv = sugs.find(s=>s.block==='move_steps')
    const sy = sugs.find(s=>s.block==='say')
    const steps = mv ? Number(mv.params[0]||10) : 10
    const msg   = sy ? String(sy.params[0]||'안녕!') : '안녕!'
    const sec   = sy ? Number(sy.params[1]||2) : 2
    return {
      objects:[{ id:"obj-1", name:"고양이", sprite:{pictures:[],sounds:[]},
        scripts:[[
          {type:"when_run_button_click", params:[], x:30, y:30},
          {type:"move_direction", params:[steps]},
          {type:"say_something", params:[msg, sec]}
        ]], objectType:"sprite"}],
      scenes:[{name:"장면 1"}], variables:[], messages:[], functions:[], tables:[], speed:60
    }
  }

  async function onInitEntry() {
    await initEntry({ mountId:'entryMount' }) // baseDist/libDir 자동감지 또는 CDN 버전 사용 시 옵션
    setTimeout(()=>{ if(isEntryReady()) setToast('엔트리 준비 완료!') }, 600)
  }
  function onLoadToEntry() {
    if(!isEntryReady()){ setToast('엔트리가 아직 준비되지 않았어요. 먼저 초기화하세요.'); return }
    loadProjectJson(buildProjectFromSuggestions(suggestions))
    setToast('추천 블록을 엔트리에 로드했어요!')
  }
  function onExportEntry() {
    try { console.log('[Entry JSON]', exportProject()); setToast('현재 프로젝트 JSON을 콘솔에 출력했어요.') }
    catch(e:any){ setToast('Export 실패: '+(e?.message||e)) }
  }

  return (
    <div className="code-layout">
      {/* 좌측: 추천/스택/컨트롤 */}
      <section className="panel left">
        <div className="panel-header">추천 블록</div>
        <div className="chips">
          {suggestions.length===0 && <div className="muted">대시보드에서 계획을 생성하세요.</div>}
          {suggestions.map((s,i)=>( <BlockChip key={i} label={s.block} onClick={()=>onAdd(s)} /> ))}
        </div>

        <div className="panel-header" style={{marginTop:8}}>조립한 스택</div>
        <div className="stack slim">
          {stack.map((s:any,i:number)=>(<div key={i} className="stack-item">{s.label}</div>))}
        </div>

        <div className="toolbar sticky">
          <button className="btn" onClick={runPartial}>부분 실행 ▶</button>
          <button className="btn ghost" onClick={()=>nav(`/student/dashboard?class=${classId}&sid=${studentId}`)}>← 대시보드</button>
        </div>
      </section>

      {/* 우측: Entry Workspace */}
      <section className="panel right">
        <div className="panel-header">엔트리 워크스페이스</div>
        <div id="entryMount" className="entry-mount" />
        <div className="toolbar rightbar">
          <button className="btn" onClick={onInitEntry}>엔트리 초기화</button>
          <button className="btn" onClick={onLoadToEntry}>추천 → 로드</button>
          <button className="btn ghost" onClick={onExportEntry}>JSON 내보내기</button>
        </div>
      </section>

      {toast && <Toast text={toast} />}
    </div>
  )
}

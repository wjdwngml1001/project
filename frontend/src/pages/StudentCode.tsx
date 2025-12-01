import { useEffect, useState } from 'react'
import { initBlockly, currentXml, getWorkspace } from '../blockly/bridge'
import { astFromWorkspace, toEntryProject } from '../blockly/generator'
import { connectSocket, tabId } from '../realtime/socket'

export default function StudentCode() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    initBlockly('blocklyDiv')
    setReady(true)

    const sock = connectSocket('student', '3A', '학생-'+tabId())
  const ping = setInterval(() => sock.emit('student:ping', { studentId: tabId() }), 3000)

  // 썸네일 전송(2~3초에 한 번, 크기 축소)
  const shot = setInterval(() => {
    const ws = getWorkspace() as any
    if (!ws) return
    const svg = ws.getParentSvg()
    if (!svg) return
    const xml = new XMLSerializer().serializeToString(svg)
    const svg64 = btoa(unescape(encodeURIComponent(xml)))
    const dataUrl = 'data:image/svg+xml;base64,' + svg64
    sock.emit('student:thumb', dataUrl)
  }, 4000)

  // 교사 공지 팝업
  sock.on('announcement', (msg: string) => alert('[교사 공지]\n\n' + msg))

  return () => { clearInterval(ping); clearInterval(shot); sock.off('announcement') }
  }, [])

  const onSave = () => {
    const ws = getWorkspace()
    if (!ws) return
    const ast = astFromWorkspace(ws)
    const xml = currentXml()
    const entry = toEntryProject(ast) // 엔트리 JSON 초안
    localStorage.setItem('studentPlan', JSON.stringify({ ast, xml, entry }))
    alert('저장 완료!')
  }

  const onDownloadEntry = () => {
    const raw = localStorage.getItem('studentPlan')
    if (!raw) return alert('먼저 저장하세요.')
    const { entry } = JSON.parse(raw)
    const blob = new Blob([JSON.stringify(entry, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'entry_project_candidate.json'
    a.click()
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>학생 코딩 (Blockly)</h2>
      <div id="blocklyDiv" style={{ width:'100%', height:'70vh', border:'1px solid #ddd', borderRadius:8 }} />
      <div style={{ marginTop: 12, display:'flex', gap:8 }}>
        <button disabled={!ready} onClick={onSave}>현재 계획 저장</button>
        <button disabled={!ready} onClick={onDownloadEntry}>엔트리 JSON(초안) 다운로드</button>
      </div>
    </div>
  )
}

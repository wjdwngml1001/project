// frontend/src/pages/StudentCode.tsx
import { useEffect, useState } from 'react'
import * as Blockly from 'blockly'
import { initBlockly, getWorkspace, currentXml } from '../blockly/bridge'
import { astFromWorkspace, toEntryProject } from '../blockly/generator'
import { connectSocket, tabId } from '../realtime/socket'

type SavedPlan = {
  goal: string
  summary: string
  ast: any
  xml: string
}

export default function StudentCode() {
  const [ready, setReady] = useState(false)
  const [goal, setGoal] = useState<string>('')
  const [summary, setSummary] = useState<string>('')

  useEffect(() => {
    const ws = initBlockly('blocklyDiv')
    setReady(true)

    // ✅ StudentDashboard에서 저장해둔 계획 불러오기
    const raw = localStorage.getItem('studentPlan')
    if (raw) {
      try {
        const parsed: SavedPlan = JSON.parse(raw)
        setGoal(parsed.goal || '')
        setSummary(parsed.summary || '')

        if (parsed.xml) {
          // 🔧 타입 오류를 피하기 위해 any로 우회
          const XmlAny = (Blockly as any).Xml
          const dom = XmlAny.textToDom(parsed.xml)
          XmlAny.domToWorkspace(dom, ws)
        }
      } catch (e) {
        console.error('plan load error', e)
      }
    }

    // ✅ 소켓 연결
    const sock = connectSocket('student', '3A', '학생-' + tabId())

    // ✅ 주기적으로 썸네일 + 코드 정보 교사에게 전송
    const sendInterval = setInterval(() => {
      const w = getWorkspace()
      if (!w) return
      const xml = currentXml()
      const ast = astFromWorkspace(w)

      // 썸네일(svg → dataURL)
      const svg = w.getParentSvg()
      if (svg) {
        const xmlSvg = new XMLSerializer().serializeToString(svg)
        const svg64 = btoa(unescape(encodeURIComponent(xmlSvg)))
        const dataUrl = 'data:image/svg+xml;base64,' + svg64
        sock.emit('student:thumb', { tabId: tabId(), thumb: dataUrl })
      }

      sock.emit('student:code', {
        tabId: tabId(),
        goal: goal,
        summary: summary,
        ast,
        xml,
      })
    }, 4000)

    // 교사 공지 팝업
    sock.on('announcement', (msg: string) => {
      alert('[교사 공지]\n\n' + msg)
    })

    return () => {
      clearInterval(sendInterval)
      sock.off('announcement')
    }
  }, [goal, summary])

  /** 1) 현재 블록/계획만 저장 */
  const onSaveOnly = () => {
    const ws = getWorkspace()
    if (!ws) return
    const ast = astFromWorkspace(ws)
    const xml = currentXml()
    const plan: SavedPlan = {
      goal,
      summary,
      ast,
      xml,
    }
    localStorage.setItem('studentPlan', JSON.stringify(plan))
    alert('현재 블록과 계획이 저장되었습니다.')
  }

  /** 2) 엔트리 JSON만 내보내기 */
  const onDownloadEntryJson = () => {
    const ws = getWorkspace()
    if (!ws) return
    const ast = astFromWorkspace(ws)
    const entryJson = toEntryProject(ast)

    const blob = new Blob([JSON.stringify(entryJson, null, 2)], {
      type: 'application/json',
    })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `entry_project_${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>학생 코딩 (Blockly)</h2>
      <div style={{ marginBottom: 8 }}>
        <div>
          <b>{goal || '목표 미설정'}</b>
        </div>
        <div style={{ fontSize: 13, color: '#555', marginTop: 4 }}>
          요약 : {summary || 'AI 요약 결과가 없습니다.'}
        </div>
      </div>
      <div
        id="blocklyDiv"
        style={{
          width: '100%',
          height: '70vh',
          border: '1px solid #ddd',
          borderRadius: 8,
          background: 'white',
        }}
      />
      <div
        style={{
          marginTop: 12,
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
        }}
      >
        <button disabled={!ready} onClick={onSaveOnly}>
          현재 계획 / 블록 저장
        </button>
        <button disabled={!ready} onClick={onDownloadEntryJson}>
          엔트리 JSON 내보내기
        </button>
      </div>
    </div>
  )
}

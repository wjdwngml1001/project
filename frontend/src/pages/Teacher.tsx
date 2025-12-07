// frontend/src/pages/Teacher.tsx
import { useEffect, useState } from 'react'
import { connectSocket } from '../realtime/socket'

type StudentInfo = {
  socketId: string
  tabId: string
  name: string
  goal: string
  summary: string
  thumb: string
}

export default function Teacher() {
  const [students, setStudents] = useState<StudentInfo[]>([])
  const [selected, setSelected] = useState<StudentInfo | null>(null)
  const [announcement, setAnnouncement] = useState('')

  useEffect(() => {
    const sock = connectSocket('teacher', '3A', '교사')

    // 서버에서 전체 학생 목록을 받아서 통째로 갱신
    sock.on('teacher:students', (list: StudentInfo[]) => {
      setStudents(list)
      // 선택된 학생이 사라졌으면 선택 해제
      if (selected) {
        const exists = list.find((s) => s.socketId === selected.socketId)
        if (!exists) {
          setSelected(null)
        }
      }
    })

    return () => {
      sock.off('teacher:students')
    }
  }, [selected])

  const onSendAnnouncement = () => {
    const msg = announcement.trim()
    if (!msg) return
    const sock = connectSocket('teacher', '3A', '교사')
    sock.emit('teacher:announcement', msg)
    alert('학생들에게 공지가 전송되었습니다.')
    setAnnouncement('')
  }

  const onOpenPopup = (s: StudentInfo) => {
    // 새 창으로 미리보기 (간단하게 thumb만 보여주는 별도 페이지를 열 수 있지만
    // 지금은 이미지 dataURL을 새 탭에 띄우는 형태)
    if (s.thumb) {
      const win = window.open('', '_blank')
      if (win) {
        win.document.write(
          `<html><head><title>${s.name} 화면</title></head><body><img src="${s.thumb}" style="max-width:100%;"/></body></html>`,
        )
        win.document.close()
      }
    } else {
      alert('아직 학생 화면 썸네일이 도착하지 않았습니다.')
    }
  }

  return (
    <div style={{ padding: 16, display: 'flex', gap: 16, height: '100vh' }}>
      {/* 왼쪽: 학생 목록 + 공지 */}
      <div style={{ width: 320, borderRight: '1px solid #eee' }}>
        <h2>교사 대시보드</h2>
        <div style={{ fontSize: 14, marginBottom: 8 }}>
          현재 접속 중인 학생 수 : <b>{students.length}</b>명
        </div>

        <div style={{ marginBottom: 12 }}>
          <textarea
            placeholder="학생들에게 보낼 공지를 입력하세요."
            value={announcement}
            onChange={(e) => setAnnouncement(e.target.value)}
            style={{ width: '100%', height: 80, resize: 'none' }}
          />
          <button style={{ marginTop: 4 }} onClick={onSendAnnouncement}>
            공지 보내기
          </button>
        </div>

        <div style={{ fontSize: 13, fontWeight: 'bold', marginBottom: 4 }}>
          학생 목록
        </div>
        <div
          style={{
            maxHeight: '60vh',
            overflowY: 'auto',
            border: '1px solid #eee',
            borderRadius: 8,
          }}
        >
          {students.length === 0 && (
            <div style={{ padding: 8, fontSize: 13, color: '#777' }}>
              현재 접속 중인 학생이 없습니다.
            </div>
          )}
          {students.map((s) => (
            <div
              key={s.socketId}
              onClick={() => setSelected(s)}
              style={{
                padding: 8,
                cursor: 'pointer',
                borderBottom: '1px solid #f3f3f3',
                background:
                  selected && selected.socketId === s.socketId
                    ? '#e0f2fe'
                    : 'white',
              }}
            >
              <div style={{ fontWeight: 'bold' }}>{s.name || '이름 없음'}</div>
              <div style={{ fontSize: 12, color: '#555' }}>
                목표: {s.goal || '-'}
              </div>
              <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
                요약: {s.summary || '-'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 오른쪽: 선택된 학생 미리보기 */}
      <div style={{ flex: 1, paddingTop: 32 }}>
        {!selected && (
          <div style={{ color: '#777' }}>왼쪽에서 학생을 선택하세요.</div>
        )}
        {selected && (
          <div>
            <h3>
              {selected.name} 학생 화면 미리보기
              <button
                style={{ marginLeft: 8 }}
                onClick={() => onOpenPopup(selected)}
              >
                새 창으로 크게 보기
              </button>
            </h3>
            <div style={{ marginBottom: 8, fontSize: 14 }}>
              <div>
                <b>목표</b> : {selected.goal || '-'}
              </div>
              <div style={{ marginTop: 4 }}>
                <b>요약</b> : {selected.summary || '-'}
              </div>
            </div>
            <div
              style={{
                border: '1px solid #ddd',
                borderRadius: 8,
                background: 'white',
                width: '100%',
                maxWidth: 640,
                height: 360,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {selected.thumb ? (
                <img
                  src={selected.thumb}
                  alt="학생 화면"
                  style={{ maxWidth: '100%', maxHeight: '100%' }}
                />
              ) : (
                <span style={{ color: '#999', fontSize: 13 }}>
                  아직 학생 화면 썸네일이 전송되지 않았습니다.
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

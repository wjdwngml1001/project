// frontend/src/realtime/socket.ts
import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

/**
 * 브라우저 "탭"마다 다른 ID 부여
 */
export function tabId(): string {
  let id = sessionStorage.getItem('tabId')
  if (!id) {
    if (typeof crypto !== 'undefined' && (crypto as any).randomUUID) {
      id = (crypto as any).randomUUID()
    } else {
      id = Math.random().toString(36).slice(2, 10)
    }
    sessionStorage.setItem('tabId', id)
  }
  return id
}

// Vite 환경변수 사용하면서 TS 오류 안 나게 any 캐스팅
const REALTIME_URL =
  ((import.meta as any).env?.VITE_REALTIME_URL as string | undefined) ||
  'http://localhost:7070'

// 마지막으로 join한 역할/이름을 저장해서 connect 시점에 한 번 안내용으로 사용
let lastJoinRole: 'student' | 'teacher' | null = null
let lastJoinName: string | null = null
let listenersInitialized = false

/**
 * 소켓 연결 (학생/교사 공용)
 * - role: 'student' | 'teacher'
 * - classId: 예) '3A'
 * - name: 학생/교사 이름 (대시보드에 표시될 값)
 */
export function connectSocket(
  role: 'student' | 'teacher',
  classId: string,
  name: string,
): Socket {
  if (!socket) {
    socket = io(REALTIME_URL, {
      transports: ['websocket'],
    })
  }

  // 공통 이벤트 리스너는 한 번만 등록
  if (!listenersInitialized && socket) {
    socket.on('connect', () => {
      console.log('✅ socket connected:', socket!.id)

      if (lastJoinRole && lastJoinName) {
        const label = lastJoinRole === 'teacher' ? '교사' : '학생'
        // 너무 자주 안 뜨게, 최초 연결 시점 안내용
        alert(`${label}(${lastJoinName}) 소켓 연결 완료!`)
      }
    })

    socket.on('disconnect', () => {
      console.log('⚠️ socket disconnected')
    })

    socket.on('connect_error', (err) => {
      console.error('❌ socket connect_error:', err)
    })

    listenersInitialized = true
  }

  const id = tabId()
  lastJoinRole = role
  lastJoinName = name

  // 서버에 현재 탭이 어떤 역할로 참여했는지 알림
  socket.emit('join', { role, classId, name, tabId: id })

  return socket
}

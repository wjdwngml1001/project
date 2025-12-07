// frontend/src/realtime/socket.ts
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

/** 브라우저 탭마다 고유 ID 부여 */
export function tabId(): string {
  let id = sessionStorage.getItem('tabId');
  if (!id) {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      id = crypto.randomUUID();
    } else {
      id = Math.random().toString(36).slice(2, 10);
    }
    sessionStorage.setItem('tabId', id);
  }
  return id;
}

const REALTIME_URL =
  (import.meta as any).env?.VITE_REALTIME_URL || 'http://localhost:7070';

/** 내부에서 실제 socket.io 인스턴스를 생성/재사용 */
function getSocket(): Socket {
  if (!socket) {
    socket = io(REALTIME_URL, {
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('[socket] connected:', socket!.id);
    });

    socket.on('connect_error', (err) => {
      console.error('[socket] connect_error:', err);
    });
  }
  return socket;
}

/**
 * 교사/학생 공통 소켓 연결 함수
 *  - 반드시 join 이벤트를 서버로 보냄
 */
export function connectSocket(
  role: 'student' | 'teacher',
  classId: string,
  name: string,
): Socket {
  const s = getSocket();
  const id = tabId();

  s.emit('join', { role, classId, name, tabId: id });
  console.log('[socket] join emitted:', { role, classId, name, tabId: id });

  return s;
}

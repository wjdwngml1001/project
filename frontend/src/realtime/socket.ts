// frontend/src/realtime/socket.ts
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

/** 이 탭에서 이미 join을 보냈는지 여부 (StrictMode 대비용) */
let joinedOnce = false;

/**
 * 브라우저 "탭"마다 다른 ID 부여
 */
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
  import.meta.env.VITE_REALTIME_URL || 'http://localhost:7070';

export function connectSocket(
  role: 'student' | 'teacher',
  classId: string,
  name: string,
): Socket {
  if (!socket) {
    socket = io(REALTIME_URL, {
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('[socket] connected:', socket.id);
    });
  }

  const id = tabId();

  // 🔒 StrictMode 때문에 useEffect가 두 번 실행되어도
  // 같은 탭에서는 join 을 한 번만 보내도록 가드
  if (!joinedOnce) {
    socket.emit('join', { role, classId, name, tabId: id });
    console.log('[socket] join emitted:', { role, classId, name, tabId: id });
    joinedOnce = true;
  }

  return socket;
}

// frontend/src/realtime/socket.ts
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

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
  }

  const id = tabId();
  socket.emit('join', { role, classId, name, tabId: id });

  return socket;
}

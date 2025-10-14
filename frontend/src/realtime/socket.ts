import { io, Socket } from 'socket.io-client'

export type Role = 'student'|'teacher'

let socket: Socket | null = null

export function connectSocket(role: Role, classId: string, studentId?: string) {
  if (socket?.connected) return socket
  socket = io('http://localhost:8080', {
    transports: ['websocket'],
    query: { role, classId, studentId }
  })
  return socket
}

export function getSocket() {
  return socket
}

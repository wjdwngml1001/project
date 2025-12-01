import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

function getTabId() {
  const k = 'tab_id'
  let id = sessionStorage.getItem(k)
  if (!id) {
    id = Math.random().toString(36).slice(2)
    sessionStorage.setItem(k, id)
  }
  return id
}

export function connectSocket(role: 'student'|'teacher', classId='3A', name?: string) {
  if (socket) return socket
  const base = import.meta.env.VITE_API_BASE || 'http://localhost:7070'
  socket = io(base, { transports:['websocket'] })
  socket.emit('register', { role, classId, studentId: getTabId(), name })
  return socket
}

export function getSocket() { return socket }
export function tabId() { return getTabId() }

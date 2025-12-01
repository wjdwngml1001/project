import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'

const app = express()
app.use(cors())
const http = createServer(app)
const io = new Server(http, { cors: { origin: '*' } })

// 메모리 상태
const classes = new Map() // classId -> Map(studentId -> {name, lastSeen, thumb})

function getClass(classId) {
  if (!classes.has(classId)) classes.set(classId, new Map())
  return classes.get(classId)
}

io.on('connection', (socket) => {
  let classId = null
  let studentId = null
  let role = 'student'

  socket.on('register', (payload) => {
    classId = payload.classId || '3A'
    role = payload.role || 'student'
    if (role === 'student') {
      studentId = payload.studentId || socket.id
      const c = getClass(classId)
      c.set(studentId, { name: payload.name || '무명', lastSeen: Date.now(), thumb: null })
      io.to(`class:${classId}`).emit('presence', snapshot(classId))
    }
    socket.join(`class:${classId}`)
    if (role === 'teacher') {
      socket.emit('presence', snapshot(classId))
    }
  })

  socket.on('student:ping', (payload) => {
    if (!classId) return
    const c = getClass(classId)
    if (!studentId) studentId = payload.studentId
    const s = c.get(studentId) || { name: payload.name || '무명', thumb: null }
    s.lastSeen = Date.now()
    c.set(studentId, s)
    // 필요 시 rate-limit 가능
  })

  socket.on('student:thumb', (dataUrl) => {
    if (!classId || !studentId) return
    const c = getClass(classId)
    const s = c.get(studentId)
    if (s) {
      s.thumb = dataUrl
      s.lastSeen = Date.now()
      io.to(`class:${classId}`).emit('presence', snapshot(classId))
    }
  })

  socket.on('announcement', (msg) => {
    if (!classId) return
    io.to(`class:${classId}`).emit('announcement', msg)
  })

  socket.on('disconnect', () => {
    if (classId && studentId) {
      const c = getClass(classId)
      if (c) {
        c.delete(studentId)
        io.to(`class:${classId}`).emit('presence', snapshot(classId))
      }
    }
  })
})

function snapshot(classId) {
  const c = getClass(classId)
  const list = Array.from(c.entries()).map(([id, s]) => ({
    id, name: s.name, lastSeen: s.lastSeen, thumb: s.thumb
  }))
  return { classId, count: list.length, students: list }
}

const PORT = process.env.PORT || 7070
http.listen(PORT, () => console.log('realtime listening on', PORT))

// realtime-server/index.js
import express from 'express'
import http from 'http'
import { Server } from 'socket.io'

const app = express()
const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
})

// 메모리 상 학생 목록: { socketId -> { tabId, name, goal, summary, thumb } }
const students = new Map()

function broadcastStudents() {
  const list = Array.from(students.values())
  io.to('teacher').emit('teacher:students', list)
}

io.on('connection', (socket) => {
  console.log('✅ socket connected:', socket.id)

  socket.on('join', ({ role, classId, name, tabId }) => {
    console.log('join:', role, classId, name, tabId)

    if (role === 'teacher') {
      socket.join('teacher')
      socket.emit('teacher:students', Array.from(students.values()))
    } else if (role === 'student') {
      socket.join('student')
      // 최초 접속 시 기본 정보만 저장
      students.set(socket.id, {
        socketId: socket.id,
        tabId,
        name,
        goal: '',
        summary: '',
        thumb: '',
      })
      broadcastStudents()
    }
  })

  // 학생 썸네일 업데이트
  socket.on('student:thumb', ({ tabId, thumb }) => {
    const s = students.get(socket.id)
    if (s) {
      s.thumb = thumb
      students.set(socket.id, s)
      broadcastStudents()
    }
  })

  // 학생 코드 / 목표 / 요약 업데이트
  socket.on('student:code', ({ tabId, goal, summary, ast, xml }) => {
    const s = students.get(socket.id)
    if (s) {
      s.goal = goal
      s.summary = summary
      // 필요하다면 ast, xml도 저장 가능
      students.set(socket.id, s)
      broadcastStudents()
    }
  })

  // 교사 → 학생 공지
  socket.on('teacher:announcement', (msg) => {
    io.to('student').emit('announcement', msg)
  })

  socket.on('disconnect', () => {
    console.log('❌ socket disconnected:', socket.id)
    if (students.has(socket.id)) {
      students.delete(socket.id)
      broadcastStudents()
    }
  })
})

const PORT = 7070
server.listen(PORT, () => {
  console.log('🚀 Realtime server listening on', PORT)
})

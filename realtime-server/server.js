import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'

const app = express()
app.use(cors())
app.get('/health', (_,res) => res.json({ok:true}))
const httpServer = createServer(app)

const io = new Server(httpServer, {
  cors: { origin: '*' }
})

// 메모리 상태(데모용): classId -> { students: Map<studentId, state>, teachers: Set<socketId> }
const classes = new Map()

function ensureClass(classId) {
  if (!classes.has(classId)) {
    classes.set(classId, { students: new Map(), teachers: new Set() })
  }
  return classes.get(classId)
}

// 주기 브로드캐스트(2초)
setInterval(() => {
  for (const [classId, state] of classes.entries()) {
    const thumbnails = Array.from(state.students.entries()).map(([sid, st]) => ({
      studentId: sid,
      status: st.status || 'ok',   // 'ok' | 'slow' | 'err'
      screen: st.screen || 'dashboard', // 'dashboard' | 'code'
    }))
    const misconceptions = [
      { type: 'repeat_missing', count: thumbnails.filter(t => t.status==='err').length },
      { type: 'coord_confused', count: Math.floor(thumbnails.length/3) },
      { type: 'empty_if', count: Math.floor(thumbnails.length/5) },
    ]
    io.to(`teacher:${classId}`).emit('overview', { thumbnails, misconceptions, ts: Date.now() })
  }
}, 2000)

io.on('connection', (socket) => {
  // handshake 예: { role:'student'|'teacher', classId:'3A', studentId? }
  const { role, classId, studentId } = socket.handshake.query
  // 문자열로 들어오므로 캐스팅
  const r = String(role||'')
  const c = String(classId||'default')
  const s = studentId ? String(studentId) : undefined

  const cls = ensureClass(c)

  if (r === 'teacher') {
    socket.join(`teacher:${c}`)
    cls.teachers.add(socket.id)
    socket.emit('connected', { role:'teacher', classId:c })
  } else {
    socket.join(`student:${c}`)
    if (s) {
      cls.students.set(s, { screen:'dashboard', status:'ok' })
      socket.data.studentId = s
    }
    socket.emit('connected', { role:'student', classId:c, studentId:s })
    // 초기 알림: 교사에게 존재 알려주기
    io.to(`teacher:${c}`).emit('presence', { studentId:s, event:'join' })
  }

  // 학생 상태 업데이트
  socket.on('student:state', (payload) => {
    // payload: { classId, studentId, screen, status }
    const { classId, studentId, screen, status } = payload || {}
    const cls = ensureClass(String(classId||c))
    const curr = cls.students.get(String(studentId||s)) || {}
    cls.students.set(String(studentId||s), { ...curr, screen, status })
    // 변경 즉시도 개별 업데이트를 보낼 수 있음(선택):
    io.to(`teacher:${classId||c}`).emit('student:update', { studentId: String(studentId||s), screen, status })
  })

  // 교사 → 학생 브로드캐스트
  socket.on('teacher:broadcast', (payload) => {
    // payload: { classId, message }
    const { classId, message } = payload || {}
    io.to(`student:${String(classId||c)}`).emit('broadcast', { message })
  })

  socket.on('disconnect', () => {
    // 학생 퇴장 처리
    if (socket.data.studentId) {
      const stid = socket.data.studentId
      const cls = ensureClass(c)
      cls.students.delete(stid)
      io.to(`teacher:${c}`).emit('presence', { studentId: stid, event:'leave' })
    }
    // 교사 퇴장 처리
    const cls = ensureClass(c)
    cls.teachers.delete(socket.id)
  })
})

const PORT = process.env.PORT || 8080
httpServer.listen(PORT, () => {
  console.log(`Realtime server listening on http://localhost:${PORT}`)
})

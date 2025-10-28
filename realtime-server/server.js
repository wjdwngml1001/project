import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'

const app = express()
app.use(cors())
app.use(express.json())
app.get('/health', (_,res) => res.json({ok:true}))
const httpServer = createServer(app)

const io = new Server(httpServer, {
  cors: { origin: '*' }
})

/**
 * 메모리 상태 구조
 * classes: Map<classId, {
 *   students: Map<studentId, { screen, status, lastSeen }>
 *   teachers: Set<socketId>
 *   logs: { // 간단 집계용 카운터
 *     events: Map<type, count>,
 *     misconceptions: Map<type, count>
 *   }
 * }>
 */
const classes = new Map()
const MIS_TYPES = ['repeat_missing', 'coord_confused', 'empty_if']

function ensureClass(classId) {
  if (!classes.has(classId)) {
    classes.set(classId, {
      students: new Map(),
      teachers: new Set(),
      logs: { events: new Map(), misconceptions: new Map() }
    })
  }
  return classes.get(classId)
}

function incMap(m, key, by = 1) { m.set(key, (m.get(key) || 0) + by) }

// 2초마다 교사에게 개요 전송
setInterval(() => {
  for (const [classId, state] of classes.entries()) {
    const thumbnails = Array.from(state.students.entries()).map(([sid, st]) => ({
      studentId: sid,
      status: st.status || 'ok',
      screen: st.screen || 'dashboard',
    }))
    // 오개념은 logs.misconceptions 카운터를 사용
    const misconceptions = MIS_TYPES.map(t => ({ type: t, count: state.logs.misconceptions.get(t) || 0 }))

    // 간단한 이벤트 카운트 지표(최근 누적)
    const eventStats = Array.from(state.logs.events.entries()).map(([type, count]) => ({ type, count }))

    io.to(`teacher:${classId}`).emit('overview', {
      thumbnails,
      misconceptions,
      metrics: {
        events: eventStats,
        studentsOnline: thumbnails.length,
        ts: Date.now(),
      }
    })
  }
}, 2000)

io.on('connection', (socket) => {
  const { role, classId, studentId } = socket.handshake.query
  const r = String(role || '')
  const c = String(classId || 'default')
  const s = studentId ? String(studentId) : undefined
  const cls = ensureClass(c)

  if (r === 'teacher') {
    socket.join(`teacher:${c}`)
    cls.teachers.add(socket.id)
    socket.emit('connected', { role:'teacher', classId:c })
  } else {
    socket.join(`student:${c}`)
    if (s) {
      cls.students.set(s, { screen:'dashboard', status:'ok', lastSeen: Date.now() })
      socket.data.studentId = s
    }
    socket.emit('connected', { role:'student', classId:c, studentId:s })
    io.to(`teacher:${c}`).emit('presence', { studentId:s, event:'join' })
  }

  // 학생 상태 업데이트
  socket.on('student:state', (payload) => {
    const { classId: cid, studentId: sid, screen, status } = payload || {}
    const cl = ensureClass(String(cid || c))
    const cur = cl.students.get(String(sid || s)) || {}
    cl.students.set(String(sid || s), { ...cur, screen, status, lastSeen: Date.now() })
    io.to(`teacher:${cid || c}`).emit('student:update', { studentId: String(sid || s), screen, status })
  })

  // 학생 이벤트 로그 (7–8주차 추가)
  // payload: { classId, studentId, type, meta? }
  socket.on('student:log', (payload) => {
    const { classId: cid, studentId: sid, type, meta } = payload || {}
    const cl = ensureClass(String(cid || c))
    incMap(cl.logs.events, String(type || 'unknown'))
    // 간단 오개념 집계 규칙 (meta.hintKey 같은 키로 합산 가능)
    if (meta && meta.misType && MIS_TYPES.includes(meta.misType)) {
      incMap(cl.logs.misconceptions, meta.misType)
    }
  })

  // 교사 → 학생 브로드캐스트
  socket.on('teacher:broadcast', (payload) => {
    const { classId, message } = payload || {}
    io.to(`student:${String(classId || c)}`).emit('broadcast', { message })
  })

  socket.on('disconnect', () => {
    if (socket.data.studentId) {
      const stid = socket.data.studentId
      const cl = ensureClass(c)
      cl.students.delete(stid)
      io.to(`teacher:${c}`).emit('presence', { studentId: stid, event:'leave' })
    }
    const cl = ensureClass(c)
    cl.teachers.delete(socket.id)
  })
})

const PORT = process.env.PORT || 8080
httpServer.listen(PORT, () => {
  console.log(`Realtime server listening on http://localhost:${PORT}`)
})

// realtime-server/index.js
import { createServer } from 'http';
import { Server } from 'socket.io';

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
});

// 메모리 상 학생/교사 상태
/** @type {Map<string, {id:string, classId:string, name:string, goal:string, summary:string, thumb?:string, lastPing:number}>} */
const students = new Map();
/** @type {Map<string, {socket:import('socket.io').Socket, classId:string}>} */
const teachers = new Map();

/**
 * 특정 반(classId)의 현황을 모든 교사에게 전송
 */
function broadcastTeacherState(classId) {
  const now = Date.now();
  const ACTIVE_MS = 15000; // 15초 이상 ping 없으면 죽은 학생으로 간주

  const list = Array.from(students.values()).filter(
    (s) => s.classId === classId && now - s.lastPing < ACTIVE_MS,
  );

  const payload = { students: list };

  for (const t of teachers.values()) {
    if (t.classId === classId) {
      t.socket.emit('teacher:state', payload);
    }
  }
}

io.on('connection', (socket) => {
  console.log('socket connected', socket.id);
  socket.data.role = null;
  socket.data.classId = null;
  socket.data.studentId = null;

  function joinClassRoom(classId) {
    socket.join(`class:${classId}`);
  }

  // 최초 접속
  socket.on('join', ({ role, classId, name, tabId }) => {
    const clazz = classId || 'default';
    socket.data.role = role;
    socket.data.classId = clazz;

    joinClassRoom(clazz);

    if (role === 'student') {
      const id = tabId || socket.id;
      socket.data.studentId = id;

      const now = Date.now();
      students.set(id, {
        id,
        classId: clazz,
        name: name || `학생-${String(id).slice(0, 4)}`,
        goal: '',
        summary: '',
        thumb: '',
        lastPing: now,
      });

      console.log('[join] student', id, 'class', clazz);
      broadcastTeacherState(clazz);
    } else if (role === 'teacher') {
      teachers.set(socket.id, { socket, classId: clazz });
      console.log('[join] teacher', socket.id, 'class', clazz);
      broadcastTeacherState(clazz);
    }
  });

  // 학생 상태 ping
  socket.on('student:ping', (data) => {
    if (socket.data.role !== 'student') return;

    const id = socket.data.studentId || socket.id;
    const prev = students.get(id) || {};
    const now = Date.now();

    // 혹시 프론트에서 name/goal을 뒤섞어서 보내더라도 최대한 안전하게 처리
    const incomingName = data?.name ?? prev.name;
    const incomingGoal = data?.goal ?? prev.goal;

    const updated = {
      id,
      classId: socket.data.classId,
      name:
        typeof incomingName === 'string' && incomingName.trim()
          ? incomingName.trim()
          : prev.name || `학생-${String(id).slice(0, 4)}`,
      goal: typeof incomingGoal === 'string' ? incomingGoal : prev.goal || '',
      summary:
        typeof data?.summary === 'string' ? data.summary : prev.summary || '',
      thumb: prev.thumb,
      lastPing: now,
    };

    students.set(id, updated);
    broadcastTeacherState(socket.data.classId);
  });

  // 학생 썸네일
  socket.on('student:thumb', (data) => {
    if (socket.data.role !== 'student') return;

    const id = socket.data.studentId || socket.id;
    const prev = students.get(id);
    if (!prev) return;

    const thumb =
      typeof data === 'string'
        ? data
        : typeof data?.thumb === 'string'
        ? data.thumb
        : prev.thumb;

    const updated = {
      ...prev,
      thumb,
      lastPing: Date.now(),
    };

    students.set(id, updated);
    broadcastTeacherState(socket.data.classId);
  });

  // 교사 공지
  socket.on('teacher:announcement', (msg) => {
    if (socket.data.role !== 'teacher') return;
    const clazz = socket.data.classId;
    io.to(`class:${clazz}`).emit('announcement', msg);
  });

  socket.on('disconnect', () => {
    console.log('socket disconnected', socket.id);
    if (socket.data.role === 'student') {
      const id = socket.data.studentId || socket.id;
      const clazz = socket.data.classId;
      if (students.has(id)) {
        students.delete(id);
        broadcastTeacherState(clazz);
      }
    } else if (socket.data.role === 'teacher') {
      teachers.delete(socket.id);
    }
  });
});

const PORT = 7070;
httpServer.listen(PORT, () => {
  console.log('✅ realtime-server listening on http://localhost:' + PORT);
});

// realtime-server/index.js
import { createServer } from 'http';
import express from 'express';
import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
});

// 간단 헬스체크 (브라우저에서 http://localhost:7070 접속용)
app.get('/', (req, res) => {
  res.send('realtime-server OK');
});

// 탭/학생 상태 저장
const students = new Map();

/**
 * 학생 정보 upsert 헬퍼
 * - 없으면 새로 만들고
 * - 있으면 name / classId / lastSeen 갱신
 */
function upsertStudent({ tabId, classId, name }) {
  const id = tabId || 'unknown';
  const now = Date.now();
  let s = students.get(id);

  if (!s) {
    s = {
      id,
      name: name || '',
      classId: classId || '3A',
      goal: '',
      summary: '',
      thumb: null,
      lastSeen: now,
    };
    students.set(id, s);
  } else {
    if (name && !s.name) s.name = name;
    if (classId) s.classId = classId;
    s.lastSeen = now;
  }
  return s;
}

/** 특정 반의 상태를 교사에게 전송 */
function broadcastState(classId) {
  const list = Array.from(students.values()).filter(
    (s) => s.classId === classId
  );
  console.log('broadcastState', classId, 'students:', list.length);
  io.to(`teacher:${classId}`).emit('teacher:state', list);
}

io.on('connection', (socket) => {
  console.log('socket connected', socket.id);

  // 공통적으로 classId / tabId 기억해두기
  socket.on('join', ({ role, classId, name, tabId }) => {
    console.log('join', { role, classId, name, tabId });

    socket.data.role = role;
    socket.data.classId = classId;
    socket.data.tabId = tabId;

    if (role === 'student') {
      upsertStudent({ tabId, classId, name });
      socket.join(`class:${classId}`);
      broadcastState(classId);
    } else if (role === 'teacher') {
      socket.join(`teacher:${classId}`);
      broadcastState(classId);
    }
  });

  // 학생이 계획(목표/요약)을 저장하거나 갱신할 때
  socket.on('student:plan', (payload) => {
    const { tabId, classId, name, goal, summary } = payload || {};
    const cid = classId || socket.data.classId || '3A';
    const id = tabId || socket.data.tabId || socket.id;

    console.log('student:plan', { id, cid, name, goal, summary });

    const s = upsertStudent({ tabId: id, classId: cid, name });
    if (goal !== undefined) s.goal = goal;
    if (summary !== undefined) s.summary = summary;
    broadcastState(cid);
  });

  // 학생이 블록 썸네일을 전송할 때
  socket.on('student:thumb', (payload) => {
    const { tabId, classId, name, thumb } = payload || {};
    const cid = classId || socket.data.classId || '3A';
    const id = tabId || socket.data.tabId || socket.id;

    console.log('student:thumb', { id, cid, hasThumb: !!thumb });

    const s = upsertStudent({ tabId: id, classId: cid, name });
    if (thumb) s.thumb = thumb;
    broadcastState(cid);
  });

  // 교사 공지 → 반 전체 학생에게
  socket.on('teacher:announcement', (msg) => {
    const classId = socket.data.classId || '3A';
    console.log('teacher:announcement', classId, msg);
    io.to(`class:${classId}`).emit('announcement', msg);
  });

  socket.on('disconnect', () => {
    const { role, classId, tabId } = socket.data || {};
    console.log('disconnect', { role, classId, tabId });

    if (role === 'student') {
      const id = tabId || socket.id;
      if (students.has(id)) {
        students.delete(id);
        if (classId) broadcastState(classId);
      }
    }
  });
});

const PORT = process.env.PORT || 7070;
httpServer.listen(PORT, () => {
  console.log('realtime-server listening on', PORT);
});

// realtime-server/index.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { nl2plan } from "./llm/nl2plan.js";

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// ----- LLM API: 자연어 -> 계획 생성 -----
app.post("/api/nl2plan", async (req, res) => {
  try {
    const { goal, studentName } = req.body || {};
    if (!goal || !goal.trim()) {
      return res
        .status(400)
        .json({ error: "goal(학습 목표)이 비어 있습니다." });
    }

    const plan = await nl2plan({
      goal: goal.trim(),
      studentName: studentName || "이름 없는 학생",
    });

    return res.json(plan);
  } catch (e) {
    console.error("nl2plan error:", e);
    return res.status(500).json({ error: "계획 생성 중 오류가 발생했습니다." });
  }
});

// ----- 실시간 교사-학생 소켓 -----
const students = new Map(); // id -> { id, name, thumb, lastSeen }

function broadcastStudents(room) {
  io.to(room).emit("teacher:students", Array.from(students.values()));
}

io.on("connection", (socket) => {
  const { role, room = "3A", name = "학생", tabId } =
    socket.handshake.query;

  const id = tabId || socket.id;

  if (role === "student") {
    socket.join(room);
    students.set(id, {
      id,
      name,
      thumb: null,
      lastSeen: Date.now(),
    });
    broadcastStudents(room);

    socket.on("student:ping", (payload) => {
      const cur = students.get(id) || { id };
      cur.name = payload?.name || cur.name || name;
      cur.lastSeen = Date.now();
      students.set(id, cur);
      broadcastStudents(room);
    });

    socket.on("student:thumb", (payload) => {
      const cur = students.get(id) || { id };
      cur.name = payload?.name || cur.name || name;
      cur.thumb = payload?.img || cur.thumb || null;
      cur.lastSeen = Date.now();
      students.set(id, cur);
      broadcastStudents(room);
    });

    socket.on("disconnect", () => {
      students.delete(id);
      broadcastStudents(room);
    });
  }

  if (role === "teacher") {
    socket.join(room);
    socket.emit("teacher:students", Array.from(students.values()));

    socket.on("announcement", (msg) => {
      io.to(room).emit("announcement", msg);
    });
  }
});

httpServer.listen(7070, () => {
  console.log("Realtime + LLM server on :7070");
});

// frontend/src/realtime/socket.ts
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function tabId() {
  let id = localStorage.getItem("tabId");
  if (!id) {
    id = Math.random().toString(36).slice(2);
    localStorage.setItem("tabId", id);
  }
  return id;
}

export function connectSocket(
  role: "student" | "teacher",
  room: string,
  name: string
) {
  const id = tabId();

  if (!socket) {
    socket = io("http://localhost:7070", {
      query: { role, room, name, tabId: id },
    });
  } else {
    // 이미 연결된 소켓의 query 갱신
    (socket.io as any).opts.query = { role, room, name, tabId: id };
  }

  return socket;
}

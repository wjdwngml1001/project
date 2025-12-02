// frontend/src/pages/Teacher.tsx
import { useEffect, useState } from "react";
import { connectSocket } from "../realtime/socket";

type StudentInfo = {
  id: string;
  name: string;
  thumb?: string | null;
  lastSeen: number;
};

export default function Teacher() {
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    const sock = connectSocket("teacher", "3A", "담임");

    sock.on("teacher:students", (list: StudentInfo[]) => {
      setStudents(list || []);
    });

    return () => {
      sock.off("teacher:students");
    };
  }, []);

  const sendAnnouncement = () => {
    if (!announcement.trim()) return;
    const sock = connectSocket("teacher", "3A", "담임");
    sock.emit("announcement", announcement.trim());
    setAnnouncement("");
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>교사 대시보드</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 16,
          alignItems: "flex-start",
        }}
      >
        {/* 좌측: 학생 화면 미리보기 */}
        <div>
          <h3 style={{ marginTop: 0 }}>
            현재 접속 학생 수: {students.length}명
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 12,
            }}
          >
            {students.map((s) => (
              <div
                key={s.id}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  padding: 8,
                  background: "#ffffff",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                }}
              >
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    marginBottom: 4,
                  }}
                >
                  {s.name || "이름 없음"}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#6b7280",
                    marginBottom: 6,
                  }}
                >
                  마지막 신호:{" "}
                  {new Date(s.lastSeen).toLocaleTimeString("ko-KR")}
                </div>
                <div
                  style={{
                    width: "100%",
                    height: 140,
                    borderRadius: 4,
                    overflow: "hidden",
                    border: "1px solid #e5e7eb",
                    background: "#ffffff", // ✅ 썸네일 배경 흰색
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {s.thumb ? (
                    <img
                      src={s.thumb}
                      alt="학생 화면"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                      }}
                    />
                  ) : (
                    <span
                      style={{
                        fontSize: 12,
                        color: "#9ca3af",
                      }}
                    >
                      아직 화면 캡쳐가 없습니다.
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 우측: 공지 보내기 */}
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            padding: 12,
            background: "#f9fafb",
          }}
        >
          <h3 style={{ marginTop: 0 }}>학생 공지 보내기</h3>
          <textarea
            value={announcement}
            onChange={(e) => setAnnouncement(e.target.value)}
            rows={6}
            placeholder="예: 5분 후 전체 실행 버튼을 눌러주세요."
            style={{
              width: "100%",
              padding: 8,
              borderRadius: 4,
              border: "1px solid #d1d5db",
              resize: "vertical",
            }}
          />
          <button
            onClick={sendAnnouncement}
            style={{
              marginTop: 8,
              padding: "8px 16px",
              borderRadius: 6,
              border: "none",
              background: "#16a34a",
              color: "white",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            공지 보내기
          </button>
          <p
            style={{
              marginTop: 8,
              fontSize: 12,
              color: "#6b7280",
            }}
          >
            공지사항은 학생 대시보드와 학생 코딩 화면 모두에
            팝업으로 표시됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}

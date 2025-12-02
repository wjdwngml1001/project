// frontend/src/pages/StudentDashboard.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { connectSocket } from "../realtime/socket";

const BASE =
  (import.meta as any).env?.VITE_API_BASE || "http://localhost:7070";

export default function StudentDashboard() {
  const navigate = useNavigate();

  const [name, setName] = useState(
    localStorage.getItem("studentName") || ""
  );
  const [goal, setGoal] = useState("");
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onGenerate = async () => {
    const trimmedName = name.trim() || "이름 없음";
    const trimmedGoal = goal.trim();

    // 1) 교사 로그인 모드
    if (trimmedName === "교사" && trimmedGoal === "") {
      localStorage.setItem("teacherName", trimmedName);
      // 소켓도 교사 역할로 붙여둠
      connectSocket("teacher", "3A", "교사");
      alert("교사로 로그인 하였습니다.");
      navigate("/teacher");
      return;
    }

    // 2) 일반 학생 모드
    if (!trimmedGoal) {
      alert(
        "학습 목표를 입력하거나,\n교사로 로그인하려면 이름에 '교사'를 입력하고 목표를 비워두세요."
      );
      return;
    }

    // 학생 이름 저장
    setName(trimmedName);
    localStorage.setItem("studentName", trimmedName);

    try {
      setLoading(true);

      const res = await fetch(`${BASE}/api/nl2plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal: trimmedGoal,
          studentName: trimmedName,
        }),
      });

      if (!res.ok) {
        throw new Error("계획 생성 API 호출 실패");
      }

      const data = await res.json();

      const plan = {
        name: trimmedName,
        goal: trimmedGoal,
        summary: data.summary || "AI 요약 결과가 없습니다.",
        ast: data,
        createdAt: Date.now(),
      };

      localStorage.setItem("studentPlan", JSON.stringify(plan));
      setAiSummary(plan.summary);

      alert("학습 계획이 생성되었습니다. 블록 화면으로 이동합니다.");
      navigate("/student/code");
    } catch (e) {
      console.error(e);
      alert("계획 생성 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 16, maxWidth: 960, margin: "0 auto" }}>
      <h2>학생 대시보드</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.1fr 0.9fr",
          gap: 16,
          alignItems: "stretch",
        }}
      >
        {/* 왼쪽: 입력 영역 */}
        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: 8,
            padding: 16,
            background: "#f9fafb",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <label style={{ fontSize: 14 }}>
            이름 (교사는 '교사' 입력)
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 3학년 2반 김코딩 / 교사"
              style={{
                width: "100%",
                marginTop: 4,
                padding: 8,
                borderRadius: 4,
                border: "1px solid #ccc",
              }}
            />
          </label>

          <label style={{ fontSize: 14 }}>
            오늘 만들고 싶은 프로그램을 자연어로 적어보세요
            <textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              rows={6}
              placeholder="예: 스페이스바를 누르면 고양이가 '안녕'이라고 말하고 10걸음 앞으로 가는 프로그램"
              style={{
                width: "100%",
                marginTop: 4,
                padding: 8,
                borderRadius: 4,
                border: "1px solid #ccc",
                resize: "vertical",
              }}
            />
          </label>

          <button
            onClick={onGenerate}
            disabled={loading}
            style={{
              alignSelf: "flex-end",
              padding: "8px 16px",
              borderRadius: 6,
              border: "none",
              background: "#2563eb",
              color: "white",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {loading ? "생성 중..." : "계획 생성 / 교사 로그인"}
          </button>
        </div>

        {/* 오른쪽: AI 요약 + 안내 */}
        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: 8,
            padding: 16,
            background: "#ffffff",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <h3 style={{ fontSize: 16, margin: 0 }}>AI가 도와주는 오늘의 계획 요약</h3>
          {aiSummary ? (
            <p
              style={{
                whiteSpace: "pre-wrap",
                fontSize: 14,
                lineHeight: 1.5,
              }}
            >
              {aiSummary}
            </p>
          ) : (
            <p style={{ fontSize: 14, color: "#6b7280" }}>
              학생은 프로그램 아이디어를 입력하고,{" "}
              <b>“계획 생성 / 교사 로그인”</b> 버튼을 누르면
              <br />
              AI가 단계별 계획을 만들어주고 학생 코딩 화면에서
              <br />
              <b>추천 블록이 미리 채워진 상태</b>로 학습을 시작할 수 있습니다.
              <br />
              교사는 이름에 <b>교사</b>를 입력하고 목표를 비워둔 후 버튼을 눌러
              <br />
              교사 대시보드로 바로 이동할 수 있습니다.
            </p>
          )}

          <div
            style={{
              marginTop: "auto",
              paddingTop: 8,
              borderTop: "1px dashed #e5e7eb",
              fontSize: 12,
              color: "#6b7280",
            }}
          >
            생성된 계획과 요약, 추천 블록 정보는{" "}
            <code>localStorage.studentPlan</code>에 저장되며
            학생 코딩 화면에서 자동으로 불러옵니다.
          </div>
        </div>
      </div>
    </div>
  );
}

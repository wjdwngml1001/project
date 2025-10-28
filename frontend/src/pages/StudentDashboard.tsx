import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useApp } from "../store"
import { getSocket } from "../realtime/socket"
import Toast from "../components/Toast"

export default function StudentDashboard() {
  const [goal, setGoal] = useState("")
  const [toast, setToast] = useState<string | null>(null)
  const nav = useNavigate()
  const { setSuggestions } = useApp()

  const onGenerate = () => {
    if (!goal.trim()) {
      setToast("학습 목표를 입력해주세요.")
      return
    }

    const blocks = [
      { block: "when_start", params: [] },
      { block: "move_steps", params: [10] },
      { block: "say", params: ["안녕!", 2] },
    ]
    setSuggestions(blocks)
    getSocket()?.emit("student:goal", { goal, blocks })
    setToast("목표에 맞는 추천 블록이 생성되었습니다!")
  }

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        background: "#f8fafc",
        fontFamily: "Pretendard, sans-serif",
      }}
    >
      {/* 좌측 입력창 */}
      <div
        style={{
          flex: 3.5,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          padding: "20px 30px 10px 30px",
          borderRight: "1px solid #e5e7eb",
        }}
      >
        <h2 style={{ fontSize: "1.3rem", margin: 0, marginBottom: 8 }}>🧠 학습 목표 입력</h2>
        <p style={{ fontSize: "0.9rem", color: "#6b7280", marginBottom: 10 }}>
          예: “고양이가 움직이며 인사하는 프로그램 만들기”
        </p>

        <textarea
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="학습 목표를 입력하세요..."
          style={{
            flex: 1,
            resize: "none",
            fontSize: "1rem",
            padding: "10px 12px",
            borderRadius: 6,
            border: "1px solid #d1d5db",
            background: "white",
            lineHeight: 1.5,
            height: "100%",
          }}
        />

        <div style={{ textAlign: "right", marginTop: 10 }}>
          <button
            onClick={onGenerate}
            style={{
              padding: "8px 18px",
              background: "#3b82f6",
              color: "white",
              borderRadius: 6,
              border: "none",
              cursor: "pointer",
              fontSize: "0.9rem",
            }}
          >
            🎯 계획 생성
          </button>
        </div>
      </div>

      {/* 우측 패널 */}
      <div
        style={{
          flex: 1.2,
          background: "#f1f5f9",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start", // space-between → flex-start 로 변경
          padding: "20px 24px 40px 24px", // 아래쪽 padding 살짝 추가
        }}
      >
        <div>
          <h3 style={{ fontSize: "1.05rem", marginBottom: 10 }}>📊 학습 진행 현황</h3>
          <ul style={{ fontSize: "0.9rem", lineHeight: 1.6, paddingLeft: 18, margin: 0 }}>
            <li>최근 학습: 반복문 실습</li>
            <li>진도율: 80%</li>
            <li>남은 과제: 변수 활용</li>
          </ul>
        </div>

        <button
          onClick={() => nav("/student/code")}
          style={{
            background: "#10b981",
            color: "white",
            border: "none",
            borderRadius: 6,
            padding: "10px 16px",
            fontSize: "0.9rem",
            cursor: "pointer",
            alignSelf: "center",
            width: "90%",
            marginTop: "auto", // 화면 줄어도 버튼이 약간 위에 남음
            marginBottom: "20px", // 버튼이 너무 밑에 붙지 않게
          }}
        >
          ▶ 블록 코딩으로 이동
        </button>
      </div>

      {toast && <Toast text={toast} />}
    </div>
  )
}

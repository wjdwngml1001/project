// frontend/src/api/student.ts (예시)
const BASE = import.meta.env.VITE_API_BASE || "http://localhost:7070";

export async function generatePlan(text: string, grade: number) {
  const res = await fetch(`${BASE}/api/nl2plan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, grade }),
  });
  if (!res.ok) throw new Error("계획 생성 실패");
  return res.json(); // { summary, goals, steps, ast }
}

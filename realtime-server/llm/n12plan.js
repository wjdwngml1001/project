// realtime-server/llm/nl2plan.js
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // .env 에 설정
});

/**
 * 자연어 목표를 받아 블록 계획/요약/AST를 생성
 * @param {Object} params
 * @param {string} params.goal
 * @param {string} params.studentName
 */
export async function nl2plan({ goal, studentName }) {
  const prompt = `
당신은 초등학생용 블록 코딩 수업을 돕는 교사 보조 AI입니다.
다음은 학생이 말한 프로그램 아이디어입니다.

[학생 이름] ${studentName}
[학생 목표] ${goal}

아래 JSON 형식으로만 출력하세요. 설명 문장은 쓰지 마세요.

{
  "summary": "학생이 만들고자 하는 프로그램을 교사가 한눈에 이해할 수 있도록 3~4문장으로 요약",
  "steps": [
    {
      "type": "start",
      "description": "언제 시작되는지 (예: 스페이스 키를 눌렀을 때, 시작하기 버튼을 클릭했을 때 등)"
    },
    {
      "type": "say",
      "text": "캐릭터가 말할 내용",
      "description": "..."
    },
    {
      "type": "move",
      "steps": 10,
      "description": "앞으로 10걸음 이동"
    }
  ]
}
`;

  const response = await client.responses.create({
    model: "gpt-4.1-mini", // 저렴한 LLM. 필요하면 4.1 등으로 변경 가능
    input: prompt,
    response_format: { type: "json_object" },
  });

  // SDK 버전에 따라 꺼내는 방식이 조금 다를 수 있음
  const text =
    response.output_text || // 새로운 SDK
    response.output?.[0]?.content?.[0]?.text ||
    "{}";

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    parsed = {
      summary: "AI 요약에 실패했습니다. 목표: " + goal,
      steps: [],
    };
  }

  return parsed;
}

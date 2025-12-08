// realtime-server/index.js
import { createServer } from 'http';
import express from 'express';
import { Server } from 'socket.io';
import OpenAI from 'openai';

const app = express();
const httpServer = createServer(app);

// JSON + CORS 설정
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// ── OpenAI 클라이언트 ─────────────────────────
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || undefined,
});

// ── Socket.IO ─────────────────────────────────
const io = new Server(httpServer, {
  cors: { origin: '*' },
});

// 탭/학생 단위로 상태 저장
const students = new Map();

/** 교사에게 특정 반 상태 broadcast */
function broadcastState(classId) {
  const list = Array.from(students.values()).filter(
    (s) => s.classId === classId
  );
  console.log('broadcastState', classId, 'students:', list.length);
  io.to(`teacher:${classId}`).emit('teacher:state', list);
}

io.on('connection', (socket) => {
  console.log('socket connected', socket.id);

  socket.on('join', ({ role, classId, name, tabId }) => {
    console.log('join', { role, classId, name, tabId });
    socket.data.role = role;
    socket.data.classId = classId;
    socket.data.tabId = tabId;

    if (role === 'student') {
      students.set(tabId, {
        id: tabId,
        name: name || '',
        classId,
        goal: '',
        summary: '',
        thumb: null,
        lastSeen: Date.now(),
      });
      socket.join(`class:${classId}`);
      broadcastState(classId);
    } else if (role === 'teacher') {
      socket.join(`teacher:${classId}`);
      broadcastState(classId);
    }
  });

  socket.on('student:plan', ({ tabId, classId, goal, summary }) => {
    console.log('student:plan', { tabId, classId });
    const s = students.get(tabId);
    if (s) {
      s.goal = goal;
      s.summary = summary;
      s.lastSeen = Date.now();
    }
    broadcastState(classId);
  });

  socket.on('student:thumb', ({ tabId, classId, thumb }) => {
    console.log('student:thumb', {
      id: tabId,
      cid: classId,
      hasThumb: !!thumb,
    });
    const s = students.get(tabId);
    if (s) {
      s.thumb = thumb;
      s.lastSeen = Date.now();
    }
    broadcastState(classId);
  });

  // ✅ [추가] 교사 공지 → 같은 반 학생들에게 broadcast
  socket.on('teacher:announcement', (message) => {
    const { classId } = socket.data || {};
    if (!classId) return;
    // 학생들이 join 할 때 들어가는 방으로 공지 전송
    io.to(`class:${classId}`).emit('announcement', String(message || ''));
  });

  socket.on('disconnect', () => {
    const { role, classId, tabId } = socket.data || {};
    if (role === 'student' && tabId && students.has(tabId)) {
      students.delete(tabId);
      if (classId) broadcastState(classId);
    }
  });
});

// ── 서버측 규칙 기반 fallback 플랜 ─────────────
function makeRulePlanServerSide(name, goalRaw) {
  const nameSafe = name && name.trim() ? name.trim() : '학생';
  const g = goalRaw || '고양이가 인사하는 프로그램';

  /** 프론트의 makeFallbackPlan 과 동일한 구조 유지 */
  let blocks = [];

  if (g.includes('스페이스') || g.includes('스페이스바')) {
    blocks = [
      { type: 'event_when_key_pressed', fields: { KEY: 'SPACE' } },
      { type: 'looks_say', fields: { TEXT: '안녕!' } },
    ];
  } else if (g.includes('오른쪽') || g.includes('시계')) {
    blocks = [
      { type: 'event_when_flag_clicked' },
      { type: 'motion_turnright', fields: { DEG: 90 } },
    ];
  } else if (g.includes('반복') || g.includes('여러 번')) {
    blocks = [
      { type: 'event_when_flag_clicked' },
      { type: 'control_repeat', fields: { TIMES: 10 } },
      { type: 'motion_movesteps', fields: { STEPS: 10 } },
    ];
  } else {
    blocks = [
      { type: 'event_when_flag_clicked' },
      { type: 'looks_say', fields: { TEXT: '시작!' } },
    ];
  }

  const summary =
    `${nameSafe}의 자연어 목표를 분석하여 ` +
    `이벤트 블록과 움직임/생김새 블록을 중심으로 기본 구조를 구성했습니다.`;

  return { summary, blocks };
}

// ── 자연어 → 블록 계획 LLM API (/api/nl2plan) ─────────
app.post('/api/nl2plan', async (req, res) => {
  const { name = '학생', goal = '' } = req.body || {};
  if (!goal || !goal.trim()) {
    return res.status(400).json({ error: 'goal_required' });
  }

  // 1) API 키 없으면 무조건 규칙 기반으로
  if (!process.env.OPENAI_API_KEY) {
    console.warn(
      '[nl2plan] OPENAI_API_KEY 미설정 – 규칙 기반 플랜으로 응답합니다.'
    );
    const plan = makeRulePlanServerSide(name, goal);
    return res.json(plan);
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: [
            '너는 초등 SW 교육용 블록 코딩 튜터다.',
            '학생의 "자연어 목표"를 보고 어떤 "시작 블록"을 사용할지 결정하고,',
            '학생이 참고하면 좋은 블록 카테고리를 한국어 문장으로 설명해 준다.',
            '',
            '1. 시작 블록은 아래 세 가지 중 "정확히 하나"만 선택한다.',
            '- event_when_flag_clicked : "시작하기 버튼을 클릭했을 때"',
            '- event_when_key_pressed : "키보드 ~ 키를 눌렀을 때"',
            '- event_when_clicked : "이 스프라이트를 클릭했을 때"',
            '',
            '2. event_when_key_pressed 를 선택했다면 fields.KEY 는 다음 값 중 하나여야 한다.',
            '- "SPACE", "UP", "DOWN", "LEFT", "RIGHT"',
            '',
            '3. blocks 배열에는 반드시 추천 시작 블록만 넣는다. (1개 이상 가능)',
            '   그 외 움직임/생김새/흐름 블록은 넣지 않는다.',
            '',
            '4. summary 필드에는 학생이 어떤 카테고리의 블록을 보면 좋을지',
            '   초등학생이 이해할 수 있는 자연어 문장 1~3개로 설명한다.',
            '   예:',
            '   - 말하기/생각하기/대사 → "생김새" 카테고리',
            '   - 움직이기/걷다/점프/회전/이동 → "움직임" 카테고리',
            '   - 반복/여러 번/~번 하기 → "흐름" 카테고리',
            '   - 조건/만약/~이면 → "판단" 카테고리',
            '   - 숫자/합/더하기/빼기 → "계산" 카테고리',
            '   - 점수/목숨/변수/값 저장 → "자료" 카테고리',
            '   - 목록/리스트 → "리스트" 카테고리',
            '   - 자주 쓰는 동작 묶기 → "함수" 카테고리',
            '',
            '5. 반드시 아래 JSON 형식으로만 답한다. 추가 설명 문장은 쓰지 않는다.',
            '{',
            '  "summary": "<학생이 참고하면 좋은 카테고리 설명을 한글 문장으로 1~3문장>",',
            '  "blocks": [',
            '    {',
            '      "type": "event_when_flag_clicked" | "event_when_key_pressed" | "event_when_clicked",',
            '      "fields": {',
            '        "KEY": "SPACE" | "UP" | "DOWN" | "LEFT" | "RIGHT"',
            '      }',
            '    }',
            '  ]',
            '}',
          ].join('\n'),
        },
        {
          role: 'user',
          content:
            `학생 이름: ${name || '학생'}\n` +
            `자연어 목표: ${goal}\n\n` +
            '위 규칙에 맞게 JSON만 응답해줘.',
        },
      ],
    });

    const text = completion.choices[0]?.message?.content || '{}';
    let plan;
    try {
      plan = JSON.parse(text);
    } catch (e) {
      console.error('[nl2plan] JSON 파싱 실패, 원본 텍스트:', text);
      throw e;
    }

    if (!plan || !Array.isArray(plan.blocks)) {
      console.error('[nl2plan] LLM output invalid:', plan);
      throw new Error('invalid llm output');
    }

    // KEY 정규화
    plan.blocks.forEach((b) => {
      if (b.type === 'event_when_key_pressed' && b.fields?.KEY) {
        const v = String(b.fields.KEY).toUpperCase();
        if (['SPACE', 'UP', 'DOWN', 'LEFT', 'RIGHT'].includes(v)) {
          b.fields.KEY = v;
        } else {
          delete b.fields.KEY;
        }
      }
    });

    return res.json(plan);
  } catch (err) {
    const status = err?.status || err?.response?.status;
    const data = err?.response?.data;
    console.error('[nl2plan] llm error status=', status);
    if (data) console.error('[nl2plan] llm error data=', data);
    console.error('[nl2plan] llm error message=', err.message);

    const fallback = makeRulePlanServerSide(name, goal);
    return res.json(fallback);
  }
});

const PORT = process.env.PORT || 7070;
httpServer.listen(PORT, () => {
  console.log('realtime-server listening on', PORT);
});

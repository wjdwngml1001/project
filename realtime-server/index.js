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
  const g = goalRaw || '고양이가 인사하는 프로그램';

  let blocks = [];

  if (g.includes('스페이스') || g.includes('스페이스바')) {
    blocks = [
      { type: 'event_when_key_pressed', fields: { KEY: 'SPACE' } },
      { type: 'looks_say', fields: { TEXT: '안녕!' } },
    ];
  } else if (g.includes('키보드') || g.includes('화살표')) {
    blocks = [{ type: 'event_when_key_pressed', fields: { KEY: 'SPACE' } }];
  } else if (g.includes('스프라이트') || g.includes('캐릭터를 클릭')) {
    blocks = [{ type: 'event_when_clicked' }];
  } else {
    blocks = [{ type: 'event_when_flag_clicked' }];
  }

  const summary = makeCategorySummary(goalRaw, '');

  return { summary, blocks };
}

/** 자연어 목표에서 블록 카테고리들을 추론해서 1~3문장 요약 생성 */
function makeCategorySummary(goalRaw, baseSummary) {
  const goal = (goalRaw || '').trim();
  const base = (baseSummary || '').trim();

  // 다른 카테고리는 "목표 + 기존 summary" 모두 참고
  const textAll = goal + (base ? ' ' + base : '');

  const keywordGroups = [
    {
      // 생김새: 어간 중심으로(말하/생각하/숨기/보이 등) → 말하고, 말하면, 숨겨도… 전부 잡힘
      cat: '생김새',
      kw: ['말하', '생각하', '대사', '표정', '모양', '숨기', '보이'],
      phrase: '말하기/생각하기/대사',
    },
    {
      // 움직임
      cat: '움직임',
      kw: ['움직', '이동', '걷', '달리', '점프', '뛰', '돌', '회전', '좌표', 'x좌표', 'y좌표'],
      phrase: '움직이기/이동하기/회전하기',
    },
    {
      // 흐름 (반복/만약~이면 구조 포함)
      cat: '흐름',
      kw: ['반복', '여러 번', '번 하기', '계속', '무한', '만약', '이면'],
      phrase: '반복/여러 번/계속하기',
    },
    {
      // 판단 – ★ goal(학생 문장)에서만 검색 ★
      cat: '판단',
      kw: [
        '비교',
        '같다',
        '같은지',
        '다른지',
        '크다',
        '작다',
        '이상',
        '이하',
        '초과',
        '미만',
        '보다',
        '>=',
        '<=',
        '==',
        '!=',
        '참',
        '거짓',
      ],
      phrase: '값을 비교하거나 참/거짓을 판단하기',
    },
    {
      cat: '계산',
      kw: ['숫자', '합', '더하기', '빼기', '곱하기', '나누기', '계산'],
      phrase: '숫자 계산(더하기/빼기 등)',
    },
    {
      cat: '자료',
      kw: ['점수', '목숨', '변수', '저장', '기록', '카운트'],
      phrase: '점수/변수와 같은 값 저장',
    },
    {
      cat: '리스트',
      kw: ['목록', '리스트'],
      phrase: '목록/리스트',
    },
    {
      cat: '함수',
      kw: ['함수', '묶기', '자주 쓰'],
      phrase: '자주 쓰는 동작 묶기',
    },
  ];

  const foundCats = [];
  const phrases = [];

  keywordGroups.forEach((g) => {
    // 판단: goal 에서만 키워드 찾기 (summary에 있는 '참/거짓' 설명은 무시)
    const targetText = g.cat === '판단' ? goal : textAll;
    if (!targetText) return;

    if (g.kw.some((k) => targetText.includes(k))) {
      foundCats.push(g.cat);
      phrases.push(g.phrase);
    }
  });

  if (!foundCats.length) {
    if (base) return base;
    return goal
      ? `이 목표를 보고 어떤 블록이 필요할지 직접 생각하며 여러 카테고리를 탐색해 보세요.`
      : '여러 블록 카테고리를 탐색하며 필요한 블록을 직접 찾아 사용해 보세요.';
  }

  const keywordText = phrases.join(', ');
  const catText = foundCats.join(', ');

  return `이 목표에는 ${keywordText}와 같은 표현이 들어가 있어서, ${catText} 카테고리의 블록을 함께 사용하면 좋아요.`;
}

/** LLM이 돌려준 blocks에 시작 이벤트가 없으면 안전하게 하나 추가 */
function ensureStartBlock(plan, goalRaw) {
  if (!plan || !Array.isArray(plan.blocks)) return plan;

  const events = [
    'event_when_flag_clicked',
    'event_when_key_pressed',
    'event_when_clicked',
  ];
  const hasEvent = plan.blocks.some((b) => events.includes(b.type));
  if (hasEvent) return plan;

  const goal = (goalRaw || '').trim();

  // 1) 키보드 관련 표현
  if (
    goal.includes('스페이스') ||
    goal.includes('스페이스바') ||
    goal.includes('키보드') ||
    goal.includes('화살표') ||
    goal.includes('키를 눌렀')
  ) {
    let key = 'SPACE';
    if (goal.includes('위쪽') || goal.includes('위 화살표')) key = 'UP';
    else if (goal.includes('아래') || goal.includes('아래쪽')) key = 'DOWN';
    else if (goal.includes('왼쪽')) key = 'LEFT';
    else if (goal.includes('오른쪽')) key = 'RIGHT';

    plan.blocks.unshift({
      type: 'event_when_key_pressed',
      fields: { KEY: key },
    });
    return plan;
  }

  // 2) 스프라이트/캐릭터 클릭 관련
  if (
    goal.includes('스프라이트를 클릭') ||
    goal.includes('캐릭터를 클릭') ||
    goal.includes('그림을 클릭')
  ) {
    plan.blocks.unshift({ type: 'event_when_clicked' });
    return plan;
  }

  // 3) 그 외에는 시작하기 버튼 기본
  plan.blocks.unshift({ type: 'event_when_flag_clicked' });
  return plan;
}

// ── 자연어 → 블록 계획 LLM API (/api/nl2plan) ─────────
app.post('/api/nl2plan', async (req, res) => {
  const { name = '학생', goal = '' } = req.body || {};
  if (!goal || !goal.trim()) {
    return res.status(400).json({ error: 'goal_required' });
  }

  // API 키 없으면 규칙 기반
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
            '학생의 "자연어 목표"를 보고 어떤 "시작 블록"을 사용할지 결정하고, 학생이 참고하면 좋은 블록 카테고리를 한국어로 설명해 준다.',
            '1. 시작 블록은 아래 세 가지 중 "정확히 하나"만 선택한다.',
            '- event_when_flag_clicked : "시작하기 버튼을 클릭했을 때"',
            '- event_when_key_pressed : "키보드 ~ 키를 눌렀을 때"',
            '- event_when_clicked : "이 스프라이트를 클릭했을 때"',
            '2. event_when_key_pressed 를 선택했다면 fields.KEY 는 다음 값 중 하나여야 한다.',
            '- "SPACE" (스페이스바)',
            '- "UP" (위쪽 화살표)',
            '- "DOWN" (아래쪽 화살표)',
            '- "LEFT" (왼쪽 화살표)',
            '- "RIGHT" (오른쪽 화살표)',
            '3. blocks 배열에는 "반드시 길이가 추천 시작 블록을 넣는다.(2개 이상도 가능) 그 외 움직임/생김새/흐름 블록은 넣지 않는다.',
            '4. summary 필드에는 학생이 어떤 카테고리의 블록을 보면 좋을지 한글로 설명한다.',
            '5. 반드시 아래 JSON 형식으로만 답한다. 추가 설명 문장은 쓰지 않는다.',
            '{',
            '  "summary": "<학생이 참고하면 좋은 카테고리 설명을 한글로 1~3문장>",',
            '  "blocks": [',
            '    {',
            '      "type": "event_when_flag_clicked" | "event_when_key_pressed" | "event_when_clicked",',
            '      "fields": {',
            '        // key 블록인 경우에만 KEY 필드를 포함, 그 외에는 생략 가능',
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
            '형식에 맞춰서 시작 블록과 요약만 JSON으로 답해줘.',
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
        const v = String(b.fields.KEY).toLowerCase();
        if (v === 'space' || v === '스페이스바' || v === '스페이스') {
          b.fields.KEY = 'SPACE';
        } else if (v === 'up' || v === '위' || v === '위쪽') {
          b.fields.KEY = 'UP';
        } else if (v === 'down' || v === '아래' || v === '아래쪽') {
          b.fields.KEY = 'DOWN';
        } else if (v === 'left' || v === '왼쪽') {
          b.fields.KEY = 'LEFT';
        } else if (v === 'right' || v === '오른쪽') {
          b.fields.KEY = 'RIGHT';
        }
      }
    });

    // 시작 이벤트 보정
    ensureStartBlock(plan, goal);

    // 요약 문장 보강 (여러 카테고리 동시에 언급)
    plan.summary = makeCategorySummary(goal, plan.summary || '');

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

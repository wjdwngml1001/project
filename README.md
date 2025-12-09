# 초등 소프트웨어 교육을 위한 자연어–블록코드 변환 학습 보조 시스템
자연어로 코딩 목표를 입력하면 AI가 시작 블록을 추천해주고, 학생의 Blockly 코딩 화면을 교사가 실시간으로 모니터링할 수 있는 **AI 기반 초등 SW 교육 학습 보조 플랫폼**입니다.

---

## 📌 주요 기능

### 🧒 학생 대시보드
- 학생 이름 + 자연어 목표 입력
- OpenAI LLM이 자연어 목표를 분석하여  
  → **시작 블록 자동 추천**  
  → **필요한 블록 카테고리 요약 제공**
- 자동 생성된 계획을 기반으로 Blockly 코딩 시작
- 생성한 블록 코드를 *JSON(.json)** 형식으로 내보내기 가능
- 학생의 블록 화면은 실시간으로 교사에게 전송됨

### 🧩 학생 코딩(Blockly)
- 한국어 기반 블록 카테고리 제공  
  (시작 / 흐름 / 움직임 / 생김새 / 소리 / 판단 / 계산 / 자료 / 리스트 / 함수)
- LLM이 추천한 시작 블록을 자동 배치
- 실시간 SVG 썸네일 캡처 → Socket을 통해 교사에게 전달

### 👩‍🏫 교사 대시보드
- **실시간 학생 목록 갱신 (Socket.IO 기반)**
- 학생 목표 / 요약 / 썸네일 화면을 그리드 형태로 표시
- 학생 클릭 시 큰 화면 팝업 제공
- 교사 공지 → 학생에게 실시간 팝업으로 전달

---

## 📂 프로젝트 구성
```bash
project/
├── frontend/ # React + Vite + Typescript + Blockly
│ ├── src/
│ │ ├── api/  # api 호출
│ │ ├── pages/ # StudentDashboard, StudentCode, Teacher 페이지
│ │ ├── blockly/ # Block 정의, toolbox, generator
│ │ ├── realtime/ # socket.io-client 연결
│ │ └── style.css
│ └── index.html
└── realtime-server/ # Node.js + express + socket.io + OpenAI
  ├── index.js # LLM API + 실시간 소켓 서버
  ├── server.js # 서버
  └── package.json
```

---

## 🚀 실행 방법

### 1. 저장소 Clone
```bash
git clone https://github.com/wjdwngml1001/project.git
cd project
```
---

### 2. 실시간 서버 실행 (Node + Socket.IO + OpenAI)
```bash
cd realtime-server
npm install
```
🔑 서버 실행 및 OPEN_API 설정(현재는 제 개인 키를 사용 중입니다. KEY가 필요하다면 제 메일로 연락 부탁드립니다.)

서버 실행
```bash
set OPENAI_API_KEY=(키 복사붙여넣기) && node index.js
```

실행되면 cmd에 다음과 같이 뜬다.
```bash
realtime-server listening on 7070
```
---

### 3. 프론트엔드 실행 (React + Vite)
```bash
cd frontend
npm install
npm run dev
```

실행 후 브라우저에서 아래 주소로 접속합니다.
```bash
http://localhost:5173/
```
---

## 🎮 사용 방법

### 1. 학생 모드

브라우저에서 /student 또는 “학생 대시보드” 진입
이름과 자연어 목표 입력
계획 생성 → AI가 시작 블록 추천
코딩 화면으로 이동 클릭
Blockly로 자유롭게 블록 조립
원하는 경우 JSON 파일로 내보내기 가능

### 2. 교사 모드

브라우저에서 /teacher 페이지로 이동
학생들이 접속할 때 자동으로 리스트에 표시됨
각 학생의 블록 미리보기 확인
클릭하면 팝업으로 크게 볼 수 있음
공지 입력 → 모든 학생에게 팝업 알림 전송

## 💡 기술 스택

Frontend

React (Vite)

TypeScript

Blockly (커스텀 한글 블록)

socket.io-client

Backend (Realtime)

Node.js + Express

socket.io

OpenAI GPT API (gpt-4o-mini)


## 🤖 LLM 활용 방식

서버에서 /api/nl2plan API로 LLM 호출

자연어 목표 분석

필요한 시작 블록 정확하게 추천(여러 개도 가능)

학생이 참고할 블록 카테고리 요약 문장 생성


실패 시 규칙 기반 fall-back 적용


## 📈 기대 효과

초등 학생의 블록코딩 접근성 향상

자연어 기반 사고 → 블록 기반 사고로 부드러운 연결

교사의 실시간 모니터링을 통해 맞춤 지도 가능

SW·AI 융합 교육 도구로 확장 가능성 큼


---

### 프로젝트 문의
wjdwngml1001@khu.ac.kr

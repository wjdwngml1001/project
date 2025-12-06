// frontend/src/pages/Teacher.tsx
import { useEffect, useState } from 'react';
import { connectSocket } from '../realtime/socket';

type LiveStudent = {
  id: string;
  name: string;
  goal: string;
  summary: string;
  thumb?: string;
  lastPing: number;
};

function openPopupForStudent(s: LiveStudent) {
  const win = window.open(
    '',
    `student-preview-${s.id}`,
    'width=900,height=700,noopener,noreferrer',
  );
  if (!win) return;

  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${s.name} - 블록 화면</title>
  <style>
    body { margin:0; font-family:-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background:#f5f5f5; }
    .wrap { padding:16px; }
    .card { background:#fff; border-radius:8px; padding:16px; box-shadow:0 2px 8px rgba(0,0,0,0.1); }
    .title { font-weight:600; font-size:18px; margin-bottom:8px; }
    .meta { font-size:13px; color:#555; margin-bottom:8px; }
    img { width:100%; max-height:560px; object-fit:contain; background:#fafafa; border-radius:4px; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <div class="title">${s.name}</div>
      <div class="meta">목표: ${
        s.goal || '(학생이 아직 목표를 입력하지 않았습니다.)'
      }</div>
      <div class="meta">요약: ${
        s.summary || '(AI 요약 결과가 없습니다.)'
      }</div>
      ${
        s.thumb
          ? `<img src="${s.thumb}" alt="블록 화면" />`
          : '<div style="width:100%;height:300px;display:flex;align-items:center;justify-content:center;color:#999;font-size:13px;background:#fafafa;border-radius:4px;">미리보기가 없습니다.</div>'
      }
    </div>
  </div>
</body>
</html>`;

  win.document.open();
  win.document.write(html);
  win.document.close();
}

export default function Teacher() {
  const [students, setStudents] = useState<Record<string, LiveStudent>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const sock = connectSocket('teacher', '3A', '교사');

    sock.on('teacher:state', (payload: any) => {
      console.log('[teacher:state] payload =', payload);

      if (!payload || !Array.isArray(payload.students)) return;
      const map: Record<string, LiveStudent> = {};
      payload.students.forEach((s: any) => {
        if (!s.id) return;
        map[s.id] = {
          id: s.id,
          name: s.name || `학생-${String(s.id).slice(0, 4)}`,
          goal: s.goal || '',
          summary: s.summary || '',
          thumb: s.thumb,
          lastPing: s.lastPing || Date.now(),
        };
      });
      setStudents(map);
    });

    return () => {
      sock.off('teacher:state');
    };
  }, []);

  const now = Date.now();
  const ACTIVE_MS = 15000;
  const activeStudents = Object.values(students).filter(
    (s) => now - s.lastPing < ACTIVE_MS,
  );

  const selected = selectedId
    ? activeStudents.find((s) => s.id === selectedId) || null
    : null;

  return (
    <div style={{ padding: 16 }}>
      <h2>교사 대시보드</h2>
      <p style={{ fontSize: 14, color: '#555' }}>
        현재 접속 중인 학생 수: <b>{activeStudents.length}</b>
      </p>

      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        {/* 왼쪽: 학생 목록 */}
        <div style={{ flex: 1 }}>
          {activeStudents.length === 0 && (
            <div
              style={{
                padding: 12,
                borderRadius: 8,
                border: '1px dashed #ccc',
                color: '#666',
                fontSize: 14,
              }}
            >
              현재 접속 중인 학생이 없습니다.
            </div>
          )}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: 12,
            }}
          >
            {activeStudents.map((s) => (
              <div
                key={s.id}
                onClick={() => {
                  setSelectedId(s.id);
                  openPopupForStudent(s); // 🔍 팝업으로 확대
                }}
                style={{
                  border:
                    s.id === selectedId ? '2px solid #2563eb' : '1px solid #ddd',
                  borderRadius: 8,
                  padding: 8,
                  cursor: 'pointer',
                  background: '#fff',
                  boxShadow:
                    s.id === selectedId
                      ? '0 0 0 2px rgba(37,99,235,0.1)'
                      : '0 1px 3px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{s.name}</div>
                <div style={{ fontSize: 12, color: '#555', marginBottom: 4 }}>
                  목표:{' '}
                  {s.goal || '(학생이 아직 목표를 입력하지 않았습니다.)'}
                </div>
                <div style={{ fontSize: 12, color: '#555', marginBottom: 4 }}>
                  요약:{' '}
                  {s.summary
                    ? s.summary
                    : '(AI 요약 결과가 없습니다. 학생 대시보드에서 계획을 생성하면 요약이 표시됩니다.)'}
                </div>
                {s.thumb ? (
                  <img
                    src={s.thumb}
                    alt="학생 블록 미리보기"
                    style={{
                      width: '100%',
                      height: 120,
                      objectFit: 'contain',
                      background: '#fafafa',
                      borderRadius: 4,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: 120,
                      borderRadius: 4,
                      background: '#fafafa',
                      fontSize: 12,
                      color: '#999',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    미리보기가 없습니다.
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 오른쪽: 선택한 학생 요약 (보조용) */}
        <div style={{ width: 320 }}>
          <h3 style={{ marginBottom: 8 }}>선택한 학생 화면</h3>
          {selected ? (
            <div
              style={{
                border: '1px solid #ddd',
                borderRadius: 8,
                padding: 8,
                background: '#fff',
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 4 }}>
                {selected.name}
              </div>
              <div style={{ fontSize: 12, color: '#555', marginBottom: 4 }}>
                목표: {selected.goal || '(목표 없음)'}
              </div>
              <div style={{ fontSize: 12, color: '#555', marginBottom: 4 }}>
                요약:{' '}
                {selected.summary || '(AI 요약 결과가 없습니다.)'}
              </div>
              {selected.thumb ? (
                <img
                  src={selected.thumb}
                  alt="학생 블록 확대"
                  style={{
                    width: '100%',
                    maxHeight: 260,
                    objectFit: 'contain',
                    background: '#fafafa',
                    borderRadius: 4,
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: 260,
                    borderRadius: 4,
                    background: '#fafafa',
                    fontSize: 12,
                    color: '#999',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  아직 미리보기가 없습니다.
                </div>
              )}
            </div>
          ) : (
            <div
              style={{
                border: '1px dashed #ccc',
                borderRadius: 8,
                padding: 12,
                fontSize: 12,
                color: '#666',
              }}
            >
              왼쪽 목록에서 학생을 클릭하면<br />
              여기에서 화면을 크게 볼 수 있습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

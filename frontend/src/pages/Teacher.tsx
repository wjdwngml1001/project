// frontend/src/pages/Teacher.tsx
import { useEffect, useState } from 'react';
import { connectSocket } from '../realtime/socket';

type StudentSnapshot = {
  id: string;
  name?: string;
  goal: string;
  summary: string;
  thumb?: string | null;
};

export default function Teacher() {
  const [students, setStudents] = useState<StudentSnapshot[]>([]);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    // 교사로 접속
    const sock = connectSocket('teacher', '3A', '교사');

    // 서버에서 상태를 받으면 전체 갱신
    sock.on('teacher:state', (list: StudentSnapshot[]) => {
      setStudents(list);
    });

    return () => {
      sock.off('teacher:state');
    };
  }, []);

  // 이름 라벨
  const labelFor = (s: StudentSnapshot) =>
    s.name && s.name.trim() ? s.name.trim() : `학생-${s.id.slice(0, 8)}`;

  const onSendNotice = () => {
    const sock = connectSocket('teacher', '3A', '교사');
    if (notice.trim()) {
      sock.emit('teacher:announcement', notice.trim());
      alert('학생들에게 공지가 전송되었습니다.');
      setNotice('');
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>교사 대시보드</h2>
      <div style={{ marginBottom: 8 }}>
        현재 접속 중인 학생 수 : {students.length}명
      </div>

      {/* 공지 영역 */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          alignItems: 'stretch',
          marginBottom: 16,
          maxWidth: 600,
        }}
      >
        <textarea
          value={notice}
          onChange={(e) => setNotice(e.target.value)}
          placeholder="학생들에게 보낼 공지를 입력하세요."
          style={{ flex: 1, height: 80 }}
        />
        <button
          onClick={onSendNotice}
          style={{ width: 120, height: 80 }}
        >
          공지 보내기
        </button>
      </div>

      <div style={{ marginBottom: 8, fontWeight: 'bold' }}>학생 화면 미리보기</div>

      {/* 학생 카드 그리드 */}
      {students.length === 0 ? (
        <div style={{ fontSize: 13, color: '#666' }}>
          현재 접속 중인 학생이 없습니다.
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 16,
          }}
        >
          {students.map((s) => (
            <div
              key={s.id}
              style={{
                border: '1px solid #ddd',
                borderRadius: 8,
                padding: 12,
                background: '#ffffff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <div style={{ fontWeight: 'bold', fontSize: 15 }}>
                {labelFor(s)}
              </div>
              <div style={{ fontSize: 13 }}>
                <div>
                  <b>목표 :</b>{' '}
                  {s.goal && s.goal.trim() ? s.goal : '(입력 없음)'}
                </div>
                <div>
                  <b>요약 :</b>{' '}
                  {s.summary && s.summary.trim()
                    ? s.summary
                    : '(요약 없음)'}
                </div>
              </div>

              <div
                style={{
                  marginTop: 8,
                  border: '1px solid #eee',
                  borderRadius: 6,
                  background: '#fafafa',
                  height: 180,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  cursor: s.thumb ? 'pointer' : 'default',
                }}
                onClick={() => {
                  if (!s.thumb) return;
                  const win = window.open('', '_blank');
                  if (win) {
                    win.document.write(
                      `<img src="${s.thumb}" style="max-width:100%;height:auto;" />`,
                    );
                  }
                }}
              >
                {s.thumb ? (
                  <img
                    src={s.thumb}
                    alt="학생 블록 미리보기"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <div style={{ fontSize: 12, color: '#999' }}>
                    아직 블록 화면이 전송되지 않았습니다.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

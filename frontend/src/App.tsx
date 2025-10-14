// src/App.tsx
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useApp } from './store'
import { useEffect } from 'react'

export default function App() {
  const loc = useLocation()
  const { setScreen } = useApp()

  // ✅ useEffect 안에서만 상태 업데이트
  useEffect(() => {
    if (loc.pathname.includes('/student/code')) {
      setScreen('code')
    } else {
      setScreen('dashboard')
    }
  }, [loc.pathname, setScreen])

  // UI 렌더링은 단순히 상태 읽기만 하도록
  const screen = loc.pathname.includes('/student/code') ? 'code' : 'dashboard'

  return (
    <div>
      <div
        style={{
          display: 'flex',
          gap: 12,
          padding: 12,
          borderBottom: '1px solid #eee',
          alignItems: 'center'
        }}
      >
        <b>자연어→블록 학습 보조 데모</b>
        <Link
          to="/student/dashboard"
          className="badge"
          style={{
            background: loc.pathname.includes('/student/dashboard')
              ? '#e0f2fe'
              : ''
          }}
        >
          학생 대시보드
        </Link>
        <Link
          to="/student/code"
          className="badge"
          style={{
            background: loc.pathname.includes('/student/code') ? '#e0f2fe' : ''
          }}
        >
          학생 코딩
        </Link>
        <Link
          to="/teacher"
          className="badge"
          style={{
            background: loc.pathname === '/teacher' ? '#e0f2fe' : ''
          }}
        >
          교사 대시보드
        </Link>
        <span className="small" style={{ marginLeft: 'auto' }}>
          현재 화면: <span className="hl">{screen}</span>
        </span>
      </div>
      <Outlet />
    </div>
  )
}

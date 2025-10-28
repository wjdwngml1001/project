import { Outlet, Link, useLocation } from "react-router-dom"

export default function App() {
  const loc = useLocation()
  const on = (path: string) => loc.pathname.startsWith(path)

  return (
    <div className="page">
      <header className="topbar">
        <b className="brand">자연어→블록</b>
        <nav className="nav">
          <Link className={`navlink ${on("/student/dashboard")?"on":""}`} to="/student/dashboard">학생 대시보드</Link>
          <Link className={`navlink ${on("/student/code")?"on":""}`} to="/student/code">학생 코딩</Link>
          <Link className={`navlink ${on("/teacher")?"on":""}`} to="/teacher">교사 대시보드</Link>
        </nav>
      </header>
      <main className="main"><Outlet /></main>
    </div>
  )
}

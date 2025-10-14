import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import App from './App'
import StudentDashboard from './pages/StudentDashboard'
import StudentCode from './pages/StudentCode'
import Teacher from './pages/Teacher'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  //<React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<App />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/code" element={<StudentCode />} />
          <Route path="/teacher" element={<Teacher />} />
          {/* 기본 진입은 대시보드로 */}
          <Route path="*" element={<Navigate to="/student/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  //</React.StrictMode>
)

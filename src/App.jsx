import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Dashboard from '@/page/dashboard'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  )
}

export default App

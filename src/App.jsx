import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Dashboard from '@/page/dashboard'
import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler'

function App() {
  return (
    <div className="min-h-screen w-full relative">
      <AnimatedThemeToggler className="absolute top-4 right-4 z-50" duration={420} />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </div>
  )
}

export default App

import React, { useState, useEffect } from 'react'
import Calibration from './views/Calibration'
import Dashboard from './views/Dashboard'
import { BootConfigFab } from './components/BootConfigFab'

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'calibration' | 'dashboard'>('calibration')
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('fwacs-theme')
    return saved === 'light' ? 'light' : 'dark'
  })

  useEffect(() => {
    // Hide the loading indicator when React mounts
    // But don't notify main process yet - wait for view to render
    const loader = document.getElementById('app-loader')
    if (loader) {
      loader.classList.add('hidden')
    }
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('fwacs-theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))

  if (currentView === 'calibration') {
    return (
      <>
        <Calibration onBack={() => setCurrentView('dashboard')} theme={theme} onToggleTheme={toggleTheme} />
        <BootConfigFab />
      </>
    )
  }

  return (
    <>
      <Dashboard onOpenCalibration={() => setCurrentView('calibration')} theme={theme} onToggleTheme={toggleTheme} />
      <BootConfigFab />
    </>
  )
}

export default App

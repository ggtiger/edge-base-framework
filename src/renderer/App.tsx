import React, { useState, useEffect } from 'react'
import Calibration from './views/Calibration'
import Dashboard from './views/Dashboard'

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'calibration' | 'dashboard'>('calibration')

  useEffect(() => {
    // Hide the loading indicator when React mounts
    // But don't notify main process yet - wait for view to render
    const loader = document.getElementById('app-loader')
    if (loader) {
      loader.classList.add('hidden')
    }
  }, [])

  if (currentView === 'calibration') {
    return <Calibration onBack={() => setCurrentView('dashboard')} />
  }

  return <Dashboard onOpenCalibration={() => setCurrentView('calibration')} />
}

export default App

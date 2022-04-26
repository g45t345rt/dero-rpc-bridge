import React from 'react'
import { createRoot } from 'react-dom/client'
import { Route, Routes } from 'react-router'
import { HashRouter } from 'react-router-dom'

import Main from './pages/main'
import Confirm from './pages/confirm'

const App = () => {
  return <HashRouter>
    <Routes>
      <Route path="/" element={<Main />} />
      <Route path="/confirm" element={<Confirm />} />
    </Routes>
  </HashRouter>
}

const container = document.getElementById('app')
const root = createRoot(container)
root.render(<App />)

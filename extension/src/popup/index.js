import React from 'react'
import ReactDOM from 'react-dom'
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

ReactDOM.render(<App />, document.getElementById('app'))

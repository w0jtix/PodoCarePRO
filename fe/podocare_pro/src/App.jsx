import { useState } from 'react'
import './App.css'
import Dashboard from './components/dashboard'
import Navbar from './components/Navbar'


function App() {
  

  return (
    <>
    <div className="container">
      <div className="display">
          <Navbar />
          <Dashboard />
      </div>
    </div>
    </>
  )
}

export default App

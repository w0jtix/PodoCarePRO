import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Warehouse from './pages/Warehouse'
import Orders from './pages/Orders'

function App() {
  

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Warehouse/>}/>
        <Route path="/zamowienia" element={<Orders/>}/>
      </Routes>
    </Router>
  )
}

export default App

import React from 'react'
import Dashboard from '../components/dashboard'
import Navbar from '../components/Navbar'

const Warehouse = () => {
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

export default Warehouse

import React from 'react'
import Navbar from '../components/Navbar'
import OrdersDashboard from '../components/Orders/OrdersDashboard'

const Orders = () => {
  return (
    <>
        <div className="container">
            <div className="display">
                <Navbar />
                <OrdersDashboard />
            </div>
        </div>
    </>
  )
}

export default Orders

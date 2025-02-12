import React from 'react'
import OrdersNavigationBar from './OrdersNavigationBar'
import OrderCreate from './OrderCreate'
import { useState } from 'react'

const OrdersDashboard = () => {

  

  return (
    <div className="dashboard-panel">
        <OrdersNavigationBar />
        <OrderCreate />
    </div>
  )
}

export default OrdersDashboard

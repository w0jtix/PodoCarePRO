import React from 'react'
import OrderCreate from './OrderCreate'
import OrderBySupplier from './OrderBySupplier'

const OrderList = ({ orderFilterDTO }) => {
  return (
    <div className='orders-container'>
      <OrderCreate />
      <OrderBySupplier />
    </div>
  )
}

export default OrderList

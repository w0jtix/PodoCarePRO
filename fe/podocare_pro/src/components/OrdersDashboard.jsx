import React from 'react'
import OrdersNavigationBar from './OrdersNavigationBar'
import OrderList from './OrderList'
import { useState } from 'react'

const OrdersDashboard = () => {

  const [orderFilterDTO, setOrderFilterDTO] = useState({
    orderNumber: 0,
    dateStart: "",
    dateEnd:"",
    selectedSupplierIds: [],
    keyword: ""
  });

  const handleFilterChange = (newFilter) => {
    setOrderFilterDTO(newFilter);
  };

  return (
    <div className="dashboard-panel">
        <OrdersNavigationBar onFilter={handleFilterChange} orderFilterDTO={orderFilterDTO}/>
        <OrderList orderFilterDTO = {orderFilterDTO} />
    </div>
  )
}

export default OrdersDashboard

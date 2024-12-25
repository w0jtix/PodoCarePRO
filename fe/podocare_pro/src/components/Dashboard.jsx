import React from 'react'
import NavigationBar from './dashboard-components/NavigationBar'
import SupplyList from './dashboard-components/SupplyList'
import { useState } from 'react'

const Dashboard = () => {

  const [productFilterDTO, setProductFilterDTO] = useState({
    productTypes: ["Sale", "Tool", "Equipment"], 
    selectedBrandIds: [],
    keyword: ""
  });

  const handleFilterChange = (newFilter) => {
    setProductFilterDTO(newFilter);
  };

  return (
    <div className="dashboard-panel">
        <NavigationBar onFilter={handleFilterChange} productFilterDTO={productFilterDTO}/>
        <SupplyList 
          productFilterDTO={productFilterDTO}
          />
    </div>
  )
}

export default Dashboard

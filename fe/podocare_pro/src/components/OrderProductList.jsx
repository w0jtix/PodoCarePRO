import React from 'react'
import OrderListHeader from './OrderListHeader'
import OrderItemList from './OrderItemList';
import { useCallback } from 'react';

const OrderProductList = ({ items, onItemsChange }) => {

    const attributes = [
        { name:"", width: "6%", justify: "center" },
        { name:"Nazwa", width: "42%", justify: "flex-start" },
        { name:"Cena jedn.", width: "13%", justify: "center" },
        { name:"Ilość", width: "13%", justify: "center" },
        { name:"VAT", width: "13%", justify: "center" },
        { name:"Cena", width: "13%", justify: "center" },
    ];

    const handleItemsChange = useCallback(
      (updatedItems) => {
        onItemsChange(updatedItems);
      },
      [onItemsChange]
    );

  return (
    <div className='order-productList'>
      <OrderListHeader attributes={attributes}/>
      <OrderItemList
      attributes={attributes} 
      items={items}
      onItemsChange={handleItemsChange}
      />
    </div>
  )
}

export default OrderProductList

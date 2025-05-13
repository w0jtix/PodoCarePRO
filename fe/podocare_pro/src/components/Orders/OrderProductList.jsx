import React, { useEffect } from "react";
import ListHeader from "../ListHeader";
import OrderItemList from "./OrderItemList";
import { useCallback } from "react";

const OrderProductList = ({
  items,
  onItemsChange,
  action,

  setHasWarning,
}) => {
  const attributes = [
    { name: "", width: "6%", justify: "center" },
    { name: "Nazwa", width: "42%", justify: "flex-start" },
    { name: "Cena jedn.", width: "13%", justify: "center" },
    { name: "Ilość", width: "13%", justify: "center" },
    { name: "VAT", width: "13%", justify: "center" },
    { name: "Cena", width: "13%", justify: "center" },
  ];

  const handleItemsChange = useCallback(
    (updatedItems) => {
      onItemsChange(updatedItems);
    },
    [onItemsChange]
  );
  
  return (
    <div className="order-productList">
      <ListHeader attributes={attributes} module={"order"} />
      <OrderItemList
        attributes={attributes}
        items={items}
        onItemsChange={handleItemsChange}
        action={action}
        setHasWarning={setHasWarning}
      />
    </div>
  );
};

export default OrderProductList;

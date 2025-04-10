import React from "react";
import OrderListHeader from "./OrderListHeader";
import OrderItemList from "./OrderItemList";
import { useCallback } from "react";

const OrderProductList = ({
  items,
  setItems,
  onItemsChange,
  action,
  initialOrderProductList,
  setCurrentOrderProductList,
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
      <OrderListHeader attributes={attributes} />
      <OrderItemList
        attributes={attributes}
        items={items}
        setItems={setItems}
        onItemsChange={handleItemsChange}
        action={action}
        initialOrderProductList={initialOrderProductList}
        setCurrentOrderProductList={setCurrentOrderProductList}
        setHasWarning={setHasWarning}
      />
    </div>
  );
};

export default OrderProductList;

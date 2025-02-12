import React from "react";
import HandyOrderProductList from "./HandyOrderProductList";
import OrderProductListHeader from "./OrderProductListHeader";

const OrderContent = ({ order, setSelectedOrderProduct }) => {
  const attributes = [
    { name: "", width: "6%", justify: "start" },
    { name: "Nazwa", width: "70%", justify: "start" },
    { name: "Ilość", width: "10%", justify: "center" },
    { name: "Cena [szt]", width: "14%", justify: "center" },
  ];

  return (
    <div className="order-content">
      <OrderProductListHeader attributes={attributes} />
      <HandyOrderProductList
        attributes={attributes}
        order={order}
        setSelectedOrderProduct={setSelectedOrderProduct}
      />
    </div>
  );
};

export default OrderContent;

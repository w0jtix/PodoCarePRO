import React from "react";
import HandyOrderProductList from "./HandyOrderProductList";
import OrderProductListHeader from "./OrderProductListHeader";

const OrderContent = ({ order, setSelectedOrderProduct, action }) => {
  const attributes = [
    { name: "", width: "6%", justify: "start"  },
    { name: "Nazwa", width: "70%", justify: "start" },
    { name: "Ilość", width: "10%", justify: "center" },
    { name: "Cena [szt]", width: "14%", justify: "center" },
  ];

  const attributesHistory = [
    { name: "", width: "6%", justify: "center" },
    { name: "Nazwa", width: "64%", justify: "start" },
    { name: "Ilość", width: "12%", justify: "center" },
    { name: "Netto [szt]", width: "6%", justify: "center" },
    { name: "VAT", width: "6%", justify: "center" },
    { name: "Cena [szt]", width: "6%", justify: "center" },
  ];

  return (
    <div className={`order-content ${action.toLowerCase()}`}>
      <OrderProductListHeader attributes={action === "History" ? attributesHistory : attributes} />
      <HandyOrderProductList
        attributes={action === "History" ? attributesHistory : attributes}
        order={order}
        setSelectedOrderProduct={setSelectedOrderProduct}
        action={action}
      />
    </div>
  );
};

export default OrderContent;

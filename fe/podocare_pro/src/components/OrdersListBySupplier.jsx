import React from "react";
import { useState, useEffect } from "react";
import OrderListHeader from "./OrderListHeader";
import HandyOrderList from "./HandyOrderList";
import OrderService from "../service/OrderService";

const OrdersListBySupplier = ({ selectedSupplier }) => {
  const [filteredOrders, setFilteredOrders] = useState([]);

  const attributes = [
    { name: "", width: "6%", justify: "center" },
    { name: "Numer", width: "12%", justify: "center" },
    { name: "Data", width: "48%", justify: "center" },
    { name: "Ilość produktów", width: "16%", justify: "center" },
    { name: "Wartość", width: "18%", justify: "center" },
  ];

  useEffect(() => {
    if (selectedSupplier !== null) {
      OrderService.filterOrdersBySupplier(selectedSupplier)
        .then((filteredOrders) => {
          setFilteredOrders(filteredOrders);
        })
        .catch((error) => console.error(error.message));
    } else {
      setFilteredOrders([]);
    }
    console.log("elo");
  }, [selectedSupplier]);

  return (
    <div className="order-display-container">
      <div className="order-display-interior">
        {selectedSupplier !== null ? (
          <h1 className="orders-list-by-supplier-container-title">
            {selectedSupplier.name} - zamówienia
          </h1>
        ) : (
          <h1 className="orders-list-by-supplier-container-title">
            Wybierz sklep by wyświetlić zamówienia
          </h1>
        )}
        <OrderListHeader attributes={attributes} />
        <HandyOrderList attributes={attributes} orders={filteredOrders} />
        <section className="orders-list-by-supplier-orders-count">
          {selectedSupplier !== null ? (
            <span className="orders-list-by-supplier-orders-count-span">
              Razem: {filteredOrders.length}
            </span>
          ) : (
            " "
          )}
        </section>
      </div>
    </div>
  );
};

export default OrdersListBySupplier;

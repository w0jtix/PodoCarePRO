import React from "react";
import { useState, useEffect } from "react";
import HandyOrderList from "./HandyOrderList";
import OrderService from "../../service/OrderService";
import ListHeader from "../ListHeader";

const OrdersListBySupplier = ({
  selectedSupplier,
  setSelectedOrderProduct,
  expandedOrderIds,
  setExpandedOrderIds,
}) => {
  const [filteredOrders, setFilteredOrders] = useState([]);

  const attributes = [
    { name: "", width: "6%", justify: "start" },
    { name: "Numer", width: "12%", justify: "center" },
    { name: "Data", width: "48%", justify: "center" },
    { name: "Produkty", width: "16%", justify: "center" },
    { name: "Wartość", width: "18%", justify: "center" },
  ];

  const fetchOrders = async (filterDTO) => {
    OrderService.getOrders(filterDTO)
    .then((data) => {
      setFilteredOrders(data);
    })
    .catch((error) => {
      console.error("Error fetching orders:", error);
      setFilteredOrders([]);
    });
  }

  useEffect(() => {
    if (selectedSupplier !== null) {
        const filterDTO = {
          supplierIds: [selectedSupplier.id],
        }
        fetchOrders(filterDTO);
    } else {
      setFilteredOrders([]);
    }
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
        <ListHeader attributes={attributes} module={"order"}/>
        <HandyOrderList
          attributes={attributes}
          orders={filteredOrders}
          setSelectedOrderProduct={setSelectedOrderProduct}
          expandedOrderIds={expandedOrderIds}
          setExpandedOrderIds={setExpandedOrderIds}
        />
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

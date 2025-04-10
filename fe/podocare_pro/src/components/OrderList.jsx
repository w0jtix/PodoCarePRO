import React from "react";
import { useState, useEffect } from "react";
import ProductActionButton from "./ProductActionButton";
import OrderContent from "./OrderContent";
import EditOrderPopup from "./EditOrderPopup";
import RemoveOrderPopup from "./RemoveOrderPopup";

const OrderList = ({
  attributes,
  orders,
  currentPage,
  itemsPerPage,
  handleResetAllFilters,
}) => {
  const [expandedOrderIds, setExpandedOrderIds] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isEditOrderPopupOpen, setIsEditOrderPopupOpen] = useState(false);
  const [isRemoveOrderPopupOpen, setIsRemoveOrderPopupOpen] = useState(false);

  const attributeMap = {
    Numer: "orderNumber",
    Sklep: "supplierName",
    Produkty: "orderProductDTOList.length",
    "Data Zamówienia": "orderDate",
    Netto: "totalNet",
    VAT: "totalVat",
    Brutto: "totalValue",
  };

  const categoryColors = {
    Sale: "rgb(0, 253, 0)",
    Tool: "rgb(253, 173, 0)",
    Equipment: "rgb(253, 0, 190)",
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("pl-PL");
  };

  const getNestedValue = (obj, path) => {
    return path.split(".").reduce((acc, part) => acc && acc[part], obj);
  };

  const handleOnClickEdit = (e, order) => {
    e.stopPropagation();
    setIsEditOrderPopupOpen(true);
    setSelectedOrder(order);
  };

  const handleOnClickRemove = (e, order) => {
    e.stopPropagation();
    setSelectedOrder(order);
    setIsRemoveOrderPopupOpen(true);
  }

  const toggleOrders = (orderId) => {
    setExpandedOrderIds((prevIds) =>
      prevIds.includes(orderId)
        ? prevIds.filter((id) => id !== orderId)
        : [...prevIds, orderId]
    );
  };
  const startIndex = (currentPage - 1) * itemsPerPage;
  return (
    <div className={`item-list ${orders.length === 0 ? "is-empty" : ""}`}>
      {orders.map((order, index) => (
        <div
          key={`${order.orderId}-${order.orderNumber}`}
          className="product-wrapper"
        >
          <div
            className={`item ${
              order.orderProductDTOList.length > 0 ? "pointer" : ""
            }`}
            onClick={() => toggleOrders(order.orderId)}
          >
            {attributes.map((attr) => (
              <div
                key={`${order.orderId}-${attr.name}`}
                className={`attribute-item ${
                  attr.name === "" ? "category-column" : ""
                }`}
                style={{
                  width: attr.width,
                  justifyContent: attr.justify,
                }}
              >
                {attr.name === "" ? (
                  <img
                    src="src/assets/arrow_down.svg"
                    alt="arrow down"
                    className={`arrow-down ${
                      expandedOrderIds.includes(order.orderId) ? "rotated" : ""
                    }`}
                  />
                ) : attr.name === "Numer" ? (
                  <span>{`# ${order.orderNumber}`}</span>
                ) : attr.name === "Data Zamówienia" ? (
                  <span>{formatDate(order.orderDate)}</span>
                ) : attr.name === "Netto" ? (
                  <span className="order-values-lower-font-size">
                    {order.totalNet.toFixed(2)}
                  </span>
                ) : attr.name === "VAT" ? (
                  <span className="order-values-lower-font-size">
                    {order.totalVat.toFixed(2)}
                  </span>
                ) : attr.name === "Brutto" ? (
                  <span className="order-values-lower-font-size">
                    {order.totalValue.toFixed(2)}
                  </span>
                ) : attr.name === "Opcje" ? (
                  <div className="item-list-single-item-action-buttons">
                    <ProductActionButton
                      src={"src/assets/edit.svg"}
                      alt={"Edytuj Produkt"}
                      text={"Edytuj"}
                      onClick={(e) => handleOnClickEdit(e, order)}
                      disableText={true}
                    />
                    <ProductActionButton
                      src={"src/assets/cancel.svg"}
                      alt={"Usuń Produkt"}
                      text={"Usuń"}
                      onClick={(e) => handleOnClickRemove(e, order)}
                      disableText={true}
                    />
                  </div>
                ) : (
                  getNestedValue(order, attributeMap[attr.name])
                )}
              </div>
            ))}
          </div>
          {expandedOrderIds.includes(order.orderId) && (
            <OrderContent order={order} action={"History"} />
          )}
        </div>
      ))}
      {isEditOrderPopupOpen && (
        <EditOrderPopup
          onClose={() => setIsEditOrderPopupOpen(false)}
          handleResetAllFilters={handleResetAllFilters}
          selectedOrder={selectedOrder}
        />
      )}
      {isRemoveOrderPopupOpen && (
        <RemoveOrderPopup
          onClose={() => setIsRemoveOrderPopupOpen(false)}
          handleResetAllFilters={handleResetAllFilters}
          selectedOrder={selectedOrder}
        />
      )}
    </div>
  );
};

export default OrderList;

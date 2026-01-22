import React from "react";
import { useState, useEffect, useCallback } from "react";
import HandyOrderList from "./HandyOrderList";
import OrderService from "../../services/OrderService";
import ListHeader, { ListModule } from "../ListHeader";
import { ORDERS_BY_SUPPLIER_ATTRIBUTES } from "../../constants/list-headers";
import { Supplier } from "../../models/supplier";
import { OrderProduct } from "../../models/order-product";
import { Order, OrderFilterDTO } from "../../models/order";
import { useAlert } from "../Alert/AlertProvider";
import { AlertType } from "../../models/alert";

export interface OrdersListBySupplierProps {
  selectedSupplier: Supplier | null;
  setSelectedOrderProduct: (orderProduct: OrderProduct | null) => void;
  expandedOrderIds: number[];
  setExpandedOrderIds: React.Dispatch<React.SetStateAction<number[]>>;
  className?: string;
}

export function OrdersListBySupplier({
  selectedSupplier,
  setSelectedOrderProduct,
  expandedOrderIds,
  setExpandedOrderIds,
  className = "",
}: OrdersListBySupplierProps) {
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const { showAlert } = useAlert();

  const fetchOrders = useCallback(async (filter: OrderFilterDTO) => {
    OrderService.getOrders(filter, 0, 1000)
      .then((data) => {
        const content = data?.content || [];
        setFilteredOrders(content);
      })
      .catch((error) => {
        showAlert("Błąd", AlertType.ERROR);
        console.error("Error fetching orders:", error);
        setFilteredOrders([]);
      });
  }, []);

  useEffect(() => {
    if (selectedSupplier) {
      const filter: OrderFilterDTO = {
        supplierIds: [selectedSupplier.id],
      };
      fetchOrders(filter);
    } else {
      setFilteredOrders([]);
    }
  }, [selectedSupplier, fetchOrders]);

  const getTitle = (): string => {
    if (selectedSupplier) {
      return `${selectedSupplier.name} - zamówienia`;
    }
    return "Wybierz sklep by wyświetlić zamówienia";
  };

  const getOrderCountText = (): string => {
    const count = filteredOrders.length;
    return `${count}`;
  };

  return (
    <div className={`order-display-container align-self-center relative ${className}`}>
      <div className="order-display-interior grid g-10px relative ">
        <h1 className="orders-list-by-supplier-container-title flex align-items-center">
          {getTitle()}
        </h1>
        <ListHeader
          attributes={ORDERS_BY_SUPPLIER_ATTRIBUTES}
          module={ListModule.ORDER}
        />
        <HandyOrderList
          attributes={ORDERS_BY_SUPPLIER_ATTRIBUTES}
          orders={filteredOrders}
          setSelectedOrderProduct={setSelectedOrderProduct}
          expandedOrderIds={expandedOrderIds}
          setExpandedOrderIds={setExpandedOrderIds}
        />
        <section className="orders-list-by-supplier-orders-count flex justify-center align-items-center">
          {selectedSupplier ? (
            <span className="orders-list-by-supplier-orders-count-span">
              Razem: {getOrderCountText()}
            </span>
          ) : (
            " "
          )}
        </section>
      </div>
    </div>
  );
}

export default OrdersListBySupplier;

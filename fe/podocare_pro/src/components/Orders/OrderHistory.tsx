import React from "react";
import ListHeader from "../ListHeader.js";
import OrderList from "./OrderList.jsx";
import { useState, useEffect, useCallback } from "react";
import OrderService from "../../services/OrderService.jsx";
import ActionButton from "../ActionButton.jsx";
import DropdownSelect from "../DropdownSelect.js";
import DateInput from "../DateInput.js";
import SupplierService from "../../services/SupplierService.jsx";
import { Order, OrderFilterDTO } from "../../models/order.js";
import { Supplier } from "../../models/supplier.js";
import { Alert, AlertType } from "../../models/alert.js";
import { ORDER_HISTORY_ATTRIBUTES } from "../../constants/list-headers.js";
import { useAlert } from "../Alert/AlertProvider.js";

export function OrderHistory() {
  const { showAlert } = useAlert();
  const [orders, setOrders] = useState<Order[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSuppliers, setSelectedSuppliers] = useState<Supplier[]>([]);
  const [filter, setFilter] = useState<OrderFilterDTO>({
    supplierIds: null,
    dateFrom: null,
    dateTo: null,
  });
  const [loading, setLoading] = useState<boolean>(true);

  const handleSuccess = useCallback(
    () => {
      handleResetFiltersAndData();
    },
    [showAlert]
  );

  const handleResetFiltersAndData = useCallback(() => {
    setFilter({
      supplierIds: null,
      dateFrom: null,
      dateTo: null,
    });
    setSelectedSuppliers([]);
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    OrderService.getOrders(filter)
      .then((data) => {
        const sortedOrders = data.sort(
          (a, b) =>
            new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
        );
        setOrders(sortedOrders);
      })
      .catch((error) => {
        setOrders([]);
        showAlert("Błąd", AlertType.ERROR);
        console.error("Error fetching Orders:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [filter]);

  const fetchSuppliers = useCallback(async () => {
    SupplierService.getSuppliers()
      .then((data) => {
        const sortedSuppliers = data.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        setSuppliers(sortedSuppliers);
      })
      .catch((error) => {
        setSuppliers([]);
        showAlert("Błąd", AlertType.ERROR);
        console.error("Error fetching suppliers:", error);
      });
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [filter, fetchOrders]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const handleOnSelectSupplier = useCallback(
    (selected: Supplier | Supplier[] | null) => {
      if (selected) {
        const selectedSuppliers = Array.isArray(selected)
          ? selected
          : [selected];
        setSelectedSuppliers(selectedSuppliers);
      } else {
        setSelectedSuppliers([]);
      }
    },
    []
  );

  useEffect(() => {
    const supplierIds = selectedSuppliers.map((supplier) => supplier.id);

    setFilter((prev) => ({
      ...prev,
      supplierIds: supplierIds.length === 0 ? null : supplierIds,
    }));
  }, [selectedSuppliers]);

  const handleDateFromChange = useCallback(
    (newDateString: string | null) => {
      setFilter((prevFilter) => {
        if (newDateString && prevFilter.dateTo) {
          if (newDateString > prevFilter.dateTo) {
            showAlert(
              "Błędne daty:  Data od późniejsza niż Data do!",
              AlertType.ERROR
            );
            return prevFilter;
          }
        }
        return { ...prevFilter, dateFrom: newDateString };
      });
    },
    [showAlert]
  );

  const handleDateToChange = useCallback(
    (newDateString: string | null) => {
      setFilter((prevFilter) => {
        if (newDateString && prevFilter.dateFrom) {
          if (newDateString < prevFilter.dateFrom) {
            showAlert(
              "Błędne daty: Data do wcześniejsza niż Data od!",
              AlertType.ERROR
            );
            return prevFilter;
          }
        }
        return { ...prevFilter, dateTo: newDateString };
      });
    },
    [showAlert]
  );
  return (
    <>
      <section className="order-history-action-buttons width-80 flex align-self-center mt-1 mb-1 justify-center g-35">
        <DropdownSelect<Supplier>
          items={suppliers}
          value={selectedSuppliers}
          placeholder="Wybierz sklep"
          onChange={handleOnSelectSupplier}
          allowNew={false}
          multiple={true}
          allowColors={true}
          className="supplier-dropdown"
        />

        <section className="order-history-action-button-title flex g-15px">
          <a className="order-history-action-buttons-a align-center">Data od:</a>
          <DateInput
            onChange={handleDateFromChange}
            selectedDate={filter.dateFrom || null}
            showPlaceholder={true}
          />
        </section>
        <section className="order-history-action-button-title flex g-15px">
          <a className="order-history-action-buttons-a align-center">Data do:</a>
          <DateInput
            onChange={handleDateToChange}
            selectedDate={filter.dateTo || null}
            showPlaceholder={true}
          />
        </section>
        <ActionButton
          src={"src/assets/reset.svg"}
          alt={"Reset"}
          iconTitle={"Resetuj filtry"}
          text={"Reset"}
          onClick={handleResetFiltersAndData}
          disableText={true}
        />
      </section>
      <ListHeader attributes={ORDER_HISTORY_ATTRIBUTES} />
      {loading ? (
        <div className="list-loading-container relative flex align-items-center justify-center">
          <div className="loading-dot relative flex align-items-center height-max width-25"></div>
          <div className="loading-dot relative flex align-items-center height-max width-25"></div>
          <div className="loading-dot relative flex align-items-center height-max width-25"></div>
          <div className="loading-dot relative flex align-items-center height-max width-25"></div>
        </div>
      ) : (
        
          <OrderList
            attributes={ORDER_HISTORY_ATTRIBUTES}
            orders={orders}
            onSuccess={handleSuccess}
            className="products"
          />
      )}
    </>
  );
}

export default OrderHistory;

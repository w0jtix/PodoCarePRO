import React from "react";
import ListHeader from "../ListHeader.js";
import OrderList from "./OrderList.jsx";
import { useState, useEffect, useCallback } from "react";
import OrderService from "../../services/OrderService.jsx";
import ActionButton from "../ActionButton.jsx";
import DropdownSelect from "../DropdownSelect.js";
import DateInput from "../DateInput.js";
import SupplierService from "../../services/SupplierService.jsx";
import CustomAlert from "../CustomAlert.js";
import { Order, OrderFilterDTO } from "../../models/order.js";
import { Supplier } from "../../models/supplier.js";
import { Alert, AlertType } from "../../models/alert.js";
import { ORDER_HISTORY_ATTRIBUTES } from "../../constants/list-headers.js";

export function OrderHistory() {
  const [alert, setAlert] = useState<Alert | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSuppliers, setSelectedSuppliers] = useState<Supplier[]>([]);
  const [filter, setFilter] = useState<OrderFilterDTO>({
    supplierIds: null,
    dateFrom: null,
    dateTo: null,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 14;

  const showAlert = useCallback((message: string, variant: AlertType) => {
    setAlert({ message, variant });
    setTimeout(() => {
      setAlert(null);
    }, 3000);
  }, []);

  const handleSuccess = useCallback(
    (message: string) => {
      showAlert(message, AlertType.SUCCESS);
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
    setCurrentPage(1);
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
        console.error("Error fetching suppliers:", error);
      });
  }, []);

  useEffect(() => {
    fetchOrders();
    setCurrentPage(1);
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

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = orders.slice(startIndex, endIndex);
  const totalPages = Math.ceil(orders.length / itemsPerPage);

  const handlePreviousPage = useCallback(() => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  }, [totalPages]);

  return (
    <>
      <section className="order-history-action-buttons">
        <DropdownSelect<Supplier>
          items={suppliers}
          value={selectedSuppliers}
          placeholder="Wybierz sklep"
          onChange={handleOnSelectSupplier}
          allowNew={false}
          multiple={true}
          allowColors={true}
        />

        <section className="order-history-action-button-title">
          <a className="order-history-action-buttons-a">Data od:</a>
          <DateInput
            onChange={handleDateFromChange}
            selectedDate={filter.dateFrom || null}
            showPlaceholder={true}
          />
        </section>
        <section className="order-history-action-button-title">
          <a className="order-history-action-buttons-a">Data do:</a>
          <DateInput
            onChange={handleDateToChange}
            selectedDate={filter.dateTo || null}
            showPlaceholder={true}
          />
        </section>
        <ActionButton
          src={"src/assets/reset.svg"}
          alt={"Reset"}
          text={"Reset"}
          onClick={handleResetFiltersAndData}
          disableText={true}
        />
      </section>
      <ListHeader attributes={ORDER_HISTORY_ATTRIBUTES} />
      {loading ? (
        <div className="list-loading-container">
          <div className="loading-dot"></div>
          <div className="loading-dot"></div>
          <div className="loading-dot"></div>
          <div className="loading-dot"></div>
        </div>
      ) : (
        <>
          <OrderList
            attributes={ORDER_HISTORY_ATTRIBUTES}
            orders={currentItems}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onSuccess={handleSuccess}
          />
          {orders.length > itemsPerPage && (
            <div className="list-pagination">
              <button
                className="list-prev-page-button"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
              >
                <img
                  className="pagination-img"
                  src="src/assets/previousPage.svg"
                  alt="previous page"
                />
              </button>
              <span className="page-info">
                {currentPage} / {totalPages}
              </span>
              <button
                className="list-next-page-button"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                <img
                  className="pagination-img"
                  src="src/assets/nextPage.svg"
                  alt="next page"
                />
              </button>
            </div>
          )}
        </>
      )}
      {alert && <CustomAlert message={alert.message} variant={alert.variant} />}
    </>
  );
}

export default OrderHistory;

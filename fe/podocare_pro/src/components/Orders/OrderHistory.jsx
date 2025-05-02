import React from "react";
import ListHeader from "../ListHeader.jsx";
import OrderList from "./OrderList";
import { useState, useEffect } from "react";
import OrderService from "../../service/OrderService.jsx";
import ProductActionButton from "../ProductActionButton.jsx";
import SupplierDropdown from "../SupplierDropdown";
import DateInput from "../DateInput.jsx";
import SupplierService from "../../service/SupplierService.jsx";
import CustomAlert from "../CustomAlert.jsx";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState([]);
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);
  const [orderFilterDTO, setOrderFilterDTO] = useState({
    supplierIds: selectedSupplier.map((supplier) => supplier.id),
    dateFrom,
    dateTo,
  });
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 14;

  const attributes = [
    { name: "", width: "3%", justify: "center" },
    { name: "Numer", width: "4%", justify: "center" },
    { name: "Sklep", width: "28%", justify: "center" },
    { name: "Data Zamówienia", width: "28%", justify: "center" },
    { name: "Produkty", width: "15%", justify: "center" },
    { name: "Netto", width: "5%", justify: "center" },
    { name: "VAT", width: "5%", justify: "center" },
    { name: "Brutto", width: "5%", justify: "center" },
    { name: "Opcje", width: "7%", justify: "center" },
  ];

  const showAlert = (message, variant) => {
    if (variant === "success") {
      setSuccessMessage(message);
      setErrorMessage(null);
    } else {
      setErrorMessage(message);
      setSuccessMessage(null);
    }

    setAlertVisible(true);
    setTimeout(() => {
      setAlertVisible(false);
    }, 2500);
  };

  useEffect(() => {
    setOrderFilterDTO({
      supplierIds: selectedSupplier.map((supplier) => supplier.id),
      dateFrom,
      dateTo,
    });
  }, [selectedSupplier, dateFrom, dateTo]);

  const fetchOrders = async (orderFilterDTO) => {
    OrderService.getFilteredOrders(orderFilterDTO)
      .then((data) => {
        const sortedOrders = data.sort(
          (a, b) => new Date(b.orderDate) - new Date(a.orderDate)
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
  };

  useEffect(() => {
    setLoading(true);
    fetchOrders(orderFilterDTO);
    setCurrentPage(1);
  }, [orderFilterDTO]);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    SupplierService.getAllSuppliers()
      .then((response) => {
        const sortedSuppliers = response.data.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        setSuppliers(sortedSuppliers);
        return sortedSuppliers;
      })
      .catch((error) => {
        setSuppliers([]);
        console.error("Error fetching suppliers:", error);
        return [];
      });
  };

  const handleOnSelectSupplier = (suppliers) => {
    setSelectedSupplier(suppliers.map((s) => s));
  };

  const handleDateFromChange = (newDate) => {
    if (newDate && dateTo && newDate > dateTo) {
      showAlert("Błędne daty:  Data od > Data do!", "error");
      setDateFrom(null);
    } else {
      setDateFrom(newDate);
    }
  };

  const handleDateToChange = (newDate) => {
    if (newDate && dateFrom && newDate < dateFrom) {
      showAlert("Błędne daty:  Data do < Data od!", "error");
      setDateTo(null);
    } else {
      setDateTo(newDate);
    }
  };

  const handleResetAllFilters = (success, mode) => {
    if(success ) {
      if(mode === "Remove") {
        showAlert("Zamówienie usunięte!", "success");
      } else if (mode === "Edit") {
        showAlert("Zamówienie zaktualizowane!", "success");
      }
    }
    setSelectedSupplier([]);
    setDateFrom(null);
    setDateTo(null);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = orders.slice(startIndex, endIndex);

  const totalPages = Math.ceil(orders.length / itemsPerPage);

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  return (
    <>
      <section className="order-history-action-buttons">
        <SupplierDropdown
          items={suppliers}
          placeholder="Wybierz Sklep"
          selectedSupplier={selectedSupplier}
          onSelect={handleOnSelectSupplier}
          addSupplierVisible={false}
          multiSelect={true}
        />

        <section className="order-history-action-button-title">
          <a className="order-history-action-buttons-a">Data od:</a>
          <DateInput
            onChange={handleDateFromChange}
            selectedDate={dateFrom}
            showPlaceholder={true}
          />
        </section>
        <section className="order-history-action-button-title">
          <a className="order-history-action-buttons-a">Data do:</a>
          <DateInput
            onChange={handleDateToChange}
            selectedDate={dateTo}
            showPlaceholder={true}
          />
        </section>
        <ProductActionButton
          src={"src/assets/reset.svg"}
          alt={"Reset"}
          text={"Reset"}
          onClick={() => handleResetAllFilters()}
          disableText={true}
        />
      </section>
      <ListHeader attributes={attributes} />
      {loading ? (
        <div className="list-loading-container">
          <div className="loading-dot"></div>
          <div className="loading-dot"></div>
          <div className="loading-dot"></div>
          <div className="loading-dot"></div>
        </div>
      ) : error ? (
        <div className="list-error">
          <h2>Coś poszło nie tak 😵</h2>
        </div>
      ) : (
        <>
          <OrderList
            attributes={attributes}
            orders={currentItems}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            handleResetAllFilters={handleResetAllFilters}
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
      {alertVisible && (
        <CustomAlert
          message={errorMessage || successMessage}
          variant={errorMessage ? "error" : "success"}
        />
      )}
    </>
  );
};

export default OrderHistory;

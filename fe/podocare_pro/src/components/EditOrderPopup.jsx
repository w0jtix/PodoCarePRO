import React from "react";
import { useState, useEffect } from "react";
import CustomAlert from "./CustomAlert";
import ReactDOM from "react-dom";
import OrderNewProductsPopup from "./OrderNewProductsPopup";
import OrderService from "../service/OrderService";
import ProductActionButton from "./ProductActionButton";
import OrderCreator from "./OrderCreator";

const EditOrderPopup = ({ onClose, handleResetAllFilters, selectedOrder }) => {
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [orderDTO, setOrderDTO] = useState({});
  const [nonExistingProducts, setNonExistingProducts] = useState([]);
  const [hasWarning, setHasWarning] = useState(false);
  const [isOrderNewProductsPopupOpen, setIsOrderNewProductsPopupOpen] =
    useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [infoMessage, setInfoMessage] = useState(null);
  const [alertVisible, setAlertVisible] = useState(false);

  const showAlert = (message, variant) => {
    if (variant === "success") {
      setSuccessMessage(message);
      setErrorMessage(null);
      setInfoMessage(null);
    } else if (variant === "error") {
      setErrorMessage(message);
      setSuccessMessage(null);
      setInfoMessage(null);
    } else {
      setErrorMessage(null);
      setSuccessMessage(null);
      setInfoMessage(message);
    }

    setAlertVisible(true);
    setTimeout(() => {
      setAlertVisible(false);
    }, 3000);
  };

  const handleCloseOrderNewProductPopup = () => {
    setIsOrderNewProductsPopupOpen(false);
  };

  const handleValidate = async (orderDTO) => {
    if (checkForErrors()) return;
    let nonExistingProducts;
    if (orderDTO.addedOrderProducts) {
      nonExistingProducts = orderDTO.addedOrderProducts.filter(
        (product) => !product.productId
      );
    }
    if (nonExistingProducts?.length > 0) {
      setNonExistingProducts(nonExistingProducts);
      setIsOrderNewProductsPopupOpen(true);
      return;
    }
    handleSaveOrder(orderDTO);
  };

  const handleSaveOrder = async (orderDTO) => {
    console.log("OrderDTO b4 req", orderDTO);
    return OrderService.updateOrder(orderDTO)
      .then((response) => {
        setIsOrderNewProductsPopupOpen(false);
        console.log("response", response.data);
        const success = true;
        const mode = "Edit";
        handleResetAllFilters(success, mode);
        setTimeout(() => {
          onClose();
        }, 600);
      })
      .catch((error) => {
        console.error("Error updating Order.", error);
        showAlert("Błąd aktualizacji zamówienia.", "error");
        return false;
      });
  };

  const checkForErrors = () => {
    if (!orderDTO || Object.keys(orderDTO).length === 0) {
      showAlert("Brak zmian!", "error");
      return true;
    }
    if (orderDTO.orderProductDTOList.length === 0) {
      showAlert("Puste zamówienie... Dodaj produkty!", "error");
      return true;
    }
    if (
      orderDTO.orderProductDTOList.some(
        (product) => product.productName.trim() === ""
      )
    ) {
      showAlert("Niepoprawna nazwa produktu!", "error");
      return true;
    } else if (
      orderDTO.orderProductDTOList.some(
        (product) => product.productName.trim().length <= 2
      )
    ) {
      showAlert("Nazwa produktu za krótka! (2+)", "error");
      return true;
    }
    return false;
  };

  return ReactDOM.createPortal(
    <div className="add-popup-overlay edit-order" onClick={onClose}>
      <div
        className="edit-order-popup-content"
        onClick={(e) => e.stopPropagation()}
      >
        <section className="edit-product-popup-header">
          <h2 className="popup-title">{`Edytuj Zamówienie #${selectedOrder.orderNumber}`}</h2>
          <button className="popup-close-button" onClick={onClose}>
            <img
              src="src/assets/close.svg"
              alt="close"
              className="popup-close-icon"
            />
          </button>
        </section>
        <section className="order-popup-interior">
          {selectedOrder && (
            <OrderCreator
              selectedOrder={selectedOrder}
              action={"Edit"}
              selectedSupplier={selectedSupplier}
              setSelectedSupplier={setSelectedSupplier}
              setOrderDTO={setOrderDTO}
              hasWarning={hasWarning}
              setHasWarning={setHasWarning}
            />
          )}
        </section>
        {hasWarning && (
          <div className="popup-warning-explanation-display">
            <img
              src="src/assets/warning.svg"
              alt="Warning"
              className="order-item-warning-icon"
            />
            <a className="warning-explanation">
              Konflikt: Chcesz usunąć więcej Produktów niż masz w Magazynie!
              <br />
              Po zatwierdzeniu usuniesz dostępne Produkty.
            </a>
          </div>
        )}
        {selectedOrder && (
          <>
            <div className="popup-footer-container"></div>
            <ProductActionButton
              src={"src/assets/tick.svg"}
              alt={"Zapisz"}
              text={"Zapisz"}
              onClick={async () => handleValidate(orderDTO)}
            />
          </>
        )}

        {alertVisible && (
          <CustomAlert
            message={errorMessage || successMessage || infoMessage}
            variant={
              errorMessage ? "error" : successMessage ? "success" : "info"
            }
          />
        )}
        {isOrderNewProductsPopupOpen && (
          <OrderNewProductsPopup
            nonExistingProducts={nonExistingProducts}
            orderProductDTOList={orderDTO.addedOrderProducts}
            trueOrderProductDTOList={orderDTO.orderProductDTOList}
            setOrderDTO={setOrderDTO}
            orderDTO={orderDTO}
            onClose={handleCloseOrderNewProductPopup}
            onFinalizeOrder={(orderDTO) => handleValidate(orderDTO)}
            action={"Edit"}
          />
        )}
      </div>
    </div>,
    document.getElementById("portal-root")
  );
};

export default EditOrderPopup;

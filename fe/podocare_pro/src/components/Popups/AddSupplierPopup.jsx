import React from "react";
import ReactDOM from "react-dom";
import { useState } from "react";
import axios from "axios";
import CustomAlert from "../CustomAlert";
import SupplierService from "../../service/SupplierService";

const AddSupplierPopup = ({ onClose, onAddSupplier }) => {
  const [supplierName, setSupplierName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [alertVisible, setAlertVisible] = useState(false);

  const handleSupplierNameChange = (e) => {
    setSupplierName(e.target.value);
  };

  const handleWebsiteUrlChange = (e) => {
    setWebsiteUrl(e.target.value);
  };

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

  const handleCreateSupplier = async (e) => {
    e.preventDefault();
    const supplierDTO = {
      name: supplierName,
      websiteUrl,
    };
    if (await checkForErrors(supplierDTO)) return false;

    return SupplierService.createSupplier(supplierDTO)
      .then((data) => {
        console.log("CreateSupplier API response: ", data);
        showAlert("Dodano nowy Sklep", "success");
        setTimeout(() => {
          onAddSupplier(data);
          onClose();
        }, 1100);
      })
      .catch((error) => {
        console.error("Error creating new Supplier:", error);
        showAlert("Błąd tworzenia dostawcy.", "error");
      });
  };

  const checkForErrors = async (supplierDTO) => {
    if (!supplierDTO.name) {
      showAlert("Nazwa sklepu nie może być pusta!", "error");
      return true;
    }

    if (supplierDTO.name.trim().length <= 2) {
      showAlert("Nazwa dostawcy za krótka! (2+)", "error");
      return true;
    }
    return false;
  };

  return ReactDOM.createPortal(
    <div className="add-popup-overlay" onClick={onClose}>
      <div
        className="add-supplier-popup-content"
        onClick={(e) => e.stopPropagation()}
      >
        <section className="add-new-supplier-header">
          <h2 className="popup-title">Dodaj nowy sklep</h2>
          <button className="popup-close-button" onClick={onClose}>
            <img
              src="src/assets/close.svg"
              alt="close"
              className="popup-close-icon"
            />
          </button>
        </section>
        <form onSubmit={handleCreateSupplier} className="add-supplier-form">
          <section className="add-supplier-input-section">
            <label className="add-supplier-label">
              <a className="add-supplier-label-a">Nazwa Sklepu:</a>
              <input
                type="text"
                value={supplierName}
                onChange={handleSupplierNameChange}
                className="add-supplier-input"
              />
            </label>
            <label className="add-supplier-label">
              <a className="add-supplier-label-a">Strona www:</a>
              <input
                type="text"
                value={websiteUrl}
                onChange={handleWebsiteUrlChange}
                placeholder="https://"
                className="add-supplier-input"
              />
            </label>
          </section>
          <button className="supplier-confirm-button">
            <img src="src/assets/tick.svg" alt="tick" className="tick-icon" />
            <a>Zapisz</a>
          </button>
        </form>
        {alertVisible && (
          <CustomAlert
            message={errorMessage || successMessage}
            variant={errorMessage ? "error" : "success"}
          />
        )}
      </div>
    </div>,
    document.getElementById("portal-root")
  );
};

export default AddSupplierPopup;

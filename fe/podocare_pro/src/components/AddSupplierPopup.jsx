import React from 'react'
import ReactDOM from 'react-dom';
import { useState } from 'react';
import axios from 'axios';
import CustomAlert from './CustomAlert';


const AddSupplierPopup = ({ onClose, onAddSupplier }) => {

  const [supplierName, setSupplierName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [alertVisible, setAlertVisible] = useState(false);

  const handleSupplierNameChange = (e) => {
    setSupplierName(e.target.value);
  }

  const handleWebsiteUrlChange = (e) => {
    setWebsiteUrl(e.target.value);
  }

  const showAlert = (message, variant) => {
    if(variant ==="success") {
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
  }
    
  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!supplierName) {
      showAlert("Nazwa sklepu nie może być pusta!", "error");
      return;
    }

    try{
      const response = await axios.post('http://localhost:8080/suppliers',
        {
          name: supplierName,
          websiteUrl: websiteUrl,
        }
      );
      const newSupplier = response.data;
      console.log(newSupplier);
      onAddSupplier(newSupplier);
      showAlert("Dodano nowy Sklep", "success");
      setTimeout(() => {
        onClose();
      }, 1100);
    } catch (error) {
      console.error("Failed to add supplier:", error);
      const errorMsg = error.response?.data || "Błąd podczas tworzenia Sklepu.";
      showAlert("Błąd tworzenia dostawcy.", "error");
    }
  }




  return ReactDOM.createPortal(
    <div className='add-popup-overlay' onClick={onClose}>
        <div className='add-supplier-popup-content' onClick={(e) => e.stopPropagation()}>
            <section className='add-new-supplier-header'>        
              <h2 className="popup-title">
                Dodaj nowy sklep
              </h2>
              <button className='popup-close-button' onClick={onClose}>
                <img 
                    src='src/assets/close.svg' 
                    alt="close" 
                    className='popup-close-icon' />
              </button>
            </section>
            <form 
              onSubmit={handleSubmit}
              className='add-supplier-form'>
                <section className="add-supplier-input-section">
                  <label className="add-supplier-label">
                  <a className='add-supplier-label-a'>Nazwa Sklepu:</a>
                    <input
                      type="text"
                      value={supplierName}
                      onChange={handleSupplierNameChange}
                      className="add-supplier-input"
                    />
                  </label>
                  <label className="add-supplier-label">
                    <a className='add-supplier-label-a'>Strona www:</a>
                    <input
                      type="text"
                      value={websiteUrl}
                      onChange={handleWebsiteUrlChange}
                      placeholder='https://'
                      className="add-supplier-input"
                    />
                  </label>
                </section>
                <button className='supplier-confirm-button'>
                  <img 
                      src='src/assets/tick.svg' 
                      alt="tick" 
                      className='tick-icon' />
                  <a>Zapisz</a>
              </button>
            </form>
            {alertVisible && (
              <CustomAlert
                message={errorMessage || successMessage}
                variant={errorMessage ? 'error' : 'success'}
              />
            )}
        </div>     
    </div>,
    document.getElementById('portal-root')
  )
}

export default AddSupplierPopup

import React from "react";
import ReactDOM from "react-dom";
import ProductContent from "./ProductContent";
import ProductActionButton from "./ProductActionButton";


const RemoveProductPopup = ({
  onClose,
  handleProductRemove,
  selectedProduct,
}) => {
  
  return ReactDOM.createPortal(
    <div className="add-popup-overlay" onClick={onClose}>
      <div
        className="remove-product-popup-content"
        onClick={(e) => e.stopPropagation()}
      >
        <section className="edit-product-popup-header">
          <h2 className="popup-title">Na pewno? ⛔</h2>
          <button className="popup-close-button" onClick={onClose}>
            <img
              src="src/assets/close.svg"
              alt="close"
              className="popup-close-icon"
            />
          </button>
        </section>
        <section className="remove-product-popup-interior">
          <section>
            <a className="remove-popup-warning-a">
              ❗❗❗ Zatwierdzenie spowoduje usunięcie informacji o produkcie i
              dostępnych zapasów na stanie:
            </a>
            <br />
            <a className="remove-popup-warning-a-list-length">{`Razem: ${selectedProduct.productInstances.length}`}</a>
          </section>
          {selectedProduct && <ProductContent product={selectedProduct} />}
          <a className="remove-popup-warning-a"></a>
        </section>
        {selectedProduct && (
          <>
            <section className="footer-popup-action-buttons">
              <div className="footer-cancel-button">
                <ProductActionButton
                  src={"src/assets/cancel.svg"}
                  alt={"Anuluj"}
                  text={"Anuluj"}
                  onClick={onClose}
                />
              </div>
              <div className="footer-confirm-button">
                <ProductActionButton
                  src={"src/assets/tick.svg"}
                  alt={"Zatwierdź"}
                  text={"Zatwierdź"}
                  onClick={() => handleProductRemove(selectedProduct.id)}
                />
              </div>
            </section>
            <a className="popup-category-description">
              Jeśli chcesz usunąć pojedynczy produkt z zapasów skorzystaj z
              zakładki - <i>Edytuj Produkt</i>
            </a>
          </>
        )}
      </div>
    </div>,
    document.getElementById("portal-root")
  );
};

export default RemoveProductPopup;

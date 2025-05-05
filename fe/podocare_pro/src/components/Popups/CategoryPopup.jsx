import React from "react";
import CustomAlert from "../CustomAlert";
import ReactDOM from "react-dom";
import ProductActionButton from "../ProductActionButton";
import { useState, useEffect } from "react";
import CategoryService from "../../service/CategoryService";
import CategoryForm from "../CategoryForm";

const CategoryPopup = ({
  onClose,
  handleResetFiltersAndData,
  selectedCategory,
}) => {
  /* WAS NOT TESTED FOR EDIT CATEGORY - ONLY CREATION SO FAR */
  const [categoryDTO, setCategoryDTO] = useState(null);
  const [fetchedCategories, setFetchedCategories] = useState(null);
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

  const fetchCategories = async () => {
    CategoryService.getCategories()
      .then((data) => {
        setFetchedCategories(data);
        return data;
      })
      .catch((error) => {
        setFetchedCategories([]);
        console.error("Error fetching categories:", error);
        return [];
      });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const action = selectedCategory ? "Edit" : "Create";

  const handleCategoryAction = async (categoryDTO) => {
    if (await checkForErrorsCategoryAction(categoryDTO)) {
      return false;
    }
    if (action == "Create") {
      CategoryService.createCategory(categoryDTO)
        .then((data) => {
          showAlert("Kategoria utworzona!", "success");
          handleResetFiltersAndData();
          setTimeout(() => {
            onClose();
          }, 1200);
        })
        .catch((error) => {
          console.error("Error creating new Category.", error);
          showAlert("Błąd tworzenia kategorii.", "error");
          return false;
        });
    } else if (action == "Edit") {
      CategoryService.updateCategory(categoryDTO)
        .then((data) => {
          showAlert(`Kategoria zaktualizowana!`, "success");
          handleResetFiltersAndData();
          setTimeout(() => {
            onClose();
          }, 1200);
        })
        .catch((error) => {
          console.error("Error updating Category.", error);
          showAlert("Błąd aktualizacji kategorii.", "error");
          return false;
        });
    }
  };

  const checkForErrorsCategoryAction = async (categoryForm) => {
    const nameExists = fetchedCategories.some(
      (cat) =>
        cat.name.toLowerCase().trim() === categoryForm.name.toLowerCase().trim()
    );

    if (nameExists) {
      showAlert("Kategoria o takiej nazwie już istnieje!", "error");
      return true;
    }

    if (categoryForm.name.trim().length <= 2) {
      showAlert("Nazwa kategorii za krótka! (2+)", "error");
      return true;
    }

    if(selectedCategory) {
      const noChangesDetected =
      categoryForm.name === selectedCategory.name &&
      categoryForm.color === selectedCategory.color;

    if (action == "Edit" && noChangesDetected) {
      showAlert("Brak zmian!", "error");
      return true;
    }
    }
    
    return false;
  };

  const handleCategoryDTO = (categoryForm) => {
    setCategoryDTO(categoryForm);
  };

  return ReactDOM.createPortal(
    <div className="add-popup-overlay short-version category" onClick={onClose}>
      <div
        className="category-popup-content"
        onClick={(e) => e.stopPropagation()}
      >
        <section className="product-popup-header">
          <h2 className="popup-title">
            {selectedCategory ? "Edytuj Kategorię" : "Nowa Kategoria"}
          </h2>
          <button className="popup-close-button" onClick={onClose}>
            <img
              src="src/assets/close.svg"
              alt="close"
              className="popup-close-icon"
            />
          </button>
        </section>
        <section className="remove-product-popup-interior">
          <CategoryForm
            onForwardCategoryForm={(categoryForm) =>
              handleCategoryDTO(categoryForm)
            }
            selectedCategory={selectedCategory}
          />
        </section>
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
              onClick={() => handleCategoryAction(categoryDTO)}
            />
          </div>
        </section>
        {alertVisible && (
          <CustomAlert
            message={errorMessage || successMessage || infoMessage}
            variant={
              errorMessage ? "error" : successMessage ? "success" : "info"
            }
          />
        )}
      </div>
    </div>,
    document.getElementById("portal-root")
  );
};

export default CategoryPopup;

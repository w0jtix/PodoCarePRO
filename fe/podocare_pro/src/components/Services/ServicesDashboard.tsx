import { useAlert } from "../Alert/AlertProvider";
import { useState, useCallback, useEffect } from "react";
import NavigationBar from "../NavigationBar";
import ActionButton from "../ActionButton";
import CategoryButtons from "../CategoryButtons";
import {
  CategoryButtonMode,
  BaseServiceCategory,
  NewBaseServiceCategory,
} from "../../models/categories";
import BaseServiceCategoryService from "../../services/BaseServiceCategoryService";
import CategoryPopup from "../Popups/CategoryPopup";
import { AlertType } from "../../models/alert";
import { Action } from "../../models/action";
import { validateCategoryForm } from "../../utils/validators";
import { extractCategoryErrorMessage } from "../../utils/errorHandler";
import ServiceList from "./ServiceList";
import { SERVICES_LIST_ATTRIBUTES } from "../../constants/list-headers";
import { BaseService } from "../../models/service";
import BaseServiceService from "../../services/BaseServiceService";
import ServicePopup from "../Popups/ServicePopup";
import AvailableAddOnsPopup from "../Popups/AvailableAddOnsPopup";
import RemovePopup from "../Popups/RemovePopup";
import DropdownSelect from "../DropdownSelect";
import { ca } from "date-fns/locale";

export function ServicesDashboard() {
  const [keyword, setKeyword] = useState<string | undefined>(undefined);
  const [resetTriggered, setResetTriggered] = useState<boolean>(false);
  const [categories, setCategories] = useState<BaseServiceCategory[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<
    BaseServiceCategory[]
  >([]);
  const [isRemovePopupOpen, setIsRemovePopupOpen] = useState<boolean>(false);
  const [isManageAddOnsPopupOpen, setIsManageAddOnsPopupOpen] =
    useState<boolean>(false);
  const [services, setServices] = useState<BaseService[]>([]);
  const [selectedService, setSelectedService] = useState<BaseService | null>(
    null
  );
  const [isAddNewServicePopupOpen, setIsAddNewServicePopupOpen] =
    useState<boolean>(false);
  const [isCategoryPopupOpen, setIsCategoryPopupOpen] =
    useState<boolean>(false);
  const { showAlert } = useAlert();

  const fetchCategories = async (): Promise<void> => {
    BaseServiceCategoryService.getCategories()
      .then((data) => {
        setCategories(data);
      })
      .catch((error) => {
        setCategories([]);
        console.error("Error fetching categories:", error);
      });
  };

  const fetchServices = async (): Promise<void> => {
    const selectedCategoryIds = selectedCategories.length > 0 ? selectedCategories.map(cat => cat.id) : null;
    BaseServiceService.getServices({ keyword: keyword, categoryIds: selectedCategoryIds })
      .then((data) => {
        console.log(data);
        const sorted = data.sort(
          (a, b) => (a.category?.id || 0) - (b.category?.id || 0)
        );
        setServices(sorted);
      })
      .catch((error) => {
        setServices([]);
        console.error("Error fetching Services: ", error);
      });
  };

  const handleKeywordChange = useCallback((newKeyword: string) => {
    setKeyword(newKeyword);
  }, []);

  const handleFilterByCategory = useCallback(
    (categories: BaseServiceCategory | BaseServiceCategory[] | null) => {

      const categoriesArray = !categories
      ? []
      : Array.isArray(categories)
      ? categories
      : [categories];
      
      setSelectedCategories(categoriesArray);
    },
    []
  );

  const handleResetFiltersAndData = useCallback(() => {
    fetchCategories();
    setResetTriggered((prev) => !prev);
    setSelectedService(null);
    setSelectedCategories([]);
  }, []);

  const handlePopupSuccess = useCallback(
    (message: string) => {
      showAlert(message, AlertType.SUCCESS);
      handleResetFiltersAndData();
    },
    [showAlert, handleResetFiltersAndData]
  );

  const handleServiceRemove = useCallback(async () => {
    if (!selectedService) return;
    BaseServiceService.deleteService(selectedService.id)
      .then(() => {
        handlePopupSuccess(`Usługa ${selectedService.name} usunięta!`);
        setIsRemovePopupOpen(false);
      })
      .catch((error) => {
        console.error("Error removing Service", error);
        showAlert("Błąd usuwania Usługi!", AlertType.ERROR);
      });
  }, [selectedService, showAlert]);

  const handleCategoryAction = useCallback(
    async (categoryDTO: BaseServiceCategory | NewBaseServiceCategory) => {
      const action = "id" in categoryDTO ? Action.EDIT : Action.CREATE;

      const error = validateCategoryForm(
        categoryDTO,
        "id" in categoryDTO ? (categoryDTO as BaseServiceCategory) : undefined,
        action,
        categories
      );
      if (error) {
        showAlert(error, AlertType.ERROR);
        return;
      }

      try {
        if (action === Action.CREATE) {
          await BaseServiceCategoryService.createCategory(
            categoryDTO as NewBaseServiceCategory
          );
          handlePopupSuccess(`Kategoria ${categoryDTO.name} utworzona!`);
        } else {
          await BaseServiceCategoryService.updateCategory(
            (categoryDTO as BaseServiceCategory).id,
            categoryDTO as BaseServiceCategory
          );
          handlePopupSuccess(`Kategoria ${categoryDTO.name} zaktualizowana!`);
        }
        setIsCategoryPopupOpen(false);
      } catch (error) {
        console.error(
          `Error ${
            action === Action.CREATE ? "creating" : "updating"
          } category:`,
          error
        );
        const errorMessage = extractCategoryErrorMessage(error, action);
        showAlert(errorMessage, AlertType.ERROR);
      }
    },
    [categories, showAlert, handlePopupSuccess]
  );

  const handleReset = useCallback(() => { 
    setSelectedService(null);
    setSelectedCategories([]);
    fetchCategories();
    fetchServices();
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchServices();
  }, [resetTriggered, keyword, selectedCategories]);

  return (
    <div className="dashboard-panel width-85 height-max flex-column align-items-center">
      <NavigationBar
        onKeywordChange={handleKeywordChange}
        resetTriggered={resetTriggered}
      >
        <DropdownSelect
                  items={categories}
                  value={selectedCategories}
                  onChange={handleFilterByCategory}
                  placeholder="Wybierz kategorie"
                  searchable={false}
                  allowNew={false}
                  className="categories"
                  multiple={true}
                />
        <ActionButton
          src={"src/assets/reset.svg"}
          alt={"Reset filters"}
          text={"Reset"}
          onClick={handleReset}
          disableText={true}
        />
      </NavigationBar>
      <section className="action-buttons-section width-93 flex space-around align-items-center">
        <section className="products-action-buttons width-80 flex align-self-center justify-end g-25 mt-1 mb-1">
          <ActionButton
            src={"src/assets/addNew.svg"}
            alt={"Nowa Usługa"}
            text={"Nowa Usługa"}
            onClick={() => setIsAddNewServicePopupOpen(true)}
          />
          <ActionButton
            src={"src/assets/addNew.svg"}
            alt={"Nowa Kategoria"}
            text={"Nowa Kategoria"}
            onClick={() => setIsCategoryPopupOpen(true)}
          />
          <ActionButton
            src={"src/assets/star.svg"}
            alt={"Zarządzaj Dodatkami"}
            text={"Zarządzaj Dodatkami"}
            onClick={() => setIsManageAddOnsPopupOpen(true)}
          />
        </section>
      </section>
      <div className="services-list-section width-90 flex align-items-center justify-center">
        <ServiceList
          attributes={SERVICES_LIST_ATTRIBUTES}
          items={services}
          setIsEditServicePopupOpen={setIsAddNewServicePopupOpen}
          setIsRemoveServicePopupOpen={setIsRemovePopupOpen}
          setSelectedService={setSelectedService}
          className="services"
        />
      </div>
      {isAddNewServicePopupOpen && (
        <ServicePopup
          onClose={() => {
            setIsAddNewServicePopupOpen(false);
            setSelectedService(null);
          }}
          onReset={handleReset}
          selectedService={selectedService}
          className={"service-popup"}
        />
      )}
      {isCategoryPopupOpen && (
        <CategoryPopup
          categories={categories}
          onClose={() => setIsCategoryPopupOpen(false)}
          onConfirm={handleCategoryAction}
        />
      )}
      {isManageAddOnsPopupOpen && (
        <AvailableAddOnsPopup
          onClose={() => setIsManageAddOnsPopupOpen(false)}
          action={Action.MANAGE}
          className="manage-addons"
        />
      )}
      {isRemovePopupOpen && (
        <RemovePopup
          onClose={() => setIsRemovePopupOpen(false)}
          selectedItem={selectedService}
          warningText={
            "Zatwierdzenie spowoduje usunięcie Usługi z bazy danych!"
          }
          handleRemove={handleServiceRemove}
        />
      )}
    </div>
  );
}

export default ServicesDashboard;

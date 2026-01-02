import {
  BaseService,
  NewBaseService,
} from "../../models/service";
import { useCallback, useState, useEffect } from "react";
import { useAlert } from "../Alert/AlertProvider";
import { Action } from "../../models/action";
import ReactDOM from "react-dom";
import ActionButton from "../ActionButton";
import ServiceForm from "../Services/ServiceForm";
import { AlertType } from "../../models/alert";
import { validateServiceForm } from "../../utils/validators";
import BaseServiceService from "../../services/BaseServiceService";
import { extractServiceErrorMessage } from "../../utils/errorHandler";

export interface ServicePopupProps {
  onClose: () => void;
  onReset: () => void;
  editServiceId?: number;
  className: string;
}

export function ServicePopup({
  onClose,
  onReset,
  editServiceId,
  className = "",
}: ServicePopupProps) {
  const [fetchedService, setFetchedService] = useState<BaseService | null>(null);
  const [serviceDTO, setServiceDTO] = useState<NewBaseService | BaseService>({
    name: "",
    price: 0,
    duration: 0,
    variants: [],
    category: null,
  });
  const { showAlert } = useAlert();

  const action = editServiceId ? Action.EDIT : Action.CREATE;

  const fetchServiceById = async(serviceId: number) => {
    BaseServiceService.getServiceById(serviceId)
      .then((data) => {
        setFetchedService(data);
        setServiceDTO(data);
      })
      .catch((error) => {
        console.error("Error fetching service: ", error);
        showAlert("Błąd!", AlertType.ERROR);
      })
  }

  useEffect(() => {
    if (editServiceId) {
      fetchServiceById(editServiceId);
    }
  }, [editServiceId]);

  const handleServiceAction = useCallback(async () => {
    const error = validateServiceForm(
      serviceDTO,
      action,
      fetchedService
    );
    if(error) {
      showAlert(error, AlertType.ERROR);
      return;
    }
    try {
      if (action === Action.CREATE) {
        await BaseServiceService.createService(serviceDTO as NewBaseService);
        showAlert(`Usługa ${serviceDTO.name} utworzona!`, AlertType.SUCCESS);
      } else {
        await BaseServiceService.updateService((serviceDTO as BaseService).id, serviceDTO as BaseService);
        showAlert(`Usługa ${serviceDTO.name} zaktualizowana!`, AlertType.SUCCESS);
        
      }
      onReset();
      onClose();
    } catch (error) {
      console.error(`Error ${action === Action.CREATE ? "creating" : "updating"} service:`, error);      
      const errorMessage = extractServiceErrorMessage(error, action);
      showAlert(errorMessage, AlertType.ERROR);
    }
  }, [
    serviceDTO,
    action,
    fetchedService,
    onReset,
    onClose,
    showAlert,
  ]);

  const portalRoot = document.getElementById("portal-root");
  if (!portalRoot) {
    showAlert("Błąd", AlertType.ERROR);
    console.error("Portal root element not found");
    return null;
  }

  return ReactDOM.createPortal(
    <div className={`add-popup-overlay flex justify-center align-items-start ${className}`} onClick={onClose}>
      <div
        className="service-popup-content flex-column align-items-center relative"
        onClick={(e) => e.stopPropagation()}
      >
        <section className="product-popup-header flex mb-2">
          <h2 className="popup-title">
            {action === Action.CREATE ? "Dodaj Nową Usługę" : "Edytuj Usługę"}
          </h2>
          <button className="popup-close-button transparent border-none flex align-items-center justify-center absolute pointer" onClick={onClose}>
            <img
              src="src/assets/close.svg"
              alt="close"
              className="popup-close-icon"
            />
          </button>
        </section>
        <section className="custom-form-section width-90">
          <ServiceForm
            setServiceDTO={setServiceDTO}
            serviceDTO={serviceDTO}
            action={action}
            className={""}
          />
        </section>

        <ActionButton
          src={"src/assets/tick.svg"}
          alt={"Zapisz"}
          text={"Zapisz"}
          onClick={handleServiceAction}
        />
      </div>
    </div>,
    portalRoot
  );
}

export default ServicePopup;

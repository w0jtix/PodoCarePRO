import ReactDOM from "react-dom";
import { BaseService } from "../../models/service";
import { useState, useCallback, useEffect } from "react";
import VariantsList from "../Services/VariantsList";
import { SERVICE_VARIANTS_ATTRIBUTES } from "../../constants/list-headers";
import { ServiceVariant } from "../../models/service";
import { useAlert } from "../Alert/AlertProvider";
import { AlertType } from "../../models/alert";

export interface ServiceVariantsPopupProps {
  onClose: () => void;
  className?: string;
  pendingService: BaseService;
  onSelect: (variant: ServiceVariant | null) => void;
}

export function ServiceVariantsPopup({
  onClose,
  className = "",
  pendingService,
  onSelect
}: ServiceVariantsPopupProps) {
  const [selectedVariant, setSelectedVariant] = useState<ServiceVariant | null>(null);
  const { showAlert } = useAlert();

  const baseVariant: ServiceVariant & { isBaseVariant?: boolean } = {
    id: pendingService.id,
    name: pendingService.name,
    price: pendingService.price,
    duration: pendingService.duration,
    isBaseVariant: true
  };

  const allVariants = [baseVariant, ...(pendingService?.variants ?? [])];

  useEffect(() => {
    if(selectedVariant) {
      const isBaseVariant = (selectedVariant as any).isBaseVariant === true;
      onSelect(isBaseVariant ? null : selectedVariant);   
    }
  }, [selectedVariant]);

  const portalRoot = document.getElementById("portal-root");
  if (!portalRoot) {
    showAlert("Błąd", AlertType.ERROR);
    console.error("Portal root element not found");
    return null;
  }
  return ReactDOM.createPortal(
    <div
      className={`add-popup-overlay flex justify-center align-items-start ${className}`}
      onClick={onClose}
    >
      <div
        className="variants-popup-content flex-column align-items-center relative"
        onClick={(e) => e.stopPropagation()}
      >
        <section className="product-popup-header flex mb-2">
          <h2 className="popup-title">Wybierz Wariant Usługi</h2>
          <button
            className="popup-close-button transparent border-none flex align-items-center justify-center absolute pointer"
            onClick={onClose}
          >
            <img
              src="src/assets/close.svg"
              alt="close"
              className="popup-close-icon"
            />
          </button>
        </section>

        <section className="variants-addons-lists flex width-90 space-between mb-2 g-05">
          <VariantsList
            attributes={SERVICE_VARIANTS_ATTRIBUTES}
            items={allVariants}
            setSelectedVariant={setSelectedVariant}
            selectedVariant={selectedVariant}
            className="products pricelist"
          />
        </section>
      </div>
    </div>,
    portalRoot
  );
}

export default ServiceVariantsPopup;

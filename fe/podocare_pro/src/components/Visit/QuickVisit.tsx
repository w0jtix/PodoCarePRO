import { Product } from "../../models/product";
import { BaseService } from "../../models/service";
import VisitForm from "./VisitForm";

export interface QuickVisitProps {
    products?: Product[];
    selectedService?: BaseService | null;
    setSelectedService?: (service: BaseService | null) => void;
    selectedProduct?: Product | null;
    setSelectedProduct?: (product: Product | null) => void;
    setQuickVisitTotal?: (total: number) => void;
    className?: string;
    enableHeader?: boolean;
    onClose?: () => void;
    compact?: boolean;
}

export function QuickVisit({
    products,
    selectedService,
    setSelectedService,
    selectedProduct,
    setSelectedProduct,
    setQuickVisitTotal,
    className= "",
    enableHeader= true,
    onClose,
    compact = false,
}: QuickVisitProps) {
    return (
    <>
          <div className={`qv-summary-container width-max f-1 min-width-0 min-height-0 flex-column ${className}`}>
            {enableHeader && (
              <section className="qv-summary-header-section width-max">
              <h2 className="text-align-center mb-1 ml-1">
                Podsumowanie wizyty
              </h2>
            </section>
            )}
            <VisitForm
                products={products}
                selectedService={selectedService}
                setSelectedService={setSelectedService}
                selectedProduct={selectedProduct}
                setSelectedProduct={setSelectedProduct}
                setQuickVisitTotal={setQuickVisitTotal}
                onClose={onClose}
                compact={compact}
            />
          </div>
    </>
    )
}

export default QuickVisit;
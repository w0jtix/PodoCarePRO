import { Visit } from "../../models/visit";
import VisitCartItemList from "./VisitCartItemList";
import { SERVICES_VISIT_CONTENT_ATTRIBUTES, PRODUCT_VISIT_LIST_CONTENT_ATTRIBUTES, DEBTS_VISIT_LIST_ATTRIBUTES, SERVICES_BOOST_VISIT_CONTENT_ATTRIBUTES } from "../../constants/list-headers";
import { useState, useEffect } from "react";
import { ClientDebt } from "../../models/debt";
import DebtsList from "../Clients/DebtsList";
import {Mode} from "../../models/action";

export interface VisitContentProps {
  visit: Visit;
  className?: string;
  mode?: Mode;
  showHeaders?: boolean;
}

export function VisitContent({ visit, className = "", mode, showHeaders = false }: VisitContentProps) {
    const [paidClientDebts, setPaidClientDebts] = useState<ClientDebt[]> ([]);

    useEffect(()=> {
        if(visit && visit.debtRedemptions.length > 0) {
            const debtsArray = visit.debtRedemptions.map((redemption) => redemption.debtSource);
            setPaidClientDebts(debtsArray);
        } else {
            setPaidClientDebts([]);
        }        
    }, [visit])

  return (
    <div className={`width-97 flex mt-05 mb-5px justify-center g-1 ${mode === Mode.POPUP ? "flex-column" : "default"}`}
    onClick={(e) => e.stopPropagation()}>
      {visit.items.length > 0 && (
        
        <div className={`${mode === Mode.POPUP ? "width-max flex-column align-items-center" : "width-half"}`}>
          {showHeaders && (
          <h2 className="f16  mb-05">Usługi</h2>
        )}
        <VisitCartItemList
        attributes={visit.isBoost ? SERVICES_BOOST_VISIT_CONTENT_ATTRIBUTES : SERVICES_VISIT_CONTENT_ATTRIBUTES}
        items={visit.items}
        className={`services pricelist qv content ${className}`}
      />
      </div>
      )}
      {visit.sale && visit.sale.items.length > 0  && (
        <div className={`${mode === Mode.POPUP ? "width-max flex-column align-items-center" : "width-30"}`}>
          {showHeaders && (
          <h2 className="f16  mb-05">Produkty</h2>
        )}
        <VisitCartItemList
        attributes={PRODUCT_VISIT_LIST_CONTENT_ATTRIBUTES}
        items={visit.sale.items}
        className={`services pricelist qv content ${className}`}
      />
      </div>
      )}
      {visit.debtRedemptions.length > 0 && (
        <div className={`${mode === Mode.POPUP ? "width-max flex-column align-items-center" : "width-20"}`}>
          {showHeaders && (
          <h2 className="f16  mb-05">Spłaty zadłużenia</h2>
        )}
            <DebtsList
                attributes={DEBTS_VISIT_LIST_ATTRIBUTES}
                items={paidClientDebts}
                className="products popup-list quick-visit content"
            />
      </div>
      )}
    </div>
  );
}
export default VisitContent;

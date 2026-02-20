
import { InventoryReport, InventoryReportItem } from "../../models/inventory_report";
import { ListAttribute } from "../../constants/list-headers";
import { getSupplyChange } from "../../utils/inventoryReportUtils";
import ListHeader from "../ListHeader";
import { ListModule } from "../ListHeader";

export interface InventoryReportContentProps {  
  attributes: ListAttribute[];
  inventoryReport: InventoryReport;
  className?: string;
}

export function InventoryReportContent ({
  attributes,
  inventoryReport,
  className="",
}: InventoryReportContentProps) {
  
    const renderAttributeContent = (
        attr: ListAttribute,
        item: InventoryReportItem,
        index: number
      ): React.ReactNode => {
        switch (attr.name) {


            case " ":
        return (
          <div
          className="category-container width-40 p-0"
          style={{
            backgroundColor: item.product.category?.color
                      ? `rgb(${item.product.category.color})`
                      : undefined
          }}
          />
        );
    
    
          case "Produkt":
            return (
              <span className="expense-item-list-span">
                {item.product.name}
              </span>
            );
    
          case "Przed / Po":
            return (
                <div className="flex g-05 ml-025">
                    
              <span className="ir-item-span">
                {item.supplyBefore}
              </span>
              <img 
              src="src/assets/transition.svg"
              alt="Change"
              className="ir-change-icon"
              />
              <span className="ir-item-span">
                {item.supplyAfter}
              </span>
                </div>
            );


            case "Zmiana": {
            const change = getSupplyChange(item);
            return (
              <span className={`report-supply-change ${change.className} ml-`}>
                {change.label}
              </span>
            );
          }
    
          default:
            return null;
        }
      };
  

  return (
    <div className={`ir-content width-max `}>
        <ListHeader
        attributes={attributes}
        module={ListModule.HANDY}
        />
        <div
              className={`handy-expense-item-list-container flex-column ${className}`}
            >
              {inventoryReport.items.map((item, index) => {
                return (
                  <div
                    key={`${item.id}-${index}`}
                    className="ir-item flex"
                  >
                    {attributes.map((attr) => (
                      <div
                        key={`${item.id}-${attr.name}`}
                        className="attribute-item flex order align-items-center"
                        style={{
                          width: attr.width,
                          justifyContent: attr.justify,
                        }}
                      >
                        {renderAttributeContent(attr, item, index)}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
    </div>

  );
};

export default InventoryReportContent;

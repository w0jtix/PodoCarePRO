import { NewCompanyExpenseItem } from "../../models/expense";
import ListHeader from "../ListHeader";
import { ListModule } from "../ListHeader";
import { ListAttribute } from "../../constants/list-headers";
import ActionButton from "../ActionButton";
import { useCallback } from "react";
import TextInput from "../TextInput";
import { VatRate } from "../../models/vatrate";
import CostInput from "../CostInput";
import DigitInput from "../DigitInput";
import SelectVATButton from "../SelectVATButton";

export interface ExpenseItemListProps {
  className?: string;
  expenseItems: NewCompanyExpenseItem[];
  setExpenseItems: React.Dispatch<
    React.SetStateAction<NewCompanyExpenseItem[]>
  >; 
    attributes: ListAttribute[];
}

export function ExpenseItemList({ 
    className = "",
    expenseItems,
    setExpenseItems,
    attributes
}: ExpenseItemListProps) {

    const handleExpenseItemRemove = useCallback((index: number) => {
        setExpenseItems((prev) => prev.filter((_, i) => i !== index));        
    },[]);
    const handleExpenseItemName = useCallback((index: number, name: string) => {
        setExpenseItems((prev) => (
        prev.map((ei, i) => i === index ? { ...ei, name: name} : ei)    
        ));
    }, []);
    const handleInputChange = useCallback(
        (index: number, field: keyof NewCompanyExpenseItem, value: number) => {
        setExpenseItems((prev) =>
            prev.map((ei, i) => i === index ? { ...ei, [field]: value } : ei))
    }, []);
    const handleVatSelect = useCallback(
        (index: number, selectedVAT: VatRate) => {
        setExpenseItems((prev) =>
        prev.map((ei, i) => i === index ? { ...ei, vatRate: selectedVAT } : ei)
        )
    },[]);
    const calculateTotalPrice = (price: number, quantity: number): string => {
        const total = price * quantity;
        return isNaN(total) ? "0.00" : total.toFixed(2);
    };

    const renderAttributeContent = (
    attr: ListAttribute,
    item: NewCompanyExpenseItem,
    index: number
  ): React.ReactNode => {
    switch (attr.name) {
      case "":
        return (
          <ActionButton
            src="src/assets/cancel.svg"
            alt="Usuń Produkt"
            iconTitle={"Usuń Produkt"}
            text="Usuń"
            onClick={() => handleExpenseItemRemove(index)}
            disableText={true}
          />
        );

      case "Nazwa":
        return (
          <div className="order-item-list-product-name-with-warning flex align-items-center g-2px">
            <TextInput
              key={`text-input-${'new'}-${index}`}
              dropdown={false}
              value={item.name}
              onSelect={(input) => {
            if (typeof input === "string") {
              handleExpenseItemName(index, input);
            }
          }}
            />
          </div>
        );
      case "Cena jedn.":
        return (
          <CostInput
            key={`cost-input-${'new'}-${index}`}
            selectedCost={item.price}
            onChange={(value) =>
              handleInputChange(
                index,
                "price",
                parseFloat(value.toString()) || 0
              )
            }
            placeholder={"0.00"}
          />
        );

      case "Ilość":
        return (
          <DigitInput
            key={`digit-input-${'new'}-${index}`}
            placeholder="1"
            value={item.quantity}
            onChange={(value) =>
              handleInputChange(
                index,
                "quantity",
                parseInt(value ? value.toString() : "0") || 0
              )
            }
          />
        );

      case "VAT":
        return (
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: attr.justify,
            }}
          >
            <SelectVATButton
              key={`vat-button-${'new'}-${index}`}
              selectedVat={item.vatRate}
              onSelect={(selectedVAT) =>
                handleVatSelect(index, selectedVAT)
              }
            />
          </div>
        );

      case "Cena":
        return (
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: attr.justify,
            }}
          >
            <span>{calculateTotalPrice(item.price, item.quantity)} zł</span>
          </div>
        );

      default:
        return (null);
    }
  };


  return (
    <div className={`flex-column ${className}`}>
      <ListHeader
        attributes={attributes}
        module={ListModule.ORDER}
      />
      <div className={`order-item-list invoice flex-column mt-025 ${className}`}>
            {expenseItems.map((item, index) => (
        <div key={`order-item-${'new'}-${index}`} className="order-item flex">
          {attributes.map((attr) => (
            <div
              key={`${index}-${attr.name}`}
              className={`order-attribute-item ${
                attr.name === "" ? "order-category-column" : ""
              }`}
              style={{
                width: attr.width,
                justifyItems: attr.justify,
              }}
            >
              {renderAttributeContent(attr, item, index)}
            </div>
          ))}
        </div>
      ))}
      </div>
    </div>
  );
}

export default ExpenseItemList;

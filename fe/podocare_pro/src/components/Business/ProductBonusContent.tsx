import ListHeader, { ListModule } from "../ListHeader";
import { ListAttribute } from "../../constants/list-headers";
import { BonusProduct, BonusProductItem } from "../../models/employee";
import { formatDate } from "../../utils/dateUtils";

export interface ProductBonusContentProps {
  product: BonusProduct;
  attributes: ListAttribute[];
  className?: string;
}

export function ProductBonusContent ({
  product,
  attributes,
  className="",
}: ProductBonusContentProps) {

    const renderAttributeContent = (
    attr: ListAttribute,
    product: BonusProductItem,
    noPurchaseHistory: boolean,
    fallbackPurchasePriceUsed: boolean,
    index: number
  ): React.ReactNode => {
    switch (attr.name) {

      case "":
        return "";

      case "Data":
        return (
          <span title="Data sprzedaży." className="order-values-lower-font-size pointer">
            {formatDate(product.saleDate)}
          </span>
        );

        case "Z Net":
        if (noPurchaseHistory && !fallbackPurchasePriceUsed) {
          return (
            <img
              title="Brak historii zakupów tego produktu. Brak możliwości naliczenia marży i premii."
              src="src/assets/alert.svg"
              alt="alert"
              className="sb-alert pointer"
            />
          );
        }
        return (
          <span
            title={fallbackPurchasePriceUsed ? "Awaryjna cena zakupu Netto przypisana do produktu." : "Średnia cena zakupu netto."}
            className={`order-values-lower-font-size pointer${fallbackPurchasePriceUsed ? " fallback" : ""}`}
          >
            {product.avgPurchaseNetPrice}
          </span>
        );

        case "Z Brut":
        if (noPurchaseHistory && !fallbackPurchasePriceUsed) {
          return (
            <img
              title="Brak historii zakupów tego produktu. Brak możliwości naliczenia marży i premii."
              src="src/assets/alert.svg"
              alt="alert"
              className="sb-alert pointer"
            />
          );
        }
        return (
          <span
            title={fallbackPurchasePriceUsed ? "Awaryjna cena zakupu Brutto przypisana do produktu." : "Średnia cena zakupu brutto."}
            className={`order-values-lower-font-size pointer${fallbackPurchasePriceUsed ? " fallback" : ""}`}
          >
            {product.avgPurchaseGrossPrice}
          </span>
        );

        case "S Net":
        return (
          <span title="Cena sprzedaży netto." className="order-values-lower-font-size pointer">
            {product.saleNetPrice}
          </span>
        );

        case "S Brut":
        return (
          <span title="Cena sprzedaży brutto." className="order-values-lower-font-size pointer">
            {product.saleGrossPrice}
          </span>
        );

        case "Marża":
        return (
          <span title="Zysk ze sprzedaży Produktu. SNet - ZNet" className={`order-values-lower-font-size pointer${product.margin >= 0 ? " margin" : " negative"}`}>
           {product.margin >= 0 ? "+" : ""}{product.margin} zł
          </span>
        );

        case "Premia":
        return (
          <span title="Premia za sprzedaż." className={`order-values-lower-font-size add pointer ${(noPurchaseHistory && fallbackPurchasePriceUsed) ?  "notify" : (noPurchaseHistory && !fallbackPurchasePriceUsed) ? "alert" : ""}`}>
            +{product.bonusPerUnit}zł
          </span>
        );
      

      default:
        return null;
    }
  };


  return (
    <div className={`expense-content history width-95 justify-self-center mt-025`}>
      <ListHeader
        attributes={attributes}
        module={ListModule.HANDY}
      />
      <div
      className={`handy-expense-item-list-container flex-column ${className}`}
    >
      {product.items.map((item, index) => {
        return (
          <div
            key={`${index}-${index}`}
            className="handy-expense-item flex"
          >
            {attributes.map((attr) => (
              <div
                key={`${index}-${attr.name}`}
                className="attribute-item flex expense"
                style={{
                  width: attr.width,
                  justifyContent: attr.justify,
                }}
              >
                {renderAttributeContent(attr, item, product.noPurchaseHistory, product.fallbackPurchasePriceUsed, index)}
              </div>
            ))}
          </div>
        );
      })}
    </div>
    </div>
  );
};

export default ProductBonusContent;

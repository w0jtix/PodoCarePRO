import React from "react";
import CategoryButtons from "./CategoryButtons";
import BrandButton from "./BrandButton";
import ProductActionButton from "./ProductActionButton";

const ListActionSection = ({
  onFilter,
  productFilterDTO,
  handleResetAllFilters,
  resetTriggered,
}) => {
  const { productTypes, keyword } = productFilterDTO;
  const brandFilterDTO = { productTypes, keyword };

  return (
    <div className="list-action-section">
      <CategoryButtons
        onFilter={onFilter}
        productFilterDTO={productFilterDTO}
        resetTriggered={resetTriggered}
      />
      <BrandButton
        brandFilterDTO={brandFilterDTO}
        onSelect={onFilter}
        resetTriggered={resetTriggered}
      />
      <ProductActionButton
        src={"src/assets/reset.svg"}
        alt={"Reset"}
        text={"Reset"}
        onClick={() => handleResetAllFilters()}
        disableText={true}
      />
    </div>
  );
};

export default ListActionSection;

import React from "react";
import CategoryButtons from "./CategoryButtons";
import BrandButton from "./BrandButton";

const ListActionSection = ({
  onFilter,
  productFilterDTO,
  handleResetAllFilters,
  resetTriggered
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
      <button className="reset-button" onClick={() => handleResetAllFilters()}>
        <img src="src/assets/reset.svg" alt="reset" className="reset-icon" />
      </button>
    </div>
  );
};

export default ListActionSection;

import React from "react";
import CategoryButtons from "./CategoryButtons";
import ProductActionButton from "./ProductActionButton";
import DropdownSelect from "./DropdownSelect";
import BrandService from "../service/BrandService";
import { useState, useEffect } from "react";

const ListActionSection = ({
  onFilter,
  filters,
  handleResetFiltersAndData,
  resetTriggered,
}) => {
  const [brands, setBrands] = useState([]);
  const [selectedBrandIds, setSelectedBrandIds] = useState([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);


  const fetchBrands = async () => {
    BrandService.getBrands()
      .then((data) => {
        const sortedBrands = data.sort((a, b) => a.name.localeCompare(b.name));
        setBrands(sortedBrands);
        return sortedBrands;
      })
      .catch((error) => {
        setBrands([]);
        console.error("Error fetching brands:", error);
        return [];
      });
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleOnSelectBrand = (selectedBrands) => {
    const selectedIds = selectedBrands.map((brand) => brand.id);
    setSelectedBrandIds(selectedIds);
  };

  const handleOnSelectCategory = (selectedCategoryIds) => {
    setSelectedCategoryIds(selectedCategoryIds);
  }

  useEffect(() => {
    const updatedFilterDTO = {
      ...filters,
      brandIds: selectedBrandIds,
      categoryIds: selectedCategoryIds
    }

    onFilter(updatedFilterDTO);
  }, [selectedBrandIds, selectedCategoryIds])

  useEffect(() => {
    setSelectedBrandIds([]);
    setSelectedCategoryIds([]);
    fetchBrands();
  },[resetTriggered]);

  return (
    <div className="list-action-section">
      <CategoryButtons
        onSelect={(selectedCategoryIds) => handleOnSelectCategory(selectedCategoryIds)}
        resetTriggered={resetTriggered}
      />
      <DropdownSelect
        items={brands}
        placeholder="Wybierz markę"
        onSelect={(selectedBrands) => handleOnSelectBrand(selectedBrands)}
        addNewVisible={false}
        multiSelect={true}
        reset={resetTriggered}
      />
      <ProductActionButton
        src={"src/assets/reset.svg"}
        alt={"Reset"}
        text={"Reset"}
        onClick={() => handleResetFiltersAndData()}
        disableText={true}
      />
    </div>
  );
};

export default ListActionSection;

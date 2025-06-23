import React from "react";
import CategoryButtons from "./CategoryButtons";
import ActionButton from "./ActionButton";
import DropdownSelect, { DropdownItem } from "./DropdownSelect";
import BrandService from "../services/BrandService";
import { useState, useEffect, useCallback } from "react";
import { ProductFilterDTO } from "../models/product";
import { ProductCategory, CategoryButtonMode } from "../models/product-category";

export interface Brand extends DropdownItem {
  id: number;
  name: string;
}

export interface ListActionSectionProps {
  onFilter: (filter: ProductFilterDTO) => void;
  filter: ProductFilterDTO;
  onReset: () => void;
  resetTriggered: boolean;
  className?: string;
}

export function ListActionSection ({
  onFilter,
  filter,
  onReset,
  resetTriggered,
  className = ""
}: ListActionSectionProps) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<Brand[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<ProductCategory[]>([]);
  /* const [resetTrigger, setResetTrigger] = useState(false); */

  const fetchBrands = async (): Promise<void>  => {
    BrandService.getBrands()
      .then((data) => {
        const sortedBrands = data.sort((a, b) => a.name.localeCompare(b.name));
        setBrands(sortedBrands);
      })
      .catch((error) => {
        setBrands([]);
        console.error("Error fetching brands:", error);
      });
  };

/*   useEffect(() => {
    fetchBrands();
  }, []); */

  useEffect(() => {
    fetchBrands();
  }, [resetTriggered])

  const handleBrandChange = useCallback((selected: Brand | Brand[] | null) => {
    const brandsArray = !selected? [] : Array.isArray(selected) ? selected : [selected];
    setSelectedBrands(brandsArray);
  }, []);

  const handleCategoryChange = useCallback((categories: ProductCategory[] | null) => {
    categories ? setSelectedCategories(categories) : setSelectedCategories([]);
  }, []);

  useEffect(() => {
    const newBrandIds = selectedBrands.map((brand) => brand.id);
    const newCategoryIds = selectedCategories.map((category) => category.id);

    const isSame = 
    JSON.stringify(filter.brandIds) === JSON.stringify(newBrandIds) &&
    JSON.stringify(filter.categoryIds) === JSON.stringify(newCategoryIds);

    if (!isSame) {
    const updatedFilter: ProductFilterDTO = {
      ...filter,
      brandIds: newBrandIds,
      categoryIds: newCategoryIds,
    };

    onFilter(updatedFilter);
  }
  }, [selectedBrands, selectedCategories]);

  const handleReset = useCallback(() => {
    setSelectedBrands([]);
    setSelectedCategories([]);
    onReset();
  }, []);

  useEffect(() => {
    if(filter.brandIds !== undefined && brands.length > 0) {
      const newSelectedBrands = brands.filter(brand => filter.brandIds?.includes(brand.id));
      setSelectedBrands(newSelectedBrands);
    }
  }, [filter.brandIds, brands]);

  return (
    <div className={`list-action-section ${className}`}>
      <CategoryButtons
        selectedCategories={selectedCategories}
        onSelect={handleCategoryChange}
        resetTriggered={resetTriggered}
        mode={CategoryButtonMode.MULTISELECT}
      />
      <DropdownSelect<Brand>
        items={brands}
        value={selectedBrands}
        onChange={handleBrandChange}
        placeholder="Wybierz markę"
        multiple={true}
        allowNew={false}
      />
      <ActionButton
        src={"src/assets/reset.svg"}
        alt={"Reset filters"}
        text={"Reset"}
        onClick={handleReset}
        disableText={true}
      />
    </div>
  );
};

export default ListActionSection;

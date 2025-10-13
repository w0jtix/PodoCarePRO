import { Action } from "../../models/action";
import {
  BaseService,
  BaseServiceAddOn,
  NewBaseService,
  NewBaseServiceAddOn,
  NewServiceVariant,
  ServiceVariant,
} from "../../models/service";
import { useState, useEffect, useCallback } from "react";
import { BaseServiceCategory } from "../../models/categories";
import BaseServiceCategoryService from "../../services/BaseServiceCategoryService";
import ActionButton from "../ActionButton";
import TextInput from "../TextInput";
import DigitInput from "../DigitInput";
import AddOnsList from "./AddOnsList";
import DropdownSelect from "../DropdownSelect";
import VariantForm from "./VariantForm";

export interface ServiceFormProps {
  serviceDTO: NewBaseService | BaseService;
  setServiceDTO: React.Dispatch<
    React.SetStateAction<NewBaseService | BaseService>
  >;
  action: Action;
  className?: string;
}

export function ServiceForm({
  serviceDTO,
  action,
  setServiceDTO,
  className = "",
}: ServiceFormProps) {
  const [categories, setCategories] = useState<BaseServiceCategory[]>([]);
  const [expandedVariantIndex, setExpandedVariantIndex] = useState<
    number | null
  >(null);

  const fetchCategories = async (): Promise<void> => {
    BaseServiceCategoryService.getCategories()
      .then((data) => {
        setCategories(data);
      })
      .catch((error) => {
        setCategories([]);
        console.error("Error fetching categories: ", error);
      });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const toggleVariantExpand = (index: number) => {
    setExpandedVariantIndex((prev) => (prev === index ? null : index));
  };

  const handleCategoryChange = useCallback(
    (categories: BaseServiceCategory | BaseServiceCategory[] | null) => {
      setServiceDTO((prev) => ({
        ...prev,
        category: Array.isArray(categories)
          ? categories[0] || null
          : categories,
      }));
    },
    []
  );

  const handleNameChange = useCallback((name: string) => {
    setServiceDTO((prev) => ({
      ...prev,
      name: name,
    }));
  }, []);

  const handlePriceChange = useCallback((price: number | null) => {
    if (price === null) {
      price = 0;
    }
    setServiceDTO((prev) => ({
      ...prev,
      price: price,
    }));
  }, []);

  const handleDurationChange = useCallback((duration: number | null) => {
    if (duration === null) {
      duration = 0;
    }

    setServiceDTO((prev) => ({
      ...prev,
      duration: duration,
    }));
  }, []);

  const handleAddVariant = useCallback(() => {
    setServiceDTO((prev) => ({
      ...prev,
      variants: [
        ...(prev.variants || []),
        {
          name: "",
          price: 0,
          duration: 0,
        },
      ],
    }));
  }, [setServiceDTO]);

  const handleRemoveVariant = useCallback((indexToRemove: number) => {
    setServiceDTO((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, index) => index !== indexToRemove),
    }));
  }, []);

  const handleVariantChange = useCallback(
    (index: number, updatedVariant: ServiceVariant | NewServiceVariant) => {
      setServiceDTO((prev) => ({
        ...prev,
        variants: prev.variants.map((v, i) =>
          i === index ? updatedVariant : v
        ),
      }));
    },
    []
  );

  const handleAddOns = useCallback((addOns: BaseServiceAddOn[]) => {
    setServiceDTO((prev) => ({
      ...prev,
      addOns: addOns,
    }));
  }, []);

  return (
    <div
      className={`custom-form-container ${action
        .toString()
        .toLowerCase()} ${className}`}
    >
      <section className="form-row">
        <span className="input-label">Nazwa:</span>
        <TextInput
          dropdown={false}
          value={serviceDTO.name}
          onSelect={(inputName) => {
            if (typeof inputName === "string") {
              handleNameChange(inputName);
            }
          }}
          className="name"
        />
      </section>
      <section className="form-row">
        <span className="input-label">Kategoria:</span>
        <DropdownSelect
          items={categories}
          value={serviceDTO.category}
          onChange={(cat) => handleCategoryChange(cat)}
          placeholder="Kategoria"
          searchable={false}
          allowNew={false}
          className="categories"
        />
      </section>
      <section className="form-row">
        <span className="input-label">Czas trwania (min):</span>
        <DigitInput
          onChange={handleDurationChange}
          value={serviceDTO.duration}
          max={999}
          className={"service"}
        />
      </section>
      <section className="form-row">
        <span className="input-label">Cena:</span>
        <DigitInput
          onChange={handlePriceChange}
          value={serviceDTO.price}
          max={999}
          className={"service"}
        />
      </section>
      <section className="service-variants-container">
        <ActionButton
          src={"src/assets/addNew.svg"}
          alt={"Dodaj Wariant"}
          text={"Dodaj wariant usługi"}
          onClick={() => handleAddVariant()}
          className=""
        />
        <div className="variants-list">
          {serviceDTO.variants.length > 0 &&
            serviceDTO.variants.map((variant, index) => (
              <div key={index} className="variant-wrapper">
                <div
                  className={`variant-header ${
                    expandedVariantIndex === index ? "expanded" : ""
                  }`}
                  onClick={() => toggleVariantExpand(index)}
                >
                  <div className="variant-name-div">
                    <img
                      src={"src/assets/arrow_down.svg"}
                      alt="Toggle dropdown"
                      className={`arrow-down ${
                        expandedVariantIndex === index ? "rotated" : ""
                      }`}
                    />
                    <span className="variant-value name">
                      {variant.name === ""
                        ? `Wariant ${index + 1}`
                        : variant.name}
                    </span>
                  </div>
                  <div className="variant-dp">
                    <span className="variant-value">{variant.duration}min</span>
                    <span className="variant-value">{variant.price}zł</span>
                    <ActionButton
                      src="src/assets/cancel.svg"
                      alt="Usuń Wariant"
                      text="Usuń"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveVariant(index);
                      }}
                      disableText={true}
                      className="variant-remove"
                    />
                  </div>
                </div>
                {expandedVariantIndex === index && (
                  <VariantForm
                    variant={variant}
                    handleVariant={(updated) =>
                      handleVariantChange(index, updated)
                    }
                    action={action}
                    className="variant-form"
                  />
                )}
              </div>
            ))}
        </div>
      </section>
      <AddOnsList 
        addOns={serviceDTO.addOns} 
        className={className} 
        onAddOnsChange={(newAddOns) =>
            setServiceDTO((prev) => ({ ...prev, addOns: newAddOns }))
        }
      />
    </div>
  );
}

export default ServiceForm;

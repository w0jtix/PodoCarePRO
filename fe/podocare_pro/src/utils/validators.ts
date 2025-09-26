import { Product, NewProduct } from "../models/product";
import { Action } from "../models/action";
import { Brand, NewBrand } from "../models/brand";
import { NewProductCategory, ProductCategory } from "../models/product-category";
import { NewSupplier, Supplier } from "../models/supplier";
import { Order, NewOrder } from "../models/order";
import { NewOrderProduct, OrderProduct } from "../models/order-product";

  export function validateLoginForm(
    username: string,
    password: string
  ): string | null {
    if(!username) {
      return "Brak nazwy użytkownika!";
    }
    if(!password) {
      return "Brak hasła!";
    }
    return null;
  };

  export  function validateProductForm(
    productForm: Product | NewProduct,
    selectedProduct: Product | null | undefined,
    action: Action,
  ): string | null {
    if (
      Object.values(productForm).some(
        (value) => value === null || value === undefined
      )
    ) {
      return "Brak pełnych informacji o produkcie!"
    }

    if (productForm.name && productForm.name.trim().length <= 2) {
      return "Nazwa produktu za krótka! (2+)";
    }

    if (action === Action.EDIT && selectedProduct) {
      const noChangesDetected =
      productForm.name === selectedProduct?.name &&
      productForm.category === selectedProduct?.category &&
      productForm.brand === selectedProduct?.brand &&
      (productForm.description ?? "") === (selectedProduct?.description ?? "") &&
      productForm.supply === selectedProduct?.supply;

      if (noChangesDetected) {
      return "Brak zmian!";
      }
    }
    return null;
  };

  export function validateBrandForm(
    brandForm: Brand | NewBrand,
    selectedBrand: Brand | null | undefined,
    action: Action,
  ): string | null {
    if (
      Object.values(brandForm).some(
        (value) => value === null || value === undefined
      )
    ) {
      return "Brak pełnych informacji!";
    }

    if (brandForm.name && brandForm.name.trim().length <= 2) {
        return "Nazwa marki za krótka! (2+)";
      }

    if (action === Action.EDIT && selectedBrand) {
    const noChangesDetected = brandForm.name === selectedBrand.name;

    if (noChangesDetected) {
      return "Brak zmian!";
    }
  }

    return null;
  };

  export function validateProductCategoryForm(
    categoryForm: ProductCategory | NewProductCategory,
    selectedCategory: ProductCategory | null | undefined,
    action: Action,
    fetchedCategories: ProductCategory[],
  ): string | null {
    if (
      Object.values(categoryForm).some(
        (value) => value === null || value === undefined
      )
    ) {
      return "Brak pełnych informacji!";
    }

    if (categoryForm.name && categoryForm.name.trim().length <= 2) {
      return "Nazwa kategorii za krótka! (2+)";
    }

    const nameExists = fetchedCategories.some(
      (cat) => 
        cat.name.toLowerCase().trim() === categoryForm.name?.toLowerCase().trim() &&
        (!selectedCategory || cat.id !== selectedCategory.id)
    );

    if(nameExists) {
      return "Kategoria o takiej nazwie już istnieje!";
    }

    if (action === Action.EDIT && selectedCategory) {
      const noChangesDetected = 
          categoryForm.name === selectedCategory.name &&
          categoryForm.color === selectedCategory.color;
      
          if (noChangesDetected) {
            return "Brak zmian!";
          }
    }
    return null;
  }

  export function validateSupplierForm(
    supplierForm: Supplier | NewSupplier,
    selectedSupplier: Supplier | null | undefined,
    action: Action,
  ): string | null {
    if(!supplierForm.name) {
      return "Brak pełnych informacji!";
    }

    if (supplierForm.name && supplierForm.name.trim().length <= 2) {
      return "Nazwa sklepu za krótka! (2+)"
    }

    if (action === Action.EDIT && selectedSupplier) {
    const noChangesDetected = supplierForm.name === selectedSupplier.name &&
    supplierForm.websiteUrl === selectedSupplier.websiteUrl;

    if (noChangesDetected) {
      return "Brak zmian!";
    }   
  }
  return null;
  }

  export function validateOrderForm(
    orderForm: Order | NewOrder,
    selectedOrder: Order | null | undefined,
    action: Action,
  ): string | null {

    if (!orderForm.supplier) {
      return "Nie wybrano sklepu...";
    }

    if(!orderForm.orderProducts || orderForm.orderProducts.length === 0) {
      return "Puste zamówienie... Dodaj produkty!";
    }

    if(orderForm.orderProducts.some(
      (op) => op.product?.name?.trim() === ""
    )) {
      return "Niepoprawna nazwa produktu!";
    } else if  (
      orderForm.orderProducts.some(
      (op) => op.product?.name?.trim().length <= 2
    )) {
      return "Nazwa produktu za krótka! (2+)";
    }

    if(orderForm.orderProducts.some (
      (op) => op.quantity == 0
    )){
      return Action.EDIT ? "Ilość = 0, usuń produkt!" : "Ilość produktów nie może wynosić 0!";
    }

    if(Action.EDIT && selectedOrder) {
      const noChangesDetected = orderForm.supplier === selectedOrder.supplier &&
        orderForm.orderDate === selectedOrder.orderDate &&
        orderForm.shippingCost === selectedOrder.shippingCost &&
        orderForm.totalNet === selectedOrder.totalNet &&
        orderForm.totalVat === selectedOrder.totalVat &&
        orderForm.totalValue === selectedOrder.totalValue;

        const noOrderProductChangesDetected = areOrderProductsEqual(
          selectedOrder.orderProducts,
          orderForm.orderProducts
        )

        if(noChangesDetected && noOrderProductChangesDetected) {
          return "Brak zmian!";
        }
    }

    return null;
  }

const areOrderProductsEqual = (opList1: OrderProduct[], opList2: NewOrderProduct[]) => {
    if (opList1.length != opList2.length) return false;

    const sorted1 = [...opList1].sort((a, b) => (a.product.id || 0) - (b.product.id || 0));
    const sorted2 = [...opList2].sort((a, b) => (a.product.id || 0) - (b.product.id || 0));

    return sorted1.every((op1, index) => {
      const op2 = sorted2[index];
      return (
        op1.product.name === op2.product.name &&
        op1.product.brand.name === op2.product.brand.name &&
        op1.price === op2.price &&
        op1.quantity === op2.quantity &&
        op1.vatRate === op2.vatRate
      );
    });
  };
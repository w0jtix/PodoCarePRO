import { Product, NewProduct } from "../models/product";
import { Action } from "../models/action";
import { Brand, NewBrand } from "../models/brand";
import { BaseServiceCategory, NewBaseServiceCategory, NewProductCategory, ProductCategory } from "../models/categories";
import { NewSupplier, Supplier } from "../models/supplier";
import { Order, NewOrder } from "../models/order";
import { NewOrderProduct, OrderProduct } from "../models/order-product";
import { JwtUser, User, Role, RoleType } from "../models/login";
import { Employee, NewEmployee } from "../models/employee";
import { BaseServiceAddOn, NewBaseServiceAddOn, BaseService, NewBaseService } from "../models/service";

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

  export function validaAddOnForm(
    addOnForm: BaseServiceAddOn | NewBaseServiceAddOn,
    selectedAddOn: BaseServiceAddOn | undefined | null,
    action: Action,
  ): string | null {
    if (Object.values(addOnForm).some(
      (value) => value === null || value === undefined
    )) {
      return "Brak pełnych informacji o produkcie!";
    }
    if (addOnForm.name && addOnForm.name.trim().length <= 2) {
      return "Nazwa dodatku za krótka! (2+)!";
    }

    if(action === Action.EDIT && selectedAddOn) {
      const noChangesDetected =
      addOnForm.name === selectedAddOn.name &&
      addOnForm.price === selectedAddOn.price &&
      addOnForm.duration === selectedAddOn.duration
    if (noChangesDetected) {
      return "Brak zmian!";
      }
    }
    return null;
  }

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
      return "Brak pełnych informacji o produkcie!";
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

  export function validateServiceForm(
    serviceForm: BaseService | NewBaseService,
    action: Action,
    selectedService: BaseService | null | undefined,
  ): string | null {
    if(Object.values(serviceForm).some(
      (value) => value === null || value === undefined
    )) {
      return "Brak pełnych informacji!";
    }
    if (serviceForm.variants && serviceForm.variants.length > 0) {
    for (const variant of serviceForm.variants) {
      if (!variant.name || variant.name.trim().length <= 2) {
        return "Nazwa wariantu za krótka! (2+)";
      }
    }
  }
    if (serviceForm.name && serviceForm.name.trim().length <= 2) {
        return "Nazwa usługi za krótka! (2+)";
      }

    if (action === Action.EDIT && selectedService) {

      const variantsEqual =
      (serviceForm.variants?.length ?? 0) ===
        (selectedService.variants?.length ?? 0) &&
      serviceForm.variants.every((v, i) => {
        const sv = selectedService.variants[i];
        return (
          v.name === sv.name &&
          v.price === sv.price &&
          v.duration === sv.duration
        );
      });

    const addOnsEqual =
      (serviceForm.addOns?.length ?? 0) ===
        (selectedService.addOns?.length ?? 0) &&
      serviceForm.addOns.every((a, i) => {
        const sa = selectedService.addOns[i];
        return (
          a.id === sa.id &&
          a.name === sa.name &&
          a.price === sa.price &&
          a.duration === sa.duration
        );
      });

    const noChangesDetected =
      serviceForm.name === selectedService.name &&
      serviceForm.category?.id === selectedService.category?.id &&
      serviceForm.duration === selectedService.duration &&
      serviceForm.price === selectedService.price &&
      variantsEqual &&
      addOnsEqual;

    if (noChangesDetected) {
      return "Brak zmian!";
    }
  }

    return null;
  }

  export function validateCategoryForm(
    categoryForm: ProductCategory | NewProductCategory | BaseServiceCategory | NewBaseServiceCategory,
    selectedCategory: ProductCategory | BaseServiceCategory | null | undefined,
    action: Action,
    fetchedCategories: ProductCategory[] | BaseServiceCategory[],
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

    if(action === Action.CREATE && nameExists) {
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

  //helper fnc
  function normalizeRoles(user: JwtUser | User | null | undefined): RoleType[] {
  if (!user) return [];
  
  if ('token' in user) {
    return user.roles;
  }
  
  return user.roles.map((role: Role) => role.name);
}
  //helper fnc
  function areRolesEqual(roles1: RoleType[], roles2: RoleType[]): boolean {
    if (roles1.length !== roles2.length) return false;
    
    const sorted1 = [...roles1].sort();
    const sorted2 = [...roles2].sort();
    
    return sorted1.every((role, index) => role === sorted2[index]);
  }

  export function validateUpdateUser(updatedUser: User, user: JwtUser | User | null | undefined) {

    if(!updatedUser.id || !updatedUser.username || !updatedUser.avatar) {
      return "Brak pełnych danych użytkownika!"
    }
    if(updatedUser.roles.length === 0) {
      return "Użytkownik musi posiadać conajmniej 1 role!"
    }
    const updatedUserRoles = updatedUser.roles.map(r => r.name);
    const currentUserRoles = normalizeRoles(user);

    const isTryingToAddAdmin =
    updatedUserRoles.includes(RoleType.ROLE_ADMIN) &&
    !currentUserRoles.includes(RoleType.ROLE_ADMIN);

  if (isTryingToAddAdmin) {
    return "Nie masz uprawnień do nadania roli ADMIN!";
  }

    const noChangesDetected = 
      updatedUser.avatar === user?.avatar &&
      (updatedUser.employee?.id ?? null) === (user?.employee?.id ?? null) &&
      areRolesEqual(updatedUserRoles, currentUserRoles);
      
    if (noChangesDetected) {
      return "Brak zmian!";
    }

    return null;
  }

  export function validateChangePasswordForm(
    oldPassword: string,
    newPassword: string,
    confirmPassword: string
  ): string | null {
    if(!oldPassword || !newPassword || !confirmPassword) {
      return "Brak pełnych informacji!";
    }
    if(newPassword.length < 6) {
      return "Nowe hasło za krótkie! (6+)";
    }
    if(newPassword.length > 40) {
      return "Nowe hasło za długie! (max 40)";
    }
    if(newPassword !== confirmPassword) {
      return "Nowe hasła nie są identyczne!";
    }

    if(oldPassword === newPassword) {
      return "Nowe hasło musi różnić się od starego!";
    }
    return null;
  }

  export function validateForceChangePasswordForm(
    newPassword: string,
    confirmPassword: string
  ): string | null {
    if(!newPassword || !confirmPassword) {
      return "Brak pełnych informacji!";
    }
    if(newPassword.length < 6) {
      return "Nowe hasło za krótkie! (6+)";
    }
    if(newPassword.length > 40) {
      return "Nowe hasło za długie! (max 40)";
    }
    if(newPassword !== confirmPassword) {
      return "Nowe hasła nie są identyczne!";
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

  export function validateEmployeeForm(
    employeeForm: Employee | NewEmployee,
    selectedEmployee: Employee | null | undefined,
    action: Action,
  ): string | null {
    if(!employeeForm.name || !employeeForm.secondName) {
      return "Brak pełnych informacji!";
    }
    if(employeeForm.name && employeeForm.name.trim().length <= 2) {
      return "Imię za krótkie! (2+)"
    }
    if(employeeForm.secondName && employeeForm.secondName.trim().length <= 2) {
      return "Nazwisko za krótkie! (2+)"
    }
    if(action === Action.EDIT && selectedEmployee) {
      const noChangesDetected = employeeForm.name === selectedEmployee.name && employeeForm.secondName === selectedEmployee.secondName;
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
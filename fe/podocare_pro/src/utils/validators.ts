import { Product, NewProduct } from "../models/product";
import { Action } from "../models/action";
import { Brand, NewBrand } from "../models/brand";
import { BaseServiceCategory, NewBaseServiceCategory, NewProductCategory, ProductCategory } from "../models/categories";
import { NewSupplier, Supplier } from "../models/supplier";
import { Order, NewOrder } from "../models/order";
import { NewOrderProduct, OrderProduct } from "../models/order-product";
import { JwtUser, User, Role, RoleType } from "../models/login";
import { Employee, NewEmployee } from "../models/employee";
import { BaseService, NewBaseService } from "../models/service";
import { Client, NewClient, NewClientNote } from "../models/client";
import { ClientDebt, NewClientDebt } from "../models/debt";
import { NewVoucher, Voucher } from "../models/voucher";
import { NewReview, Review } from "../models/review";
import { AppSettings, NewAppSettings } from "../models/app_settings";
import { Discount, NewDiscount, NewVisit, Visit, VisitDiscountType } from "../models/visit";
import { PaymentMethod } from "../models/payment";
import { UsageRecordItem } from "../models/usage-record";

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
    if (Object.entries(productForm).some(([key, value]) => {
      if(key === "description") return false;
      return "Brak pełnych informacji o produkcie!";
    }))

    if (productForm.name && productForm.name.trim().length <= 2) {
      return "Nazwa produktu za krótka! (2+)";
    }
    if (productForm.category && productForm.category.name === "Produkty" && (productForm.sellingPrice == null || productForm.sellingPrice === 0)) {
      return "Uzupełnij cenę sprzedaży Produktu!"
    }
    if (productForm.category && productForm.category.name === "Produkty" && (productForm.volume == null || productForm.volume === 0)) {
      return "Uzupełnij objętość Produktu!"
    }
    if (productForm.category && productForm.category.name === "Produkty" && productForm.unit == null) {
      return "Uzupełnij jednostkę Produktu!"
    }
    if (action === Action.EDIT && selectedProduct) {
      const noChangesDetected =
      productForm.name === selectedProduct?.name &&
      productForm.category === selectedProduct?.category &&
      productForm.brand === selectedProduct?.brand &&
      (productForm.description ?? "") === (selectedProduct?.description ?? "") &&
      productForm.supply === selectedProduct?.supply &&
      productForm.sellingPrice === selectedProduct?.sellingPrice &&
      productForm.volume === selectedProduct?.volume &&
      productForm.unit === selectedProduct?.unit &&
      productForm.vatRate === selectedProduct?.vatRate;


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

  export function validateReviewForm(
    reviewForm: NewReview | Review,
    action: Action,
    selectedReview: Review | null | undefined,
  ): string | null {
    if(Object.entries(reviewForm).some(([key, value]) => {
      if(action === Action.CREATE && key === "isUsed") return false;
      return value === null || value === undefined
    })) {
      return "Brak pełnych informacji!";
    }
    if(action === Action.EDIT && selectedReview) {
      const noChangesDetected =
      reviewForm.client === selectedReview.client &&
      reviewForm.issueDate === selectedReview.issueDate &&
      reviewForm.source === selectedReview.source;
      if (noChangesDetected) {
      return "Brak zmian!";
    }
    }
    return null;
  }

  export function validateClientNoteForm(
    notes: NewClientNote[],
  ): string | null {
    for(const noteForm of notes) {
      if(noteForm.content?.trim().length < 1) {
        return "Pusta notatka!"
      }
    }
    
    return null;
  }

  export function validateDiscountForm(
    discountForm: NewDiscount | Discount,
    action: Action,
    selectedDiscount: Discount | undefined | null
  ): string | null {
    if(Object.entries(discountForm).some(([key, value]) => {
      if(key === "clients") return false;
      return value === null || value === undefined || value === ""
    })
  ) {
    return "Brak pełnych informacji!";
  }
  if(discountForm.name?.trim().length < 2) {
    return "Nazwa za krótka (2+)!"
  }
  if(discountForm.name?.trim().length > 6) {
    return "Nazwa za długa max 6 znaków!"
  }

  if(discountForm.percentageValue === 0) {
    return "Rabat nie może być 0!"
  }

  if(action === Action.EDIT && selectedDiscount) {
    const formClientIds = (discountForm.clients || []).map((c) => c.id).sort();
    const selectedClientIds = (selectedDiscount.clients || []).map((c) => c.id).sort();

    const sameClients =
      formClientIds.length === selectedClientIds.length &&
      formClientIds.every((id, index) => id === selectedClientIds[index]);

    const noChangesDetected =
    discountForm.name === selectedDiscount.name &&
    discountForm.percentageValue === selectedDiscount.percentageValue &&
    sameClients;
    
  if (noChangesDetected) {
        return "Brak zmian!";
      }
    }
    return null;
  }

  export function validateSettingsForm(
  settingsForm: NewAppSettings | AppSettings,
  existingSettings: AppSettings
  ): string | null {
    if(Object.values(settingsForm).some(
      (value) => value === null || value === undefined
    )) {
      return "Brak pełnych informacji!";
    }
    if(Object.values(settingsForm).some(
      (value) => value === 0
    )) {
      return "Wartość nie może być 0!";
    }
    if(!existingSettings) {
      return "Błąd walidacji formularza."
    }
    if(existingSettings) {
      const noChangesDetected =
      settingsForm.voucherExpiryTime === existingSettings.voucherExpiryTime &&
      settingsForm.visitAbsenceRate === existingSettings.visitAbsenceRate &&
      settingsForm.visitVipRate === existingSettings.visitVipRate &&
      settingsForm.boostNetRate === existingSettings.boostNetRate &&
      settingsForm.googleReviewDiscount === existingSettings.googleReviewDiscount;
      if (noChangesDetected) {
        return "Brak zmian!";
      }
    }
    return null;
  }

  export function validateVisitForm(
    visitForm: NewVisit | Visit,
    products?: Product[],
  ): string | null {
    if(visitForm.employee == null || visitForm.client == null || visitForm.date === null ){
      return "Brak pełnych informacji!";
    }
    if(visitForm.items.length === 0 && (visitForm.sale == null || visitForm.sale.items.length === 0) && visitForm.debtRedemptions.length === 0) {
      return "Nie można utworzyć pustej Wizyty!";
    }
    if(visitForm.isVip && visitForm.serviceDiscounts) {
      for(const discount of visitForm.serviceDiscounts) {
        if(discount.type === VisitDiscountType.HAPPY_HOURS ||
          discount.type === VisitDiscountType.CLIENT_DISCOUNT ||
          discount.type === VisitDiscountType.CUSTOM) {
            return "W przypadku Wizyty VIP można zastosować tylko rabat OPINIA GOOGLE!"
          }
        
      }
    }
    if(visitForm.items.length === 0 && visitForm.serviceDiscounts?.some((sd) => sd.type === VisitDiscountType.GOOGLE_REVIEW)){
      return "Rabat OPINIA GOOGLE łączy się tylko z usługami!"
    }
    if(visitForm.sale != null) {
      const productItems = visitForm.sale.items.filter(item => 'product' in item && item.product != null);
      const productCounts = productItems.reduce((acc, item) => {
        const id = item.product!.id;

        acc[id] = (acc[id] || 0) + 1;

        return acc;
      }, {} as Record<number, number>);
      for(const [productId, count] of Object.entries(productCounts)) {
        const availableSupply = products?.find(p => p.id === Number(productId))?.supply;
        if( availableSupply && availableSupply < count) {
          const productName = products?.find(p => p.id === Number(productId))?.name;
          return `Niewystarczająca ilość produktu ${productName} w magazynie! Dostępne: ${availableSupply}`
        }
      }
      
    }
    if(visitForm.absence && visitForm.serviceDiscounts) {
      for(const discount of visitForm.serviceDiscounts) {
        if(discount.type === VisitDiscountType.HAPPY_HOURS ||
          discount.type === VisitDiscountType.GOOGLE_REVIEW ||
          discount.type === VisitDiscountType.CUSTOM) {
            return "W przypadku nieobecności można zastosować tylko stały rabat (klienta)!"
          }
        
      }
    }
    const usedVoucherIds = new Set<number>();

    for(const payment of visitForm.payments) {
      if(!payment.method) {
        return "Brak informacji o metodzie płatności!";
      }
      if(payment.method === PaymentMethod.VOUCHER && !payment.voucher) {
        return "Nie przypisano Vouchera jako metody płatności!";
      }
      if(payment.method === PaymentMethod.VOUCHER && payment.voucher) {
        if(usedVoucherIds.has(payment.voucher.id)) {
          return "Nie można użyć tego samego Vouchera dwukrotnie!";
        }
        usedVoucherIds.add(payment.voucher.id);
      }
    }
    return null;
  }

  export function validateVoucherForm(
    voucherForm: NewVoucher | Voucher,
    action: Action,
    selectedVoucher: Voucher | null | undefined,
  ): string | null {
    if(Object.entries(voucherForm).some(([key, value]) => {
      if(action === Action.CREATE && key === "expiryDate") return false;
      return value === null || value === undefined || value === ""
    })
  ) {
    return "Brak pełnych informacji!";
  }
    if(voucherForm.value === 0) {
      return "Wartość vouchera nie może być = 0!"
    }
    if(action === Action.EDIT && selectedVoucher) {
      const noChangesDetected =
      voucherForm.value === selectedVoucher.value &&
      voucherForm.client === selectedVoucher.client &&
      voucherForm.issueDate === selectedVoucher.issueDate &&
      voucherForm.expiryDate === selectedVoucher.expiryDate;
      if (noChangesDetected) {
        return "Brak zmian!";
      }
    }
    return null;
  }

  export function validateNoSourceClientDebtForm(
    debtForm: NewClientDebt | ClientDebt,
    action: Action,
    selectedDebt: ClientDebt | null | undefined,
  ): string | null {
    if(Object.values(debtForm).some(
      (value) => value === null || value === undefined
    )) {
      return "Brak pełnych informacji!";
    }
    if(debtForm.value === 0) {
      return "Wartość długu nie może być = 0!"
    }
    if(action === Action.EDIT && selectedDebt) {
      const noChangesDetected =
      debtForm.value === selectedDebt.value &&
      debtForm.client === selectedDebt.client &&
      debtForm.type === selectedDebt.type;
      if (noChangesDetected) {
      return "Brak zmian!";
    }
    }
    return null;
  }

  export function validateClientForm(
    clientForm: NewClient,
    action: Action,
    selectedClient: Client | null | undefined,
  ): string | null {
    if(Object.entries(clientForm).some(([key, value]) => {
      if(key === "phoneNumber") return false;
      return value === null || value === undefined;
    })) {
      return "Brak pełnych informacji!";
    }
    if(clientForm.firstName.trim().length <= 2) {
      return "Imię klienta za krótkie! (2+)"
    }
    if(clientForm.lastName.trim().length <= 2) {
      return "Nawisko klienta za krótkie! (2+)"
    }

    if(action ===Action.EDIT && selectedClient) {
      const noChangesDetected =
      clientForm.firstName === selectedClient.firstName &&
      clientForm.lastName === selectedClient.lastName &&
      clientForm.boostClient === selectedClient.boostClient &&
      clientForm.signedRegulations === selectedClient.signedRegulations &&
      clientForm.redFlag === selectedClient.redFlag &&
      clientForm.phoneNumber === selectedClient.phoneNumber;

      if (noChangesDetected) {
      return "Brak zmian!";
    }
    }
    return null;
  }

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

    const noChangesDetected =
      serviceForm.name === selectedService.name &&
      serviceForm.category?.id === selectedService.category?.id &&
      serviceForm.duration === selectedService.duration &&
      serviceForm.price === selectedService.price &&
      variantsEqual;

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
      (op) => op.name?.trim() === ""
    )) {
      return "Niepoprawna nazwa produktu!";
    } else if  (
      orderForm.orderProducts.some(
      (op) => op.name?.trim().length <= 2
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
        orderForm.shippingCost === selectedOrder.shippingCost;

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

    const sorted1 = [...opList1].sort((a, b) => (a.product?.id || 0) - (b.product?.id || 0));
    const sorted2 = [...opList2].sort((a, b) => (a.product?.id || 0) - (b.product?.id || 0));

    return sorted1.every((op1, index) => {
      const op2 = sorted2[index];
      return (
        op1.name === op2.name &&
        op1.product?.brand?.name === op2.product?.brand?.name &&
        op1.price === op2.price &&
        op1.quantity === op2.quantity &&
        op1.vatRate === op2.vatRate
      );
    });
  };

  export function validateUsageRecordsForm(
    usageRecordItems: UsageRecordItem[],
    sharedFields: { employee: Employee | null; usageDate: string },
    hasSupplyError: boolean = false
  ): string | null {
    if (!sharedFields.employee) {
      return "Wybierz pracownika";
    }

    if (usageRecordItems.length === 0) {
      return "Dodaj przynajmniej jeden produkt";
    }

    if (hasSupplyError) {
      return "Ilość jednego lub więcej produktów przekracza dostępny stan magazynowy";
    }

    const invalidItems = usageRecordItems.filter((item) => item.quantity <= 0);
    if (invalidItems.length > 0) {
      return "Wszystkie produkty muszą mieć ilość większą niż 0";
    }

    const exceededItems = usageRecordItems.filter(
      (item) => item.quantity > item.product.supply
    );
    if (exceededItems.length > 0) {
      const productNames = exceededItems
        .map((item) => item.product.name)
        .join(", ");
      return `Ilość przekracza dostępny stan dla: ${productNames}`;
    }

    return null;
  }
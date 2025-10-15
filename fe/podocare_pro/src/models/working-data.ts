import { Brand, NewBrand } from "./brand";
import { ProductCategory } from "./categories";
import { Product, NewProduct } from "./product";
import { VatRate } from "./vatrate";
import { Order, NewOrder } from "./order";
import { Supplier } from "./supplier";
import { OrderProduct, NewOrderProduct } from "./order-product";


export interface OrderWorkingData {
  originalOrder?: Order;
  supplier: Supplier | null;
  orderDate: string;
  orderProducts: OrderProductWorkingData[];
  shippingVatRate: VatRate;
  shippingCost: number;
  totalNet: number;
  totalVat: number;
  totalValue: number;
}

export interface OrderProductWorkingData {
  tempId: string;
  originalOrderProduct: OrderProduct | NewOrderProduct;
  productName: string;
  product: Product | ProductWorkingData | null;
  productSuggestions: Product[];
  quantity: number;
  vatRate: VatRate;
  price: number;
  hasWarning: boolean;
  initialQuantity: number;
}

export interface ProductWorkingData {
  tempId: string;
  originalProduct?: Product;
  originalOrderProduct?: OrderProduct;
  name: string;
  category: ProductCategory | null;
  brand: Brand | NewBrand | null;
  brandName: string,
  brandSuggestions: Brand[];
  supply: number;
  description: string;
  isDeleted?: boolean;
}

let tempIdCounter = 0;

export const generateTempId = (prefix: string = 'temp'): string => {
  return `${prefix}-${Date.now()}-${tempIdCounter++}`;
};

export const isTempId = (id: any): boolean => {
  return typeof id === 'string' && id.includes('-');
};

export const convertToWorkingData = {
  orderProduct: (item: OrderProduct | NewOrderProduct): OrderProductWorkingData => {
    const isOrderProduct = 'id' in item && typeof item.id === 'number';
    
    return {
      tempId: generateTempId('op'),
      originalOrderProduct: item,
      productName: item.product?.name || '',
      product: item.product || null,
      productSuggestions: [],
      quantity: item.quantity || 1,
      vatRate: item.vatRate || VatRate.VAT_8,
      price: item.price || 0,
      hasWarning: false,
      initialQuantity: item.quantity || 1,
    };
  },

  order: (order: Order): OrderWorkingData => ({
    originalOrder: order,
    supplier: order.supplier,
    orderDate: order.orderDate,
    orderProducts: order.orderProducts.map(convertToWorkingData.orderProduct),
    shippingVatRate: order.shippingVatRate,
    shippingCost: order.shippingCost,
    totalNet: order.totalNet,
    totalVat: order.totalVat,
    totalValue: order.totalValue,
  }),

  product: (product: Product): ProductWorkingData => ({
    tempId: generateTempId('p'),
    originalProduct: product,
    name: product.name,
    category: product.category || null,
    brand: product.brand || null,
    brandName: product.brand.name || "",
    brandSuggestions: [],
    supply: product.supply,
    description: product.description,
    isDeleted: product.isDeleted,
  }),
};

export const convertToBackendData = {
  orderProduct: (workingItem: OrderProductWorkingData): NewOrderProduct => {
      return {
        product: workingItem.product as Product,
        quantity: workingItem.quantity,
        vatRate: workingItem.vatRate,
        price: workingItem.price,
      };
  },

  order: (workingData: OrderWorkingData): NewOrder => {
    const orderProducts = workingData.orderProducts.map(convertToBackendData.orderProduct);
      return {
        supplier: workingData.supplier!,
        orderDate: workingData.orderDate,
        orderProducts: orderProducts as NewOrderProduct[],
        shippingVatRate: workingData.shippingVatRate,
        shippingCost: workingData.shippingCost,
        totalNet: workingData.totalNet,
        totalVat: workingData.totalVat,
        totalValue: workingData.totalValue,
      };    
  },

  product: (workingData: ProductWorkingData): Product | NewProduct => {
    if (workingData.originalProduct) {
      return {
        ...workingData.originalProduct,
        name: workingData.name,
        category: workingData.category!,
        brand: workingData.brand as Brand,
        supply: workingData.supply,
        description: workingData.description,
        isDeleted: workingData.isDeleted,
      } as Product;
    } else {
      return {
        name: workingData.name,
        category: workingData.category!,
        brand: workingData.brand as Brand,
        supply: workingData.supply,
        description: workingData.description,
        isDeleted: false,
      } as NewProduct;
    }
  },
};

export const createNewOrderProductWorkingData = (): OrderProductWorkingData => ({
  tempId: generateTempId('new-op'),
  originalOrderProduct: {
    quantity: 1,
    vatRate: VatRate.VAT_8,
    price: 0,
  } as NewOrderProduct,
  productName: '',
  product: null,
  productSuggestions: [],
  quantity: 1,
  vatRate: VatRate.VAT_8,
  price: 0,
  hasWarning: false,
  initialQuantity: 1,
});

export const createNewOrderWorkingData = (): OrderWorkingData => ({
  supplier: null,
  orderDate: new Date().toISOString(),
  orderProducts: [],
  shippingVatRate: VatRate.VAT_23,
  shippingCost: 0,
  totalNet: 0,
  totalVat: 0,
  totalValue: 0,
});

export const createNewProductWorkingData = (name: string = ''): ProductWorkingData => ({
  tempId: generateTempId('new-p'),
  name,
  category: null,
  brand: null,
  brandName: "",
  brandSuggestions: [],
  supply: 0,
  description: '',
});

export const hasNonExistingProducts = (orderProducts: OrderProductWorkingData[]): OrderProductWorkingData[] => {
  return orderProducts.filter(op => 
    !op.product || 
    (op.product && 'tempId' in op.product) || 
    !op.product.id
  );
};

export const isProductComplete = (product: ProductWorkingData | Product | null): boolean => {
  if (!product) return false;
  
  if ('tempId' in product) {
    return !!(product.name.trim() && product.category && product.brand);
  } else {
    return !!(product.id && product.name);
  }
};
import { NewProduct, Product, ProductFilterDTO } from "../models/product";
import { sendApiRequest } from "../components/send-api-request/SendApiRequest";

class AllProductService {

  static async getProductById(productId: number | string):Promise<Product> {
    return await sendApiRequest<Product>(`products/${productId}`, {
      method: "get",
      errorMessage: "Error fetching product."
    })
  }

  static async getProducts(
    filter?: ProductFilterDTO,
    page: number = 0, 
    size: number = 30
  ):Promise<{ content: Product[], totalPages: number, totalElements: number, last: boolean }> {
    return await sendApiRequest<{ content: Product[], totalPages: number, totalElements: number, last: boolean }>(`products/search?page=${page}&size=${size}`, {
      method: "post",
      body: filter ?? {},
      errorMessage: "Error fetching products."
    })
  }

  static async createProduct(product: NewProduct): Promise<Product> {
    return await sendApiRequest<Product>('products', {
      method: "post",
      body: product,
      errorMessage: "Error creating new Products.",
    })
  }

  static async createNewProducts(products: NewProduct[]): Promise<Product[]> {
    return await sendApiRequest<Product[]>('products/batch', {
      method: "post",
      body: products,
      errorMessage: "Error creating new Products.",
    })
  } 
  
  static async updateProduct(id: string | number, product: NewProduct): Promise<Product> {
    return await sendApiRequest<Product>(`products/${id}`, {
      method: "put",
      body: product,
      errorMessage: "Error updating Product.",
    })
  }     

  static async deleteProduct(id: string | number): Promise<void> {
    return await sendApiRequest<void>(`products/${id}`, {
      method: "delete",
      errorMessage: "Error removing Product.",
    })
  }

  static async generateInventoryReport(filter: ProductFilterDTO): Promise<Blob> {
    return await sendApiRequest<Blob>(`products/inventory-report`, {
      method: "post",
      body: filter,
      responseType: "blob",
      errorMessage: "Error generating PDF file"
    })
  }
}

export default AllProductService;

import axios from "axios";
import { AxiosResponse } from "axios";
import { NewProduct, Product, ProductFilterDTO } from "../models/product";
import { sendApiRequest } from "../components/send-api-request/SendApiRequest";

class AllProductService {

  static async getProducts(filter?: ProductFilterDTO):Promise<Product[]> {
    return await sendApiRequest<Product[]>('products/search', {
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
  
  static async updateProduct(id: string | number, product: Product): Promise<Product | undefined> {
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
}

export default AllProductService;

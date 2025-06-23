import axios from "axios";
import { AxiosResponse } from "axios";
import { NewProduct, Product, ProductFilterDTO } from "../models/product";

class AllProductService {
  private static readonly API_URL = "http://localhost:8080/api/products";

  static async getProducts(filter?: ProductFilterDTO): Promise<Product[]> {
    try {
      const response: AxiosResponse<Product[]> = await axios.post(`${this.API_URL}/search`, filter ?? {});
      return response.status === 204 ? [] : response.data;
    } catch (error) {
      console.error("Error fetching products. ", error);
      throw error;
    }
  }

  static async createProduct(product: NewProduct): Promise<Product> {
    try {
      const response: AxiosResponse<Product> = await axios.post(`${this.API_URL}`, product);
      return response.data;
    } catch (error) {
      console.error("Error creating new Products.", error);
      throw error;
    }
  }

  static async createNewProducts(products: NewProduct[]): Promise<Product[]> {
    try {
      const response: AxiosResponse<Product[]> = await axios.post(`${this.API_URL}/batch`, products);
      return response.data;
    } catch (error) {
      console.error("Error creating new Products.", error);
      throw error;
    }
  }

  static async updateProduct(id: string | number, product: Product): Promise<Product | undefined> {
    try {
      const response: AxiosResponse<Product> = await axios.put(`${this.API_URL}/${id}`, product);
      return response.data;
    } catch (error) {
      console.error("Error updating Product.", error);
      throw error;
    }
  }

  static async deleteProduct(id: string | number): Promise<void> {
    try {
      await axios.delete(`${this.API_URL}/${id}`);
    } catch (error) {
      console.error(
        "Error removing Product.", error);
      throw error;
    }
  }








  static async getProductById(productId) {
    try {
      const response = await axios.get(`${this.API_URL}/${productId}/find`);
      return response.status === 204 ? null : response.data;
    } catch (error) {
      console.error(
        "Product not found", error
      )
      throw error;
    }
  }
}

export default AllProductService;

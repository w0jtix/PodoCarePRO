import axios from "axios";
import { AxiosResponse } from "axios";
import { NewProductCategory, ProductCategory } from "../models/product-category";

class CategoryService {
  private static readonly API_URL = "http://localhost:8080/api/categories";

  static async getCategories(): Promise<ProductCategory[]> {
    try {
      const response: AxiosResponse<ProductCategory[]> = await axios.post(`${this.API_URL}/search`, {});
      return response.status === 204 ? [] : response.data;
    } catch (error) {
      console.error("Error fetching categories. ", error);
      throw error;
    }
  }

  static async createCategory(category: NewProductCategory): Promise<ProductCategory> {
    try{
      const response: AxiosResponse<ProductCategory> = await axios.post(`${this.API_URL}`, category)
      return response.data;
    } catch (error) {
      console.error("Error creating new Category.", error);
      throw error;
    }
  }

  static async updateCategory(id: string | number, category: NewProductCategory): Promise<ProductCategory | undefined> {
    try {
      const response: AxiosResponse<ProductCategory> = await axios.put(`${this.API_URL}/${id}`, category)
      return response.data;
    }catch (error) {
      console.error("Error updating Category.", error);
      throw error;
    }
  }
}

export default CategoryService;
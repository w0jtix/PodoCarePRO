import axios from "axios";
import { Brand, KeywordDTO, NewBrand } from "../models/brand";
import { AxiosResponse } from "axios";


class BrandService {
  private static  readonly API_URL = "http://localhost:8080/api/brands";

  static async getBrands(filter?: KeywordDTO): Promise<Brand[]> {
    try {
      const response: AxiosResponse<Brand[]> = await axios.post(`${this.API_URL}/search`, filter ?? {});
      return response.status === 204 ? [] : response.data;
    } catch (error) {
      console.error("Error fetching brands. ", error);
      throw error;
    }
  }

  static async createBrand(brand: NewBrand): Promise<Brand> {
    try {
      const response: AxiosResponse<Brand> = await axios.post(`${this.API_URL}`, brand);
      return response.data;
    } catch (error) {
      console.error("Error creating brand. ", error);
      throw error;
    }
  }

  static async createBrands(brands: NewBrand[]): Promise<Brand[]> {
    try {
      const response: AxiosResponse<Brand[]> = await axios.post(`${this.API_URL}/batch`, brands);
      return response.data;
    } catch (error) {
      console.error("Error batch creating brands. ", error);
      throw error;
    }
  }
}

export default BrandService;

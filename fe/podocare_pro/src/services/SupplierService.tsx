import axios from "axios";
import { AxiosResponse } from "axios";
import { Supplier, NewSupplier } from "../models/supplier";

class SupplierService {
  private static readonly API_URL = "http://localhost:8080/api/suppliers";

  static async getSuppliers(): Promise<Supplier[]> {
    try {
      const response: AxiosResponse<Supplier[]> = await axios.post(`${this.API_URL}/search`, {});
      return response.status === 204 ? [] : response.data;
    } catch (error) {
      console.error("Error fetching suppliers. ", error);
      throw error;
    }
  }

  static async createSupplier(supplier: NewSupplier): Promise<Supplier> {
    try {
      const response: AxiosResponse<Supplier> =  await axios.post(`${this.API_URL}`, supplier);
      return response.data;
    } catch (error) {
      console.error("Error creating new Supplier.", error);
      throw error;
    }
  }
}

export default SupplierService;

import axios from "axios";

class SupplierService {
  static API_URL = "http://localhost:8080/suppliers";

  static async getSuppliers() {
    try {
      const response = await axios.get(`${this.API_URL}`);
      return response.status === 204 ? [] : response.data;
    } catch (error) {
      console.error("Error fetching suppliers. ", error);
      throw error;
    }
  }

  static async createSupplier(supplierDTO) {
    try {
      const response = await axios.post(`${this.API_URL}`,
        supplierDTO);
      return response.data;
    } catch (error) {
      console.error("Error creating new Supplier.", error);
      throw error;
    }
  }


}

export default SupplierService;

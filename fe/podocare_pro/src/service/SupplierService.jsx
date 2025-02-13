import axios from "axios";

class SupplierService {
  static API_URL = "http://localhost:8080/suppliers";

  static async getAllSuppliers() {
    try {
      const response = await axios.get(`${this.API_URL}`, {});
      return response.status === 204 ? [] : response;
    } catch (error) {
      console.error("Error fetching suppliers. ", error);
      throw error;
    }
  }
}

export default SupplierService;

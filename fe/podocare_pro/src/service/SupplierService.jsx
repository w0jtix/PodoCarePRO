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

  static async getFilteredSuppliersByKeyword(keyword) {
    try {
      const allSuppliers = await this.getAllSuppliers();
      const filteredSuppliers = allSuppliers.data.filter((supplier) =>
        supplier.name.toLowerCase().startsWith(keyword.trim().toLowerCase())
      );

      return filteredSuppliers;
    } catch (error) {
      console.error("Error filtering Suppliers. ", error);
      throw error;
    }
  }
}

export default SupplierService;

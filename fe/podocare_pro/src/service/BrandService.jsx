import axios from "axios";

class BrandService {
  static API_URL = "http://localhost:8080/brands";

  static async getAllBrands() {
    try {
      const response = await axios.get(`${this.API_URL}/all`, {});
      return response.status === 204 ? [] : response.data;
    } catch (error) {
      console.error("Error fetching brands. ", error);
      throw error;
    }
  }

  static async getFilteredBrands(keyword) {
    try {
      const allBrands = await this.getAllBrands();
      const filteredBrands = allBrands.filter((brand) =>
        brand.name.toLowerCase().startsWith(keyword.trim().toLowerCase())
      );
      return filteredBrands;
    } catch (error) {
      console.error("Error filtering Brands. ", error);
      throw error;
    }
  }
}

export default BrandService;

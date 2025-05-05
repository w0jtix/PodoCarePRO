import axios from "axios";

class BrandService {
  static API_URL = "http://localhost:8080/brands";

  static async getBrands(filterDTO) {
    try {
      const response = await axios.post(`${this.API_URL}/get`, filterDTO ?? {} );
      return response.status === 204 ? [] : response.data;
    } catch (error) {
      console.error("Error fetching brands. ", error);
      throw error;
    }
  }

  static async createBrand(brandDTO) {
    try {
      const response = await axios.post(`${this.API_URL}`, brandDTO);
      return response.data;
    } catch (error) {
      console.error("Error creating brand. ", error);
      throw error;
    }
  }

  /* static async getFilteredBrands(productTypes, keyword) {
    try {
      const response = await axios.post(`${this.API_URL}/filter`, {
        productTypes: productTypes,
        keyword: keyword,
      });
      return response.status === 204 ? [] : response.data;
    } catch (error) {
      console.error("Error filtering brands. ", error);
      throw error;
    }
  }

  static async getFilteredBrandsByKeyword(keyword) {
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
  } */
}

export default BrandService;

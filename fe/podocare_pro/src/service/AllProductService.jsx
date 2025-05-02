import axios from "axios";

class AllProductService {
  static API_URL = "http://localhost:8080/products";

  static async getProducts(
    filterDTO
  ) {
    try {
      const response = await axios.post(`${this.API_URL}/get`, 
        filterDTO
      );
      return response.status === 204 ? [] : response.data;
    } catch (error) {
      console.error("Error fetching products. ", error);
      throw error;
    }
  }

  static async createNewProduct(productRequestDTO) {
    try {
      const response = await axios.post(
        `${this.API_URL}/create`,
        productRequestDTO
      );
      return response.data;
    } catch (error) {
      console.error("Error creating new Products.", error);
      throw error;
    }
  }

  static async createNewProducts(productRequestDTOList) {
    try {
      const response = await axios.post(
        `${this.API_URL}/create/batch`,
        productRequestDTOList
      );
      return response.data;
    } catch (error) {
      console.error("Error creating new Products.", error);
      throw error;
    }
  }










  
  static async updateProduct(productCreationDTO) {
    try {
      const response = await axios.patch(
        `${this.API_URL}/${productCreationDTO.id}`,
        productCreationDTO
      );
      return response.data;
    } catch (error) {
      console.error("Error updating Product", error);
      throw error;
    }
  }

  static async deleteProductAndActiveInstances(productId) {
    try {
      const response = await axios.delete(`${this.API_URL}/${productId}`);
      return response.data;
    } catch (error) {
      console.error(
        "Error removing Product",
        error?.response?.data || error.message
      );
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

  static async findProductByIdAndIncludeActiveInstances(productId) {
    try {
      const response = await axios.get(`${this.API_URL}/${productId}`);
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

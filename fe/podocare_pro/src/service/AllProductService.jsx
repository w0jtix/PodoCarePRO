import axios from "axios";

class AllProductService {
  static API_URL = "http://localhost:8080/products";

  static async getAllProducts() {
    try {
      const response = await axios.get(this.API_URL, {});
      return response.status === 204 ? [] : response.data;
    } catch (error) {
      console.error("Error fetching products. ", error);
      throw error;
    }
  }

  static async checkIfProductExists(product, category) {
    try {
      const allProducts = await this.getAllProducts();
      return allProducts.some((p) => p.productName.toLowerCase() === product.name.toLowerCase() && p.category === category);
    } catch (error) {
      console.error("Error checking if product exists. ", error);
      throw error;
    }
  }

  static async getFilteredProducts(keyword) {
    try {
      const allProducts = await this.getAllProducts();
      const filteredProducts = allProducts.filter((product) =>
        product.productName
          .toLowerCase()
          .startsWith(keyword.trim().toLowerCase())
      );
      return filteredProducts;
    } catch (error) {
      console.error("Error filtering products. ", error);
      throw error;
    }
  }

  static async getFilteredProductsWithZeroInstances(
    productTypes,
    selectedIds,
    keyword
  ){
    try{
      const response = await axios.post(`${this.API_URL}/filterAll`, {
        productTypes,
        selectedIds,
        keyword,
      });
      return response.status === 204 ? [] : response.data;
    } catch (error) {
      console.error("Error fetching products. ", error);
      throw error;
    }
  }

  static async getFilteredActiveProductsWithActiveInstances(
    productTypes,
    selectedIds,
    keyword
  ) {
    try {
      const response = await axios.post(`${this.API_URL}/filter`, {
        productTypes,
        selectedIds,
        keyword,
      });
      return response.status === 204 ? [] : response.data;
    } catch (error) {
      console.error("Error fetching products. ", error);
      throw error;
    }
  }

  static async createNewProducts(productsList) {
    try {
      const response = await axios.post(
        `${this.API_URL}/createNewProducts`,
        productsList
      );
      return response.data;
    } catch (error) {
      console.error("Error creating new Products.", error);
      throw error;
    }
  }

  static async validateProducts(orderProductDTOList) {
    try {
      const response = await axios.post(
        `${this.API_URL}/validate`,
        orderProductDTOList
      );
      return response;
    } catch (error) {
      console.error("Error validating Products.", error);
      throw error;
    }
  }

  static async updateProduct(productCreationDTO) {
    try{
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
    try{
      const response = await axios.delete(
        `${this.API_URL}/${productId}`,
      );
      return response.data;
    } catch (error) {
      console.error("Error removing Product", error?.response?.data || error.message);
      throw error;
    }
  }
}

export default AllProductService;

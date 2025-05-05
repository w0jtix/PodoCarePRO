import axios from "axios";

class CategoryService {
  static API_URL = "http://localhost:8080/categories";

  static async getCategories() {
    try {
      const response = await axios.get(this.API_URL, {});
      return response.status === 204 ? [] : response.data;
    } catch (error) {
      console.error("Error fetching categories. ", error);
      throw error;
    }
  }

  static async createCategory(categoryDTO) {
    try{
      const response = await axios.post(this.API_URL, categoryDTO)
      return response.data;
    } catch (error) {
      console.error("Error creating new Category.", error);
      throw error;
    }
  }

  static async updateCategory(categoryDTO) {
    try {
      const response = await axios.put(`${this.API_URL}/${categoryDTO.id}`, categoryDTO)
      return response.data;
    }catch (error) {
      console.error("Error updating Category.", error);
      throw error;
    }
  }
}

export default CategoryService;
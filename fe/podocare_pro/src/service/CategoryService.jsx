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
}

export default CategoryService;
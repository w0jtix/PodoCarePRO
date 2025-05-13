import axios from "axios";

class SupplyManagerService {
  static API_URL = "http://localhost:8080/supply";

  static async getManagers(productIds) {
    try {
      const response = await axios.post(`${this.API_URL}/get`, productIds);
      return response.status === 204 ? [] : response.data;
    } catch (error) {
      console.error("Error fetching supply managers. ", error);
      throw error;
    }
  }


}

export default SupplyManagerService;

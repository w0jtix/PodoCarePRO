import axios from "axios";

class OrderService {
  static API_URL = "http://localhost:8080/orders";


  static async createOrder(OrderRequestDTO) {
    try {
      const response = await axios.post(
        `${this.API_URL}`,
        OrderRequestDTO
      );
      return response.data;
    } catch (error) {
      console.error("Error creating new Order.", error);
      throw error;
    }
  }

  static async getOrders(FilterDTO) {
    try {
      const response = await axios.post(`${this.API_URL}/get`, FilterDTO);
      return response.status === 204 ? [] : response.data;
    } catch (error) {
      console.error("Error fetching orders. ", error);
      throw error;
    }
  }

  static async updateOrder(OrderRequestDTO) {
      try{
        const response = await axios.put(
        `${this.API_URL}/${OrderRequestDTO.id}`,
          OrderRequestDTO
        );
        return response.data;
      } catch (error) {
        console.error("Error updating Order.", error);
        throw error;
      }
    }

  static async deleteOrder(orderId) {
    try{
      const response = await axios.delete(
        `${this.API_URL}/${orderId}`);
        return response.status;
    } catch (error) {
      console.error("Error deleting Order.", 
        error?.response?.data || error.message
      );
      throw error;
    }
  }

}

export default OrderService;

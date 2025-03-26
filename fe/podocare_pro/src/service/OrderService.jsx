import axios from "axios";

class OrderService {
  static API_URL = "http://localhost:8080/orders";

  static async getAllOrders() {
    try {
      const response = await axios.get(this.API_URL, {});
      return response.status === 204 ? [] : response.data;
    } catch (error) {
      console.error("Error fetching orders. ", error);
      throw error;
    }
  }

  static async getFilteredOrders(orderFilterDTO) {
    try{
      const response = await axios.post(`${this.API_URL}/filter`,
        orderFilterDTO
      )
      return response.status === 204 ? [] : response.data;
    } catch (error) {
      console.error("Error fetching Orders.", error);
      throw error;
    }
  }

  static async createNewOrder(OrderDTO) {
    try {
      const response = await axios.post(
        `${this.API_URL}/createOrder`,
        OrderDTO
      );
      return response;
    } catch (error) {
      console.error("Error creating new Order.", error);
      throw error;
    }
  }

  static async filterOrdersBySupplier(supplier) {
    try {
      const allOrders = (await this.getAllOrders()) || [];
      const filteredOrders = allOrders.filter(
        (order) => order.supplierId === supplier.id
      );
      return filteredOrders;
    } catch (error) {
      console.error("Error filtering Orders. ", error);
      throw error;
    }
  }
}

export default OrderService;

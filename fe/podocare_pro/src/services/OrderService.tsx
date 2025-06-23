import axios from "axios";
import { AxiosResponse } from "axios";
import { Order, OrderFilterDTO, NewOrder } from "../models/order";

class OrderService {
  private static readonly API_URL = "http://localhost:8080/api/orders";

   static async getOrders(filter: OrderFilterDTO): Promise<Order[]> {
    try {
      const response: AxiosResponse<Order[]> =  await axios.post(`${this.API_URL}/search`, filter);
      return response.status === 204 ? [] : response.data;
    } catch (error) {
      console.error("Error fetching orders.", error);
      throw error;
    }
  }

  static async createOrder(order: NewOrder): Promise<Order> {
    try {
      const response: AxiosResponse<Order> = await axios.post(`${this.API_URL}`, order);
      return response.data;
    } catch (error) {
      console.error("Error creating new Order.", error);
      throw error;
    }
  }


  static async updateOrder(id: number, order: Order): Promise<Order | undefined> {
      try{
        const response: AxiosResponse<Order> = await axios.put(`${this.API_URL}/${id}`, order);
        return response.data;
      } catch (error) {
        console.error("Error updating Order.", error);
        throw error;
      }
    }

  static async deleteOrder(id: number): Promise<void> {
    try{
      await axios.delete(`${this.API_URL}/${id}`);
    } catch (error) {
      console.error("Error deleting Order.", error);
      throw error;
    }
  }

}

export default OrderService;

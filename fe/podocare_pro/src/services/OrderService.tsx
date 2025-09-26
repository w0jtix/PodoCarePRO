import axios from "axios";
import { AxiosResponse } from "axios";
import { Order, OrderFilterDTO, NewOrder } from "../models/order";

import { sendApiRequest } from "../components/send-api-request/SendApiRequest";

class OrderService {

  static async getOrders(filter: OrderFilterDTO): Promise<Order[]> {
    return await sendApiRequest<Order[]>('orders/search', {
      method: "post",
      body: filter,
      errorMessage: "Error fetching orders."
    })
  }

  static async createOrder(order: NewOrder): Promise<Order> {
    return await sendApiRequest<Order>('orders', {
      method: "post",
      body: order,
      errorMessage: "Error creating new Order.",
    })
  }

  static async updateOrder(id: number, order: Order): Promise<Order | undefined> {
      return await sendApiRequest<Order>(`orders/${id}`, {
        method: "put",
        body: order,
        errorMessage: "Error updating Order.",
      })
    }

  static async deleteOrder(id: number): Promise<void> {
    return await sendApiRequest<void>(`orders/${id}`, {
      method: "delete",
      errorMessage: "Error removing Order.",
    })
  }
}

export default OrderService;

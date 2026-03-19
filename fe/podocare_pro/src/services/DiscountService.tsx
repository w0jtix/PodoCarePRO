import { Discount, NewDiscount } from "../models/visit";

import { sendApiRequest } from "../components/send-api-request/SendApiRequest";

class DiscountService {
  static async getDiscounts(): Promise<Discount[]> {
    return await sendApiRequest<Discount[]>(`discounts/all`, {
      method: "get",
      body: {},
      errorMessage: "Error fetching Discounts.",
    });
  }

  static async getDiscountById(
    id: string | number,
  ): Promise<Discount> {
    return await sendApiRequest<Discount>(`discounts/${id}`, {
        method: "get",
        body: {},
        errorMessage: `Error fetching Discount with given id: ${id}`
    });;
  }

  static async createDiscount(
    discount: NewDiscount
  ): Promise<Discount> {
    return await sendApiRequest<Discount>("discounts", {
      method: "post",
      body: discount,
      errorMessage: "Error creating new Discount.",
    });
  }

  static async updateDiscount(
    id: string | number,
    discount: NewDiscount
  ): Promise<Discount | undefined> {
    return await sendApiRequest<Discount>(`discounts/${id}`, {
      method: "put",
      body: discount,
      errorMessage: "Error updating Discount.",
    });
  }

  static async deleteDiscount(
    id: string | number,
  ): Promise<void> {
    return await sendApiRequest<void>(`discounts/${id}`, {
        method: "delete",
        body: {},
        errorMessage: `Error removing Discount with given id: ${id}`
    });
  }

  
}

export default DiscountService;

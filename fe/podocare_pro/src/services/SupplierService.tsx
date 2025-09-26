import axios from "axios";
import { AxiosResponse } from "axios";
import { Supplier, NewSupplier } from "../models/supplier";
import { sendApiRequest } from "../components/send-api-request/SendApiRequest";

class SupplierService {

  static async getSuppliers(): Promise<Supplier[]> {
    return await sendApiRequest<Supplier[]>(`suppliers/search`, {
      method: "post",
      body: {},
      errorMessage: "Error fetching suppliers."
    });
  }

  static async createSupplier(supplier: NewSupplier): Promise<Supplier> {
    return await sendApiRequest<Supplier>("suppliers", {
      method: "post",
      body: supplier,
      errorMessage: "Error creating new Supplier.",
    });
  }
}

export default SupplierService;

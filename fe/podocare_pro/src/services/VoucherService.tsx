import { Voucher, NewVoucher, VoucherFilterDTO } from "../models/voucher";

import { sendApiRequest } from "../components/send-api-request/SendApiRequest";

class VoucherService {
  static async getVouchers(filter: VoucherFilterDTO): Promise<Voucher[]> {
    return await sendApiRequest<Voucher[]>(`vouchers/search`, {
      method: "post",
      body: filter ?? {},
      errorMessage: "Error fetching vouchers.",
    });
  }

  static async getVoucherById(
    id: string | number,
  ): Promise<Voucher> {
    return await sendApiRequest<Voucher>(`vouchers/${id}`, {
        method: "get",
        body: {},
        errorMessage: `Error fetching Voucher with given id: ${id}`
    });;
  }

  static async createVoucher(
    voucher: NewVoucher
  ): Promise<Voucher> {
    return await sendApiRequest<Voucher>("vouchers", {
      method: "post",
      body: voucher,
      errorMessage: "Error creating new Voucher.",
    });
  }

  static async updateVoucher(
    id: string | number,
    voucher: NewVoucher
  ): Promise<Voucher | undefined> {
    return await sendApiRequest<Voucher>(`vouchers/${id}`, {
      method: "put",
      body: voucher,
      errorMessage: "Error updating Voucher.",
    });
  }

  static async deleteVoucher(
    id: string | number,
  ): Promise<void> {
    return await sendApiRequest<void>(`vouchers/${id}`, {
        method: "delete",
        body: {},
        errorMessage: `Error removing Voucher with given id: ${id}`
    });
  }

  static async hasSaleReference(
    voucherId: string | number,
  ): Promise<Boolean> {
    return await sendApiRequest<Boolean>(`vouchers/${voucherId}/hasReference`, {
        method: "get",
        body: {},
        errorMessage: `Error checking for Sale references for voucher with given id: ${voucherId}`
    })
  }
  
}

export default VoucherService;

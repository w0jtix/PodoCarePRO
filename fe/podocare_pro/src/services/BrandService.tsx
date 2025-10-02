import axios from "axios";
import { Brand, KeywordDTO, NewBrand } from "../models/brand";
import { sendApiRequest } from "../components/send-api-request/SendApiRequest";
import { AxiosResponse } from "axios";
import { error } from "console";


class BrandService {

  static async getBrands(filter?: KeywordDTO): Promise<Brand[]> {
    return await sendApiRequest<Brand[]>(`brands/search`, {
      method: "post",
      body: filter ?? {},
      errorMessage: "Error fetching brands."
    });
  }

  static async createBrand(brand: NewBrand): Promise<Brand> {
    return await sendApiRequest<Brand>('brands', {
      method: "post",
      body: brand,
      errorMessage: "Error creating new Brand.",
    });
  }

  static async createBrands(brands: NewBrand[]): Promise<Brand[]> {
    return await sendApiRequest<Brand[]>(`brands/batch`, {
      method: "post",
      body: brands,
      errorMessage: "Error batch creating brands.",
    });
  }
}

export default BrandService;

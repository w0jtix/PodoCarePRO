import { sendApiRequest } from "../components/send-api-request/SendApiRequest";
import { BaseServiceCategory, NewBaseServiceCategory } from "../models/categories";

class BaseServiceCategoryService {
    static async getCategories(): Promise<BaseServiceCategory[]> {
        return await sendApiRequest<BaseServiceCategory[]>(`service-categories/all`, {
            method: "get",
            body: {},
            errorMessage: "Error fetching Categories."
        });
    }

    static async createCategory(category: NewBaseServiceCategory): Promise<BaseServiceCategory> {
        return await sendApiRequest<BaseServiceCategory>(`service-categories`, {
            method: "post",
            body:category,
            errorMessage: "Error creating new Category."
        });
    }

    static async updateCategory(id: string | number, category: NewBaseServiceCategory): Promise<BaseServiceCategory | undefined> {
        return await sendApiRequest<BaseServiceCategory>(`service-categories/${id}`, {
            method: "put",
            body: category,
            errorMessage: "Error updating Category."
        });
    }

    static async deleteCategory(id: string | number): Promise<void> {
        return await sendApiRequest<void>(`service-categories/${id}`, {
            method: "delete",
            errorMessage: "Error removing Category."
        })
    }

}

export default BaseServiceCategoryService;
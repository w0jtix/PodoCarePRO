import { sendApiRequest } from "../components/send-api-request/SendApiRequest";
import { BaseServiceAddOn, NewBaseServiceAddOn } from "../models/service";

class BaseServiceAddOnService {

    static async getAddOns(): Promise<BaseServiceAddOn[]> {
        return await sendApiRequest<BaseServiceAddOn[]> (`service-addons/all`, {
            method: "get",
            errorMessage: "Error fetching AddOns."
        })
    }

    static async createAddOn(addOn: NewBaseServiceAddOn): Promise<BaseServiceAddOn> {
        return await sendApiRequest<BaseServiceAddOn> (`service-addons`, {
            method: "post",
            body: addOn,
            errorMessage: "Error creating new AddOn."
        });
    }

    static async updateAddOn(id: string | number, addOn: NewBaseServiceAddOn): Promise<BaseServiceAddOn> {
        return await sendApiRequest<BaseServiceAddOn> (`service-addons/${id}`, {
            method: "put",
            body: addOn,
            errorMessage: "Error updating AddOn."
        });
    }
    static async deleteAddOn(id: string | number): Promise<void> {
        return await sendApiRequest<void> (`service-addons/${id}`, {
            method: "delete",
            errorMessage: "Error removing AddOn."
        });
    }
}
export default BaseServiceAddOnService;
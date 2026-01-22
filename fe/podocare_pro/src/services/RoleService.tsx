import { sendApiRequest } from "../components/send-api-request/SendApiRequest";
import { Role } from "../models/login";

class RoleService {

    static async getAllRoles():Promise<Role[]> {
        return await sendApiRequest<Role[]>('roles/all', {
            method: "get",
            errorMessage: "Error fetching roles."
        })
    }
}

export default RoleService;
import { sendApiRequest } from "../components/send-api-request/SendApiRequest";
import { User } from "../models/login";

class UserService {

    static async getUserById(userId: number | string): Promise<User> {
            return await sendApiRequest<User>(`user/${userId}`, {
                method: "get",
                errorMessage: "Error fetching User."
            })
        }

    static async getAllUsers(): Promise<User[]> {
        return await sendApiRequest<User[]> ('user/all', {
            method: "get",
            errorMessage: "Error fetching users."
        })
    }

    static async getUserByEmployeeId(employeeId: string | number): Promise<User> {
        return await sendApiRequest<User> (`user/employee/${employeeId}`, {
            method: "get",
            errorMessage: "Error fetching users."
        })
    }

    static async updateUser(id: number, user: User): Promise<User | undefined> {
        return await sendApiRequest<User>(`user/${id}`, {
            method: "put",
            body: user,
            errorMessage: "Error updating User.",
        });
    }

}

export default UserService;
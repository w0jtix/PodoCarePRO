import { JwtUser, LoginRequest } from "../models/login";
import { sendApiRequest } from "../components/send-api-request/SendApiRequest";
import { RoleType } from "../models/login";
import { ChangePasswordRequest, ForceChangePasswordRequest, MessageResponse, RegisterRequest } from "../models/register";

class AuthService {

    async login(
        username: string,
        password: string
    ): Promise<JwtUser | undefined> {
        const jwtUser = await sendApiRequest<JwtUser>('auth/login', {
            method:"post",
            body: { username, password } as LoginRequest,
            skipAuthHeader: true,
            errorMessage: "Error while signing in."
        });

        if(jwtUser.token) {
            localStorage.setItem('user', JSON.stringify(jwtUser));
        }
        return jwtUser;
    }

    logout(): void {
        localStorage.removeItem("user");
        window.location.replace("/login");
    }

    async register(
        username: string,
        password: string,
        roles: RoleType[],
    ): Promise<string> {
        return sendApiRequest<MessageResponse>('auth/createUser', {
            method: "post",
            body: { username, password, roles } as RegisterRequest,
            errorMessage: "Error while registering new user.",
        })
        .then((response) => {
            return response;
        })
        .then((message: MessageResponse) => {
            return message.message;
        });
    }

    async changePassword(
        oldPassword: string,
        newPassword: string
    ): Promise<string> {
        return sendApiRequest<MessageResponse>('auth/changePassword', {
            method: "post",
            body: { oldPassword, newPassword } as ChangePasswordRequest,
            errorMessage: "Error while changing password.",
        })
        .then((response) => {
            return response;
        })
        .then((message: MessageResponse) => {
            return message.message;
        })
    }

    async forceChangePassword(
        userId: number,
        newPassword: string
    ): Promise<string> {
        return sendApiRequest<MessageResponse>('auth/forceChangePassword', {
            method: "post",
            body: { userId, newPassword } as ForceChangePasswordRequest,
            errorMessage: "Error while force chaning password.",
        })
        .then((response) => {
            return response;
        })
        .then((message: MessageResponse) => {
            return message.message;
        })
    }

    getCurrentUser(): JwtUser | undefined {
        const user = localStorage.getItem("user");
        let result: JwtUser | undefined;
        if (user) {
            result = JSON.parse(user);
        }
        return result;
    }

    getAuthHeader(): { key: string; value: string } {
    
        const user = this.getCurrentUser();
        if(user?.token) {
            return { key: 'Authorization', value: user.type + ' ' + user.token };
        } else {
            return { key: 'Authorization', value: ''};
        }
    }
}

export default new AuthService();
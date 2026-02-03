import { JwtUser, LoginRequest } from "../models/login";
import { sendApiRequest } from "../components/send-api-request/SendApiRequest";
import { RoleType, User, Role } from "../models/login";
import { ChangePasswordRequest, ForceChangePasswordRequest, MessageResponse, RegisterRequest } from "../models/register";

function isUser(obj: any): obj is User {
  return (
    obj &&
    Array.isArray(obj.roles) &&
    obj.roles.length > 0 &&
    typeof obj.roles[0] === "object" &&
    "name" in obj.roles[0]
  );
}

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
        role: RoleType[],
    ): Promise<string> {
        return sendApiRequest<MessageResponse>('auth/createUser', {
            method: "post",
            body: { username, password, role } as RegisterRequest,
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

    setCurrentUser(user: JwtUser | User) {
    let jwtUser: JwtUser;

    if (isUser(user)) {
      
      jwtUser = {
        token: this.getCurrentUser()?.token || "",
        type: this.getCurrentUser()?.type || "Bearer",
        id: user.id,
        username: user.username,
        avatar: user.avatar,
        roles: user.roles.map((r:Role) => r.name),
        employee: user.employee,
      };
    } else {
      jwtUser = user as JwtUser;
    }
    localStorage.setItem("user", JSON.stringify(jwtUser));
    }
}

export default new AuthService();
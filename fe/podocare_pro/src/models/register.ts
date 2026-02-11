import { RoleType } from "./login";

export interface RegisterRequest {
    username: string;
    password: string;
    role: RoleType[];
}

export interface MessageResponse {
    message: string;
}

export interface ChangePasswordRequest {
    oldPassword: string;
    newPassword: string;
}

export interface ForceChangePasswordRequest {
    userId: number;
    newPassword: string;
}
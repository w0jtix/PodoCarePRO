export interface LoginRequest {
    username: string;
    password: string;
}

export interface JwtUser {
    token: string;
    type: string;
    id: number;
    username: string;
    avatar: string;
    roles: RoleType[];
}


export interface User {
    id: number;
    username: string;
    avatar: string;
    roles: Role[];
}

export enum RoleType {
    ROLE_USER = "ROLE_USER",
    ROLE_ADMIN = "ROLE_ADMIN",
}

export interface Role {
    id: number;
    name: RoleType;
}
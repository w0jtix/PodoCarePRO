import { Employee } from "../models/employee";

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
    employee: Employee | null;
}


export interface User {
    id: number;
    username: string;
    avatar: string;
    roles: Role[];
    employee: Employee | null;
}

export enum RoleType {
    ROLE_USER = "ROLE_USER",
    ROLE_ADMIN = "ROLE_ADMIN",
}

export interface Role {
    id: number;
    name: RoleType;
}
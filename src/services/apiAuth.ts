import { type User } from "@/types/user";
import { api } from "./api";

export interface LoginResponse {
    token: string;
    usuario: User;
}

export const login = async(email: string, senha: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/api/auth/login', {
        email,
        senha,
    });

    return response.data;
}


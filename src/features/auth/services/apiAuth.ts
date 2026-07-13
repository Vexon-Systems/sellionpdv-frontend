import { type User } from "@/types/user";
import { api } from "@/lib/api";

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    usuario: User;
}

export const login = async(email: string, senha: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/api/auth/login', {
        email,
        senha,
    });

    return response.data;
}

export const logout = async (refreshToken: string): Promise<void> => {
    await api.post('/api/auth/logout', { refreshToken });
}


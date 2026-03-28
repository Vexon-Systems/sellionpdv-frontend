import { create } from 'zustand'

export type Role = 'ROLE_ADMIN' | 'ROLE_OPERADOR'

interface User{
    id: number
    nome: string
    email: string
    role: Role
}

interface AuthState {
    user: User | null
    accessToken: string | null
    isAuthenticated: boolean
    
    setAuth: (user: User, token: string) => void
    clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    accessToken: null,
    isAuthenticated: false,

    setAuth: (user, token) => 
        set({ 
        user, 
        accessToken: token, 
        isAuthenticated: true 
        }),

    clearAuth: () => 
        set({ 
        user: null, 
        accessToken: null, 
        isAuthenticated: false 
        }),
}))
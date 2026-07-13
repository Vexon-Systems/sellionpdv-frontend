import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { type User } from '@/types/user'

export type Role = 'ROLE_ADMIN' | 'ROLE_OPERADOR'

interface AuthState {
    user: User | null
    accessToken: string | null
    refreshToken: string | null
    isAuthenticated: boolean

    setAuth: (user: User, accessToken: string, refreshToken: string) => void
    setTokens: (accessToken: string, refreshToken: string) => void
    clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,

            setAuth: (user, accessToken, refreshToken) =>
                set({
                    user,
                    accessToken,
                    refreshToken,
                    isAuthenticated: true,
                }),

            setTokens: (accessToken, refreshToken) =>
                set({ accessToken, refreshToken }),

            clearAuth: () =>
                set({
                    user: null,
                    accessToken: null,
                    refreshToken: null,
                    isAuthenticated: false,
                }),
        }),
        {
            name: 'sellion-auth',
            storage: createJSONStorage(() => sessionStorage),
        }
    )
)

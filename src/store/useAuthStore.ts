import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { type User } from '@/types/user'

export type Role = 'ROLE_ADMIN' | 'ROLE_OPERADOR'

interface AuthState {
    user: User | null
    accessToken: string | null
    isAuthenticated: boolean

    setAuth: (user: User, token: string) => void
    clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            isAuthenticated: false,

            setAuth: (user, token) =>
                set({
                    user,
                    accessToken: token,
                    isAuthenticated: true,
                }),

            clearAuth: () =>
                set({
                    user: null,
                    accessToken: null,
                    isAuthenticated: false,
                }),
        }),
        {
            name: 'sellion-auth',
            storage: createJSONStorage(() => sessionStorage),
        }
    )
)

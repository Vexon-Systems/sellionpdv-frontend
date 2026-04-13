import { type Role } from "@/store/useAuthStore"

export interface User{
    id: number
    nome: string
    email: string
    role: Role
}
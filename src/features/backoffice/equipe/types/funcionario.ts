export type FuncionarioRole = "ADMIN" | "OPERADOR";

export interface FuncionarioDTO {
    id: number;
    nome: string;
    email: string;
    role: FuncionarioRole;
    ativo: boolean;
}

export interface CriarFuncionarioDTO {
    nome: string;
    email: string;
    senha: string;
    role: FuncionarioRole;
}

export interface AtualizarFuncionarioDTO {
    nome: string;
    role: FuncionarioRole;
}

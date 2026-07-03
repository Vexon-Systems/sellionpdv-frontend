import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Users, Pen, Trash2, AlertCircle, ShieldCheck, UserRound } from "lucide-react";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";

import type { FuncionarioDTO } from "../types/funcionario";
import { useFuncionarios } from "../hooks/useFuncionarios";
import { FuncionarioFormModal } from "../components/FuncionarioFormModal";

function iniciais(nome: string): string {
    return nome
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0].toUpperCase())
        .join("");
}

function RoleBadge({ role }: { role: FuncionarioDTO["role"] }) {
    if (role === "ADMIN") {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                <ShieldCheck size={12} />
                Administrador
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
            <UserRound size={12} />
            Operador
        </span>
    );
}

export function EquipePage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [funcionarioEmEdicao, setFuncionarioEmEdicao] = useState<FuncionarioDTO | null>(null);
    const [funcionarioParaExcluir, setFuncionarioParaExcluir] = useState<FuncionarioDTO | null>(null);

    const fecharModal = () => {
        setIsModalOpen(false);
        setFuncionarioEmEdicao(null);
    };

    const { funcionarios, isLoading, isError, criar, atualizar, excluir, isSalvando, isExcluindo } =
        useFuncionarios(fecharModal);

    const handleNovo = () => {
        setFuncionarioEmEdicao(null);
        setIsModalOpen(true);
    };

    const handleEditar = (f: FuncionarioDTO) => {
        setFuncionarioEmEdicao(f);
        setIsModalOpen(true);
    };

    const handleConfirmarExclusao = async () => {
        if (!funcionarioParaExcluir) return;
        await excluir(funcionarioParaExcluir.id);
        setFuncionarioParaExcluir(null);
    };

    return (
        <div className="flex flex-col h-screen w-full bg-gray-50 overflow-hidden">
            <Header titulo="Gestão de Equipe" />

            <div className="flex-1 overflow-y-auto p-4 md:px-8 py-6">

                {/* Cabeçalho */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-base font-semibold text-gray-700">
                            {isLoading ? "Carregando..." : `${funcionarios.length} colaborador${funcionarios.length !== 1 ? "es" : ""} ativo${funcionarios.length !== 1 ? "s" : ""}`}
                        </h2>
                        <p className="text-sm text-gray-500">Gerencie os acessos e funções da sua equipe.</p>
                    </div>
                    <Button onClick={handleNovo} className="bg-primary hover:bg-primary/90 text-white shadow-md" size="lg">
                        <Plus size={18} className="mr-2" /> Novo Funcionário
                    </Button>
                </div>

                {/* Estado de erro */}
                {isError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center gap-3 mb-6">
                        <AlertCircle size={20} />
                        <p>Não foi possível carregar a equipe. Tente novamente mais tarde.</p>
                    </div>
                )}

                {/* Estado vazio */}
                {!isLoading && !isError && funcionarios.length === 0 && (
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 flex flex-col items-center justify-center text-gray-400 bg-white">
                        <Users size={48} className="mb-4 opacity-20" />
                        <h3 className="text-lg font-medium text-gray-600 mb-1">Nenhum funcionário cadastrado</h3>
                        <p className="text-sm text-center mb-4">Adicione os colaboradores para que possam acessar o sistema.</p>
                        <Button variant="outline" onClick={handleNovo}>Cadastrar Primeiro Funcionário</Button>
                    </div>
                )}

                {/* Tabela */}
                {!isError && funcionarios.length > 0 && (
                    <Card className="bg-white shadow-sm border-gray-200">
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="pl-6">Colaborador</TableHead>
                                        <TableHead>E-mail</TableHead>
                                        <TableHead>Nível de Acesso</TableHead>
                                        <TableHead className="w-24 text-right pr-6">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading
                                        ? Array.from({ length: 3 }).map((_, i) => (
                                            <TableRow key={i}>
                                                <TableCell colSpan={4} className="pl-6">
                                                    <div className="h-5 bg-gray-100 rounded animate-pulse w-3/4" />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                        : funcionarios.map((f) => (
                                            <TableRow key={f.id} className="hover:bg-gray-50/50">
                                                <TableCell className="pl-6">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-9 w-9 shrink-0">
                                                            <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                                                                {iniciais(f.nome)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span className="font-medium text-gray-900">{f.nome}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm text-gray-500">{f.email}</TableCell>
                                                <TableCell>
                                                    <RoleBadge role={f.role} />
                                                </TableCell>
                                                <TableCell className="text-right pr-6">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleEditar(f)}
                                                            className="text-gray-500 hover:text-primary h-8 w-8 p-0"
                                                        >
                                                            <Pen size={15} />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setFuncionarioParaExcluir(f)}
                                                            className="text-gray-400 hover:text-red-600 hover:bg-red-50 h-8 w-8 p-0"
                                                        >
                                                            <Trash2 size={15} />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
            </div>

            <FuncionarioFormModal
                isOpen={isModalOpen}
                onClose={fecharModal}
                funcionarioEmEdicao={funcionarioEmEdicao}
                onCriar={criar}
                onAtualizar={atualizar}
                isSalvando={isSalvando}
            />

            <AlertDialog
                open={!!funcionarioParaExcluir}
                onOpenChange={(open) => !open && setFuncionarioParaExcluir(null)}
            >
                <AlertDialogContent className="bg-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remover funcionário da equipe?</AlertDialogTitle>
                        <AlertDialogDescription>
                            A conta de <strong>{funcionarioParaExcluir?.nome}</strong> será inativada e o acesso ao sistema será bloqueado imediatamente. O histórico de vendas e caixas será preservado.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isExcluindo}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmarExclusao}
                            disabled={isExcluindo}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {isExcluindo ? "Removendo..." : "Confirmar Remoção"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

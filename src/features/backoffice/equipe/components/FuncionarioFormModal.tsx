import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import type { FuncionarioDTO } from "../types/funcionario";

const schemaCriar = z.object({
    nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres."),
    email: z.string().email("Informe um e-mail corporativo válido."),
    senha: z.string().min(8, "A senha deve ter pelo menos 8 caracteres."),
    role: z.enum(["ADMIN", "OPERADOR"]),
});

const schemaEditar = z.object({
    nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres."),
    role: z.enum(["ADMIN", "OPERADOR"]),
});

type FormCriar = z.infer<typeof schemaCriar>;
type FormEditar = z.infer<typeof schemaEditar>;

interface FuncionarioFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    funcionarioEmEdicao: FuncionarioDTO | null;
    onCriar: (dados: FormCriar) => Promise<void>;
    onAtualizar: (id: number, dados: FormEditar) => Promise<void>;
    isSalvando: boolean;
}

export function FuncionarioFormModal({
    isOpen,
    onClose,
    funcionarioEmEdicao,
    onCriar,
    onAtualizar,
    isSalvando,
}: FuncionarioFormModalProps) {
    const isEdicao = !!funcionarioEmEdicao;
    const [mostrarSenha, setMostrarSenha] = useState(false);

    const formCriar = useForm<FormCriar>({
        resolver: zodResolver(schemaCriar),
        defaultValues: { nome: "", email: "", senha: "", role: "OPERADOR" },
    });

    const formEditar = useForm<FormEditar>({
        resolver: zodResolver(schemaEditar),
        defaultValues: { nome: "", role: "OPERADOR" },
    });

    useEffect(() => {
        if (!isOpen) return;
        if (funcionarioEmEdicao) {
            formEditar.reset({ nome: funcionarioEmEdicao.nome, role: funcionarioEmEdicao.role });
        } else {
            formCriar.reset({ nome: "", email: "", senha: "", role: "OPERADOR" });
            setMostrarSenha(false);
        }
    }, [isOpen, funcionarioEmEdicao]);

    const handleSubmitCriar = formCriar.handleSubmit(async (dados) => {
        await onCriar(dados);
    });

    const handleSubmitEditar = formEditar.handleSubmit(async (dados) => {
        await onAtualizar(funcionarioEmEdicao!.id, dados);
    });

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[440px] bg-white">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-gray-900">
                        {isEdicao ? "Editar Funcionário" : "Novo Funcionário"}
                    </DialogTitle>
                    <DialogDescription className="text-gray-500">
                        {isEdicao
                            ? "Atualize o nome ou o nível de acesso. O e-mail corporativo não pode ser alterado."
                            : "Crie uma conta de acesso ao sistema para o novo colaborador."}
                    </DialogDescription>
                </DialogHeader>

                {isEdicao ? (
                    <form onSubmit={handleSubmitEditar} className="space-y-4 mt-2">
                        <div className="space-y-2">
                            <Label className="font-semibold text-gray-800">E-mail Corporativo</Label>
                            <Input value={funcionarioEmEdicao?.email} disabled className="bg-gray-50 text-gray-500" />
                            <p className="text-xs text-gray-400">O e-mail não pode ser alterado por integridade de auditoria.</p>
                        </div>

                        <div className="space-y-2">
                            <Label className="font-semibold text-gray-800">Nome Completo</Label>
                            <Input placeholder="Nome do colaborador" {...formEditar.register("nome")} disabled={isSalvando} />
                            {formEditar.formState.errors.nome && (
                                <p className="text-red-500 text-sm">{formEditar.formState.errors.nome.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label className="font-semibold text-gray-800">Nível de Acesso</Label>
                            <Select
                                value={formEditar.watch("role")}
                                onValueChange={(val) => formEditar.setValue("role", val as "ADMIN" | "OPERADOR")}
                                disabled={isSalvando}
                            >
                                <SelectTrigger className="bg-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="OPERADOR">Operador — acesso ao PDV e caixa</SelectItem>
                                    <SelectItem value="ADMIN">Administrador — acesso total ao sistema</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="pt-4 flex justify-end gap-3">
                            <Button type="button" variant="outline" onClick={onClose} disabled={isSalvando}>Cancelar</Button>
                            <Button type="submit" disabled={isSalvando} className="bg-primary hover:bg-primary/90 text-white">
                                {isSalvando ? "Salvando..." : "Salvar Alterações"}
                            </Button>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleSubmitCriar} className="space-y-4 mt-2">
                        <div className="space-y-2">
                            <Label className="font-semibold text-gray-800">Nome Completo</Label>
                            <Input placeholder="Ex: Carlos Eduardo" {...formCriar.register("nome")} disabled={isSalvando} />
                            {formCriar.formState.errors.nome && (
                                <p className="text-red-500 text-sm">{formCriar.formState.errors.nome.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label className="font-semibold text-gray-800">E-mail Corporativo</Label>
                            <Input type="email" placeholder="colaborador@empresa.com.br" {...formCriar.register("email")} disabled={isSalvando} />
                            {formCriar.formState.errors.email && (
                                <p className="text-red-500 text-sm">{formCriar.formState.errors.email.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label className="font-semibold text-gray-800">Senha de Acesso</Label>
                            <div className="relative">
                                <Input
                                    type={mostrarSenha ? "text" : "password"}
                                    placeholder="Mínimo 8 caracteres"
                                    {...formCriar.register("senha")}
                                    disabled={isSalvando}
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setMostrarSenha((v) => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    tabIndex={-1}
                                >
                                    {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {formCriar.formState.errors.senha && (
                                <p className="text-red-500 text-sm">{formCriar.formState.errors.senha.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label className="font-semibold text-gray-800">Nível de Acesso</Label>
                            <Select
                                value={formCriar.watch("role")}
                                onValueChange={(val) => formCriar.setValue("role", val as "ADMIN" | "OPERADOR")}
                                disabled={isSalvando}
                            >
                                <SelectTrigger className="bg-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="OPERADOR">Operador — acesso ao PDV e caixa</SelectItem>
                                    <SelectItem value="ADMIN">Administrador — acesso total ao sistema</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="pt-4 flex justify-end gap-3">
                            <Button type="button" variant="outline" onClick={onClose} disabled={isSalvando}>Cancelar</Button>
                            <Button type="submit" disabled={isSalvando} className="bg-primary hover:bg-primary/90 text-white">
                                {isSalvando ? "Criando conta..." : "Criar Conta"}
                            </Button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}

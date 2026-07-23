import { useCallback, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  AlertCircle,
  Pen,
  Plus,
  ShieldCheck,
  Trash2,
  UserRound,
  Users,
} from "lucide-react";

import { PageShell } from "@/components/layout/PageShell";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { FuncionarioFormModal } from "../components/FuncionarioFormModal";
import { useFuncionarios } from "../hooks/useFuncionarios";
import type { FuncionarioDTO } from "../types/funcionario";

function getIniciais(nome: string) {
  return nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0].toUpperCase())
    .join("");
}

function RoleBadge({ role }: { role: FuncionarioDTO["role"] }) {
  if (role === "ADMIN") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-info/15 px-2.5 py-1 text-xs font-semibold text-info">
        <ShieldCheck size={12} />
        Administrador
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
      <UserRound size={12} />
      Operador
    </span>
  );
}

export function EquipePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [funcionarioEmEdicao, setFuncionarioEmEdicao] = useState<FuncionarioDTO | null>(null);
  const [funcionarioParaExcluir, setFuncionarioParaExcluir] = useState<FuncionarioDTO | null>(null);

  const fecharModal = useCallback(() => {
    setIsModalOpen(false);
    setFuncionarioEmEdicao(null);
  }, []);

  const {
    funcionarios,
    isLoading,
    isError,
    criar,
    atualizar,
    excluir,
    isSalvando,
    isExcluindo,
  } = useFuncionarios(fecharModal);

  const handleNovo = useCallback(() => {
    setFuncionarioEmEdicao(null);
    setIsModalOpen(true);
  }, []);

  const handleEditar = useCallback((funcionario: FuncionarioDTO) => {
    setFuncionarioEmEdicao(funcionario);
    setIsModalOpen(true);
  }, []);

  const handleConfirmarExclusao = useCallback(async () => {
    if (!funcionarioParaExcluir) return;

    await excluir(funcionarioParaExcluir.id);
    setFuncionarioParaExcluir(null);
  }, [excluir, funcionarioParaExcluir]);

  const columns = useMemo<ColumnDef<FuncionarioDTO>[]>(
    () => [
      {
        accessorKey: "nome",
        header: "Colaborador",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 shrink-0">
              <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                {getIniciais(row.original.nome)}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium text-foreground">{row.original.nome}</span>
          </div>
        ),
      },
      {
        accessorKey: "email",
        header: "E-mail",
        cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.email}</span>,
      },
      {
        accessorKey: "role",
        header: "Nível de acesso",
        cell: ({ row }) => <RoleBadge role={row.original.role} />,
      },
      {
        id: "acoes",
        header: "Ações",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 rounded-full p-0 text-muted-foreground hover:bg-primary/10 hover:text-primary"
              aria-label={`Editar ${row.original.nome}`}
              onClick={() => handleEditar(row.original)}
            >
              <Pen size={15} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 rounded-full p-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              aria-label={`Remover ${row.original.nome}`}
              onClick={() => setFuncionarioParaExcluir(row.original)}
            >
              <Trash2 size={15} />
            </Button>
          </div>
        ),
      },
    ],
    [handleEditar],
  );

  const totalFuncionarios = funcionarios.length;
  const tituloContagem = isLoading
    ? "Carregando..."
    : `${totalFuncionarios} colaborador${totalFuncionarios !== 1 ? "es" : ""} ativo${totalFuncionarios !== 1 ? "s" : ""}`;

  return (
    <PageShell titulo="Gestão de Equipe">
      <div>
        <header className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">{tituloContagem}</h2>
            <p className="text-sm text-muted-foreground">Gerencie os acessos e funções da sua equipe.</p>
          </div>
          <Button onClick={handleNovo} size="lg">
            <Plus size={18} />
            Novo funcionário
          </Button>
        </header>

        {isError && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-destructive/25 bg-destructive/10 p-4 text-destructive">
            <AlertCircle size={20} />
            <p>Não foi possível carregar a equipe. Tente novamente mais tarde.</p>
          </div>
        )}

        {!isLoading && !isError && totalFuncionarios === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface p-12 text-muted-foreground">
            <Users size={48} className="mb-4 opacity-30" />
            <h3 className="mb-1 text-lg font-medium text-foreground">Nenhum funcionário cadastrado</h3>
            <p className="mb-4 text-center text-sm">Adicione os colaboradores para que possam acessar o sistema.</p>
            <Button variant="outline" onClick={handleNovo}>Cadastrar primeiro funcionário</Button>
          </div>
        )}

        {!isLoading && !isError && totalFuncionarios > 0 && (
          <DataTable
            columns={columns}
            data={funcionarios}
            search={{ column: "nome", placeholder: "Buscar colaborador..." }}
            pageSize={8}
          />
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover funcionário da equipe?</AlertDialogTitle>
            <AlertDialogDescription>
              A conta de <strong>{funcionarioParaExcluir?.nome}</strong> será inativada e o acesso ao sistema será bloqueado imediatamente. O histórico de vendas e caixas será preservado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isExcluindo}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={isExcluindo}
              onClick={handleConfirmarExclusao}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isExcluindo ? "Removendo..." : "Confirmar remoção"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageShell>
  );
}

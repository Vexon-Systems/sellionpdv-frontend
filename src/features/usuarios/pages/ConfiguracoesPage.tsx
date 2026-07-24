import { useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { PatternFormat } from "react-number-format";
import { useTheme } from "next-themes";
import { Camera, KeyRound, Loader2, Mail, Moon, ShieldCheck, UserRound, Volume2 } from "lucide-react";

import { PageShell } from "@/components/layout/PageShell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useUsuarioMe } from "../hooks/useUsuarioMe";

const perfilSchema = z.object({
  nome: z.string().min(3, "O nome deve ter pelo menos 3 letras."),
  telefone: z.string().min(8, "Informe um telefone válido."),
});

const senhaSchema = z.object({
  senhaAtual: z.string().min(1, "Informe a senha atual."),
  novaSenha: z.string().min(6, "A nova senha deve ter no mínimo 6 caracteres."),
});

const calcularForcaSenha = (senha: string) => {
  if (!senha) return 0;
  return [senha.length >= 8, /[A-Z]/.test(senha), /[0-9]/.test(senha), /[^A-Za-z0-9]/.test(senha)].filter(Boolean).length;
};

function PreferenceRow({
  icon: Icon,
  title,
  description,
  checked,
  onCheckedChange,
}: {
  icon: typeof Moon;
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border bg-surface-raised p-4 transition-colors hover:bg-muted/40">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon size={19} aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <Label className="text-sm font-semibold text-foreground">{title}</Label>
        <p className="mt-0.5 text-sm leading-5 text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} aria-label={title} />
    </div>
  );
}

export function ConfiguracoesPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { usuario, atualizarPerfil, isAtualizandoPerfil, uploadAvatar, isUploadingAvatar, alterarSenha, isAlterandoSenha, alterarPreferencias } = useUsuarioMe();
  const { setTheme } = useTheme();
  const formPerfil = useForm({ resolver: zodResolver(perfilSchema), defaultValues: { nome: "", telefone: "" } });
  const formSenha = useForm({ resolver: zodResolver(senhaSchema), defaultValues: { senhaAtual: "", novaSenha: "" } });
  const novaSenhaValor = formSenha.watch("novaSenha") || "";
  const forcaSenha = calcularForcaSenha(novaSenhaValor);

  useEffect(() => {
    if (usuario) formPerfil.reset({ nome: usuario.nome, telefone: usuario.telefone || "" });
  }, [usuario, formPerfil]);

  useEffect(() => {
    if (usuario) setTheme(usuario.preferencias?.tema === "DARK" ? "dark" : "light");
  }, [setTheme, usuario]);

  if (!usuario) {
    return <div className="flex h-screen flex-col items-center justify-center gap-3 bg-surface-sunken text-muted-foreground"><Loader2 className="animate-spin" size={32} /><p>Carregando configurações...</p></div>;
  }

  const preferencias = usuario.preferencias || { tema: "LIGHT", sonsAtivos: true, tamanhoInterface: "PADRAO", usaPin: false };

  return (
    <PageShell titulo="Configurações" subtitulo="Gerencie seu perfil, preferências e acesso à conta.">
      <div className="mx-auto w-full max-w-6xl">
        <Tabs defaultValue="conta" className="w-full">
          <TabsList className="mb-6 grid w-full max-w-md grid-cols-2 bg-muted p-1">
            <TabsTrigger value="conta"><UserRound /> Conta</TabsTrigger>
            <TabsTrigger value="seguranca"><ShieldCheck /> Segurança</TabsTrigger>
          </TabsList>

          <TabsContent value="conta" className="space-y-6">
            <Card className="gap-0">
              <CardHeader className="border-b pb-4">
                <CardTitle>Perfil público</CardTitle>
                <CardDescription>Essas informações identificam sua conta dentro do Sellion.</CardDescription>
              </CardHeader>
              <form onSubmit={formPerfil.handleSubmit((dados) => atualizarPerfil(dados))}>
                <CardContent className="grid gap-6 py-6 lg:grid-cols-[210px_minmax(0,1fr)]">
                  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface-sunken/50 p-5 text-center">
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="group relative rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Alterar foto de perfil">
                      <Avatar className="size-24 border-4 border-surface-raised shadow-card">
                        <AvatarImage src={usuario.avatarUrl || undefined} />
                        <AvatarFallback className="bg-primary text-2xl font-bold text-primary-foreground">{usuario.nome[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="absolute inset-0 flex items-center justify-center rounded-full bg-primary/75 text-primary-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                        {isUploadingAvatar ? <Loader2 className="animate-spin" size={22} /> : <Camera size={22} />}
                      </span>
                    </button>
                    <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={(event) => event.target.files?.[0] && uploadAvatar(event.target.files[0])} />
                    <p className="mt-3 text-sm font-medium text-foreground">Foto do perfil</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">Clique na imagem para alterar.</p>
                  </div>

                  <div className="grid content-start gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome completo</Label>
                      <Input id="nome" {...formPerfil.register("nome")} />
                      {formPerfil.formState.errors.nome && <p className="text-xs text-destructive">{formPerfil.formState.errors.nome.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telefone">Telefone de contato</Label>
                      <Controller control={formPerfil.control} name="telefone" render={({ field }) => <PatternFormat getInputRef={field.ref} value={field.value} onValueChange={(values) => field.onChange(values.value)} format="(##) #####-####" mask="_" placeholder="(00) 00000-0000" className="flex h-9 w-full rounded-md border border-input bg-surface-raised px-3 py-1 text-sm shadow-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring" />} />
                      {formPerfil.formState.errors.telefone && <p className="text-xs text-destructive">{formPerfil.formState.errors.telefone.message}</p>}
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="email">E-mail corporativo</Label>
                      <div className="relative"><Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input id="email" value={usuario.email} disabled className="pl-9" /></div>
                      <p className="text-xs text-muted-foreground">O e-mail é definido pelo administrador da conta.</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="justify-end gap-3"><Button type="submit" disabled={isAtualizandoPerfil}>{isAtualizandoPerfil && <Loader2 className="animate-spin" />} {isAtualizandoPerfil ? "Salvando..." : "Salvar alterações"}</Button></CardFooter>
              </form>
            </Card>

            <Card className="gap-0">
              <CardHeader className="border-b pb-4"><CardTitle>Preferências de uso</CardTitle><CardDescription>Ajuste como o sistema se comporta durante a operação.</CardDescription></CardHeader>
              <CardContent className="grid gap-3 py-5 lg:grid-cols-2">
                <PreferenceRow icon={Moon} title="Modo escuro" description="Reduz o cansaço visual em ambientes com pouca luz." checked={preferencias.tema === "DARK"} onCheckedChange={(checked) => { setTheme(checked ? "dark" : "light"); alterarPreferencias({ ...preferencias, tema: checked ? "DARK" : "LIGHT" }); }} />
                <PreferenceRow icon={Volume2} title="Alertas sonoros no PDV" description="Reproduz um bipe ao adicionar itens e finalizar vendas." checked={preferencias.sonsAtivos} onCheckedChange={(checked) => alterarPreferencias({ ...preferencias, sonsAtivos: checked })} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seguranca" className="space-y-6">
            <Card className="mx-auto max-w-2xl gap-0">
              <CardHeader className="border-b pb-4">
                <div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><KeyRound size={19} /></span><div><CardTitle>Credencial de acesso</CardTitle><CardDescription>Crie uma senha forte para proteger os dados da sua operação.</CardDescription></div></div>
              </CardHeader>
              <form onSubmit={formSenha.handleSubmit((dados) => alterarSenha(dados).then(() => formSenha.reset()))}>
                <CardContent className="space-y-5 py-6">
                  <div className="space-y-2"><Label htmlFor="senhaAtual">Senha atual</Label><Input id="senhaAtual" type="password" autoComplete="current-password" {...formSenha.register("senhaAtual")} />{formSenha.formState.errors.senhaAtual && <p className="text-xs text-destructive">{formSenha.formState.errors.senhaAtual.message}</p>}</div>
                  <div className="space-y-2"><Label htmlFor="novaSenha">Nova senha</Label><Input id="novaSenha" type="password" autoComplete="new-password" {...formSenha.register("novaSenha")} /><div className="flex h-1.5 gap-1.5 pt-1" aria-label={`Força da senha: ${forcaSenha} de 4`}>{[1, 2, 3, 4].map((nivel) => <span key={nivel} className={`flex-1 rounded-full ${novaSenhaValor.length === 0 ? "bg-muted" : forcaSenha >= nivel ? forcaSenha <= 1 ? "bg-destructive" : forcaSenha === 2 ? "bg-warning" : forcaSenha === 3 ? "bg-info" : "bg-success" : "bg-muted"}`} />)}</div><p className="text-xs text-muted-foreground">Use ao menos 8 caracteres, com letras maiúsculas, números e símbolos.</p>{formSenha.formState.errors.novaSenha && <p className="text-xs text-destructive">{formSenha.formState.errors.novaSenha.message}</p>}</div>
                </CardContent>
                <CardFooter className="justify-end"><Button type="submit" disabled={isAlterandoSenha || novaSenhaValor.length < 6}>{isAlterandoSenha && <Loader2 className="animate-spin" />} Atualizar senha</Button></CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageShell>
  );
}

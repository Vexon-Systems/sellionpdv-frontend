import { useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Header } from "@/components/layout/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PatternFormat } from "react-number-format";


import { useUsuarioMe } from "../hooks/useUsuarioMe";
import { Camera, Loader2, CircleHelp, Moon, Volume1 } from "lucide-react";

// --- Schemas de Validação ---
const perfilSchema = z.object({
  nome: z.string().min(3, "O nome deve ter pelo menos 3 letras."),
  telefone: z.string().min(8, "Informe um telefone válido.")
});

const senhaSchema = z.object({
  senhaAtual: z.string().min(1, "Informe a senha atual."),
  novaSenha: z.string().min(6, "A nova senha deve ter no mínimo 6 caracteres.")
});

// Lógica de Força da Senha
const calcularForcaSenha = (senha: string) => {
  if (!senha) return 0;
  let forca = 0;
  if (senha.length >= 8) forca += 1;
  if (/[A-Z]/.test(senha)) forca += 1;
  if (/[0-9]/.test(senha)) forca += 1;
  if (/[^A-Za-z0-9]/.test(senha)) forca += 1;
  return forca;
};

// Componentes Utilitários
const InfoTooltip = ({ texto }: { texto: string }) => (
  <TooltipProvider delayDuration={200}>
    <Tooltip>
      <TooltipTrigger type="button" className="cursor-help flex items-center justify-center">
        <CircleHelp size={16} className="text-muted-foreground hover:text-foreground transition-colors" />
      </TooltipTrigger>
      <TooltipContent className="bg-gray-900 text-white text-xs p-2 max-w-[250px] rounded-md shadow-md">
        <p>{texto}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export function ConfiguracoesPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    usuario, atualizarPerfil, isAtualizandoPerfil,
    uploadAvatar, isUploadingAvatar, alterarSenha, isAlterandoSenha,
    alterarPreferencias
  } = useUsuarioMe();

  const formPerfil = useForm({ resolver: zodResolver(perfilSchema), defaultValues: { nome: "", telefone: "" } });
  const formSenha = useForm({ resolver: zodResolver(senhaSchema), defaultValues: { senhaAtual: "", novaSenha: "" } });

  const novaSenhaValor = formSenha.watch("novaSenha") || "";
  const forcaSenha = calcularForcaSenha(novaSenhaValor);

  useEffect(() => {
    if (usuario) formPerfil.reset({ nome: usuario.nome, telefone: usuario.telefone || "" });
  }, [usuario, formPerfil]);

  if (!usuario) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 flex-col gap-3 text-muted-foreground">
        <Loader2 className="animate-spin" size={32} />
        <p>Carregando configurações...</p>
      </div>
    );
  }

  const prefsSeguras = usuario.preferencias || { tema: 'LIGHT', sonsAtivos: true, tamanhoInterface: 'PADRAO', usaPin: false };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await uploadAvatar(file);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-gray-50/50 overflow-hidden">
      <Header titulo="Configurações" />

      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="w-full mx-auto space-y-6">
          
          <Tabs defaultValue="conta" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-100 mb-4 bg-gray-200">
              <TabsTrigger value="conta">Conta e Preferências</TabsTrigger>
              <TabsTrigger value="seguranca">Segurança e Acesso</TabsTrigger>
            </TabsList>

            {/* ABA 1: CONTA E PREFERÊNCIAS */}
            <TabsContent value="conta" className="space-y-6 outline-none">
              
              {/* CARD: PERFIL E IDENTIDADE */}
              <Card>
                <form onSubmit={formPerfil.handleSubmit((d) => atualizarPerfil(d))}>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <CardTitle>Perfil e Identidade</CardTitle>
                      <InfoTooltip texto="Atualize sua foto e dados de contato que aparecem no sistema." />
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col md:flex-row gap-8 py-6">
                    {/* Avatar Upload */}
                    <div className="flex flex-col items-center gap-3 shrink-0">
                      <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <Avatar className="w-24 h-24 border border-gray-200 shadow-sm transition-transform hover:scale-105">
                          <AvatarImage src={usuario.avatarUrl || undefined} />
                          <AvatarFallback className="bg-primary text-primary-foreground font-bold text-2xl">
                            {usuario.nome[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          {isUploadingAvatar ? <Loader2 className="animate-spin text-white" size={24}/> : <Camera className="text-white" size={24}/>}
                        </div>
                      </div>
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                      <span className="text-xs text-muted-foreground">Clique para alterar</span>
                    </div>

                    {/* Campos de Input */}
                    <div className="flex-1 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="nome">Nome Completo</Label>
                          <Input id="nome" {...formPerfil.register("nome")} className="bg-white" />
                          {formPerfil.formState.errors.nome && <p className="text-destructive text-xs">{formPerfil.formState.errors.nome.message}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="telefone">Telefone de Contato</Label>
                          <Controller
                            name="telefone"
                            control={formPerfil.control}
                            render={({ field }) => (
                              <PatternFormat
                                getInputRef={field.ref}
                                value={field.value}
                                onValueChange={(values) => field.onChange(values.value)} 
                                format="(##) #####-####"
                                mask="_"
                                placeholder="(00) 00000-0000"
                                className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                              />
                            )}
                          />
                          {formPerfil.formState.errors.telefone && <p className="text-destructive text-xs">{formPerfil.formState.errors.telefone.message}</p>}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">E-mail Corporativo</Label>
                        <Input id="email" value={usuario.email} disabled className="bg-gray-100 text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-gray-50/50 border-t justify-end py-2">
                    <Button type="submit" disabled={isAtualizandoPerfil}>
                      {isAtualizandoPerfil && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {isAtualizandoPerfil ? "Salvando..." : "Salvar Perfil"}
                    </Button>
                  </CardFooter>
                </form>
              </Card>

              {/* CARD: APARÊNCIA E PREFERÊNCIAS */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CardTitle>Aparência e Preferências</CardTitle>
                    <InfoTooltip texto="Personalize o comportamento visual e sonoro do seu PDV." />
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  {/* Dark Mode */}
                  <div className="flex flex-row items-center justify-between rounded-lg border p-2 bg-white">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Moon size={18} className="text-muted-foreground"/>
                        <Label className="text-base font-medium">Modo Escuro (Dark Mode)</Label>
                      </div>
                      <p className="text-sm text-muted-foreground ml-6">Reduz o cansaço visual em ambientes com pouca luz.</p>
                    </div>
                    <Switch 
                      checked={prefsSeguras.tema === 'DARK'} 
                      onCheckedChange={(val) => alterarPreferencias({ ...prefsSeguras, tema: val ? 'DARK' : 'LIGHT' })}
                    />
                  </div>
                  
                  {/* Alertas Sonoros */}
                  <div className="flex flex-row items-center justify-between rounded-lg border p-2 bg-white">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Volume1 size={18} className="text-muted-foreground"/>
                        <Label className="text-base font-medium">Alertas Sonoros no PDV</Label>
                      </div>
                      <p className="text-sm text-muted-foreground ml-6">Reproduz um bipe ao adicionar itens e finalizar vendas.</p>
                    </div>
                    <Switch 
                      checked={prefsSeguras.sonsAtivos} 
                      onCheckedChange={(val) => alterarPreferencias({ ...prefsSeguras, sonsAtivos: val })}
                    />
                  </div>

                  {/* Tamanho da Interface
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-2">
                      <MonitorSmartphone size={18} className="text-muted-foreground"/>
                      <Label className="text-base font-medium">Tamanho da Interface</Label>
                    </div>
                    <RadioGroup 
                      className="flex flex-col md:flex-row gap-4 ml-6" 
                      value={prefsSeguras.tamanhoInterface}
                      onValueChange={(val) => alterarPreferencias({ ...prefsSeguras, tamanhoInterface: val })}
                    >
                      <div className="flex items-center space-x-2 border rounded-md p-3 w-full bg-white">
                        <RadioGroupItem value="COMPACTA" id="sz-compacta" />
                        <Label htmlFor="sz-compacta" className="cursor-pointer font-normal">Compacta</Label>
                      </div>
                      <div className="flex items-center space-x-2 border rounded-md p-3 w-full bg-white">
                        <RadioGroupItem value="PADRAO" id="sz-padrao" />
                        <Label htmlFor="sz-padrao" className="cursor-pointer font-normal">Padrão</Label>
                      </div>
                      <div className="flex items-center space-x-2 border rounded-md p-3 w-full bg-white">
                        <RadioGroupItem value="GRANDE" id="sz-grande" />
                        <Label htmlFor="sz-grande" className="cursor-pointer font-normal">Grande (Touch)</Label>
                      </div>
                    </RadioGroup>
                  </div> */}

                </CardContent>
              </Card>

            </TabsContent>

            {/* ABA 2: SEGURANÇA E ACESSO */}
            <TabsContent value="seguranca" className="space-y-6 outline-none">
              
              {/* CARD: ALTERAR SENHA */}
              <Card>
                <form onSubmit={formSenha.handleSubmit((d) => alterarSenha(d).then(() => formSenha.reset()))}>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <CardTitle>Credencial de Acesso</CardTitle>
                      <InfoTooltip texto="Sua senha protege não apenas o PDV, mas os dados financeiros de sua loja." />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 max-w-md py-4">
                    <div className="space-y-2">
                      <Label htmlFor="senhaAtual">Senha Atual</Label>
                      <Input id="senhaAtual" type="password" {...formSenha.register("senhaAtual")} className="bg-white" />
                      {formSenha.formState.errors.senhaAtual && <p className="text-destructive text-xs">{formSenha.formState.errors.senhaAtual.message}</p>}
                    </div>
                    
                    <div className="space-y-2 pt-2">
                      <Label htmlFor="novaSenha">Nova Senha</Label>
                      <Input id="novaSenha" type="password" {...formSenha.register("novaSenha")} className="bg-white" />
                      
                      {/* Indicador de Força Visual */}
                      <div className="flex gap-1.5 h-1.5 mt-2">
                        {[1, 2, 3, 4].map((nivel) => (
                          <div 
                            key={nivel} 
                            className={`flex-1 rounded-full transition-all duration-300 ${
                              novaSenhaValor.length === 0 ? 'bg-gray-200' :
                              forcaSenha >= nivel 
                                ? (forcaSenha <= 1 ? 'bg-red-500' : forcaSenha === 2 ? 'bg-yellow-500' : forcaSenha === 3 ? 'bg-blue-500' : 'bg-green-500')
                                : 'bg-gray-100'
                            }`} 
                          />
                        ))}
                      </div>
                      {formSenha.formState.errors.novaSenha && <p className="text-destructive text-xs">{formSenha.formState.errors.novaSenha.message}</p>}
                    </div>
                  </CardContent>
                  <CardFooter className="bg-gray-50/50 border-t py-4">
                    <Button type="submit" disabled={isAlterandoSenha || formSenha.watch("novaSenha").length < 6}>
                      {isAlterandoSenha && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Atualizar Senha
                    </Button>
                  </CardFooter>
                </form>
              </Card>

            </TabsContent>
          </Tabs>

        </div>
      </div>
    </div>
  );
}
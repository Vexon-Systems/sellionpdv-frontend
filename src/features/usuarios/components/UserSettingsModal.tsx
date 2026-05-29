import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUsuarioMe } from "../hooks/useUsuarioMe";
import { User, Lock, Sliders, Camera, Loader2, Key } from "lucide-react";

const perfilSchema = z.object({
  nome: z.string().min(3, "O nome deve ter pelo menos 3 letras."),
  telefone: z.string().min(8, "Informe um telefone válido.")
});

const senhaSchema = z.object({
  senhaAtual: z.string().min(1, "Informe a senha atual."),
  novaSenha: z.string().min(6, "A nova senha deve ter no mínimo 6 caracteres.")
});

const pinSchema = z.object({
  pin: z.string().length(4, "O PIN deve conter exatamente 4 dígitos numéricos.")
});

interface Props { isOpen: boolean; onClose: () => void; }

export function UserSettingsModal({ isOpen, onClose }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { 
    usuario, atualizarPerfil, isAtualizandoPerfil, 
    uploadAvatar, isUploadingAvatar, alterarSenha, isAlterandoSenha, 
    alterarPreferencias, configurarPin 
  } = useUsuarioMe();

  const formPerfil = useForm({ resolver: zodResolver(perfilSchema), defaultValues: { nome: "", telefone: "" } });
  const formSenha = useForm({ resolver: zodResolver(senhaSchema), defaultValues: { senhaAtual: "", novaSenha: "" } });
  const formPin = useForm({ resolver: zodResolver(pinSchema), defaultValues: { pin: "" } });

  useEffect(() => {
    if (usuario) formPerfil.reset({ nome: usuario.nome, telefone: usuario.telefone || "" });
  }, [usuario, isOpen, formPerfil]);

  if (!usuario) return null;

  const prefsSeguras = usuario.preferencias || {
    tema: 'LIGHT',
    sonsAtivos: true,
    tamanhoInterface: 'PADRAO',
    usaPin: false
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await uploadAvatar(file);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-125 bg-white pb-6 max-h-120 flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">Configurações da Conta</DialogTitle>
          <DialogDescription>Gerencie seus dados de acesso, segurança e preferências visuais.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="perfil" className="flex-1 flex flex-col mt-2 overflow-hidden">
          <TabsList className="grid grid-cols-4 bg-gray-100 h-12 shrink-0">
            <TabsTrigger value="perfil" className="text-xs gap-1"><User size={14}/> Perfil</TabsTrigger>
            <TabsTrigger value="seguranca" className="text-xs gap-1"><Lock size={14}/> Senha</TabsTrigger>
            <TabsTrigger value="pdv" className="text-xs gap-1"><Key size={14}/> PIN</TabsTrigger>
            <TabsTrigger value="prefs" className="text-xs gap-1"><Sliders size={14}/> Temas</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto pt-4 pr-1">
            {/* ABA 1: PERFIL */}
            <TabsContent value="perfil" className="space-y-4 mt-0">
              <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100 mb-4">
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <Avatar className="w-16 h-16 border border-gray-200">
                    <AvatarImage src={usuario.avatarUrl || undefined} />
                    <AvatarFallback className="bg-primary text-white font-bold text-lg">
                      {usuario.nome[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {isUploadingAvatar ? <Loader2 className="animate-spin text-white" size={16}/> : <Camera className="text-white" size={16}/>}
                  </div>
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                <div>
                  <h4 className="font-semibold text-gray-800">{usuario.nome}</h4>
                  <p className="text-xs text-gray-500">{usuario.email}</p>
                </div>
              </div>

              <form onSubmit={formPerfil.handleSubmit((d) => atualizarPerfil(d))} className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome Completo</Label>
                  <Input {...formPerfil.register("nome")} />
                  {formPerfil.formState.errors.nome && <p className="text-red-500 text-xs">{formPerfil.formState.errors.nome.message}</p>}
                </div>
                <div className="space-y-1">
                  <Label>Telefone de Contato</Label>
                  <Input {...formPerfil.register("telefone")} placeholder="(34) 99999-9999" />
                  {formPerfil.formState.errors.telefone && <p className="text-red-500 text-xs">{formPerfil.formState.errors.telefone.message}</p>}
                </div>
                <Button type="submit" disabled={isAtualizandoPerfil} className="w-full">Salvar Dados</Button>
              </form>
            </TabsContent>

            {/* ABA 2: SEGURANÇA */}
            <TabsContent value="seguranca" className="space-y-4 mt-0">
              <form onSubmit={formSenha.handleSubmit((d) => alterarSenha(d).then(() => formSenha.reset()))} className="space-y-4">
                <div className="space-y-1">
                  <Label>Senha Atual</Label>
                  <Input type="password" {...formSenha.register("senhaAtual")} />
                  {formSenha.formState.errors.senhaAtual && <p className="text-red-500 text-xs">{formSenha.formState.errors.senhaAtual.message}</p>}
                </div>
                <div className="space-y-1">
                  <Label>Nova Senha</Label>
                  <Input type="password" {...formSenha.register("novaSenha")} />
                  {formSenha.formState.errors.novaSenha && <p className="text-red-500 text-xs">{formSenha.formState.errors.novaSenha.message}</p>}
                </div>
                <Button type="submit" disabled={isAlterandoSenha} className="w-full">Modificar Credencial</Button>
              </form>
            </TabsContent>

            {/* ABA 3: PIN DE ACESSO RÁPIDO */}
            <TabsContent value="pdv" className="space-y-4 mt-0">
              <div className="p-3 bg-blue-50 border border-blue-100 text-blue-800 text-xs rounded-lg">
                O PIN de 4 dígitos permite que você trave e destrave a tela do operador do PDV rapidamente, dispensando a digitação da senha longa a cada troca de turno.
              </div>
              <form onSubmit={formPin.handleSubmit((d) => configurarPin(d.pin).then(() => formPin.reset()))} className="space-y-4">
                <div className="space-y-1">
                  <Label>PIN de Acesso Rápido (4 dígitos)</Label>
                  <Input type="password" maxLength={4} placeholder="Ex: 1234" {...formPin.register("pin")} />
                  {formPin.formState.errors.pin && <p className="text-red-500 text-xs">{formPin.formState.errors.pin.message}</p>}
                </div>
                <Button type="submit" className="w-full">Atualizar PIN</Button>
              </form>
            </TabsContent>

            {/* ABA 4: PREFERÊNCIAS */}
            <TabsContent value="prefs" className="space-y-4 mt-0">
              <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50/50">
                <div>
                  <Label className="font-semibold">Modo Escuro (Dark Mode)</Label>
                  <p className="text-xs text-gray-500">Altera as cores das telas do Backoffice e PDV.</p>
                </div>
                <Switch 
                  checked={prefsSeguras.tema === 'DARK'} 
                  onCheckedChange={(val) => alterarPreferencias({ ...prefsSeguras, tema: val ? 'DARK' : 'LIGHT' })}
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50/50">
                <div>
                  <Label className="font-semibold">Alertas Sonoros</Label>
                  <p className="text-xs text-gray-500">Bips de sucesso ao registrar itens no carrinho.</p>
                </div>
                <Switch 
                  checked={prefsSeguras.sonsAtivos} 
                  onCheckedChange={(val) => alterarPreferencias({ ...prefsSeguras, sonsAtivos: val })}
                />
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
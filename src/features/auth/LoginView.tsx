// src/features/auth/LoginView.tsx
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "../../store/useAuthStore";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import sellionLogoPos from '../../assets/logo_sellion_positiva.png';

const loginSchema = z.object({
  email: z.string().email("Por favor, digite um e-mail válido."),
  senha: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

export function LoginView() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const {
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting }, 
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormInputs) => {
    console.log("Dados enviados para a API (Fake):", data);
    
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const mockUser = { id: 1, nome: "Admin MySorvetes", email: data.email, role: "ROLE_ADMIN" as const };
    const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fake-token";

    setAuth(mockUser, mockToken);

    navigate({ to: "/" });
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-sm p-4">
        <CardHeader className="space-y-3 text-center">
          <img src={sellionLogoPos} alt="Logo do Sellion PDV" />
          <CardTitle className="text-2xl font-bold text-primary mt-2">Olá, seja Bem-vindo!</CardTitle>
          <CardDescription>
            Digite seu e-mail e senha para acessar o caixa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" placeholder="operador@email.com.br" {...register("email")} />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <Input id="senha" type="password" {...register("senha")} />
              {errors.senha && <p className="text-sm text-red-500">{errors.senha.message}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Entrando..." : "Entrar"}
            </Button>
            
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
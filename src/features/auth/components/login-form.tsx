import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import sellionLogoPos from '../../../assets/logo_sellion_positiva.png';
import loginImage from '../../../assets/Login_image.png'

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore"; 
import { login } from "@/features/auth/services/apiAuth";
import { Loader2 } from "lucide-react" 

const loginSchema = z.object({
  email: z.string().email("Por favor, digite um e-mail válido."),
  senha: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  
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
    try {
      const respostaApi = await login(data.email, data.senha);

      setAuth(respostaApi.usuario, respostaApi.token);
      toast.success(`Bem-vindo de volta, ${respostaApi.usuario.nome}!`);
      navigate({ to: "/" });

    } catch (error) {
      console.error("Falha na autenticação:", error);
      toast.error("Erro ao acessar", {
        description: "E-mail ou senha incorretos. Verifique e tente novamente."
      });
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 border-none shadow-xl">
        <CardContent className="grid p-0 md:grid-cols-2">
          
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8 flex flex-col justify-center bg-white">
            <FieldGroup>
                <div className="items-center justify-center text-center">
                    <img src={sellionLogoPos} alt="Logo do Sellion PDV" className="h-15 mx-auto"/>
                </div>

                <div className="flex flex-col items-center gap-2 text-center mb-4">
                    <h1 className="text-2xl font-bold">Olá, seja bem-vindo(a)!</h1>
                    <p className="text-balance text-muted-foreground">
                      Faça login com seu email e senha
                    </p>
                </div>
              
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@email.com"
                  {...register("email")} 
                  disabled={isSubmitting}
                />
                {errors.email && <span className="text-sm font-medium text-red-500">{errors.email.message}</span>}
              </Field>
              
              <Field>
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="password">Senha</FieldLabel>
                  <a href="#" className="text-sm underline-offset-2 hover:underline text-blue-950">
                    Esqueceu sua senha?
                  </a>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  {...register("senha")} 
                  disabled={isSubmitting} 
                />

                {errors.senha && <span className="text-sm font-medium text-red-500">{errors.senha.message}</span>}
              </Field>
              
              <Field className="pt-2">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-linear-to-r from-blue-950 to-blue-900 cursor-pointer hover:brightness-125 transition-all duration-300 w-full"
                >
                    {isSubmitting && <Loader2 className="h-4 w-4 animate-spin text-white/80"/>}
                    {isSubmitting ? "Entrando" : "Entrar"}
                </Button>
              </Field>
              
              <FieldDescription className="text-center mt-4">
                Não tem uma conta? <a href="#" className="font-semibold text-blue-900 hover:underline">Solicite agora!</a>
              </FieldDescription>
            </FieldGroup>
          </form>

          <div className="relative hidden bg-muted md:block">
            <img
              src={loginImage}
              alt="Imagem de recepção login"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>

        </CardContent>
      </Card>
    </div>
  )
}
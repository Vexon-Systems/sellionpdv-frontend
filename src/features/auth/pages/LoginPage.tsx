import { LoginForm } from "@/features/auth/components/login-form"

export default function LoginPage() {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center bg-blue-950 p-6 md:p-10 overflow-hidden">
      
      {/* Animação Pulse */}
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        <div className="animate-pulse-light h-[150vh] w-[150vh] rounded-full bg-blue-400/50 blur-[150px]" />
      </div>

      <div className="z-10 w-full max-w-sm md:max-w-4xl relative">
        <LoginForm />
      </div>
      
    </div>
  )
}
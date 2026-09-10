import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';

const schema = z.object({
    senhaAtual: z.string().min(1, 'Informe a senha temporária.'),
    novaSenha: z.string().min(8, 'Use pelo menos 8 caracteres.'),
    confirmacao: z.string(),
}).refine(data => data.novaSenha === data.confirmacao, {
    path: ['confirmacao'], message: 'As senhas não coincidem.',
});

export function TrocarSenhaPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [erro, setErro] = useState('');
    const [concluido, setConcluido] = useState(false);
    const [incerto, setIncerto] = useState(false);
    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: { senhaAtual: '', novaSenha: '', confirmacao: '' },
    });
    function limparSessao() {
        useAuthStore.getState().clearAuth();
        queryClient.clear();
        form.reset();
    }
    async function enviar({ senhaAtual, novaSenha }: z.infer<typeof schema>) {
        setErro('');
        try {
            // Limite explícito; não repetir esta gravação após resposta incerta.
            await api.put('/api/usuarios/me/senha', { senhaAtual, novaSenha }, { timeout: 30_000 });
            limparSessao();
            setConcluido(true);
        } catch (error) {
            if (!isAxiosError(error) || !error.response || error.response.status >= 500) {
                setIncerto(true);
                form.reset();
                setErro('Não foi possível confirmar a troca. Entre novamente com a nova senha para verificar o resultado antes de tentar outra troca.');
            } else {
                setErro('Não foi possível alterar a senha. Confira a senha atual e use uma nova senha com pelo menos 8 caracteres.');
            }
        }
    }
    return <main className="min-h-screen flex items-center justify-center bg-background p-6">
        <section className="w-full max-w-md space-y-6 rounded-xl border bg-card p-6">
            <h1 className="text-2xl font-semibold">{concluido ? 'Senha alterada' : 'Troque sua senha temporária'}</h1>
            {concluido ? <p>Faça um novo login com sua senha definitiva.</p> : <>
                <p>Defina sua senha definitiva para acessar o sistema.</p>
                <form onSubmit={form.handleSubmit(enviar)} className="space-y-4">
                    {(['senhaAtual', 'novaSenha', 'confirmacao'] as const).map((name, index) => <div key={name} className="space-y-2">
                        <Label htmlFor={name}>{['Senha temporária', 'Nova senha', 'Confirme a nova senha'][index]}</Label>
                        <Input id={name} type="password" autoComplete={name === 'senhaAtual' ? 'current-password' : 'new-password'} disabled={form.formState.isSubmitting || incerto} {...form.register(name)} />
                        {form.formState.errors[name] && <p role="alert">{form.formState.errors[name]?.message}</p>}
                    </div>)}
                    {erro && <p role="alert">{erro}</p>}
                    <Button type="submit" disabled={form.formState.isSubmitting || incerto}>{form.formState.isSubmitting ? 'Salvando…' : 'Salvar nova senha'}</Button>
                </form>
            </>}
            <Button variant="outline" disabled={form.formState.isSubmitting} onClick={() => { limparSessao(); void navigate({ to: '/login', replace: true }); }}>Ir para o login</Button>
        </section>
    </main>;
}

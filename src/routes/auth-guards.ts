import { redirect } from '@tanstack/react-router';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/useAuthStore';

export function requireAuth() {
    requireSession();
    if (useAuthStore.getState().user?.deveTrocarSenha) {
        throw redirect({ to: '/trocar-senha' });
    }
}

export function requireSession() {
    const { isAuthenticated, user } = useAuthStore.getState();
    // Sessões anteriores ao contrato precisam de um novo login.
    if (!isAuthenticated || typeof user?.deveTrocarSenha !== 'boolean') {
        useAuthStore.getState().clearAuth();
        throw redirect({ to: '/login' });
    }
}

export function requireAdmin() {
    requireAuth();
    const { isAuthenticated, user } = useAuthStore.getState();
    if (!isAuthenticated) {
        throw redirect({ to: '/login' });
    }
    if (user?.role !== 'ROLE_ADMIN') {
        toast.error('Acesso negado', { description: 'Apenas administradores podem acessar esta área.' });
        throw redirect({ to: '/' });
    }
}

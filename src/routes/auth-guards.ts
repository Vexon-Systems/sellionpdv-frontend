import { redirect } from '@tanstack/react-router';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/useAuthStore';

export function requireAuth() {
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) {
        throw redirect({ to: '/login' });
    }
}

export function requireAdmin() {
    const { isAuthenticated, user } = useAuthStore.getState();
    if (!isAuthenticated) {
        throw redirect({ to: '/login' });
    }
    if (user?.role !== 'ROLE_ADMIN') {
        toast.error('Acesso negado', { description: 'Apenas administradores podem acessar esta área.' });
        throw redirect({ to: '/' });
    }
}

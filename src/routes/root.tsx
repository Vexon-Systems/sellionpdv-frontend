import { lazy } from 'react';
import { createRootRoute, createRoute, createRouter, Outlet, redirect, useRouterState } from '@tanstack/react-router';
import { useAuthStore } from '../store/useAuthStore';
import { toast } from 'sonner';

import LoginPage from '@/features/auth/pages/LoginPage';
import { PdvPage } from '@/features/pdv/pages/PdvPage';
import { ControleCaixaPage } from '@/features/caixa/pages/ControleCaixaPage';

const CatalogoPage     = lazy(() => import('@/features/backoffice/catalogo/pages/CatalogoPage').then(m => ({ default: m.CatalogoPage })));
const ModificadoresPage = lazy(() => import('@/features/backoffice/modificadores/pages/ModificadoresPage').then(m => ({ default: m.ModificadoresPage })));
const DashboardPage    = lazy(() => import('@/features/backoffice/dashboard/pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const RelatoriosPage   = lazy(() => import('@/features/backoffice/relatorios/pages/RelatoriosPage').then(m => ({ default: m.RelatoriosPage })));
const EquipePage       = lazy(() => import('@/features/backoffice/equipe/pages/EquipePage').then(m => ({ default: m.EquipePage })));
const MaquininhasPage  = lazy(() => import('@/features/backoffice/maquininhas/pages/MaquininhaPage').then(m => ({ default: m.MaquininhasPage })));
const ConfiguracoesPage = lazy(() => import('@/features/usuarios/pages/ConfiguracoesPage').then(m => ({ default: m.ConfiguracoesPage })));
const FinanceiroPage    = lazy(() => import('@/features/backoffice/financeiro/pages/FinanceiroPage').then(m => ({ default: m.FinanceiroPage })));

import { SidebarProvider } from '../components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';

function requireAuth() {
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) {
        throw redirect({ to: '/login' });
    }
}

function requireAdmin() {
    const { isAuthenticated, user } = useAuthStore.getState();
    if (!isAuthenticated) {
        throw redirect({ to: '/login' });
    }
    if (user?.role !== 'ROLE_ADMIN') {
        toast.error('Acesso negado', { description: 'Apenas administradores podem acessar esta área.' });
        throw redirect({ to: '/' });
    }
}

function RootLayout() {
    const routerState = useRouterState();
    const isLoginPage = routerState.location.pathname === '/login';

    if (isLoginPage) {
        return <Outlet />;
    }

    return (
        <SidebarProvider>
            <AppSidebar />
            <main className='flex flex-1 overflow-hidden'>
                <Outlet />
            </main>
        </SidebarProvider>
    );
}

const rootRoute = createRootRoute({
    component: RootLayout,
});

const loginRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/login',
    component: LoginPage,
});

const pdvRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    beforeLoad: requireAuth,
    component: PdvPage,
});

const caixaRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/caixa',
    beforeLoad: requireAuth,
    component: ControleCaixaPage,
});

const catalogoRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/catalogo',
    beforeLoad: requireAdmin,
    component: CatalogoPage,
});

const modificadoresRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/modificadores',
    beforeLoad: requireAdmin,
    component: ModificadoresPage,
});

const dashboardRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/dashboard',
    beforeLoad: requireAdmin,
    component: DashboardPage,
});

const relatoriosRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/relatorios',
    beforeLoad: requireAdmin,
    component: RelatoriosPage,
});

const equipeRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/equipe',
    beforeLoad: requireAdmin,
    component: EquipePage,
});

const maquininhaRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/maquininhas',
    beforeLoad: requireAdmin,
    component: MaquininhasPage,
});

const configuracoesRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/configuracoes',
    beforeLoad: requireAuth,
    component: ConfiguracoesPage,
});

const financeiroRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/financeiro',
    beforeLoad: requireAdmin,
    component: FinanceiroPage,
});

const routeTree = rootRoute.addChildren([loginRoute, pdvRoute, caixaRoute, catalogoRoute, modificadoresRoute, dashboardRoute, relatoriosRoute, equipeRoute, maquininhaRoute, configuracoesRoute, financeiroRoute]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}

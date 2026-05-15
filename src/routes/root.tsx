import { createRootRoute, createRoute, createRouter, Outlet, redirect, useRouterState } from '@tanstack/react-router';
import { useAuthStore } from '../store/useAuthStore';
import LoginPage from '@/features/auth/pages/LoginPage';
import { PdvPage } from '@/features/pdv/pages/PdvPage';
import { ControleCaixaPage } from '@/features/caixa/pages/ControleCaixaPage';
import { CatalogoPage } from '@/features/backoffice/pages/CatalogoPage';
import { ModificadoresPage } from '@/features/backoffice/pages/ModificadoresPage';
import { DashboardPage } from '@/features/backoffice/pages/DashboardPage';
import { SidebarProvider } from '../components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { RelatoriosPage } from '@/features/backoffice/pages/RelatoriosPage';
import { EquipePage } from '@/features/backoffice/pages/EquipePage';


const rootRoute = createRootRoute({
    component: () => {
        const routerState = useRouterState();
        const isLoginPage = routerState.location.pathname === '/login'

        if (isLoginPage){
            return <Outlet/>;
        }

        return(
            <SidebarProvider>
                <AppSidebar/>
                <main className='flex flex-1 overflow-hidden'>
                    <Outlet/>
                </main>
            </SidebarProvider>
        )
    }
});

const loginRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/login',
    component: LoginPage,
});

const pdvRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    beforeLoad: () => {
        const isAuthenticated = useAuthStore.getState().isAuthenticated;
        if (!isAuthenticated) {
            throw redirect({ to: '/login' }); 
        }
    },
    component: PdvPage,
});

const caixaRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/caixa',
    beforeLoad: () => {
        const isAuthenticated = useAuthStore.getState().isAuthenticated;
        if (!isAuthenticated) {
            throw redirect({ to: '/login' }); 
        }
    },
    component: ControleCaixaPage,
});

const catalogoRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/catalogo',
    beforeLoad: () => {
        const { isAuthenticated, user } = useAuthStore.getState();
        
        if (!isAuthenticated) {
            throw redirect({ to: '/login' });
        }
        
        if (user?.role !== 'ROLE_ADMIN') {
            alert('Acesso negado! Apenas ADMINS podem acessar esta área.');
            throw redirect({ to: '/' }); 
        }
    },
    component: CatalogoPage,
});

const modificadoresRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/modificadores',
    beforeLoad: () => {
        const { isAuthenticated, user } = useAuthStore.getState();
        
        if (!isAuthenticated) {
            throw redirect({ to: '/login' });
        }
        
        if (user?.role !== 'ROLE_ADMIN') {
            alert('Acesso negado! Apenas gerentes podem acessar esta área.');
            throw redirect({ to: '/' }); 
        }
    },
    component: ModificadoresPage,
});

const dashboardRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/dashboard',
    beforeLoad: () => {
        const { isAuthenticated, user } = useAuthStore.getState();
        
        if (!isAuthenticated) {
            throw redirect({ to: '/login' });
        }
        
        if (user?.role !== 'ROLE_ADMIN') {
            alert('Acesso negado! Apenas gerentes podem acessar esta área.');
            throw redirect({ to: '/' }); 
        }
    },
    component: DashboardPage,
});

const relatoriosRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/relatorios',
    beforeLoad: () => {
        const { isAuthenticated, user } = useAuthStore.getState();
        
        if (!isAuthenticated) {
            throw redirect({ to: '/login' });
        }
        
        if (user?.role !== 'ROLE_ADMIN') {
            alert('Acesso negado! Apenas gerentes podem acessar esta área.');
            throw redirect({ to: '/' }); 
        }
    },
    component: RelatoriosPage,
});

const equipeRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/equipe',
    beforeLoad: () => {
        const { isAuthenticated, user } = useAuthStore.getState();
        
        if (!isAuthenticated) {
            throw redirect({ to: '/login' });
        }
        
        if (user?.role !== 'ROLE_ADMIN') {
            alert('Acesso negado! Apenas gerentes podem acessar esta área.');
            throw redirect({ to: '/' }); 
        }
    },
    component: EquipePage,
});

const routeTree = rootRoute.addChildren([loginRoute, pdvRoute, caixaRoute, catalogoRoute, modificadoresRoute, dashboardRoute, relatoriosRoute, equipeRoute]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}
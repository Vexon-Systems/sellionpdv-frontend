import { createRootRoute, createRoute, createRouter, Outlet, redirect, useRouterState } from '@tanstack/react-router';
import { useAuthStore } from '../store/useAuthStore';
import LoginPage from '@/features/auth/pages/LoginPage';
import { PdvPage } from '@/features/pdv/pages/PdvPage';
import { ControleCaixaPage } from '@/features/caixa/pages/ControleCaixaPage';
import { CatalogoPage } from '@/features/backoffice/pages/CatalogoPage';
import { ModificadoresPage } from '@/features/backoffice/pages/ModificadoresPage';
import { SidebarProvider } from '../components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';


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

const routeTree = rootRoute.addChildren([loginRoute, pdvRoute, caixaRoute, catalogoRoute, modificadoresRoute]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}
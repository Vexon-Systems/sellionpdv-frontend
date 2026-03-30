import { createRootRoute, createRoute, createRouter, Outlet, redirect, useRouterState } from '@tanstack/react-router';
import { useAuthStore } from '../store/useAuthStore';
import { LoginView } from '../features/auth/LoginView';
import { PdvView } from '../features/pdv/PdvView';
import { SidebarProvider } from '../components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { CatalogoView } from '@/features/backoffice/CatalogoView';
import { ControleCaixaView } from '@/features/caixa/ControleCaixaView';


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
    component: LoginView,
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
    component: PdvView,
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
    component: ControleCaixaView,
});

const backofficeRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/gestao',
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
    component: CatalogoView,
});

const routeTree = rootRoute.addChildren([loginRoute, pdvRoute, caixaRoute, backofficeRoute]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}
import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router';

import LoginPage from '@/features/auth/pages/LoginPage';
import { PdvPage } from '@/features/pdv/pages/PdvPage';
import { ControleCaixaPage } from '@/features/caixa/pages/ControleCaixaPage';

import { RootLayout } from './RootLayout';
import { requireAuth, requireAdmin } from './auth-guards';
import {
    CatalogoPage,
    ModificadoresPage,
    DashboardPage,
    RelatoriosPage,
    EquipePage,
    MaquininhasPage,
    ConfiguracoesPage,
    FinanceiroPage,
} from './lazyPages';

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

const routeTree = rootRoute.addChildren([
    loginRoute,
    pdvRoute,
    caixaRoute,
    catalogoRoute,
    modificadoresRoute,
    dashboardRoute,
    relatoriosRoute,
    equipeRoute,
    maquininhaRoute,
    configuracoesRoute,
    financeiroRoute,
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}

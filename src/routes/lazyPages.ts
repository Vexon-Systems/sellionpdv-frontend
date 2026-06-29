import { lazy } from 'react';

export const CatalogoPage = lazy(() =>
    import('@/features/backoffice/catalogo/pages/CatalogoPage').then((m) => ({ default: m.CatalogoPage }))
);

export const ModificadoresPage = lazy(() =>
    import('@/features/backoffice/modificadores/pages/ModificadoresPage').then((m) => ({ default: m.ModificadoresPage }))
);

export const DashboardPage = lazy(() =>
    import('@/features/backoffice/dashboard/pages/DashboardPage').then((m) => ({ default: m.DashboardPage }))
);

export const RelatoriosPage = lazy(() =>
    import('@/features/backoffice/relatorios/pages/RelatoriosPage').then((m) => ({ default: m.RelatoriosPage }))
);

export const EquipePage = lazy(() =>
    import('@/features/backoffice/equipe/pages/EquipePage').then((m) => ({ default: m.EquipePage }))
);

export const MaquininhasPage = lazy(() =>
    import('@/features/backoffice/maquininhas/pages/MaquininhaPage').then((m) => ({ default: m.MaquininhasPage }))
);

export const ConfiguracoesPage = lazy(() =>
    import('@/features/usuarios/pages/ConfiguracoesPage').then((m) => ({ default: m.ConfiguracoesPage }))
);

export const FinanceiroPage = lazy(() =>
    import('@/features/backoffice/financeiro/pages/FinanceiroPage').then((m) => ({ default: m.FinanceiroPage }))
);

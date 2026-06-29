import { Outlet, useRouterState } from '@tanstack/react-router';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';

export function RootLayout() {
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

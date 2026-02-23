import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { Outlet } from 'react-router-dom';
import { GlobalSearch } from '@/components/GlobalSearch';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { QRScanner } from '@/components/QRScanner';

export function AppLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center border-b border-border bg-card px-4 shrink-0 gap-4 shadow-sm">
            <SidebarTrigger />
            <GlobalSearch />
            <QRScanner />
          </header>
          <div className="flex-1 overflow-auto p-6">
            <Breadcrumbs />
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

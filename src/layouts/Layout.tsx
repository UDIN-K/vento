import { Outlet, Link } from 'react-router-dom';
import { CalendarDays, Package2 } from 'lucide-react';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col font-sans text-sys-text">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-sys-border bg-sys-card px-4 shadow-sm sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-semibold text-sys-text">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-sys-accent text-white">
            <Package2 className="h-5 w-5" />
          </div>
          <span className="text-xl tracking-tight hidden sm:inline-block font-bold">VENTO</span>
        </Link>
        
        <div className="ml-auto flex items-center gap-4">
          <nav className="flex gap-4 sm:gap-6">
            <Link to="/" className="text-sm font-medium hover:text-sys-accent text-sys-dim flex items-center gap-2 transition-colors">
              <CalendarDays className="h-4 w-4" />
              Events Manager
            </Link>
          </nav>
        </div>
      </header>
      
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>

      <footer className="mt-auto px-6 py-8 border-t border-sys-border font-mono text-[11px] text-sys-dim flex flex-col sm:flex-row justify-between gap-4">
        <div>&copy; 2024 VENTO SYSTEM • EVENT ARCHITECTURE ENVIRONMENT</div>
        <div>LOCALE: ID_ID.UTF-8 • TZ: ASIA/JAKARTA</div>
      </footer>
    </div>
  );
}

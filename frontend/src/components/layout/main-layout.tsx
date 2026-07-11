'use client';

import { useState } from 'react';
import { TopNav } from './top-nav';
import { Sidebar } from './sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
}

/**
 * Main application layout — sidebar + top nav + content area with mobile responsiveness.
 */
export function MainLayout({ children }: MainLayoutProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background font-sans text-foreground overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative w-64 bg-sidebar h-full shadow-lg flex-shrink-0 flex flex-col z-10">
            <Sidebar isMobile onNavigate={() => setIsMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0 h-full">
        <TopNav onMenuClick={() => setIsMobileOpen(true)} />
        <main className="flex-1 min-h-0 bg-background/50 overflow-y-auto">
          <div className="w-full min-h-full p-4 md:p-6 flex flex-col">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

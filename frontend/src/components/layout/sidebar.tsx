import { APP_CONFIG } from '@/constants/app.constants';
import { Sparkles, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface SidebarProps {
  isMobile?: boolean;
  onNavigate?: () => void;
}

export function Sidebar({ isMobile, onNavigate }: SidebarProps) {
  return (
    <aside 
      className={cn(
        "w-[240px] bg-sidebar text-sidebar-foreground flex-col border-r border-sidebar-border min-h-screen transition-all duration-300",
        isMobile ? "flex" : "hidden md:flex"
      )}
    >
      {/* Brand Logo */}
      <div className="flex h-20 items-center gap-3 px-6 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 shadow-md">
          <Sparkles className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
        </div>
        <span className="text-lg font-bold tracking-tight text-sidebar-foreground">
          {APP_CONFIG.name}
        </span>
      </div>

      <div className="flex-1 px-4 py-6 overflow-y-auto">
        <div className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-sidebar-accent-foreground/60 px-2">
          Main Menu
        </div>
        <nav className="space-y-1">
          <Link
            href="/"
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
              "bg-primary text-primary-foreground shadow-sm" // Changed to pure primary for contrast
            )}
          >
            <Users className="h-4 w-4" />
            Lead Management
          </Link>
        </nav>
      </div>

      {/* Pinned User Profile */}
      <div className="p-4 mt-auto border-t border-sidebar-border/50">
        <div className="flex items-center gap-3 rounded-xl p-2 hover:bg-sidebar-accent transition-colors cursor-pointer">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
            A
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold truncate text-sidebar-foreground">Admin User</span>
            <span className="text-xs truncate text-muted-foreground">admin@groweasy.ai</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

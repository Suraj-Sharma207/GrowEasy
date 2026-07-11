import { Search, Menu, Bell, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface TopNavProps {
  onMenuClick?: () => void;
}

/**
 * Top navigation bar with global search placeholder and mobile menu toggle.
 */
export function TopNav({ onMenuClick }: TopNavProps) {
  return (
    <header className="sticky top-0 z-10 w-full bg-background border-b border-border/40">
      <div className="flex h-16 items-center justify-between px-6 md:px-8">
        {/* Left side - mobile menu toggle and context */}
        <div className="flex items-center gap-3">
          {onMenuClick && (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden -ml-2 h-9 w-9"
              onClick={onMenuClick}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          )}
          {/* Breadcrumbs or Context could go here */}
        </div>

        {/* Right side - global actions */}
        <div className="flex items-center gap-5">
          <div className="relative hidden w-72 sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full bg-background pl-9 pr-12 h-10 border-border/60 rounded-full shadow-sm"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                <span className="text-xs">⌘</span>K
              </kbd>
            </div>
          </div>
          
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-muted-foreground hover:text-foreground">
            <Bell className="h-5 w-5" />
          </Button>

          {/* User profile dropdown placeholder */}
          <div className="flex items-center gap-3 pl-2 cursor-pointer">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold text-sm shadow-sm">
              A
            </div>
            <div className="hidden md:flex items-center gap-1">
              <span className="text-sm font-medium text-foreground">Admin User</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

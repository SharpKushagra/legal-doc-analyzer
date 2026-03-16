'use client';

import { Button } from '@/components/ui/button';
import { Bell, Search } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export function Header() {
    const { user } = useAuth();
    const initial = user?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || '?';

    return (
        <header className="flex h-16 items-center border-b bg-background/95 backdrop-blur-sm px-6 justify-between supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10 w-full">
            <div className="flex items-center gap-4 bg-muted/40 px-3 py-1.5 rounded-lg border border-border/50 text-sm text-muted-foreground w-64 shadow-inner">
                <Search className="h-4 w-4" />
                <input type="text" placeholder="Search Documents..." className="bg-transparent border-none focus:outline-none w-full" />
            </div>
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                    <Bell className="h-5 w-5" />
                </Button>
                <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white shadow-lg ring-2 ring-background ring-offset-2 ring-offset-background">
                    {initial}
                </div>
            </div>
        </header>
    );
}

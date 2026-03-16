'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { LayoutDashboard, FileText, Upload, ShieldAlert, MessagesSquare, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

const navItems = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Upload Document', href: '/dashboard/upload', icon: Upload },
    { name: 'My Documents', href: '/dashboard/documents', icon: FileText },
    { name: 'Risk Analysis', href: '/dashboard/risk', icon: ShieldAlert },
    { name: 'AI Assistant', href: '/dashboard/chat', icon: MessagesSquare },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        router.replace('/login');
        router.refresh();
    };

    return (
        <div className="hidden border-r border-border/40 bg-background/95 md:block w-64 min-h-screen sticky top-0">
            <div className="flex h-16 items-center border-b border-border/40 px-6">
                <Link href="/dashboard" className="flex items-center">
                    <Image src="/logo.png" alt="Clause Sense Logo" width={150} height={44} className="object-contain h-9 w-auto" />
                </Link>
            </div>
            <div className="flex flex-col gap-1 py-6 px-3">
                {navItems.map((item) => (
                    <Link key={item.href} href={item.href}>
                        <Button
                            variant={pathname === item.href ? 'secondary' : 'ghost'}
                            className={cn(
                                "w-full justify-start gap-3 mb-1 font-medium",
                                pathname === item.href
                                    ? "bg-primary/10 text-primary hover:bg-primary/15"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.name}
                        </Button>
                    </Link>
                ))}
            </div>

            <div className="mt-auto p-4 space-y-2">
                {user && (
                    <div className="px-3 py-2 rounded-lg bg-muted/50 text-sm">
                        <p className="font-medium truncate">{user.full_name || user.email}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                )}
                <Button variant="outline" size="sm" className="w-full gap-2 justify-start" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" /> Log out
                </Button>
            </div>
        </div>
    );
}

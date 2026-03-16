'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export function Navbar() {
    const { isAuthenticated, user, logout, isReady } = useAuth();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push('/');
        router.refresh();
    };

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
                <Link href="/" className="flex items-center group">
                    <Image
                        src="/logo.png"
                        alt="Clause Sense Logo"
                        width={160}
                        height={48}
                        className="object-contain h-10 w-auto"
                    />
                </Link>
                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
                    <Link href="#features" className="hover:text-foreground transition-colors">Features</Link>
                    <Link href="#workflow" className="hover:text-foreground transition-colors">Workflow</Link>
                    <Link href="#pricing" className="hover:text-foreground transition-colors">Pricing</Link>
                    <Link href="#security" className="hover:text-foreground transition-colors">Security</Link>
                </div>
                <div className="flex items-center gap-4">
                    {isReady && (
                        isAuthenticated ? (
                            <>
                                <span className="text-sm text-muted-foreground hidden sm:inline truncate max-w-[140px]">
                                    {user?.email}
                                </span>
                                <Link href="/dashboard">
                                    <Button variant="ghost" size="sm">Dashboard</Button>
                                </Link>
                                <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-1">
                                    <LogOut className="h-4 w-4" /> Log out
                                </Button>
                            </>
                        ) : (
                            <>
                                <Link href="/login">
                                    <Button variant="ghost" size="sm" className="hidden sm:inline-flex">Sign In</Button>
                                </Link>
                                <Link href="/signup">
                                    <Button size="sm" className="shadow-lg shadow-primary/20">Get Started</Button>
                                </Link>
                            </>
                        )
                    )}
                </div>
            </div>
        </nav>
    );
}

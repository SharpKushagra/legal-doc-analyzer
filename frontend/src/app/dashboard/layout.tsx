'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header } from '@/components/dashboard/Header';
import { useAuth } from '@/lib/auth-context';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isReady } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isReady) return;
        if (!isAuthenticated) {
            router.replace('/login');
        }
    }, [isReady, isAuthenticated, router]);

    if (!isReady || !isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-pulse text-muted-foreground">Loading...</div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-muted/10 selection:bg-primary/20">
            <Sidebar />
            <div className="flex-1 flex flex-col relative w-full overflow-hidden">
                <Header />
                <main className="flex-1 p-8 space-y-6 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}

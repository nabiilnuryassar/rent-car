import { Head, Link, router, usePage } from '@inertiajs/react';
import { Bell, LogOut } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import DriverBottomNav from '@/components/driver/DriverBottomNav';
import { useFlashToast } from '@/hooks/use-flash-toast';
import { logout } from '@/routes';

type DriverLayoutProps = {
    title: string;
    eyebrow?: string;
    headline?: string;
    children: ReactNode;
    notificationCount?: number;
};

export default function DriverLayout({
    title,
    eyebrow,
    headline,
    children,
    notificationCount = 0,
}: DriverLayoutProps) {
    const { props } = usePage<{
        auth: {
            user: { name: string };
        };
    }>();
    useFlashToast();

    useEffect(() => {
        // Lock viewport for mobile-first feel on desktop
        document.body.style.background = '#F5F5F5';

        return () => {
            document.body.style.background = '';
        };
    }, []);

    function handleLogout() {
        if (confirm('Keluar dari akun?')) {
            router.post(logout.url());
        }
    }

    const userName = props.auth?.user?.name ?? 'Pengemudi';
    const initial = userName.charAt(0).toUpperCase();

    return (
        <>
            <Head title={`${title} - URBAN 8 Driver`} />
            <div className="min-h-screen bg-base-white pb-32 font-sans text-navy-blue">
                {/* Phone-shaped container (Removed overflow-hidden to fix sticky header) */}
                <div className="mx-auto min-h-screen max-w-md bg-base-white shadow-xl md:my-6 md:rounded-b-[28px] md:shadow-2xl">
                    {/* Top sticky header */}
                    <header className="sticky top-0 z-40 flex items-center justify-between bg-navy-blue px-6 py-3.5 text-base-white shadow-lg">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-gold text-sm font-bold text-navy-blue">
                                {initial}
                            </div>
                            <div className="leading-tight">
                                <p className="text-[9px] font-semibold tracking-[0.18em] text-amber-gold uppercase">
                                    {eyebrow ?? 'Pengemudi'}
                                </p>
                                <p className="text-xs font-bold">{userName}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link
                                href="/driver/dashboard"
                                className="relative flex h-8 w-8 items-center justify-center rounded-full bg-base-white/10 transition-colors hover:bg-base-white/20"
                                aria-label="Notifikasi"
                            >
                                <Bell className="h-3.5 w-3.5" />
                                {notificationCount > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-gold text-[9px] font-bold text-navy-blue">
                                        {notificationCount > 9
                                            ? '9+'
                                            : notificationCount}
                                    </span>
                                )}
                            </Link>
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-base-white/10 transition-colors hover:bg-base-white/20"
                                aria-label="Keluar"
                            >
                                <LogOut className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </header>

                    {/* Page heading band */}
                    {(title || headline) && (
                        <div className="bg-navy-blue px-6 pt-1 pb-6 text-base-white">
                            <h1 className="text-xl leading-tight font-extrabold">
                                {headline ?? title}
                            </h1>
                        </div>
                    )}

                    {/* Content area with floating effect */}
                    <main className="-mt-4 md:rounded-t-[24px] bg-surface-gray px-4 pt-5 pb-12">
                        {children}
                    </main>
                </div>

                {/* Floating bottom nav (always visible) */}
                <DriverBottomNav />
            </div>
        </>
    );
}

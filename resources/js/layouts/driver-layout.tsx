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
                {/* Phone-shaped container */}
                <div className="mx-auto min-h-screen max-w-md bg-base-white shadow-xl md:my-6 md:rounded-[28px] md:shadow-2xl">
                    {/* Top sticky header */}
                    <header className="sticky top-0 z-40 flex items-center justify-between rounded-t-[28px] bg-navy-blue px-6 py-5 text-base-white shadow-lg">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-gold text-base font-bold text-navy-blue">
                                {initial}
                            </div>
                            <div className="leading-tight">
                                <p className="text-[10px] font-semibold tracking-[0.18em] text-amber-gold uppercase">
                                    {eyebrow ?? 'Pengemudi'}
                                </p>
                                <p className="text-sm font-bold">{userName}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link
                                href="/driver/dashboard"
                                className="relative flex h-9 w-9 items-center justify-center rounded-full bg-base-white/10 transition-colors hover:bg-base-white/20"
                                aria-label="Notifikasi"
                            >
                                <Bell className="h-4 w-4" />
                                {notificationCount > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-gold text-[10px] font-bold text-navy-blue">
                                        {notificationCount > 9
                                            ? '9+'
                                            : notificationCount}
                                    </span>
                                )}
                            </Link>
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-base-white/10 transition-colors hover:bg-base-white/20"
                                aria-label="Keluar"
                            >
                                <LogOut className="h-4 w-4" />
                            </button>
                        </div>
                    </header>

                    {/* Page heading band */}
                    {(title || headline) && (
                        <div className="bg-navy-blue px-6 pt-2 pb-8 text-base-white">
                            <h1 className="text-2xl leading-tight font-extrabold">
                                {headline ?? title}
                            </h1>
                        </div>
                    )}

                    {/* Content area with floating effect */}
                    <main className="-mt-6 rounded-t-[24px] bg-surface-gray px-5 pt-6 pb-12">
                        {children}
                    </main>
                </div>

                {/* Floating bottom nav (always visible) */}
                <DriverBottomNav />
            </div>
        </>
    );
}

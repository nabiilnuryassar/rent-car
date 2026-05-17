import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    Car,
    CarFront,
    Users,
    CreditCard,
    CalendarCheck,
    FileText,
    HelpCircle,
    Settings,
    LogOut,
    Bus,
} from 'lucide-react';
import type { ReactNode } from 'react';
import type { BreadcrumbItem } from '@/components/ui/breadcrumb';

import { Breadcrumb } from '@/components/ui/breadcrumb';
import { useConfirm } from '@/components/ui/confirm-modal';
import { useFlashToast } from '@/hooks/use-flash-toast';
import { logout } from '@/routes';
import admin from '@/routes/admin';

type AdminLayoutProps = {
    title: string;
    /**
     * Breadcrumb trail shown above the page title. The dashboard page should
     * leave this undefined; every other admin page supplies its own trail.
     */
    breadcrumbs?: BreadcrumbItem[];
    /**
     * Optional right-aligned node rendered next to the page title (e.g.
     * action buttons).
     */
    headerActions?: ReactNode;
    children: ReactNode;
};

const topNavItems = [
    {
        label: 'Dasbor',
        href: () => admin.dashboard.url(),
        icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
        label: 'Kategori',
        href: () => admin.vehicleCategories.index.url(),
        icon: <Car className="h-5 w-5" />,
    },
    {
        label: 'Kendaraan',
        href: () => admin.vehicles.index.url(),
        icon: <CarFront className="h-5 w-5" />,
    },
    {
        label: 'Pengemudi',
        href: () => admin.drivers.index.url(),
        icon: <Users className="h-5 w-5" />,
    },
    {
        label: 'Harga dan Tarif',
        href: () => admin.pricingRules.index.url(),
        icon: <CreditCard className="h-5 w-5" />,
    },
    {
        label: 'Antar-Jemput',
        href: () => admin.shuttleTariffs.index.url(),
        icon: <Bus className="h-5 w-5" />,
    },
    {
        label: 'Pesanan',
        href: () => admin.orders.index.url(),
        icon: <CalendarCheck className="h-5 w-5" />,
    },
    {
        label: 'Verifikasi Pembayaran',
        href: () => admin.payments.verification.index.url(),
        icon: <CreditCard className="h-5 w-5" />,
    },
    {
        label: 'Laporan',
        href: () => admin.reports.index.url(),
        icon: <FileText className="h-5 w-5" />,
    },
];

const bottomNavItems = [
    {
        label: 'Pengaturan',
        href: () => admin.settings.index.url(),
        icon: <Settings className="h-5 w-5" />,
    },
];

export default function AdminLayout({
    title,
    breadcrumbs,
    headerActions,
    children,
}: AdminLayoutProps) {
    const { url: currentUrl, props } = usePage<{
        settings: Record<string, string>;
        auth: {
            user: {
                role: string;
                name: string;
                roles: Array<{ name: string }>;
            };
        };
    }>();
    const confirm = useConfirm();
    useFlashToast();

    // In Spatie, roles are often an array, but we can check the first one or if 'admin' is in the list
    const roles = props.auth?.user?.roles?.map((r) => r.name) || [];
    const isAdmin = roles.includes('admin');

    const supportPhone =
        props.settings?.company_phone?.replace(/\D/g, '') ?? '';
    const supportHref = supportPhone
        ? `https://wa.me/${supportPhone}`
        : admin.settings.index.url();

    const renderNavItems = (items: typeof topNavItems) =>
        items
            .filter((item) => {
                if (!isAdmin) {
                    // Kasir only sees Dashboard, Verifikasi Pembayaran, and Reports (for Kwitansi/Receipts etc)
                    const allowedForKasir = [
                        'Dasbor',
                        'Verifikasi Pembayaran',
                        'Laporan',
                    ];

                    return allowedForKasir.includes(item.label);
                }

                return true;
            })
            .map((item) => {
                const href = item.href();
                const isDashboard = href === admin.dashboard.url();
                const isActive = isDashboard
                    ? currentUrl === href || currentUrl === '/admin/dashboard'
                    : currentUrl.startsWith(href);

                return (
                    <Link
                        key={item.label}
                        href={href}
                        className={`relative flex items-center gap-4 px-6 py-3 text-sm font-medium transition-all ${
                            isActive
                                ? 'ml-4 rounded-l-full bg-base-white pl-6 font-bold text-navy-blue'
                                : 'ml-4 pl-6 text-base-white/80 hover:rounded-l-full hover:bg-base-white/10 hover:text-base-white'
                        }`}
                    >
                        {isActive && (
                            <span className="absolute top-1/2 left-0 h-8 w-1.5 -translate-y-1/2 rounded-r-full bg-amber-gold shadow-[2px_0_4px_rgba(255,216,1,0.5)]" />
                        )}
                        {item.icon}
                        <span>{item.label}</span>
                    </Link>
                );
            });

    async function handleLogout() {
        const ok = await confirm({
            title: 'Keluar dari akun?',
            description:
                'Anda akan diarahkan ke halaman masuk. Sesi saat ini akan berakhir.',
            confirmLabel: 'Keluar',
            cancelLabel: 'Batal',
            variant: 'danger',
        });

        if (!ok) {
            return;
        }

        router.post(logout.url());
    }

    return (
        <>
            <Head title={`${title} - URBAN 8 Admin`} />
            <div className="flex h-screen overflow-hidden bg-base-white font-sans text-navy-blue">
                <aside className="flex h-screen w-72 shrink-0 flex-col bg-navy-blue text-base-white">
                    {/* Brand header */}
                    <div className="flex items-center gap-3 border-b border-base-white/10 px-6 py-5">
                        <img
                            src="/images/logo/logo-urban8.png"
                            alt="URBAN 8"
                            className="h-10 w-10 rounded-full bg-base-white/5 object-cover p-1 ring-1 ring-base-white/15"
                        />
                        <div className="flex flex-col leading-tight">
                            <span className="text-[10px] font-semibold tracking-[0.22em] text-amber-gold uppercase">
                                URBAN 8
                            </span>
                            <span className="text-sm font-extrabold tracking-[0.18em] uppercase">
                                Dashboard
                            </span>
                        </div>
                    </div>

                    {/* Scrollable nav */}
                    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto py-5 pr-4">
                        {renderNavItems(topNavItems)}
                    </nav>

                    {/* Pinned footer */}
                    <div className="flex flex-col gap-1 border-t border-base-white/10 py-4 pr-4">
                        <a
                            href={supportHref}
                            target="_blank"
                            rel="noreferrer"
                            className="ml-4 flex items-center gap-4 px-6 py-3 pl-6 text-sm font-medium text-base-white/80 transition-all hover:rounded-l-full hover:bg-base-white/10 hover:text-base-white"
                        >
                            <HelpCircle className="h-5 w-5" />
                            <span>Bantuan</span>
                        </a>
                        {isAdmin && renderNavItems(bottomNavItems)}
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="ml-4 flex items-center gap-4 px-6 py-3 pl-6 text-left text-sm font-medium text-base-white/80 transition-all hover:rounded-l-full hover:bg-base-white/10 hover:text-base-white"
                        >
                            <LogOut className="h-5 w-5" />
                            <span>Keluar</span>
                        </button>
                    </div>
                </aside>

                <main className="flex h-screen flex-1 flex-col overflow-hidden bg-surface-gray">
                    <div className="flex-1 overflow-y-auto px-8 py-8">
                        {breadcrumbs && breadcrumbs.length > 0 && (
                            <Breadcrumb items={breadcrumbs} className="mb-3" />
                        )}
                        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                            <h1 className="text-2xl font-extrabold text-navy-blue">
                                {title}
                            </h1>
                            {headerActions && (
                                <div className="flex flex-wrap items-center gap-2">
                                    {headerActions}
                                </div>
                            )}
                        </div>
                        {children}
                    </div>
                </main>
            </div>
        </>
    );
}

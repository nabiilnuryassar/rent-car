import { Head, Link, usePage } from '@inertiajs/react';
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
} from 'lucide-react';
import type { ReactNode } from 'react';
import { logout } from '@/routes';
import admin from '@/routes/admin';

type AdminLayoutProps = {
    title: string;
    children: ReactNode;
};

const topNavItems = [
    {
        label: 'Dashboard',
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
        label: 'Harga & Tarif',
        href: () => admin.pricingRules.index.url(),
        icon: <CreditCard className="h-5 w-5" />,
    },
    {
        label: 'Order',
        href: () => admin.orders.index.url(),
        icon: <CalendarCheck className="h-5 w-5" />,
    },
    {
        label: 'Laporan',
        href: () => admin.reports.index.url(),
        icon: <FileText className="h-5 w-5" />,
    },
];

const bottomNavItems = [
    {
        label: 'Settings',
        href: () => admin.settings.index.url(),
        icon: <Settings className="h-5 w-5" />,
    },
];

export default function AdminLayout({ title, children }: AdminLayoutProps) {
    const { url: currentUrl, props } = usePage<{
        settings: Record<string, string>;
    }>();
    const supportPhone =
        props.settings?.company_phone?.replace(/\D/g, '') ?? '';
    const supportHref = supportPhone
        ? `https://wa.me/${supportPhone}`
        : admin.settings.index.url();

    const renderNavItems = (items: typeof topNavItems) =>
        items.map((item) => {
            const href = item.href();
            const isActive = currentUrl.startsWith(href) && href !== '#';

            return (
                <Link
                    key={item.label}
                    href={href}
                    className={`relative flex items-center gap-4 px-6 py-3.5 text-sm font-medium transition-all ${
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

    return (
        <>
            <Head title={`${title} — URBAN 8 Admin`} />
            <div className="flex min-h-screen bg-base-white font-sans text-navy-blue">
                <aside className="flex w-72 shrink-0 flex-col bg-navy-blue py-8 text-base-white">
                    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto pr-4">
                        {renderNavItems(topNavItems)}
                    </nav>

                    <div className="mt-auto flex flex-col gap-1 border-t border-base-white/10 pt-4 pr-4">
                        <a
                            href={supportHref}
                            target="_blank"
                            rel="noreferrer"
                            className="ml-4 flex items-center gap-4 px-6 py-3.5 pl-6 text-sm font-medium text-base-white/80 transition-all hover:rounded-l-full hover:bg-base-white/10 hover:text-base-white"
                        >
                            <HelpCircle className="h-5 w-5" />
                            <span>Support</span>
                        </a>
                        {renderNavItems(bottomNavItems)}
                        <Link
                            href={logout.url()}
                            method="post"
                            as="button"
                            className="ml-4 flex items-center gap-4 px-6 py-3.5 pl-6 text-sm font-medium text-base-white/80 transition-all hover:rounded-l-full hover:bg-base-white/10 hover:text-base-white"
                        >
                            <LogOut className="h-5 w-5" />
                            <span>Logout</span>
                        </Link>
                    </div>
                </aside>

                <main className="flex-1 overflow-x-auto bg-surface-gray px-8 py-8">
                    <h1 className="mb-6 text-2xl font-extrabold text-navy-blue">
                        {title}
                    </h1>
                    {children}
                </main>
            </div>
        </>
    );
}

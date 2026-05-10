import { Head, Link, usePage } from '@inertiajs/react';
import {
    LayoutGrid,
    ClipboardList,
    User,
    CarFront,
    Bell,
    ShieldCheck,
    CalendarCheck,
    Clock,
    Headset,
} from 'lucide-react';
import type { ReactNode } from 'react';
import MobileBottomNav from '@/components/customer/MobileBottomNav';

type CustomerLayoutProps = {
    title: string;
    children: ReactNode;
};

const topNavItems = [
    { label: 'Home', href: '/', icon: LayoutGrid },
    { label: 'Catalog', href: '/catalog', icon: LayoutGrid },
    { label: 'Orders', href: '/orders', icon: ClipboardList },
];

export default function CustomerLayout({
    title,
    children,
}: CustomerLayoutProps) {
    const { props, url } = usePage();
    const auth = props.auth as { user?: { name: string } } | undefined;

    return (
        <>
            <Head title={`${title} — FleetGo`} />
            <div className="flex min-h-screen gap-10 bg-base-white p-0 pb-24 font-sans text-navy-blue md:p-10 md:pb-10">
                {/* Desktop Sidebar (Fixed Width ~320px) */}
                <aside className="hidden w-[280px] shrink-0 flex-col bg-base-white md:flex lg:w-[320px]">
                    <Link href="/" className="mb-12 flex items-center gap-2">
                        <CarFront className="h-8 w-8 text-navy-blue" />
                        <span className="text-xl font-extrabold tracking-tight text-navy-blue">
                            FleetGo
                        </span>
                    </Link>

                    <div className="mb-10 flex flex-col gap-4">
                        <h1 className="font-serif text-4xl leading-tight font-extrabold tracking-tight text-navy-blue lg:text-5xl">
                            Fleet Rental Management
                        </h1>
                        <p className="text-sm leading-relaxed font-medium text-slate-gray lg:text-base">
                            Streamline your fleet operations, automate bookings,
                            and deliver exceptional rental experiences.
                        </p>
                    </div>

                    <div className="flex flex-col gap-8">
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[12px] bg-surface-gray">
                                <CarFront className="h-6 w-6 text-navy-blue" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-navy-blue">
                                    Wide Range of Vehicles
                                </h3>
                                <p className="mt-1 text-sm text-slate-gray">
                                    Choose from a diverse fleet to fit every
                                    need.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[12px] bg-surface-gray">
                                <CalendarCheck className="h-6 w-6 text-navy-blue" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-navy-blue">
                                    Real-time Availability
                                </h3>
                                <p className="mt-1 text-sm text-slate-gray">
                                    Live inventory and instant booking
                                    confirmation.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[12px] bg-surface-gray">
                                <ShieldCheck className="h-6 w-6 text-navy-blue" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-navy-blue">
                                    Trusted & Insured
                                </h3>
                                <p className="mt-1 text-sm text-slate-gray">
                                    All vehicles are insured and roadside
                                    assistance enabled.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[12px] bg-surface-gray">
                                <Headset className="h-6 w-6 text-navy-blue" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-navy-blue">
                                    24/7 Customer Support
                                </h3>
                                <p className="mt-1 text-sm text-slate-gray">
                                    Our support team is always here to help you.
                                </p>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Right Container */}
                <div className="flex min-h-[calc(100vh-80px)] flex-1 flex-col md:rounded-[24px] md:bg-surface-gray md:p-10">
                    {/* Desktop Header / Top Nav */}
                    <header className="mb-10 hidden items-center justify-end gap-8 md:flex">
                        <nav className="flex items-center gap-2">
                            {topNavItems.map((item) => {
                                const isActive =
                                    (url.startsWith(item.href) &&
                                        item.href !== '/') ||
                                    (item.href === '/' && url === '/');

                                return (
                                    <Link
                                        key={item.label}
                                        href={item.href}
                                        className={`rounded-full px-5 py-2.5 text-sm font-bold transition-colors ${isActive ? 'bg-navy-blue text-base-white' : 'text-slate-gray hover:bg-slate-gray/10 hover:text-navy-blue'}`}
                                    >
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>
                        <div className="flex items-center gap-6 border-l border-slate-gray/20 pl-8">
                            <button className="text-slate-gray transition-colors hover:text-navy-blue">
                                <Bell className="h-6 w-6" />
                            </button>
                            {auth?.user ? (
                                <div className="relative group">
                                    <button className="flex items-center gap-2">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-blue text-sm font-bold text-base-white shadow-sm">
                                            {auth.user.name.charAt(0)}
                                        </div>
                                    </button>
                                    <div className="absolute right-0 mt-2 w-48 rounded-[16px] bg-base-white border border-slate-gray/10 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                                        <div className="px-4 py-3 border-b border-slate-gray/10">
                                            <p className="text-sm font-bold text-navy-blue truncate">{auth.user.name}</p>
                                        </div>
                                        <div className="p-2">
                                            <Link href="/profile" className="block px-4 py-2 text-sm text-slate-gray hover:bg-slate-gray/5 hover:text-navy-blue rounded-[8px] transition-colors">
                                                Profile Settings
                                            </Link>
                                            <Link href="/logout" method="post" as="button" className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-[8px] transition-colors">
                                                Logout
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <Link
                                    href="/login"
                                    className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-gray/20 text-navy-blue transition-colors hover:bg-slate-gray/30"
                                >
                                    <User className="h-5 w-5" />
                                </Link>
                            )}
                            <Link
                                href="/orders?new=1"
                                className="rounded-full bg-navy-blue px-6 py-3 text-sm font-bold whitespace-nowrap text-base-white shadow-sm transition-colors hover:bg-navy-blue/90"
                            >
                                + New Booking
                            </Link>
                        </div>
                    </header>

                    {/* Mobile Header */}
                    <header className="sticky top-0 z-10 flex items-center justify-between bg-base-white/90 px-6 py-6 backdrop-blur-md md:hidden">
                        <div className="flex items-center gap-2">
                            <CarFront className="h-6 w-6 text-navy-blue" />
                            <span className="text-lg font-extrabold tracking-tight text-navy-blue">
                                FleetGo
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <button className="text-slate-gray">
                                <Bell className="h-5 w-5" />
                            </button>
                        </div>
                    </header>

                    <main className="flex-1 px-6 md:px-0">{children}</main>

                    {/* Desktop Footer Stats */}
                    <div className="mt-auto mb-6 hidden items-center justify-between rounded-[20px] border border-slate-gray/10 bg-base-white px-8 py-6 shadow-sm md:flex lg:mt-12">
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="h-6 w-6 text-success-green" />
                            <div>
                                <h4 className="text-sm font-bold text-navy-blue">
                                    All India Coverage
                                </h4>
                                <p className="text-xs text-slate-gray">
                                    Pan India presence
                                </p>
                            </div>
                        </div>
                        <div className="h-10 w-px bg-slate-gray/20"></div>
                        <div className="flex items-center gap-3">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-gold/20 text-sm font-bold text-amber-gold">
                                %
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-navy-blue">
                                    Best Price Guarantee
                                </h4>
                                <p className="text-xs text-slate-gray">
                                    Unbeatable pricing
                                </p>
                            </div>
                        </div>
                        <div className="h-10 w-px bg-slate-gray/20"></div>
                        <div className="flex items-center gap-3">
                            <Clock className="h-6 w-6 text-navy-blue" />
                            <div>
                                <h4 className="text-sm font-bold text-navy-blue">
                                    24/7 Roadside Assistance
                                </h4>
                                <p className="text-xs text-slate-gray">
                                    We're here anytime
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Bottom Nav */}
                <MobileBottomNav />
            </div>
        </>
    );
}

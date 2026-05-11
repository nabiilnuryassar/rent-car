import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    BadgeCheck,
    Banknote,
    CarFront,
    ClipboardList,
    Clock,
    Crown,
    Gauge,
    Headset,
    MapPin,
    Menu,
    ShieldCheck,
    Sparkles,
    UserCheck,
    Users,
    X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

import MobileBottomNav from '@/components/customer/MobileBottomNav';
import { dashboard, home, login, register } from '@/routes';
import catalog from '@/routes/catalog';

type LandingFeature = {
    icon: LucideIcon;
    title: string;
    description: string;
};

const navLinks = [
    { label: 'Platform', href: '#platform' },
    { label: 'Features', href: '#features' },
    { label: 'Fleet', href: '#fleet' },
    { label: 'Workflow', href: '#workflow' },
    { label: 'Contact', href: '#contact' },
];

const heroProof = ['Smart pricing', 'Driver assignment', 'Payment verified'];

const processSteps = [
    { number: '01', title: 'Choose vehicle' },
    { number: '02', title: 'Confirm trip' },
    { number: '03', title: 'Pay & verify' },
    { number: '04', title: 'Dispatch' },
];

const features: LandingFeature[] = [
    {
        icon: Gauge,
        title: 'Smart Pricing',
        description:
            'Rates are calculated by hour, day, week, or month with fewer manual quoting steps.',
    },
    {
        icon: CarFront,
        title: 'Vehicle Availability',
        description:
            'Keep inventory visible across classes, schedules, and booking windows.',
    },
    {
        icon: Sparkles,
        title: 'Free Upgrade Offer',
        description:
            'Offer a higher class at the same price when premium units are available.',
    },
    {
        icon: Crown,
        title: 'Priority Member',
        description:
            'Let loyal customers keep a preferred trusted driver for repeat trips.',
    },
    {
        icon: MapPin,
        title: 'Shuttle Service',
        description:
            'Support point-to-point shuttle routes with predictable fixed pricing.',
    },
    {
        icon: Banknote,
        title: 'Cash & Transfer',
        description:
            'Handle instant cash receipts and transfer proof verification in one flow.',
    },
    {
        icon: Clock,
        title: 'Overtime Settlement',
        description:
            'Late returns can be billed by hourly increments with a clear audit trail.',
    },
    {
        icon: ClipboardList,
        title: 'Audit Trail',
        description:
            'Track approvals, dispatch, returns, cancellations, and payment activity.',
    },
];

const reliability: LandingFeature[] = [
    {
        icon: ShieldCheck,
        title: 'Payment Lock',
        description:
            'Reduce dispatch risk by keeping payment verification visible before trips move forward.',
    },
    {
        icon: ClipboardList,
        title: 'Operational Audit',
        description:
            'Give admins a cleaner record of approvals, status changes, and cancellation events.',
    },
    {
        icon: UserCheck,
        title: 'Driver Readiness',
        description:
            'Keep assigned drivers and trip context visible as orders move through dispatch.',
    },
];

const customerTypes: LandingFeature[] = [
    {
        icon: UserCheck,
        title: 'New customer',
        description:
            'Start with a guided vehicle catalog and a clear booking path.',
    },
    {
        icon: Crown,
        title: 'Loyal customer',
        description: 'Give repeat customers a more personal rental experience.',
    },
    {
        icon: Users,
        title: 'Corporate-ready',
        description:
            'A practical base for B2B rental workflows and operator control.',
    },
    {
        icon: Headset,
        title: 'Supported trip',
        description: 'Keep service touchpoints visible from booking to return.',
    },
];

const stats = [
    { value: '85+', label: 'routes supporting rental operations' },
    { value: '10', label: 'service-layer modules' },
    { value: '4', label: 'core roles in the workflow' },
    { value: '24/7', label: 'support-ready rental journey' },
];

function SectionHeader({
    eyebrow,
    title,
    description,
    dark = false,
}: {
    eyebrow: string;
    title: ReactNode;
    description?: ReactNode;
    dark?: boolean;
}) {
    return (
        <div className="max-w-3xl">
            <p
                className={`text-xs font-bold tracking-normal uppercase ${
                    dark ? 'text-base-white/55' : 'text-slate-gray'
                }`}
            >
                {eyebrow}
            </p>
            <h2
                className={`mt-4 text-4xl leading-[1.08] font-extrabold tracking-normal md:text-5xl ${
                    dark ? 'text-base-white' : 'text-navy-blue'
                }`}
            >
                {title}
            </h2>
            {description ? (
                <p
                    className={`mt-5 max-w-2xl text-lg leading-8 ${
                        dark ? 'text-base-white/65' : 'text-slate-gray'
                    }`}
                >
                    {description}
                </p>
            ) : null}
        </div>
    );
}

function FeatureCard({
    icon: Icon,
    title,
    description,
    dark = false,
}: LandingFeature & { dark?: boolean }) {
    if (dark) {
        return (
            <div className="rounded-[20px] border border-base-white/10 bg-base-white/[0.05] p-6 transition-colors hover:bg-base-white/10">
                <span className="grid h-11 w-11 place-items-center rounded-[12px] bg-amber-gold text-navy-blue">
                    <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-lg font-bold tracking-normal text-base-white">
                    {title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-base-white/60">
                    {description}
                </p>
            </div>
        );
    }

    return (
        <div className="group rounded-[20px] border border-slate-gray/10 bg-base-white p-7 shadow-rental transition-all hover:-translate-y-1 hover:border-navy-blue/20 hover:shadow-xl">
            <span className="grid h-11 w-11 place-items-center rounded-[12px] bg-navy-blue text-amber-gold transition-colors group-hover:bg-amber-gold group-hover:text-navy-blue">
                <Icon className="h-5 w-5" />
            </span>
            <h3 className="mt-6 text-xl font-bold tracking-normal text-navy-blue">
                {title}
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-gray">
                {description}
            </p>
        </div>
    );
}

function LandingNav({ isSignedIn }: { isSignedIn: boolean }) {
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);
    const navTone = scrolled ? 'text-navy-blue' : 'text-base-white';
    const mutedNavTone = scrolled ? 'text-navy-blue/75' : 'text-base-white/75';
    const navHoverTone = scrolled
        ? 'hover:text-navy-blue'
        : 'hover:text-base-white';
    const navHoverBg = scrolled
        ? 'hover:bg-surface-gray'
        : 'hover:bg-base-white/10';

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 12);

        onScroll();
        window.addEventListener('scroll', onScroll);

        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <header
            className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
                scrolled
                    ? 'border-b border-slate-gray/10 bg-base-white/90 shadow-sm backdrop-blur-md'
                    : 'bg-transparent'
            }`}
        >
            <nav className="mx-auto flex h-[72px] w-full max-w-7xl items-center justify-between px-5 md:px-8">
                <Link href={home.url()} className="flex items-center gap-3">
                    <img
                        src="/images/logo/logo-urban8.png"
                        alt="URBAN 8"
                        className="h-11 w-11 rounded-full object-cover"
                    />
                    <span
                        className={`hidden text-lg font-extrabold tracking-normal sm:inline ${navTone}`}
                    >
                        URBAN <span className="text-amber-gold">8</span>
                    </span>
                </Link>

                <ul className="hidden items-center gap-8 lg:flex">
                    {navLinks.map((link) => (
                        <li key={link.href}>
                            <a
                                href={link.href}
                                className={`text-sm font-semibold transition-colors ${mutedNavTone} ${navHoverTone}`}
                            >
                                {link.label}
                            </a>
                        </li>
                    ))}
                </ul>

                <div className="hidden items-center gap-3 lg:flex">
                    {isSignedIn ? (
                        <Link
                            href={dashboard.url()}
                            className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${navTone} ${navHoverBg}`}
                        >
                            Dashboard
                        </Link>
                    ) : (
                        <Link
                            href={login.url()}
                            className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${navTone} ${navHoverBg}`}
                        >
                            Masuk
                        </Link>
                    )}
                    <Link
                        href={isSignedIn ? catalog.index.url() : register.url()}
                        className="rounded-full bg-amber-gold px-5 py-2.5 text-sm font-bold text-navy-blue shadow-rental transition-all hover:-translate-y-0.5 hover:bg-amber-gold/90"
                    >
                        {isSignedIn ? 'Open Catalog' : 'Daftar'}
                    </Link>
                </div>

                <button
                    type="button"
                    aria-label="Toggle menu"
                    onClick={() => setOpen((value) => !value)}
                    className={`grid h-10 w-10 place-items-center rounded-[12px] lg:hidden ${navTone}`}
                >
                    {open ? (
                        <X className="h-6 w-6" />
                    ) : (
                        <Menu className="h-6 w-6" />
                    )}
                </button>
            </nav>

            {open ? (
                <div className="border-t border-slate-gray/10 bg-base-white lg:hidden">
                    <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-5 py-4">
                        {navLinks.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                onClick={() => setOpen(false)}
                                className="py-2 text-sm font-semibold text-navy-blue"
                            >
                                {link.label}
                            </a>
                        ))}
                        <div className="flex gap-3 pt-2">
                            <Link
                                href={
                                    isSignedIn ? dashboard.url() : login.url()
                                }
                                className="flex-1 rounded-full border border-slate-gray/20 px-5 py-2.5 text-center text-sm font-semibold text-navy-blue"
                            >
                                {isSignedIn ? 'Dashboard' : 'Masuk'}
                            </Link>
                            <Link
                                href={
                                    isSignedIn
                                        ? catalog.index.url()
                                        : register.url()
                                }
                                className="flex-1 rounded-full bg-amber-gold px-5 py-2.5 text-center text-sm font-bold text-navy-blue"
                            >
                                {isSignedIn ? 'Catalog' : 'Daftar'}
                            </Link>
                        </div>
                    </div>
                </div>
            ) : null}
        </header>
    );
}

export default function Welcome() {
    const user = usePage().props.auth.user;
    const isSignedIn = Boolean(user);

    return (
        <>
            <Head title="URBAN 8 - Premium Vehicle Rental" />
            <div className="min-h-screen bg-base-white pb-24 text-navy-blue md:pb-0">
                <LandingNav isSignedIn={isSignedIn} />

                <main>
                    <section className="relative isolate overflow-hidden bg-navy-blue pt-28 text-base-white md:pt-32">
                        <img
                            src="/images/landing/hero-fleet.jpg"
                            alt="Premium URBAN 8 fleet at a hotel entrance"
                            className="absolute inset-0 -z-10 h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 -z-10 bg-navy-blue/78" />
                        <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-navy-blue to-transparent" />

                        <div className="mx-auto grid w-full max-w-7xl gap-12 px-5 pb-14 md:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end lg:pb-20">
                            <div className="max-w-4xl">
                                <div className="inline-flex items-center gap-2 rounded-full border border-base-white/15 bg-base-white/10 px-4 py-1.5 text-xs font-bold tracking-normal text-base-white backdrop-blur">
                                    <span className="h-2 w-2 rounded-full bg-amber-gold" />
                                    Premium Vehicle Rental Platform
                                </div>
                                <h1 className="mt-6 max-w-4xl text-5xl leading-[1.02] font-extrabold tracking-normal md:text-7xl">
                                    Smarter Vehicle Rental, Built for Modern
                                    Operations
                                </h1>
                                <p className="mt-6 max-w-2xl text-lg leading-8 text-base-white/75 md:text-xl">
                                    Manage bookings, pricing, drivers, payments,
                                    dispatch, returns, and shuttle services from
                                    one premium rental workflow.
                                </p>
                                <div className="mt-8 flex flex-wrap gap-3">
                                    <Link
                                        href={catalog.index.url()}
                                        className="inline-flex h-12 items-center gap-2 rounded-full bg-amber-gold px-7 text-sm font-bold text-navy-blue shadow-rental transition-all hover:-translate-y-0.5 hover:bg-amber-gold/90"
                                    >
                                        Start booking
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                    <a
                                        href="#platform"
                                        className="inline-flex h-12 items-center rounded-full border border-base-white/20 bg-base-white/10 px-7 text-sm font-semibold text-base-white backdrop-blur transition-colors hover:bg-base-white/20"
                                    >
                                        Explore platform
                                    </a>
                                </div>
                                <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm text-base-white/70">
                                    {heroProof.map((item) => (
                                        <div
                                            key={item}
                                            className="inline-flex items-center gap-2"
                                        >
                                            <BadgeCheck className="h-4 w-4 text-amber-gold" />
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid gap-3 rounded-[24px] border border-base-white/15 bg-base-white/10 p-4 backdrop-blur-md sm:grid-cols-3 lg:grid-cols-1">
                                {[
                                    'Ready to dispatch',
                                    'Payment paid',
                                    'Driver assigned',
                                ].map((status, index) => (
                                    <div
                                        key={status}
                                        className="flex items-center gap-3 rounded-[16px] bg-navy-blue/70 px-4 py-3"
                                    >
                                        <span
                                            className={`h-2.5 w-2.5 rounded-full ${
                                                index === 1
                                                    ? 'bg-amber-gold'
                                                    : 'bg-success-green'
                                            }`}
                                        />
                                        <span className="text-sm font-semibold text-base-white">
                                            {status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section
                        id="workflow"
                        className="bg-navy-blue text-base-white"
                    >
                        <div className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-10 md:grid-cols-[1.2fr_repeat(4,1fr)] md:items-center md:gap-6 md:px-8 md:py-12">
                            <div>
                                <p className="text-xs font-bold tracking-normal text-base-white/55 uppercase">
                                    Workflow
                                </p>
                                <h2 className="mt-2 text-2xl leading-tight font-extrabold tracking-normal">
                                    How URBAN 8 Works
                                </h2>
                            </div>
                            {processSteps.map((step) => (
                                <div
                                    key={step.number}
                                    className="border-t border-base-white/10 pt-5 md:border-t-0 md:border-l md:pt-0 md:pl-5"
                                >
                                    <p className="text-xs font-bold tracking-normal text-amber-gold">
                                        STEP {step.number}
                                    </p>
                                    <p className="mt-2 text-lg font-bold text-base-white">
                                        {step.title}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section id="platform" className="py-20 md:py-28">
                        <div className="mx-auto grid w-full max-w-7xl gap-12 px-5 md:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                            <div>
                                <SectionHeader
                                    eyebrow="URBAN 8 Platform"
                                    title="One platform for rental, shuttle, driver, and payment operations."
                                    description="From catalog and pricing to dispatch, return, and overtime settlement, URBAN 8 brings each step of the rental workflow into a clean operating surface."
                                />
                                <Link
                                    href={catalog.index.url()}
                                    className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-navy-blue px-7 text-sm font-bold text-base-white transition-colors hover:bg-navy-blue/90"
                                >
                                    See catalog
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>

                            <div className="relative">
                                <div className="aspect-[4/3] overflow-hidden rounded-[24px] bg-surface-gray shadow-rental">
                                    <img
                                        src="/images/landing/product-car.jpg"
                                        alt="Premium car top view"
                                        className="h-full w-full object-cover"
                                        loading="lazy"
                                    />
                                </div>
                                <div className="absolute top-6 -left-3 flex items-center gap-3 rounded-[16px] border border-slate-gray/10 bg-base-white px-4 py-3 shadow-rental md:-left-5">
                                    <span className="grid h-9 w-9 place-items-center rounded-full bg-pale-green text-success-green">
                                        <BadgeCheck className="h-5 w-5" />
                                    </span>
                                    <div>
                                        <p className="text-xs text-slate-gray">
                                            Status
                                        </p>
                                        <p className="text-sm font-bold text-navy-blue">
                                            Ready to dispatch
                                        </p>
                                    </div>
                                </div>
                                <div className="absolute right-4 bottom-6 flex items-center gap-3 rounded-[16px] border border-slate-gray/10 bg-base-white px-4 py-3 shadow-rental md:-right-4">
                                    <span className="grid h-9 w-9 place-items-center rounded-full bg-amber-gold/20 text-amber-gold">
                                        <Banknote className="h-5 w-5" />
                                    </span>
                                    <div>
                                        <p className="text-xs text-slate-gray">
                                            Payment
                                        </p>
                                        <p className="text-sm font-bold text-navy-blue">
                                            Paid & Verified
                                        </p>
                                    </div>
                                </div>
                                <div className="absolute -top-3 right-8 hidden items-center gap-3 rounded-[16px] bg-navy-blue px-4 py-3 text-base-white shadow-rental sm:flex">
                                    <span className="grid h-9 w-9 place-items-center rounded-full bg-base-white/10 text-amber-gold">
                                        <UserCheck className="h-5 w-5" />
                                    </span>
                                    <div>
                                        <p className="text-xs text-base-white/55">
                                            Driver
                                        </p>
                                        <p className="text-sm font-bold">
                                            Assigned
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section
                        id="features"
                        className="border-y border-slate-gray/10 bg-surface-gray py-20 md:py-28"
                    >
                        <div className="mx-auto w-full max-w-7xl px-5 md:px-8">
                            <SectionHeader
                                eyebrow="Features"
                                title="Everything your rental operation needs."
                                description="Purpose-built modules that replace spreadsheets, group chats, and manual settlements."
                            />
                            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                {features.map((feature) => (
                                    <FeatureCard
                                        key={feature.title}
                                        {...feature}
                                    />
                                ))}
                            </div>
                        </div>
                    </section>

                    <section id="fleet" className="py-20 md:py-28">
                        <div className="mx-auto grid w-full max-w-7xl gap-12 px-5 md:px-8 lg:grid-cols-2 lg:items-center">
                            <div className="order-2 aspect-[5/4] overflow-hidden rounded-[24px] bg-surface-gray shadow-rental lg:order-1">
                                <img
                                    src="/images/landing/fleet-side.jpg"
                                    alt="Premium sedan side view"
                                    className="h-full w-full object-cover"
                                    loading="lazy"
                                />
                            </div>
                            <div className="order-1 lg:order-2">
                                <SectionHeader
                                    eyebrow="URBAN 8 Fleet"
                                    title="Meet your smarter fleet operation."
                                    description="Manage vehicle classes, availability, driver schedules, and dispatch readiness from one customer-friendly workflow."
                                />
                                <div className="mt-10 grid gap-4 sm:grid-cols-2">
                                    {[
                                        'Available 24/7',
                                        'Multi-class fleet',
                                        'Driver status sync',
                                        'Operational control',
                                    ].map((item) => (
                                        <div
                                            key={item}
                                            className="flex items-center gap-3 rounded-[16px] border border-slate-gray/10 bg-surface-gray p-4"
                                        >
                                            <BadgeCheck className="h-5 w-5 shrink-0 text-amber-gold" />
                                            <span className="text-sm font-bold text-navy-blue">
                                                {item}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="bg-navy-blue py-20 text-base-white md:py-28">
                        <div className="mx-auto w-full max-w-7xl px-5 md:px-8">
                            <p className="text-xs font-bold tracking-normal text-base-white/55 uppercase">
                                Why teams trust URBAN 8
                            </p>
                            <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                                {stats.map((stat) => (
                                    <div key={stat.label}>
                                        <p className="text-5xl leading-none font-extrabold tracking-normal text-base-white md:text-6xl">
                                            {stat.value}
                                        </p>
                                        <p className="mt-3 max-w-48 text-sm leading-6 text-base-white/60">
                                            {stat.label}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-16 grid gap-10 border-t border-base-white/10 pt-12 lg:grid-cols-2 lg:items-start">
                                <SectionHeader
                                    eyebrow="Operational Control"
                                    title="From booking to return, every step stays visible."
                                    description="Pricing accuracy, payment lock, audit trail, and role-based access help teams dispatch with confidence and close bookings cleanly."
                                    dark
                                />
                                <div className="grid gap-5 sm:grid-cols-3 lg:grid-cols-1">
                                    {reliability.map((item) => (
                                        <FeatureCard
                                            key={item.title}
                                            {...item}
                                            dark
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="grid bg-navy-blue text-base-white lg:grid-cols-2">
                        <div className="px-5 py-20 md:px-8 md:py-28 lg:ml-auto lg:w-full lg:max-w-[640px] lg:pr-14">
                            <SectionHeader
                                eyebrow="Customer Experience"
                                title="A better experience for every customer."
                                dark
                            />
                            <div className="mt-10 grid gap-4 sm:grid-cols-2">
                                {customerTypes.map(
                                    ({ icon: Icon, ...item }) => (
                                        <div
                                            key={item.title}
                                            className="rounded-[20px] border border-base-white/10 bg-base-white/[0.05] p-6"
                                        >
                                            <span className="grid h-11 w-11 place-items-center rounded-[12px] bg-amber-gold text-navy-blue">
                                                <Icon className="h-5 w-5" />
                                            </span>
                                            <h3 className="mt-5 text-lg font-bold text-base-white">
                                                {item.title}
                                            </h3>
                                            <p className="mt-2 text-sm leading-6 text-base-white/60">
                                                {item.description}
                                            </p>
                                        </div>
                                    ),
                                )}
                            </div>
                        </div>
                        <div className="min-h-[420px] overflow-hidden lg:min-h-0">
                            <img
                                src="/images/landing/safety-driver.jpg"
                                alt="Professional driver opening a vehicle door"
                                className="h-full w-full object-cover"
                                loading="lazy"
                            />
                        </div>
                    </section>

                    <section className="py-20 md:py-28">
                        <div className="mx-auto w-full max-w-7xl px-5 md:px-8">
                            <div className="grid gap-8 rounded-[24px] bg-amber-gold p-8 text-navy-blue shadow-rental md:grid-cols-[1.6fr_1fr] md:items-center md:p-10">
                                <div>
                                    <h2 className="max-w-2xl text-3xl leading-tight font-extrabold tracking-normal md:text-4xl">
                                        Ready to modernize your rental
                                        operation?
                                    </h2>
                                    <p className="mt-3 max-w-xl text-sm leading-6 text-navy-blue/75 md:text-base">
                                        Launch a cleaner, smarter, more reliable
                                        rental workflow with URBAN 8.
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-3 md:justify-end">
                                    <Link
                                        href={catalog.index.url()}
                                        className="inline-flex h-12 items-center rounded-full bg-navy-blue px-7 text-sm font-bold text-base-white transition-colors hover:bg-navy-blue/90"
                                    >
                                        Get started
                                    </Link>
                                    <a
                                        href="#contact"
                                        className="inline-flex h-12 items-center rounded-full bg-base-white px-7 text-sm font-bold text-navy-blue transition-colors hover:bg-surface-gray"
                                    >
                                        Contact sales
                                    </a>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>

                <footer id="contact" className="bg-navy-blue text-base-white">
                    <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-14 md:grid-cols-[1.2fr_1fr] md:px-8">
                        <div>
                            <div className="flex items-center gap-3">
                                <img
                                    src="/images/logo/logo-urban8.png"
                                    alt="URBAN 8"
                                    className="h-12 w-12 rounded-full object-cover"
                                />
                                <span className="text-xl font-extrabold tracking-normal">
                                    URBAN{' '}
                                    <span className="text-amber-gold">8</span>
                                </span>
                            </div>
                            <p className="mt-5 max-w-md leading-7 text-base-white/60">
                                Drive in style. Arrive in class. URBAN 8 powers
                                smarter vehicle rental and shuttle operations
                                end to end.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-6 text-sm sm:grid-cols-3">
                            {[
                                ['Catalog', catalog.index.url()],
                                ['Platform', '#platform'],
                                ['Features', '#features'],
                                ['Fleet', '#fleet'],
                                ['Workflow', '#workflow'],
                                ['Contact', '#contact'],
                            ].map(([label, href]) => (
                                <a
                                    key={label}
                                    href={href}
                                    className="font-semibold text-base-white/65 transition-colors hover:text-base-white"
                                >
                                    {label}
                                </a>
                            ))}
                        </div>
                    </div>
                    <div className="border-t border-base-white/10 py-6">
                        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-5 text-sm text-base-white/45 md:flex-row md:justify-between md:px-8">
                            <p>2026 URBAN 8. All rights reserved.</p>
                            <p>Drive in style. Arrive in class.</p>
                        </div>
                    </div>
                </footer>
            </div>
            <MobileBottomNav />
        </>
    );
}

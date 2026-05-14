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

import PageLoader from '@/components/page-loader';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';
import { home, login, register } from '@/routes';
import catalog from '@/routes/catalog';

type LandingFeature = {
    icon: LucideIcon;
    title: string;
    description: string;
};

const navLinks = [
    { label: 'Platform', href: '#platform' },
    { label: 'Fitur', href: '#features' },
    { label: 'Armada', href: '#fleet' },
    { label: 'Alur Kerja', href: '#workflow' },
    { label: 'Kontak', href: '#contact' },
];

const heroProof = [
    'Perhitungan tarif otomatis',
    'Penugasan pengemudi',
    'Pembayaran terverifikasi',
];

const processSteps = [
    { number: '01', title: 'Pilih Kendaraan' },
    { number: '02', title: 'Konfirmasi Perjalanan' },
    { number: '03', title: 'Bayar dan Verifikasi' },
    { number: '04', title: 'Pengiriman Kendaraan' },
];

const features: LandingFeature[] = [
    {
        icon: Gauge,
        title: 'Perhitungan Tarif Otomatis',
        description:
            'Tarif dihitung berdasarkan jam, hari, minggu, atau bulan sehingga proses penawaran harga menjadi lebih ringkas.',
    },
    {
        icon: CarFront,
        title: 'Ketersediaan Kendaraan',
        description:
            'Pantau ketersediaan armada berdasarkan kelas kendaraan, jadwal, dan rentang pemesanan.',
    },
    {
        icon: Sparkles,
        title: 'Penawaran Peningkatan Kelas Gratis',
        description:
            'Tawarkan peningkatan kelas kendaraan dengan harga yang sama ketika unit premium tersedia.',
    },
    {
        icon: Crown,
        title: 'Pelanggan Prioritas',
        description:
            'Berikan keleluasaan bagi pelanggan setia untuk mempertahankan pengemudi pilihan pada perjalanan berulang.',
    },
    {
        icon: MapPin,
        title: 'Layanan Antar-Jemput',
        description:
            'Dukung rute antar-jemput titik ke titik dengan tarif tetap yang mudah diprediksi.',
    },
    {
        icon: Banknote,
        title: 'Tunai dan Transfer',
        description:
            'Kelola kuitansi tunai dan verifikasi bukti transfer dalam satu alur kerja.',
    },
    {
        icon: Clock,
        title: 'Penyelesaian Denda Kelebihan Waktu',
        description:
            'Keterlambatan pengembalian dapat dihitung per jam dan tercatat melalui jejak audit yang jelas.',
    },
    {
        icon: ClipboardList,
        title: 'Jejak Audit',
        description:
            'Catat persetujuan, pengiriman kendaraan, pengembalian, pembatalan, dan aktivitas pembayaran.',
    },
];

const reliability: LandingFeature[] = [
    {
        icon: ShieldCheck,
        title: 'Kunci Pembayaran',
        description:
            'Kurangi risiko pengiriman kendaraan dengan memastikan verifikasi pembayaran terlihat sebelum perjalanan diproses.',
    },
    {
        icon: ClipboardList,
        title: 'Audit Operasional',
        description:
            'Sediakan catatan yang lebih rapi bagi admin terkait persetujuan, perubahan status, dan pembatalan.',
    },
    {
        icon: UserCheck,
        title: 'Kesiapan Pengemudi',
        description:
            'Tampilkan pengemudi yang ditugaskan dan konteks perjalanan ketika pesanan memasuki tahap pengiriman kendaraan.',
    },
];

const customerTypes: LandingFeature[] = [
    {
        icon: UserCheck,
        title: 'Pelanggan Baru',
        description:
            'Mulai dari katalog kendaraan yang terarah dan alur pemesanan yang jelas.',
    },
    {
        icon: Crown,
        title: 'Pelanggan Setia',
        description:
            'Berikan pengalaman penyewaan yang lebih personal bagi pelanggan berulang.',
    },
    {
        icon: Users,
        title: 'Siap untuk Korporasi',
        description:
            'Menjadi dasar praktis untuk alur kerja penyewaan B2B dan kontrol operator.',
    },
    {
        icon: Headset,
        title: 'Perjalanan yang Didukung',
        description:
            'Tampilkan titik layanan sejak pemesanan hingga pengembalian kendaraan.',
    },
];

const stats = [
    { value: '85+', label: 'rute yang mendukung operasional penyewaan' },
    { value: '10', label: 'modul lapisan layanan' },
    { value: '4', label: 'peran inti dalam alur kerja' },
    { value: '24/7', label: 'perjalanan penyewaan dengan dukungan layanan' },
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

    const handleNavClick = (
        e: React.MouseEvent<HTMLAnchorElement>,
        href: string,
    ) => {
        if (!href.startsWith('#')) {
            return;
        }

        e.preventDefault();

        const target = document.querySelector(href);

        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        setOpen(false);
    };

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
                                onClick={(e) => handleNavClick(e, link.href)}
                                className={`text-sm font-semibold transition-colors ${mutedNavTone} ${navHoverTone}`}
                            >
                                {link.label}
                            </a>
                        </li>
                    ))}
                </ul>

                <div className="hidden items-center gap-3 lg:flex">
                    {isSignedIn ? null : (
                        <Link
                            href={login.url()}
                            className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${navTone} ${navHoverBg}`}
                        >
                            Masuk
                        </Link>
                    )}
                    {isSignedIn ? (
                        <Link
                            href={catalog.index.url()}
                            aria-label="Buka Katalog"
                            title="Buka Katalog"
                            className="group grid h-11 w-11 place-items-center rounded-full bg-amber-gold text-navy-blue shadow-rental transition-all hover:-translate-y-0.5 hover:bg-amber-gold/90 focus-visible:ring-2 focus-visible:ring-amber-gold focus-visible:ring-offset-2 focus-visible:ring-offset-base-white focus-visible:outline-none"
                        >
                            <CarFront className="h-5 w-5 transition-transform group-hover:scale-110" />
                        </Link>
                    ) : (
                        <Link
                            href={register.url()}
                            className="rounded-full bg-amber-gold px-5 py-2.5 text-sm font-bold text-navy-blue shadow-rental transition-all hover:-translate-y-0.5 hover:bg-amber-gold/90"
                        >
                            Daftar
                        </Link>
                    )}
                </div>

                <button
                    type="button"
                    aria-label="Buka atau tutup menu"
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
                                onClick={(e) => handleNavClick(e, link.href)}
                                className="py-2 text-sm font-semibold text-navy-blue"
                            >
                                {link.label}
                            </a>
                        ))}
                        <div className="flex gap-3 pt-2">
                            {isSignedIn ? (
                                <Link
                                    href={catalog.index.url()}
                                    aria-label="Buka Katalog"
                                    className="flex flex-1 items-center justify-center gap-2 rounded-full bg-amber-gold px-5 py-2.5 text-center text-sm font-bold text-navy-blue"
                                >
                                    <CarFront className="h-5 w-5" />
                                    <span>Katalog</span>
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login.url()}
                                        className="flex-1 rounded-full border border-slate-gray/20 px-5 py-2.5 text-center text-sm font-semibold text-navy-blue"
                                    >
                                        Masuk
                                    </Link>
                                    <Link
                                        href={register.url()}
                                        className="flex-1 rounded-full bg-amber-gold px-5 py-2.5 text-center text-sm font-bold text-navy-blue"
                                    >
                                        Daftar
                                    </Link>
                                </>
                            )}
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
    const revealRoot = useScrollReveal<HTMLDivElement>();

    return (
        <>
            <Head title="URBAN 8 - Penyewaan Kendaraan Premium" />
            <PageLoader />
            <div
                ref={revealRoot}
                className="min-h-screen bg-base-white pb-24 text-navy-blue md:pb-0"
            >
                <LandingNav isSignedIn={isSignedIn} />

                <main>
                    <section className="relative isolate overflow-hidden bg-navy-blue pt-28 text-base-white md:pt-32">
                        <img
                            src="/images/landing/hero-fleet.jpg"
                            alt="Armada premium URBAN 8 di area lobi hotel"
                            className="absolute inset-0 -z-10 h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 -z-10 bg-navy-blue/78" />
                        <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-navy-blue to-transparent" />

                        <div className="mx-auto grid w-full max-w-7xl gap-12 px-5 pb-14 md:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end lg:pb-20">
                            <div className="reveal max-w-4xl" data-reveal>
                                <div className="inline-flex items-center gap-2 rounded-full border border-base-white/15 bg-base-white/10 px-4 py-1.5 text-xs font-bold tracking-normal text-base-white backdrop-blur">
                                    <span className="h-2 w-2 rounded-full bg-amber-gold" />
                                    Sistem Penyewaan Kendaraan Premium
                                </div>
                                <h1 className="mt-6 max-w-4xl text-5xl leading-[1.02] font-extrabold tracking-normal md:text-7xl">
                                    Penyewaan Kendaraan yang Lebih Cerdas untuk
                                    Operasional Modern
                                </h1>
                                <p className="mt-6 max-w-2xl text-lg leading-8 text-base-white/75 md:text-xl">
                                    Kelola pemesanan, tarif, pengemudi,
                                    pembayaran, pengiriman kendaraan,
                                    pengembalian, dan layanan antar-jemput dalam
                                    satu alur kerja penyewaan premium.
                                </p>
                                <div className="mt-8 flex flex-wrap gap-3">
                                    <Link
                                        href={catalog.index.url()}
                                        className="inline-flex h-12 items-center gap-2 rounded-full bg-amber-gold px-7 text-sm font-bold text-navy-blue shadow-rental transition-all hover:-translate-y-0.5 hover:bg-amber-gold/90"
                                    >
                                        Mulai Pemesanan
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                    <a
                                        href="#platform"
                                        className="inline-flex h-12 items-center rounded-full border border-base-white/20 bg-base-white/10 px-7 text-sm font-semibold text-base-white backdrop-blur transition-colors hover:bg-base-white/20"
                                    >
                                        Pelajari Sistem
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

                            <div
                                className="reveal reveal-delay-200 grid gap-3 rounded-[24px] border border-base-white/15 bg-base-white/10 p-4 backdrop-blur-md sm:grid-cols-3 lg:grid-cols-1"
                                data-reveal
                            >
                                {[
                                    'Siap Diproses',
                                    'Pembayaran Lunas',
                                    'Pengemudi Ditugaskan',
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
                            <div className="reveal" data-reveal>
                                <p className="text-xs font-bold tracking-normal text-base-white/55 uppercase">
                                    Alur Kerja
                                </p>
                                <h2 className="mt-2 text-2xl leading-tight font-extrabold tracking-normal">
                                    Alur Kerja URBAN 8
                                </h2>
                            </div>
                            {processSteps.map((step, index) => (
                                <div
                                    key={step.number}
                                    className={`reveal border-t border-base-white/10 pt-5 md:border-t-0 md:border-l md:pt-0 md:pl-5 reveal-delay-${(index + 1) * 100}`}
                                    data-reveal
                                >
                                    <p className="text-xs font-bold tracking-normal text-amber-gold">
                                        LANGKAH {step.number}
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
                            <div className="reveal" data-reveal>
                                <SectionHeader
                                    eyebrow="Platform URBAN 8"
                                    title="Satu platform untuk operasional penyewaan, antar-jemput, pengemudi, dan pembayaran."
                                    description="Mulai dari katalog dan tarif hingga pengiriman, pengembalian, dan penyelesaian denda kelebihan waktu, URBAN 8 menyatukan setiap tahap penyewaan dalam sistem yang tertata."
                                />
                                <Link
                                    href={catalog.index.url()}
                                    className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-navy-blue px-7 text-sm font-bold text-base-white transition-colors hover:bg-navy-blue/90"
                                >
                                    Lihat Katalog
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>

                            <div
                                className="reveal reveal-delay-200 relative"
                                data-reveal
                            >
                                <div className="aspect-[4/3] overflow-hidden rounded-[24px] bg-surface-gray shadow-rental">
                                    <img
                                        src="/images/landing/product-car.jpg"
                                        alt="Tampilan atas kendaraan premium"
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
                                            Siap Diproses
                                        </p>
                                    </div>
                                </div>
                                <div className="absolute right-4 bottom-6 flex items-center gap-3 rounded-[16px] border border-slate-gray/10 bg-base-white px-4 py-3 shadow-rental md:-right-4">
                                    <span className="grid h-9 w-9 place-items-center rounded-full bg-amber-gold/20 text-amber-gold">
                                        <Banknote className="h-5 w-5" />
                                    </span>
                                    <div>
                                        <p className="text-xs text-slate-gray">
                                            Pembayaran
                                        </p>
                                        <p className="text-sm font-bold text-navy-blue">
                                            Lunas dan Terverifikasi
                                        </p>
                                    </div>
                                </div>
                                <div className="absolute -top-3 right-8 hidden items-center gap-3 rounded-[16px] bg-navy-blue px-4 py-3 text-base-white shadow-rental sm:flex">
                                    <span className="grid h-9 w-9 place-items-center rounded-full bg-base-white/10 text-amber-gold">
                                        <UserCheck className="h-5 w-5" />
                                    </span>
                                    <div>
                                        <p className="text-xs text-base-white/55">
                                            Pengemudi
                                        </p>
                                        <p className="text-sm font-bold">
                                            Ditugaskan
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
                            <div className="reveal" data-reveal>
                                <SectionHeader
                                    eyebrow="Fitur"
                                    title="Seluruh kebutuhan operasional penyewaan dalam satu sistem."
                                    description="Modul yang dirancang untuk menggantikan pencatatan manual, koordinasi tidak terpusat, dan perhitungan operasional yang rawan keliru."
                                />
                            </div>
                            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                {features.map((feature, index) => (
                                    <div
                                        key={feature.title}
                                        className={`reveal reveal-delay-${Math.min((index % 4) * 100, 300)}`}
                                        data-reveal
                                    >
                                        <FeatureCard {...feature} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section id="fleet" className="py-20 md:py-28">
                        <div className="mx-auto grid w-full max-w-7xl gap-12 px-5 md:px-8 lg:grid-cols-2 lg:items-center">
                            <div
                                className="reveal order-2 aspect-[5/4] overflow-hidden rounded-[24px] bg-surface-gray shadow-rental lg:order-1"
                                data-reveal
                            >
                                <img
                                    src="/images/landing/fleet-side.jpg"
                                    alt="Tampilan samping sedan premium"
                                    className="h-full w-full object-cover"
                                    loading="lazy"
                                />
                            </div>
                            <div
                                className="reveal reveal-delay-200 order-1 lg:order-2"
                                data-reveal
                            >
                                <SectionHeader
                                    eyebrow="Armada URBAN 8"
                                    title="Kelola armada secara lebih cerdas dan tertata."
                                    description="Kelola kelas kendaraan, ketersediaan, jadwal pengemudi, dan kesiapan pengiriman kendaraan melalui alur kerja yang mudah digunakan."
                                />
                                <div className="mt-10 grid gap-4 sm:grid-cols-2">
                                    {[
                                        'Tersedia 24/7',
                                        'Armada Multi-Kelas',
                                        'Sinkronisasi Status Pengemudi',
                                        'Kontrol Operasional',
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
                            <p
                                className="reveal text-xs font-bold tracking-normal text-base-white/55 uppercase"
                                data-reveal
                            >
                                Alasan URBAN 8 Layak Dipercaya
                            </p>
                            <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                                {stats.map((stat, index) => (
                                    <div
                                        key={stat.label}
                                        className={`reveal reveal-delay-${Math.min(index * 100, 300)}`}
                                        data-reveal
                                    >
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
                                <div className="reveal" data-reveal>
                                    <SectionHeader
                                        eyebrow="Kontrol Operasional"
                                        title="Mulai dari pemesanan hingga pengembalian, setiap tahap tercatat dengan jelas."
                                        description="Akurasi tarif, kunci pembayaran, jejak audit, dan akses berbasis peran membantu tim memproses pesanan secara tertib dan dapat dipertanggungjawabkan."
                                        dark
                                    />
                                </div>
                                <div className="grid gap-5 sm:grid-cols-3 lg:grid-cols-1">
                                    {reliability.map((item, index) => (
                                        <div
                                            key={item.title}
                                            className={`reveal reveal-delay-${(index + 1) * 100}`}
                                            data-reveal
                                        >
                                            <FeatureCard {...item} dark />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="grid bg-navy-blue text-base-white lg:grid-cols-2">
                        <div className="px-5 py-20 md:px-8 md:py-28 lg:ml-auto lg:w-full lg:max-w-[640px] lg:pr-14">
                            <SectionHeader
                                eyebrow="Pengalaman Pelanggan"
                                title="Pengalaman layanan yang lebih baik bagi setiap pelanggan."
                                dark
                            />
                            <div className="mt-10 grid gap-4 sm:grid-cols-2">
                                {customerTypes.map(
                                    ({ icon: Icon, ...item }, index) => (
                                        <div
                                            key={item.title}
                                            className={`reveal reveal-delay-${Math.min(index * 100, 300)} rounded-[20px] border border-base-white/10 bg-base-white/[0.05] p-6`}
                                            data-reveal
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
                                alt="Pengemudi profesional membukakan pintu kendaraan"
                                className="h-full w-full object-cover"
                                loading="lazy"
                            />
                        </div>
                    </section>

                    <section className="py-20 md:py-28">
                        <div className="mx-auto w-full max-w-7xl px-5 md:px-8">
                            <div
                                className="reveal grid gap-8 rounded-[24px] bg-amber-gold p-8 text-navy-blue shadow-rental md:grid-cols-[1.6fr_1fr] md:items-center md:p-10"
                                data-reveal
                            >
                                <div>
                                    <h2 className="max-w-2xl text-3xl leading-tight font-extrabold tracking-normal md:text-4xl">
                                        Siap memodernisasi operasional penyewaan
                                        Anda?
                                    </h2>
                                    <p className="mt-3 max-w-xl text-sm leading-6 text-navy-blue/75 md:text-base">
                                        Bangun alur penyewaan yang lebih rapi,
                                        cerdas, dan andal bersama URBAN 8.
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-3 md:justify-end">
                                    <Link
                                        href={catalog.index.url()}
                                        className="inline-flex h-12 items-center rounded-full bg-navy-blue px-7 text-sm font-bold text-base-white transition-colors hover:bg-navy-blue/90"
                                    >
                                        Mulai Sekarang
                                    </Link>
                                    <a
                                        href="#contact"
                                        className="inline-flex h-12 items-center rounded-full bg-base-white px-7 text-sm font-bold text-navy-blue transition-colors hover:bg-surface-gray"
                                    >
                                        Hubungi Tim Layanan
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
                                Berkendara dengan gaya. Tiba dengan kelas. URBAN
                                8 mendukung operasional penyewaan kendaraan dan
                                antar-jemput secara terpadu.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-6 text-sm sm:grid-cols-3">
                            {[
                                ['Katalog', catalog.index.url()],
                                ['Platform', '#platform'],
                                ['Fitur', '#features'],
                                ['Armada', '#fleet'],
                                ['Alur Kerja', '#workflow'],
                                ['Kontak', '#contact'],
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
                            <p>2026 URBAN 8. Seluruh hak cipta dilindungi.</p>
                            <p>Berkendara dengan gaya. Tiba dengan kelas.</p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}

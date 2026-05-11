import { Head, Link } from '@inertiajs/react';
import { BadgeCheck } from 'lucide-react';
import type { ReactNode } from 'react';

import { home } from '@/routes';

type AuthLayoutProps = {
    title: string;
    subtitle: string;
    action: ReactNode;
    children: ReactNode;
};

const highlights = [
    'Perhitungan tarif otomatis',
    'Penugasan pengemudi',
    'Pembayaran terverifikasi',
];

export default function AuthLayout({
    title,
    subtitle,
    action,
    children,
}: AuthLayoutProps) {
    return (
        <>
            <Head title={title} />
            <div className="relative min-h-screen lg:grid lg:grid-cols-2">
                {/* Left panel — hero visual */}
                <div className="relative hidden overflow-hidden bg-navy-blue lg:block">
                    <img
                        src="/images/landing/hero-fleet.jpg"
                        alt="Armada premium URBAN 8"
                        className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-navy-blue/75" />

                    <div className="relative flex h-full flex-col justify-between p-10 xl:p-14">
                        {/* Logo */}
                        <Link
                            href={home.url()}
                            className="flex items-center gap-3"
                        >
                            <img
                                src="/images/logo/logo-urban8.png"
                                alt="URBAN 8"
                                className="h-11 w-11 rounded-full object-cover"
                            />
                            <span className="text-lg font-extrabold tracking-normal text-base-white">
                                URBAN{' '}
                                <span className="text-amber-gold">8</span>
                            </span>
                        </Link>

                        {/* Hero copy */}
                        <div className="max-w-md">
                            <div className="inline-flex items-center gap-2 rounded-full border border-base-white/15 bg-base-white/10 px-4 py-1.5 text-xs font-bold tracking-normal text-base-white backdrop-blur">
                                <span className="h-2 w-2 rounded-full bg-amber-gold" />
                                Sistem Penyewaan Kendaraan Premium
                            </div>
                            <h1 className="mt-6 text-4xl leading-[1.08] font-extrabold tracking-normal text-base-white xl:text-5xl">
                                Operasional penyewaan yang tertata sejak proses
                                masuk pertama.
                            </h1>
                            <div className="mt-8 flex flex-col gap-3">
                                {highlights.map((item) => (
                                    <div
                                        key={item}
                                        className="inline-flex items-center gap-2.5 text-sm text-base-white/75"
                                    >
                                        <BadgeCheck className="h-4 w-4 shrink-0 text-amber-gold" />
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Footer tagline */}
                        <p className="text-sm text-base-white/45">
                            Berkendara dengan gaya. Tiba dengan kelas.
                        </p>
                    </div>
                </div>

                {/* Right panel — form */}
                <main className="flex min-h-screen flex-col bg-base-white px-6 py-8 lg:min-h-0 lg:px-12 xl:px-20">
                    {/* Mobile header */}
                    <header className="flex items-center justify-between gap-4 lg:justify-end">
                        <Link
                            href={home.url()}
                            className="flex items-center gap-2.5 lg:hidden"
                        >
                            <img
                                src="/images/logo/logo-urban8.png"
                                alt="URBAN 8"
                                className="h-9 w-9 rounded-full object-cover"
                            />
                            <span className="text-base font-extrabold tracking-normal text-navy-blue">
                                URBAN{' '}
                                <span className="text-amber-gold">8</span>
                            </span>
                        </Link>
                        <div className="text-sm text-slate-gray">{action}</div>
                    </header>

                    {/* Form card */}
                    <section className="flex grow items-center justify-center py-10">
                        <div className="w-full max-w-[440px]">
                            <div className="mb-8">
                                <h2 className="text-[28px] leading-[1.2] font-extrabold tracking-normal text-navy-blue md:text-[32px]">
                                    {title}
                                </h2>
                                <p className="mt-3 text-sm leading-6 text-slate-gray">
                                    {subtitle}
                                </p>
                            </div>
                            {children}
                        </div>
                    </section>

                    {/* Bottom bar */}
                    <footer className="text-center text-xs text-slate-gray/60 lg:text-left">
                        © 2026 URBAN 8. Seluruh hak cipta dilindungi.
                    </footer>
                </main>
            </div>
        </>
    );
}

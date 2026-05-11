import { Link, Head } from '@inertiajs/react';
import type { ReactNode } from 'react';

import { home } from '@/routes';

type AuthLayoutProps = {
    title: string;
    subtitle: string;
    action: ReactNode;
    children: ReactNode;
};

export default function AuthLayout({
    title,
    subtitle,
    action,
    children,
}: AuthLayoutProps) {
    return (
        <>
            <Head title={title} />
            <main className="min-h-screen bg-base-white px-6 py-8 text-navy-blue">
                <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col">
                    <header className="flex items-center justify-between gap-4">
                        <Link
                            href={home.url()}
                            className="text-lg font-semibold tracking-normal"
                        >
                            Penyewaan Kendaraan
                        </Link>
                        <div className="text-sm">{action}</div>
                    </header>

                    <section className="grid grow items-center gap-10 py-12 lg:grid-cols-[1fr_440px]">
                        <div className="max-w-2xl">
                            <p className="mb-5 text-sm font-semibold uppercase tracking-normal">
                                Manajemen penyewaan armada
                            </p>
                            <h1 className="text-[38px] leading-[1.16] font-semibold tracking-normal md:text-[54px] md:leading-[1.05]">
                                Operasional penyewaan yang tertata sejak proses masuk pertama.
                            </h1>
                            <div className="mt-8 grid gap-4 text-base leading-7 md:grid-cols-3">
                                <div className="border-t border-slate-gray/20 pt-4">
                                    Katalog armada
                                </div>
                                <div className="border-t border-slate-gray/20 pt-4">
                                    Pengemudi dan Peran
                                </div>
                                <div className="border-t border-slate-gray/20 pt-4">
                                    Kendali Pembayaran
                                </div>
                            </div>
                        </div>

                        <div className="rounded-[20px] bg-surface-gray p-8 shadow-rental">
                            <div className="mb-8">
                                <h2 className="text-[26px] leading-[1.2] font-semibold tracking-normal">
                                    {title}
                                </h2>
                                <p className="mt-3 text-sm leading-6 text-slate-gray">
                                    {subtitle}
                                </p>
                            </div>
                            {children}
                        </div>
                    </section>
                </div>
            </main>
        </>
    );
}

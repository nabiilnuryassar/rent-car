import { Link, Head, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';

import { dashboard, home, logout } from '@/routes';

type AppLayoutProps = {
    title: string;
    eyebrow: string;
    children: ReactNode;
};

export default function AppLayout({ title, eyebrow, children }: AppLayoutProps) {
    const user = usePage().props.auth.user;

    return (
        <>
            <Head title={title} />
            <main className="min-h-screen bg-base-white text-navy-blue">
                <header className="border-b border-slate-gray/20 bg-surface-gray/80">
                    <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-6 py-4">
                        <Link
                            href={home.url()}
                            className="text-lg font-semibold tracking-normal"
                        >
                            Penyewaan Kendaraan
                        </Link>
                        <nav className="flex items-center gap-3 text-sm">
                            <Link
                                href={dashboard.url()}
                                className="rounded-full border border-slate-gray/20 px-4 py-2"
                            >
                                Dasbor
                            </Link>
                            {user && (
                                <Link
                                    href={logout.url()}
                                    method="post"
                                    as="button"
                                    className="rounded-full bg-amber-gold px-4 py-2 text-navy-blue"
                                >
                                    Keluar
                                </Link>
                            )}
                        </nav>
                    </div>
                </header>

                <section className="mx-auto w-full max-w-7xl px-6 py-10">
                    <div className="mb-8">
                        <p className="text-sm font-semibold uppercase tracking-normal">
                            {eyebrow}
                        </p>
                        <h1 className="mt-3 text-[38px] leading-[1.16] font-semibold tracking-normal">
                            {title}
                        </h1>
                    </div>
                    {children}
                </section>
            </main>
        </>
    );
}

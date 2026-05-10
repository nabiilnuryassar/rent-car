import { Head, Link, usePage } from '@inertiajs/react';

import MobileBottomNav from '@/components/customer/MobileBottomNav';
import { login, register } from '@/routes';
import catalog from '@/routes/catalog';

export default function Welcome() {
    const user = usePage().props.auth.user;

    return (
        <>
            <Head title="Rental Kendaraan" />
            <main className="min-h-screen bg-base-white px-6 py-8 text-navy-blue pb-24 md:pb-8">
                <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-7xl flex-col">
                    <header className="flex items-center justify-between gap-4">
                        <p className="text-lg font-semibold tracking-normal">
                            URBAN 8
                        </p>
                        <nav className="flex items-center gap-3 text-sm">
                            {user ? (
                                <Link
                                    href={catalog.index.url()}
                                    className="rounded-full bg-amber-gold px-5 py-2 text-navy-blue"
                                >
                                    Catalog
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login.url()}
                                        className="rounded-full border border-slate-gray/20 px-5 py-2"
                                    >
                                        Masuk
                                    </Link>
                                    <Link
                                        href={register.url()}
                                        className="rounded-full bg-amber-gold px-5 py-2 text-navy-blue"
                                    >
                                        Daftar
                                    </Link>
                                </>
                            )}
                        </nav>
                    </header>

                    <section className="grid grow items-center gap-10 py-12 lg:grid-cols-[1fr_440px]">
                        <div className="max-w-3xl">
                            <p className="mb-5 text-sm font-semibold tracking-normal uppercase">
                                URBAN 8 RENT
                            </p>
                            <h1 className="text-[54px] leading-[1.05] font-semibold tracking-normal md:text-[72px] md:leading-[1.01]">
                                Drive in Style. Arrive in Class.
                            </h1>
                            <p className="mt-6 max-w-xl text-lg leading-8">
                                Premium vehicle rental with professional drivers,
                                tailored for every journey.
                            </p>
                        </div>

                        <div className="grid gap-5">
                            <div className="rounded-[20px] bg-surface-gray p-6 shadow-rental">
                                <p className="text-sm text-slate-gray">
                                    Role awal
                                </p>
                                <p className="mt-2 text-2xl font-semibold">
                                    Admin, Kasir, Customer, Driver
                                </p>
                            </div>
                            <div className="rounded-[20px] bg-surface-gray p-6 shadow-rental">
                                <p className="text-sm text-slate-gray">
                                    Status fondasi
                                </p>
                                <p className="mt-2 text-2xl font-semibold">
                                    Auth dan RBAC
                                </p>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
            <MobileBottomNav />
        </>
    );
}

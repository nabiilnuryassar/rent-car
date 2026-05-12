import { Award, Briefcase, Clock, Star, UserCircle } from 'lucide-react';
import CustomerLayout from '@/layouts/customer-layout';

type Driver = {
    id: number;
    name: string;
    professional_title: string;
    experience_years: number;
    completed_jobs: number;
    status: string;
};

type Props = {
    drivers: Driver[];
};

export default function CustomerDriversIndex({ drivers }: Props) {
    return (
        <CustomerLayout title="Pengemudi Profesional">
            <div className="mb-10 md:mb-12">
                <div className="md:hidden">
                    <h1 className="font-serif text-5xl font-extrabold tracking-tight text-navy-blue mb-3">
                        Pengemudi <br />
                        <span className="text-amber-gold underline decoration-navy-blue/10 underline-offset-8">
                            Eksklusif
                        </span>
                    </h1>
                    <p className="text-base font-medium text-slate-gray max-w-[320px]">
                        Ditunjuk oleh URBAN 8 untuk menemani setiap perjalanan Anda.
                    </p>
                </div>
                <div className="hidden md:block">
                    <h1 className="text-4xl font-extrabold tracking-tight text-navy-blue mb-3">
                        Pengemudi Profesional
                    </h1>
                    <p className="text-lg font-medium text-slate-gray max-w-2xl">
                        Kenali para pengemudi terpilih URBAN 8. Setiap nama melalui
                        seleksi ketat, uji keterampilan, dan pelatihan layanan tamu.
                    </p>
                </div>
            </div>

            {drivers.length === 0 ? (
                <div className="rounded-2xl border border-slate-gray/10 bg-base-white p-12 text-center shadow-sm">
                    <UserCircle className="mx-auto h-12 w-12 text-slate-gray/60" aria-hidden="true" />
                    <p className="mt-4 text-sm font-medium text-slate-gray">
                        Saat ini belum ada pengemudi tersedia. Silakan coba kembali nanti.
                    </p>
                </div>
            ) : (
                <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {drivers.map((driver) => (
                        <article
                            key={driver.id}
                            className="group flex flex-col rounded-2xl border border-slate-gray/10 bg-base-white p-5 shadow-sm transition-all hover:border-navy-blue/20 hover:shadow-xl"
                        >
                            <div className="relative mb-4 flex h-[180px] w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-navy-blue via-navy-blue/90 to-navy-blue/70">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(212,175,55,0.2),_transparent_60%)]" />
                                <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-amber-gold text-3xl font-extrabold text-navy-blue ring-4 ring-base-white/20">
                                    {driver.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-base-white/95 px-3 py-1 text-[10px] font-bold text-success-green backdrop-blur-sm">
                                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success-green" />
                                    Tersedia
                                </div>
                            </div>

                            <div className="flex-1">
                                <h3 className="text-lg font-extrabold leading-tight text-navy-blue">
                                    {driver.name}
                                </h3>
                                <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-amber-gold">
                                    <Award className="h-3.5 w-3.5" aria-hidden="true" />
                                    {driver.professional_title}
                                </p>

                                <div className="mt-4 flex items-center gap-1.5">
                                    <Star className="h-4 w-4 fill-amber-gold text-amber-gold" aria-hidden="true" />
                                    <Star className="h-4 w-4 fill-amber-gold text-amber-gold" aria-hidden="true" />
                                    <Star className="h-4 w-4 fill-amber-gold text-amber-gold" aria-hidden="true" />
                                    <Star className="h-4 w-4 fill-amber-gold text-amber-gold" aria-hidden="true" />
                                    <Star className="h-4 w-4 fill-amber-gold text-amber-gold" aria-hidden="true" />
                                    <span className="ml-1 text-xs font-bold text-slate-gray">
                                        5.0
                                    </span>
                                </div>
                            </div>

                            <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-gray/10 pt-4">
                                <div className="flex items-start gap-2">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-gray">
                                        <Clock className="h-4 w-4 text-navy-blue" aria-hidden="true" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-gray">
                                            Pengalaman
                                        </p>
                                        <p className="text-sm font-extrabold text-navy-blue">
                                            {driver.experience_years} thn
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-gray">
                                        <Briefcase className="h-4 w-4 text-navy-blue" aria-hidden="true" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-gray">
                                            Perjalanan
                                        </p>
                                        <p className="text-sm font-extrabold text-navy-blue">
                                            {driver.completed_jobs}+
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </CustomerLayout>
    );
}

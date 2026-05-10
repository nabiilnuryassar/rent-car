import { Head, Link, useForm } from '@inertiajs/react';
import { User, CheckCircle2, ChevronRight, Briefcase, Star, Clock } from 'lucide-react';

type Driver = {
    id: number;
    professional_title: string | null;
    experience_years: number;
    user: {
        name: string;
    };
};

type Props = {
    order: {
        id: number;
        order_number: string;
    };
    drivers: Driver[];
    currentDriverId: number | null;
};

export default function SelectDriver({ order, drivers, currentDriverId }: Props) {
    const { data, setData, post, processing } = useForm({
        driver_id: currentDriverId || (drivers.length > 0 ? drivers[0].id : ''),
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('customer.orders.assign-driver', order.id));
    };

    return (
        <>
            <Head title="Pilih Pengemudi — FleetGo" />
            <div className="min-h-screen bg-surface-gray py-12 px-4 sm:px-6">
                <div className="mx-auto max-w-3xl">
                    {/* Header */}
                    <div className="mb-8">
                        <Link href={route('customer.orders.show', order.id)} className="text-sm font-bold text-slate-gray hover:text-navy-blue flex items-center gap-1 w-fit mb-4">
                            <ChevronRight className="h-4 w-4 rotate-180" /> Kembali ke Pesanan
                        </Link>
                        <h1 className="text-3xl font-extrabold text-navy-blue">Pilih Pengemudi Anda</h1>
                        <p className="text-slate-gray mt-2">Kami telah memilihkan 3 pengemudi terbaik dan paling berpengalaman untuk perjalanan Anda.</p>
                    </div>

                    <form onSubmit={submit} className="flex flex-col gap-6">
                        <div className="grid gap-4">
                            {drivers.map((driver) => {
                                const isSelected = data.driver_id === driver.id;
                                
                                return (
                                    <div 
                                        key={driver.id}
                                        onClick={() => setData('driver_id', driver.id)}
                                        className={`cursor-pointer rounded-[24px] border-2 p-6 transition-all ${isSelected ? 'border-amber-gold bg-base-white shadow-lg' : 'border-slate-gray/10 bg-base-white hover:border-amber-gold/50'}`}
                                    >
                                        <div className="flex items-start gap-5">
                                            {/* Avatar Placeholder */}
                                            <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-2xl font-bold ${isSelected ? 'bg-amber-gold text-navy-blue' : 'bg-surface-gray text-slate-gray'}`}>
                                                {driver.user.name.charAt(0).toUpperCase()}
                                            </div>
                                            
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h3 className="text-xl font-bold text-navy-blue flex items-center gap-2">
                                                            {driver.user.name}
                                                            {isSelected && <CheckCircle2 className="h-5 w-5 text-success-green" />}
                                                        </h3>
                                                        <p className="text-sm font-semibold text-slate-gray flex items-center gap-1.5 mt-1">
                                                            <Briefcase className="h-4 w-4" />
                                                            {driver.professional_title || 'Sopir Profesional'}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-sm font-bold text-navy-blue bg-amber-gold/20 px-3 py-1 rounded-full">
                                                        <Star className="h-3.5 w-3.5 fill-amber-gold text-amber-gold" />
                                                        4.9+
                                                    </div>
                                                </div>

                                                <div className="mt-4 grid grid-cols-2 gap-4 border-t border-slate-gray/10 pt-4">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Clock className="h-4 w-4 text-slate-gray" />
                                                        <span className="font-semibold text-navy-blue">{driver.experience_years} Tahun Pengalaman</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <CheckCircle2 className="h-4 w-4 text-success-green" />
                                                        <span className="font-semibold text-navy-blue">Telah Divaksinasi Lengkap</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {drivers.length === 0 && (
                            <div className="rounded-[24px] border border-slate-gray/10 bg-base-white p-12 text-center text-slate-gray">
                                Mohon maaf, saat ini tidak ada pengemudi yang tersedia. Kami akan menugaskan pengemudi segera setelah pesanan Anda diproses.
                            </div>
                        )}

                        <div className="flex justify-end mt-4">
                            <button
                                type="submit"
                                disabled={processing || !data.driver_id}
                                className="rounded-full bg-navy-blue px-10 py-4 text-sm font-bold text-base-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-navy-blue/90 disabled:opacity-50 disabled:hover:translate-y-0"
                            >
                                {processing ? 'Memproses...' : 'Lanjutkan ke Pembayaran'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

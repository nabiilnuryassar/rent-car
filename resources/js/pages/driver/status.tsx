import { router } from '@inertiajs/react';
import { Activity, Pause, Play } from 'lucide-react';
import { useState } from 'react';
import DriverLayout from '@/layouts/driver-layout';
import driver from '@/routes/driver';

type Props = {
    driver: {
        id: number;
        status: string | null;
    } | null;
    statuses: Array<{ value: string; label: string }>;
};

export default function DriverStatusPage({ driver: driverInfo }: Props) {
    const [submitting, setSubmitting] = useState<string | null>(null);

    const currentStatus = driverInfo?.status ?? 'off_duty';
    const lockedByOrder =
        currentStatus === 'reserved' || currentStatus === 'on_duty';

    function setStatus(next: 'available' | 'off_duty') {
        if (lockedByOrder) {
            return;
        }

        setSubmitting(next);
        router.post(
            driver.status.update.url(),
            { status: next },
            {
                preserveScroll: true,
                onFinish: () => setSubmitting(null),
            },
        );
    }

    return (
        <DriverLayout title="Status" headline="Atur Status">
            {/* Current Status Card */}
            <div className="mb-6 rounded-2xl bg-base-white p-6 text-center shadow-sm">
                <Activity className="mx-auto h-10 w-10 text-amber-gold" />
                <p className="mt-2 text-[11px] font-bold tracking-wider text-slate-gray uppercase">
                    Status saat ini
                </p>
                <p className="mt-1 text-2xl font-extrabold text-navy-blue">
                    {currentStatus === 'available' && 'Tersedia'}
                    {currentStatus === 'reserved' && 'Dipesan'}
                    {currentStatus === 'on_duty' && 'Sedang Bertugas'}
                    {currentStatus === 'off_duty' && 'Sedang Off'}
                    {currentStatus === 'inactive' && 'Tidak Aktif'}
                </p>
            </div>

            {lockedByOrder && (
                <div className="mb-5 rounded-2xl border-l-4 border-amber-gold bg-amber-gold/10 p-4 text-xs text-navy-blue">
                    Status Anda sedang dikunci oleh sistem karena ada pesanan
                    aktif. Status akan kembali otomatis setelah pesanan
                    selesai.
                </div>
            )}

            {/* Toggle Buttons */}
            <div className="grid grid-cols-1 gap-3">
                <button
                    type="button"
                    onClick={() => setStatus('available')}
                    disabled={
                        lockedByOrder ||
                        currentStatus === 'available' ||
                        submitting !== null
                    }
                    className={`flex items-center justify-between rounded-2xl border-2 p-5 text-left transition-all ${
                        currentStatus === 'available'
                            ? 'border-success-green bg-success-green/10'
                            : 'border-transparent bg-base-white shadow-sm active:scale-[0.98]'
                    } ${lockedByOrder || submitting ? 'opacity-50' : ''}`}
                >
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success-green/20">
                            <Play className="h-5 w-5 text-success-green" />
                        </div>
                        <div>
                            <p className="text-base font-bold text-navy-blue">
                                Tersedia
                            </p>
                            <p className="text-[11px] text-slate-gray">
                                Siap menerima penugasan baru.
                            </p>
                        </div>
                    </div>
                    {currentStatus === 'available' && (
                        <span className="rounded-full bg-success-green px-3 py-1 text-[10px] font-bold text-white">
                            Aktif
                        </span>
                    )}
                </button>

                <button
                    type="button"
                    onClick={() => setStatus('off_duty')}
                    disabled={
                        lockedByOrder ||
                        currentStatus === 'off_duty' ||
                        submitting !== null
                    }
                    className={`flex items-center justify-between rounded-2xl border-2 p-5 text-left transition-all ${
                        currentStatus === 'off_duty'
                            ? 'border-slate-gray bg-slate-gray/10'
                            : 'border-transparent bg-base-white shadow-sm active:scale-[0.98]'
                    } ${lockedByOrder || submitting ? 'opacity-50' : ''}`}
                >
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-gray/20">
                            <Pause className="h-5 w-5 text-slate-gray" />
                        </div>
                        <div>
                            <p className="text-base font-bold text-navy-blue">
                                Off
                            </p>
                            <p className="text-[11px] text-slate-gray">
                                Tidak menerima penugasan.
                            </p>
                        </div>
                    </div>
                    {currentStatus === 'off_duty' && (
                        <span className="rounded-full bg-slate-gray px-3 py-1 text-[10px] font-bold text-white">
                            Aktif
                        </span>
                    )}
                </button>
            </div>

            <p className="mt-6 px-2 text-center text-[11px] text-slate-gray">
                Status &quot;Dipesan&quot; dan &quot;Sedang Bertugas&quot;
                ditetapkan otomatis oleh sistem berdasarkan siklus pesanan.
            </p>
        </DriverLayout>
    );
}

import { Link, usePage, useForm } from '@inertiajs/react';
import { X, CheckCircle2, User, Star, ArrowLeft, Briefcase, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { formatVehicleStatus } from '@/lib/labels';
import orders from '@/routes/customer/orders';

type PricingRule = {
    rental_unit: 'hour' | 'day' | 'week' | 'month';
    base_rate: number;
};

type Vehicle = {
    id: number;
    brand: string;
    model: string;
    status: string;
    images?: string[];
    category: {
        id: number;
        name: string;
        pricingRules?: PricingRule[];
    };
};

type Driver = {
    id: number;
    professional_title: string | null;
    experience_years: number;
    user: { name: string };
};

type Props = {
    vehicle: Vehicle | null;
    isOpen: boolean;
    onClose: () => void;
    rentalUnits?: { value: string; label: string }[];
    pickupOptions?: { value: string; label: string }[];
    drivers?: Driver[];
};

type ModalStep = 'detail' | 'booking' | 'driver';

const LANGKAH_LABELS = ['Detail', 'Pemesanan', 'Pengemudi'];

function StepIndicator({ currentStep }: { currentStep: ModalStep }) {
    const stepIndex = currentStep === 'detail' ? 0 : currentStep === 'booking' ? 1 : 2;

    return (
        <div className="flex items-center justify-center gap-2 py-4">
            {LANGKAH_LABELS.map((label, i) => (
                <div key={label} className="flex items-center gap-2">
                    <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                        i <= stepIndex
                            ? 'bg-navy-blue text-base-white'
                            : 'bg-slate-gray/10 text-slate-gray'
                    }`}>
                        {i < stepIndex ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                    </div>
                    <span className={`text-xs font-bold hidden sm:block ${i <= stepIndex ? 'text-navy-blue' : 'text-slate-gray'}`}>
                        {label}
                    </span>
                    {i < LANGKAH_LABELS.length - 1 && (
                        <div className={`h-px w-6 ${i < stepIndex ? 'bg-navy-blue' : 'bg-slate-gray/20'}`} />
                    )}
                </div>
            ))}
        </div>
    );
}

export default function VehicleModal({ vehicle, isOpen, onClose, rentalUnits = [], pickupOptions = [], drivers: driversProp = [] }: Props) {
    const { props } = usePage();
    const auth = props.auth as { user?: { name: string } } | undefined;

    const [step, setStep] = useState<ModalStep>('detail');
    const [drivers, setDrivers] = useState<Driver[]>(driversProp);
    const [selectedDriverId, setSelectedDriverId] = useState<number | null>(
        driversProp.length > 0 ? driversProp[0].id : null,
    );

    const { data, setData, post, processing, errors, reset } = useForm({
        vehicle_id: '',
        rental_unit: 'day',
        duration: '',
        start_at: '',
        pickup_option: 'pickup_at_office',
        delivery_address: '',
        is_out_of_town: false,
        driver_id: '',
    });

    const [activeImageIndex, setActiveImageIndex] = useState(0);

    useEffect(() => {
        if (isOpen && vehicle) {
            document.body.style.overflow = 'hidden';
            setData('vehicle_id', vehicle.id.toString());
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setActiveImageIndex(0);
        } else {
            document.body.style.overflow = 'unset';
            setStep('detail');
            setDrivers(driversProp);
            setSelectedDriverId(driversProp.length > 0 ? driversProp[0].id : null);
            reset();
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, vehicle]);

    if (!isOpen || !vehicle) {
return null;
}

    const getGalleryImages = () => {
        if (vehicle.images && vehicle.images.length > 0) {
            return vehicle.images.map(img => img.startsWith('http') ? img : `/storage/${img}`);
        }

        const catName = vehicle.category.name.toLowerCase();
        const placeholder = catName.includes('suv') ? '/images/mockup/suv.png' :
                          (catName.includes('mpv') || catName.includes('minibus')) ? '/images/mockup/mpv.png' :
                          '/images/mockup/sedan.png';

        return [placeholder];
    };

    const galleryImages = getGalleryImages();
    const activeImage = galleryImages[activeImageIndex] || galleryImages[0];

    const dailyPricing = vehicle.category.pricingRules?.find(p => p.rental_unit === 'day');
    const hourlyPricing = vehicle.category.pricingRules?.find(p => p.rental_unit === 'hour');

    const formatPrice = (price: number) => new Intl.NumberFormat('id-ID', {
        style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0
    }).format(price);

    const mainPrice = dailyPricing ? formatPrice(dailyPricing.base_rate) : (hourlyPricing ? formatPrice(hourlyPricing.base_rate) : 'Belum tersedia');
    const unit = dailyPricing ? '/ hari' : (hourlyPricing ? '/ jam' : '');

    const goToDriverStep = () => {
        // Minimal client-side guards so we don't advance with an empty form.
        if (!data.duration || !data.start_at) {
            return;
        }

        if (data.pickup_option === 'deliver_to_customer' && !data.delivery_address) {
            return;
        }

        setStep('driver');
    };

    const submitBooking = () => {
        if (selectedDriverId) {
            setData('driver_id', selectedDriverId.toString());
        }

        post(orders.store.url(), {
            preserveScroll: true,
            onError: () => {
                // Surface validation errors by sending the user back to the
                // booking step so they can fix the offending field.
                setStep('booking');
            },
        });
    };

    const skipDriverSelection = () => {
        setData('driver_id', '');
        post(orders.store.url(), {
            preserveScroll: true,
            onError: () => {
                setStep('booking');
            },
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-navy-blue/50 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

            <div className="relative w-full max-w-[900px] rounded-[24px] bg-surface-gray shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] overflow-y-auto md:overflow-y-visible">

                {/* Area gambar */}
                <div className="w-full md:w-2/5 p-6 md:p-8 bg-base-white flex flex-col gap-4">
                    <StepIndicator currentStep={step} />

                    <div className="w-full h-[200px] md:h-[220px] rounded-[16px] bg-surface-gray flex items-center justify-center p-4 overflow-hidden">
                        <img src={activeImage} alt={`${vehicle.brand} ${vehicle.model}`} className="w-full h-full object-contain drop-shadow-xl" />
                    </div>

                    {galleryImages.length > 1 && (
                        <div className="flex flex-wrap gap-3">
                            {galleryImages.map((img, index) => (
                                <div
                                    key={index}
                                    onClick={() => setActiveImageIndex(index)}
                                    className={`h-16 w-16 rounded-[12px] bg-surface-gray border-2 flex items-center justify-center p-2 cursor-pointer transition-all ${activeImageIndex === index ? 'border-navy-blue' : 'border-transparent opacity-70 hover:opacity-100'}`}
                                >
                                    <img src={img} alt={`Pratinjau ${index + 1}`} className="w-full h-full object-contain" />
                                </div>
                            ))}
                        </div>
                    )}

                    {step === 'detail' && (
                        <div className="mt-auto p-4 rounded-[16px] bg-surface-gray border border-slate-gray/10 hidden md:block">
                            <p className="text-xs font-medium text-slate-gray mb-1">Mulai dari</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-extrabold text-navy-blue">{mainPrice}</span>
                                <span className="text-sm font-medium text-slate-gray">{unit}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Area detail */}
                <div className="w-full md:w-3/5 flex flex-col bg-surface-gray">
                    <div className="p-6 md:p-8 flex-1 overflow-y-auto">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                {step !== 'detail' && (
                                    <button
                                        onClick={() => setStep(step === 'driver' ? 'booking' : 'detail')}
                                        className="flex items-center gap-2 text-sm font-bold text-slate-gray hover:text-navy-blue transition-colors mb-2"
                                    >
                                        <ArrowLeft className="h-4 w-4" /> Kembali
                                    </button>
                                )}
                                <p className="text-sm font-medium text-slate-gray mb-1">{vehicle.category.name}</p>
                                <h2 className="text-[28px] font-bold text-navy-blue leading-tight">
                                    {vehicle.brand} {vehicle.model}
                                </h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-gray/10 text-slate-gray hover:bg-slate-gray/20 hover:text-navy-blue transition-colors flex-shrink-0"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {step === 'detail' && (
                            <>
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="flex items-center gap-1 text-xs font-bold text-navy-blue">
                                        <Star className="h-4 w-4 fill-amber-gold text-amber-gold" /> 4,9 (120+ perjalanan)
                                    </div>
                                    <span className="text-slate-gray/30">/</span>
                                    <div className="flex items-center gap-1 text-xs font-bold text-success-green">
                                        <span className="h-1.5 w-1.5 rounded-full bg-success-green"></span>
                                        {formatVehicleStatus(vehicle.status)}
                                    </div>
                                </div>

                                <div className="grid grid-cols-4 gap-3 mb-8">
                                    <div className="flex flex-col items-center justify-center p-3 rounded-[12px] bg-base-white border border-slate-gray/10">
                                        <User className="h-5 w-5 text-navy-blue mb-1" />
                                        <span className="text-[10px] text-slate-gray">4 Kapasitas</span>
                                    </div>
                                    <div className="flex flex-col items-center justify-center p-3 rounded-[12px] bg-base-white border border-slate-gray/10">
                                        <span className="text-lg font-bold text-navy-blue leading-none mb-1">A</span>
                                        <span className="text-[10px] text-slate-gray">Otomatis</span>
                                    </div>
                                    <div className="flex flex-col items-center justify-center p-3 rounded-[12px] bg-base-white border border-slate-gray/10">
                                        <span className="text-lg font-bold text-navy-blue leading-none mb-1">BB</span>
                                        <span className="text-[10px] text-slate-gray">Bensin</span>
                                    </div>
                                    <div className="flex flex-col items-center justify-center p-3 rounded-[12px] bg-base-white border border-slate-gray/10">
                                        <span className="text-lg font-bold text-navy-blue leading-none mb-1">💼</span>
                                        <span className="text-[10px] text-slate-gray">2 Tas</span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h4 className="font-bold text-navy-blue text-sm mb-4">Fitur yang Termasuk</h4>
                                    {['Pengemudi profesional tersedia', 'Asuransi komprehensif', 'AC dan sistem audio', 'Pembatalan gratis maksimal 24 jam sebelumnya'].map(f => (
                                        <div key={f} className="flex items-center gap-3">
                                            <CheckCircle2 className="h-5 w-5 text-success-green" />
                                            <span className="text-sm font-medium text-navy-blue">{f}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {step === 'booking' && (
                            <form onSubmit={(e) => { e.preventDefault(); goToDriverStep(); }} className="flex flex-col gap-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-1 block text-xs font-bold text-navy-blue">Unit Sewa</label>
                                        <select value={data.rental_unit} onChange={(e) => setData('rental_unit', e.target.value)}
                                            className="w-full appearance-none rounded-full border border-slate-gray/20 bg-base-white bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%207l5%205%205-5%22%20fill%3D%22none%22%20stroke%3D%22%23666664%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25em_1.25em] bg-[position:right_1rem_center] bg-no-repeat px-4 py-2.5 pr-10 text-sm outline-none focus:border-amber-gold focus:ring-1 focus:ring-amber-gold">
                                            {rentalUnits.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs font-bold text-navy-blue">Durasi</label>
                                        <input type="number" min={1} value={data.duration} onChange={(e) => setData('duration', e.target.value)} placeholder="Cth: 3"
                                            className="w-full rounded-full border border-slate-gray/20 bg-base-white px-4 py-2.5 text-sm outline-none focus:border-amber-gold focus:ring-1 focus:ring-amber-gold" />
                                        {errors.duration && <p className="mt-1 text-xs text-red-500 font-medium">{errors.duration}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-1 block text-xs font-bold text-navy-blue">Waktu Mulai</label>
                                    <input type="datetime-local" value={data.start_at} onChange={(e) => setData('start_at', e.target.value)}
                                        className="w-full rounded-full border border-slate-gray/20 bg-base-white px-4 py-2.5 text-sm outline-none focus:border-amber-gold focus:ring-1 focus:ring-amber-gold" />
                                    {errors.start_at && <p className="mt-1 text-xs text-red-500 font-medium">{errors.start_at}</p>}
                                </div>

                                <div>
                                    <label className="mb-1 block text-xs font-bold text-navy-blue">Opsi Penjemputan</label>
                                    <select value={data.pickup_option} onChange={(e) => setData('pickup_option', e.target.value)}
                                        className="w-full appearance-none rounded-full border border-slate-gray/20 bg-base-white bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%207l5%205%205-5%22%20fill%3D%22none%22%20stroke%3D%22%23666664%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25em_1.25em] bg-[position:right_1rem_center] bg-no-repeat px-4 py-2.5 pr-10 text-sm outline-none focus:border-amber-gold focus:ring-1 focus:ring-amber-gold">
                                        {pickupOptions.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                                    </select>
                                </div>

                                {data.pickup_option === 'deliver_to_customer' && (
                                    <div>
                                        <label className="mb-1 block text-xs font-bold text-navy-blue">Alamat Pengiriman</label>
                                        <textarea value={data.delivery_address} onChange={(e) => setData('delivery_address', e.target.value)} rows={2}
                                            className="w-full rounded-[16px] border border-slate-gray/20 bg-base-white px-4 py-2.5 text-sm outline-none focus:border-amber-gold focus:ring-1 focus:ring-amber-gold"
                                            placeholder="Detail alamat lengkap" />
                                        {errors.delivery_address && <p className="mt-1 text-xs text-red-500 font-medium">{errors.delivery_address}</p>}
                                    </div>
                                )}

                                <div className="flex items-center gap-3 rounded-[12px] border border-slate-gray/10 bg-base-white p-3">
                                    <input id="out_of_town" type="checkbox" checked={data.is_out_of_town} onChange={(e) => setData('is_out_of_town', e.target.checked)}
                                        className="h-4 w-4 rounded border-slate-gray/30 text-amber-gold focus:ring-amber-gold" />
                                    <label htmlFor="out_of_town" className="text-xs font-bold text-navy-blue">
                                        Perjalanan Luar Kota <span className="ml-1 text-[10px] font-medium text-slate-gray">(+ biaya tambahan)</span>
                                    </label>
                                </div>

                                <button type="submit" disabled={processing}
                                    className="mt-2 w-full rounded-full bg-navy-blue py-3.5 text-sm font-bold text-base-white shadow-md transition-all hover:bg-navy-blue/90 disabled:opacity-50">
                                    {processing ? 'Memproses...' : 'Lanjutkan Pilih Pengemudi'}
                                </button>
                            </form>
                        )}

                        {step === 'driver' && (
                            <div className="flex flex-col gap-4">
                                <p className="text-sm text-slate-gray">Pilih pengemudi profesional untuk perjalanan Anda.</p>

                                {drivers.length === 0 ? (
                                    <div className="rounded-[16px] border border-slate-gray/10 bg-base-white p-8 text-center text-slate-gray text-sm">
                                        Belum ada pengemudi tersedia. Pilih "Lewati" untuk memesan tanpa pengemudi sekarang, kami akan menugaskan pengemudi setelah pesanan Anda diproses.
                                    </div>
                                ) : (
                                    <div className="grid gap-3">
                                        {drivers.map((driver) => {
                                            const isSelected = selectedDriverId === driver.id;

                                            return (
                                                <div key={driver.id} onClick={() => setSelectedDriverId(driver.id)}
                                                    className={`cursor-pointer rounded-[16px] border-2 p-4 transition-all ${isSelected ? 'border-amber-gold bg-base-white shadow-md' : 'border-slate-gray/10 bg-base-white hover:border-amber-gold/50'}`}>
                                                    <div className="flex items-center gap-4">
                                                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-bold ${isSelected ? 'bg-amber-gold text-navy-blue' : 'bg-surface-gray text-slate-gray'}`}>
                                                            {driver.user.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="text-sm font-bold text-navy-blue flex items-center gap-2">
                                                                {driver.user.name}
                                                                {isSelected && <CheckCircle2 className="h-4 w-4 text-success-green" />}
                                                            </h3>
                                                            <p className="text-xs text-slate-gray flex items-center gap-1 mt-0.5">
                                                                <Briefcase className="h-3 w-3" />
                                                                {driver.professional_title || 'Pengemudi Profesional'}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-1 text-xs font-bold text-slate-gray">
                                                            <Clock className="h-3 w-3" /> {driver.experience_years} thn
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                <div className="flex gap-3 mt-2">
                                    <button type="button" onClick={skipDriverSelection} disabled={processing}
                                        className="flex-1 rounded-full border-2 border-slate-gray/20 py-3 text-sm font-bold text-slate-gray transition-all hover:border-navy-blue hover:text-navy-blue disabled:opacity-50">
                                        Lewati
                                    </button>
                                    <button type="button" onClick={submitBooking} disabled={processing || (drivers.length > 0 && !selectedDriverId)}
                                        className="flex-1 rounded-full bg-navy-blue py-3 text-sm font-bold text-base-white shadow-md transition-all hover:bg-navy-blue/90 disabled:opacity-50">
                                        {processing ? 'Memproses...' : 'Konfirmasi Pesanan'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer - Only visible on detail step */}
                    {step === 'detail' && (
                        <div className="p-6 md:p-8 border-t border-slate-gray/10 flex items-center justify-between bg-base-white md:bg-transparent md:border-t-0 md:pt-0">
                            <div className="md:hidden">
                                <p className="text-xs font-medium text-slate-gray mb-1">Mulai dari</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-xl font-extrabold text-navy-blue">{mainPrice}</span>
                                    <span className="text-xs font-medium text-slate-gray">{unit}</span>
                                </div>
                            </div>

                            {!auth?.user ? (
                                <Link href="/login" className="ml-auto rounded-full bg-navy-blue px-8 py-3.5 text-sm font-bold text-base-white shadow-md transition-all hover:bg-navy-blue/90 hover:-translate-y-0.5">
                                    Masuk untuk Memesan
                                </Link>
                            ) : (
                                <button onClick={() => setStep('booking')} className="ml-auto rounded-full bg-navy-blue px-8 py-3.5 text-sm font-bold text-base-white shadow-md transition-all hover:bg-navy-blue/90 hover:-translate-y-0.5">
                                    Pesan Sekarang
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

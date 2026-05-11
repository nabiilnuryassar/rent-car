const orderStatusLabels: Record<string, string> = {
    draft: 'Draf',
    pending_payment: 'Menunggu Pembayaran',
    waiting_verification: 'Menunggu Verifikasi',
    paid: 'Dibayar',
    ready_to_dispatch: 'Siap Dikirim',
    ongoing: 'Sedang Berlangsung',
    waiting_overtime_payment: 'Menunggu Pembayaran Kelebihan Waktu',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
};

const paymentStatusLabels: Record<string, string> = {
    unpaid: 'Belum Dibayar',
    waiting_verification: 'Menunggu Verifikasi',
    rejected: 'Ditolak',
    paid: 'Dibayar',
    refunded: 'Dikembalikan',
};

const vehicleStatusLabels: Record<string, string> = {
    available: 'Tersedia',
    reserved: 'Dipesan',
    in_use: 'Sedang Digunakan',
    maintenance: 'Dalam Perawatan',
    inactive: 'Nonaktif',
};

const driverStatusLabels: Record<string, string> = {
    available: 'Tersedia',
    reserved: 'Dipesan',
    on_duty: 'Sedang Bertugas',
    off_duty: 'Tidak Bertugas',
    inactive: 'Nonaktif',
};

const paymentMethodLabels: Record<string, string> = {
    cash: 'Tunai',
    bank_transfer: 'Transfer Bank',
};

const rentalUnitLabels: Record<string, string> = {
    hour: 'Jam',
    day: 'Hari',
    week: 'Minggu',
    month: 'Bulan',
    hourly: 'Jam',
    daily: 'Hari',
    weekly: 'Minggu',
    monthly: 'Bulan',
};

const pickupOptionLabels: Record<string, string> = {
    pickup_at_office: 'Ambil di Kantor',
    deliver_to_customer: 'Diantar ke Alamat Saya',
};

function fallbackLabel(value: string | null | undefined) {
    if (!value) {
        return '-';
    }

    return value
        .split('_')
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

export function formatOrderStatus(value: string | null | undefined) {
    return value ? orderStatusLabels[value] ?? fallbackLabel(value) : '-';
}

export function formatPaymentStatus(value: string | null | undefined) {
    return value ? paymentStatusLabels[value] ?? fallbackLabel(value) : '-';
}

export function formatVehicleStatus(value: string | null | undefined) {
    return value ? vehicleStatusLabels[value] ?? fallbackLabel(value) : '-';
}

export function formatDriverStatus(value: string | null | undefined) {
    return value ? driverStatusLabels[value] ?? fallbackLabel(value) : '-';
}

export function formatPaymentMethod(value: string | null | undefined) {
    return value ? paymentMethodLabels[value] ?? fallbackLabel(value) : '-';
}

export function formatRentalUnit(value: string | null | undefined) {
    return value ? rentalUnitLabels[value] ?? fallbackLabel(value) : '-';
}

export function formatPickupOption(value: string | null | undefined) {
    return value ? pickupOptionLabels[value] ?? fallbackLabel(value) : '-';
}

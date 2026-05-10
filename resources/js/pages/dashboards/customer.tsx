import StatCard from '@/components/stat-card';
import AppLayout from '@/layouts/app-layout';

export default function CustomerDashboard() {
    return (
        <AppLayout title="Dashboard Customer" eyebrow="Customer">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                <StatCard
                    label="Order aktif"
                    value="0"
                    detail="Belum ada order berjalan."
                />
                <StatCard
                    label="Riwayat selesai"
                    value="0"
                    detail="Transaksi selesai akan tampil di sini."
                />
                <StatCard
                    label="Status customer"
                    value="Baru"
                    detail="Pelanggan lama aktif setelah transaksi selesai."
                />
            </div>
        </AppLayout>
    );
}

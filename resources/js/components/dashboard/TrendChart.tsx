import { router } from '@inertiajs/react';
import { Download } from 'lucide-react';
import {
    Bar,
    CartesianGrid,
    ComposedChart,
    Legend,
    Line,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import admin from '@/routes/admin';

type TrendPoint = {
    name: string;
    period: string;
    rentals: number;
    revenue: number;
};

type Props = {
    range: '6m' | '12m';
    data: TrendPoint[];
};

const rangeOptions: Array<{ value: Props['range']; label: string }> = [
    { value: '6m', label: 'Last 6 Months' },
    { value: '12m', label: 'Last 12 Months' },
];

export default function TrendChart({ range, data }: Props) {
    const onRangeChange = (value: Props['range']): void => {
        router.reload({
            data: { range: value },
            only: ['stats', 'trend'],
        });
    };

    const onExport = (): void => {
        window.location.href = admin.dashboard.trend.export.url({
            query: { range },
        });
    };

    const formatRupiah = (val: number): string => {
        if (val >= 1_000_000_000) {
            return `${(val / 1_000_000_000).toFixed(1)}B`;
        }

        if (val >= 1_000_000) {
            return `${(val / 1_000_000).toFixed(1)}M`;
        }

        if (val >= 1_000) {
            return `${(val / 1_000).toFixed(0)}k`;
        }

        return val.toString();
    };

    return (
        <div className="flex h-full flex-col rounded-[20px] bg-surface-gray p-6 shadow-rental">
            <div className="mb-6 flex items-center justify-between">
                <h2 className="font-bold text-navy-blue">
                    Rental Trends vs. Revenue
                </h2>

                <div className="flex items-center gap-3">
                    <select
                        value={range}
                        onChange={(e) =>
                            onRangeChange(e.target.value as Props['range'])
                        }
                        className="rounded-full border border-slate-gray/20 bg-base-white/50 px-4 py-1.5 text-sm outline-none focus:border-amber-gold"
                    >
                        {rangeOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    <button
                        type="button"
                        onClick={onExport}
                        className="flex items-center gap-2 rounded-full border border-slate-gray/20 px-4 py-1.5 text-sm transition-colors hover:bg-base-white"
                    >
                        <Download className="h-4 w-4" />
                        <span>Export</span>
                    </button>
                </div>
            </div>

            <div className="min-h-[300px] w-full flex-1">
                {data.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-sm text-slate-gray">
                        Belum ada data untuk periode ini.
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart
                            data={data}
                            margin={{ top: 20, right: 20, bottom: 0, left: 0 }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                                stroke="#e5e7eb"
                            />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: '#6b7280' }}
                                dy={10}
                            />
                            <YAxis
                                yAxisId="left"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: '#6b7280' }}
                                dx={-10}
                                allowDecimals={false}
                            />
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: '#6b7280' }}
                                tickFormatter={formatRupiah}
                                dx={10}
                            />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: '12px',
                                    border: '1px solid #e5e7eb',
                                    boxShadow:
                                        '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                }}
                                formatter={(value, name) => {
                                    const num =
                                        typeof value === 'number'
                                            ? value
                                            : Number(value ?? 0);

                                    if (name === 'Revenue (IDR)') {
                                        return [
                                            `Rp ${num.toLocaleString('id-ID')}`,
                                            name,
                                        ];
                                    }

                                    return [String(value ?? ''), name];
                                }}
                            />
                            <Legend
                                wrapperStyle={{ paddingTop: '20px' }}
                                iconType="circle"
                            />
                            <Bar
                                yAxisId="left"
                                dataKey="rentals"
                                name="Total Rentals"
                                fill="#ffd801"
                                radius={[4, 4, 0, 0]}
                                barSize={32}
                            />
                            <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="revenue"
                                name="Revenue (IDR)"
                                stroke="#000000"
                                strokeWidth={2}
                                dot={{ r: 4, fill: '#000000' }}
                                activeDot={{ r: 6 }}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}

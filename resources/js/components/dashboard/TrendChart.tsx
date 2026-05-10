import { Download } from 'lucide-react';
import { ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ComposedChart, Bar, Line } from 'recharts';

const dummyData = [
    { name: "Dec '24", rentals: 90, revenue: 20000 },
    { name: "Jan '25", rentals: 124, revenue: 30000 },
    { name: "Feb '25", rentals: 135, revenue: 35000 },
    { name: "Mar '25", rentals: 151, revenue: 45000 },
    { name: "Apr '25", rentals: 120, revenue: 38000 },
    { name: "May '25", rentals: 128, revenue: 48750 },
];

export default function TrendChart() {
    return (
        <div className="flex flex-col rounded-[20px] bg-surface-gray p-6 shadow-rental h-full">
            <div className="mb-6 flex items-center justify-between">
                <h2 className="font-bold text-navy-blue">Rental Trends vs. Revenue</h2>
                
                <div className="flex items-center gap-3">
                    <select className="rounded-full border border-slate-gray/20 bg-base-white/50 px-4 py-1.5 text-sm outline-none focus:border-amber-gold">
                        <option>Last 6 Months</option>
                        <option>Last Year</option>
                    </select>
                    <button className="flex items-center gap-2 rounded-full border border-slate-gray/20 px-4 py-1.5 text-sm hover:bg-base-white transition-colors">
                        <Download className="h-4 w-4" />
                        <span>Export</span>
                    </button>
                </div>
            </div>

            <div className="flex-1 w-full min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={dummyData} margin={{ top: 20, right: 20, bottom: 0, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
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
                        />
                        <YAxis 
                            yAxisId="right" 
                            orientation="right" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 12, fill: '#6b7280' }}
                            tickFormatter={(val) => `${val / 1000}k`}
                            dx={10}
                        />
                        <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
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
                            name="Revenue (USD)" 
                            stroke="#000000" 
                            strokeWidth={2}
                            dot={{ r: 4, fill: '#000000' }}
                            activeDot={{ r: 6 }}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

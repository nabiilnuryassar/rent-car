type StatCardProps = {
    label: string;
    value: string;
    detail: string;
};

export default function StatCard({ label, value, detail }: StatCardProps) {
    return (
        <div className="rounded-[20px] bg-surface-gray p-6 shadow-rental">
            <p className="text-sm text-slate-gray">{label}</p>
            <p className="mt-4 text-[38px] leading-none font-semibold tracking-normal">
                {value}
            </p>
            <p className="mt-4 text-sm leading-6">{detail}</p>
        </div>
    );
}

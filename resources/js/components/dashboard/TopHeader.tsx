type TopHeaderProps = {
    userName: string;
};

export default function TopHeader({ userName }: TopHeaderProps) {
    return (
        <div className="flex items-center justify-between rounded-[20px] bg-surface-gray p-6 shadow-rental">
            <div className="flex items-center gap-4">
                <div>
                    <p className="text-sm text-slate-gray">Selamat datang kembali!</p>
                    <h1 className="font-serif text-3xl font-extrabold text-navy-blue">
                        Selamat pagi, {userName}
                    </h1>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <img
                    src="/images/logo/logo-urban8.png"
                    alt="URBAN 8"
                    className="h-12 w-12 rounded-full object-cover"
                />
                <div className="flex items-center gap-3 border-l border-slate-gray/20 pl-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-blue font-bold text-surface-gray">
                        {userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="text-sm leading-tight font-bold">
                            {userName}
                        </p>
                        <p className="text-[10px] tracking-wider text-slate-gray uppercase">
                            Administrator Utama
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

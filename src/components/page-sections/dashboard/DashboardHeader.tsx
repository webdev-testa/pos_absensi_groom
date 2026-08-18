interface DashboardHeaderProps {
  todayLabel: string;
  liveTime: string;
}

export function DashboardHeader({ todayLabel, liveTime }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
      <div>
        <h1 className="font-heading text-2xl sm:text-[26px] font-bold tracking-tight text-foreground">
          Selamat datang di <span className="text-[#FF5600]">Dr. Meow</span> 🐾
        </h1>
        <p className="text-[13.5px] text-muted-foreground mt-1">
          Ringkasan absensi klinik & operasional hari ini — {todayLabel}
        </p>
      </div>
      <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3.5 py-2 text-[13px] text-muted-foreground shadow-xs self-start sm:self-auto">
        <div className="w-2 h-2 rounded-full bg-[#10B981] shrink-0 animate-pulse"></div>
        <span>Live update · <strong className="text-foreground font-semibold font-mono">{liveTime}</strong></span>
      </div>
    </div>
  );
}

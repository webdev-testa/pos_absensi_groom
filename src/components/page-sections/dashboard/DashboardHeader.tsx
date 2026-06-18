interface DashboardHeaderProps {
  todayLabel: string;
  liveTime: string;
}

export function DashboardHeader({ todayLabel, liveTime }: DashboardHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <div className="font-['Syne'] text-[26px] font-bold tracking-[-0.4px]">
          Selamat pagi, <span className="text-[#C84B2F]">Fara</span> 👋
        </div>
        <div className="text-[13.5px] text-[#6B6760] mt-1.5">
          Ini ringkasan bisnis kamu hari ini — {todayLabel}
        </div>
      </div>
      <div className="flex items-center gap-2 bg-white border border-[#E0DDD7] rounded-[10px] px-3.5 py-2 text-[13px] text-[#6B6760]">
        <div className="w-2 h-2 rounded-full bg-[#2A7A4B] shrink-0 animate-pulse"></div>
        <span>Live update · <strong className="text-[#1A1814] font-semibold">{liveTime}</strong></span>
      </div>
    </div>
  );
}

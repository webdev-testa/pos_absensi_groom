interface AttendanceStatsProps {
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  totalEmployees: number;
  statOntime: number;
  statLate: number;
  statAbsent: number;
  statOut: number;
}

export function AttendanceStats({
  statusFilter,
  setStatusFilter,
  totalEmployees,
  statOntime,
  statLate,
  statAbsent,
  statOut,
}: AttendanceStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 mb-7">
      <div 
        onClick={() => setStatusFilter("all")}
        className={`bg-white border rounded-[16px] p-4.5 cursor-pointer transition-all ${statusFilter === "all" ? "border-[#1A1814] ring-1 ring-[#1A1814]" : "border-[#E0DDD7] hover:border-[#CBC8C2] hover:-translate-y-[1px]"}`}
      >
        <div className="stat-title mb-2.5">Total karyawan</div>
        <div className="font-['Syne'] text-[32px] font-bold tracking-[-1px] leading-none text-[#1A1814]">{totalEmployees}</div>
        <div className="text-[12px] text-[#A8A49E] mt-1.5">hari ini</div>
        <div className="h-[3px] rounded-[2px] mt-3 bg-[#EDEAE4] overflow-hidden"><div className="h-full bg-[#1A1814] rounded-[2px] w-full"></div></div>
      </div>
      
      <div 
        onClick={() => setStatusFilter("ontime")}
        className={`bg-white border rounded-[16px] p-4.5 cursor-pointer transition-all ${statusFilter === "ontime" ? "border-[#1A1814] ring-1 ring-[#1A1814]" : "border-[#E0DDD7] hover:border-[#CBC8C2] hover:-translate-y-[1px]"}`}
      >
        <div className="stat-title mb-2.5">Tepat waktu</div>
        <div className="font-['Syne'] text-[32px] font-bold tracking-[-1px] leading-none text-[#2A7A4B]">{statOntime}</div>
        <div className="text-[12px] text-[#A8A49E] mt-1.5">sebelum 08.00</div>
        <div className="h-[3px] rounded-[2px] mt-3 bg-[#EDEAE4] overflow-hidden"><div className="h-full bg-[#2A7A4B] rounded-[2px]" style={{ width: `${Math.min(100, (statOntime/Math.max(1, totalEmployees))*100)}%`}}></div></div>
      </div>

      <div 
        onClick={() => setStatusFilter("late")}
        className={`bg-white border rounded-[16px] p-4.5 cursor-pointer transition-all ${statusFilter === "late" ? "border-[#1A1814] ring-1 ring-[#1A1814]" : "border-[#E0DDD7] hover:border-[#CBC8C2] hover:-translate-y-[1px]"}`}
      >
        <div className="stat-title mb-2.5">Terlambat</div>
        <div className="font-['Syne'] text-[32px] font-bold tracking-[-1px] leading-none text-[#B87333]">{statLate}</div>
        <div className="text-[12px] text-[#A8A49E] mt-1.5">setelah 08.00</div>
        <div className="h-[3px] rounded-[2px] mt-3 bg-[#EDEAE4] overflow-hidden"><div className="h-full bg-[#B87333] rounded-[2px]" style={{ width: `${Math.min(100, (statLate/Math.max(1, totalEmployees))*100)}%`}}></div></div>
      </div>

      <div 
        onClick={() => setStatusFilter("absent")}
        className={`bg-white border rounded-[16px] p-4.5 cursor-pointer transition-all ${statusFilter === "absent" ? "border-[#1A1814] ring-1 ring-[#1A1814]" : "border-[#E0DDD7] hover:border-[#CBC8C2] hover:-translate-y-[1px]"}`}
      >
        <div className="stat-title mb-2.5">Tidak hadir</div>
        <div className="font-['Syne'] text-[32px] font-bold tracking-[-1px] leading-none text-[#C84B2F]">{statAbsent}</div>
        <div className="text-[12px] text-[#A8A49E] mt-1.5">belum absen</div>
        <div className="h-[3px] rounded-[2px] mt-3 bg-[#EDEAE4] overflow-hidden"><div className="h-full bg-[#C84B2F] rounded-[2px]" style={{ width: `${Math.min(100, (statAbsent/Math.max(1, totalEmployees))*100)}%`}}></div></div>
      </div>

      <div 
        onClick={() => setStatusFilter("out")}
        className={`bg-white border rounded-[16px] p-4.5 cursor-pointer transition-all ${statusFilter === "out" ? "border-[#1A1814] ring-1 ring-[#1A1814]" : "border-[#E0DDD7] hover:border-[#CBC8C2] hover:-translate-y-[1px]"}`}
      >
        <div className="stat-title mb-2.5">Sudah pulang</div>
        <div className="font-['Syne'] text-[32px] font-bold tracking-[-1px] leading-none text-[#6B6760]">{statOut}</div>
        <div className="text-[12px] text-[#A8A49E] mt-1.5">clock-out selesai</div>
        <div className="h-[3px] rounded-[2px] mt-3 bg-[#EDEAE4] overflow-hidden"><div className="h-full bg-[#A8A49E] rounded-[2px]" style={{ width: `${Math.min(100, (statOut/Math.max(1, totalEmployees))*100)}%`}}></div></div>
      </div>
    </div>
  );
}

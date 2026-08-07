import { StatCard } from "@/components/ui/stat-card"

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
  const safeTotal = Math.max(1, totalEmployees);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 mb-7">
      <StatCard
        title="Total karyawan"
        value={totalEmployees}
        subtitle="hari ini"
        isActive={statusFilter === "all"}
        onClick={() => setStatusFilter("all")}
        progressPercentage={100}
        progressBarColor="bg-[#1A1814]"
      />
      
      <StatCard
        title="Tepat waktu"
        value={statOntime}
        subtitle="sebelum 08.00"
        valueColor="text-[#2A7A4B]"
        isActive={statusFilter === "ontime"}
        onClick={() => setStatusFilter("ontime")}
        progressPercentage={(statOntime / safeTotal) * 100}
        progressBarColor="bg-[#2A7A4B]"
      />

      <StatCard
        title="Terlambat"
        value={statLate}
        subtitle="setelah 08.00"
        valueColor="text-[#B87333]"
        isActive={statusFilter === "late"}
        onClick={() => setStatusFilter("late")}
        progressPercentage={(statLate / safeTotal) * 100}
        progressBarColor="bg-[#B87333]"
      />

      <StatCard
        title="Tidak hadir"
        value={statAbsent}
        subtitle="belum absen"
        valueColor="text-[#C84B2F]"
        isActive={statusFilter === "absent"}
        onClick={() => setStatusFilter("absent")}
        progressPercentage={(statAbsent / safeTotal) * 100}
        progressBarColor="bg-[#C84B2F]"
      />

      <StatCard
        title="Sudah pulang"
        value={statOut}
        subtitle="clock-out selesai"
        valueColor="text-[#6B6760]"
        isActive={statusFilter === "out"}
        onClick={() => setStatusFilter("out")}
        progressPercentage={(statOut / safeTotal) * 100}
        progressBarColor="bg-[#A8A49E]"
      />
    </div>
  );
}


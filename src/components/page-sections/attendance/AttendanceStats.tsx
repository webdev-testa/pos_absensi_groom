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

  const stats = [
    { key: "all", title: "Total staf", value: totalEmployees, sub: "hari ini", color: "text-foreground", bar: "bg-primary", pct: 100 },
    { key: "ontime", title: "Tepat waktu", value: statOntime, sub: "sebelum 08.00", color: "text-[#10B981]", bar: "bg-[#10B981]", pct: (statOntime / safeTotal) * 100 },
    { key: "late", title: "Terlambat", value: statLate, sub: "setelah 08.00", color: "text-[#F59E0B]", bar: "bg-[#F59E0B]", pct: (statLate / safeTotal) * 100 },
    { key: "absent", title: "Tidak hadir", value: statAbsent, sub: "belum absen", color: "text-[#EF4444]", bar: "bg-[#EF4444]", pct: (statAbsent / safeTotal) * 100 },
    { key: "out", title: "Sudah pulang", value: statOut, sub: "clock-out tercatat", color: "text-[#3B82F6]", bar: "bg-[#3B82F6]", pct: (statOut / safeTotal) * 100 },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 mb-7">
      {stats.map((s) => {
        const isActive = statusFilter === s.key;
        return (
          <div
            key={s.key}
            onClick={() => setStatusFilter(s.key)}
            className={`bg-card border rounded-xl p-4.5 transition-all shadow-xs cursor-pointer ${
              isActive
                ? "border-primary ring-2 ring-primary/20 bg-surface-soft/40"
                : "border-border hover:border-foreground/20 hover:-translate-y-[1px]"
            }`}
          >
            <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2.5">
              {s.title}
            </div>
            <div className={`font-mono text-2xl sm:text-3xl font-bold tracking-tight leading-none tabular-nums ${s.color}`}>
              {s.value}
            </div>
            <div className="text-xs text-muted-foreground/80 mt-1.5">{s.sub}</div>
            <div className="h-1 rounded-full mt-3 bg-surface-soft overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${s.bar}`}
                style={{ width: `${Math.min(100, Math.max(0, s.pct))}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

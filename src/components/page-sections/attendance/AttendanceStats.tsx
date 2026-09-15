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
  const safeTotal = Number.isFinite(totalEmployees) ? Math.max(0, totalEmployees) : 0;
  const divisor = Math.max(1, safeTotal);

  const calcPct = (val: number) => {
    if (!Number.isFinite(val) || divisor <= 0) return 0;
    return Math.min(100, Math.max(0, (val / divisor) * 100));
  };

  const safeVal = (v: number) => (Number.isFinite(v) ? Math.max(0, v) : 0);

  const stats = [
    { key: "all", title: "Total staf", value: safeTotal, sub: "hari ini", color: "text-foreground", bar: "bg-primary", pct: safeTotal > 0 ? 100 : 0 },
    { key: "ontime", title: "Tepat waktu", value: safeVal(statOntime), sub: "sebelum 08.00", color: "text-emerald-600 dark:text-emerald-400", bar: "bg-emerald-500", pct: calcPct(statOntime) },
    { key: "late", title: "Terlambat", value: safeVal(statLate), sub: "setelah 08.00", color: "text-amber-600 dark:text-amber-400", bar: "bg-amber-500", pct: calcPct(statLate) },
    { key: "absent", title: "Tidak hadir", value: safeVal(statAbsent), sub: "belum absen", color: "text-rose-600 dark:text-rose-400", bar: "bg-rose-500", pct: calcPct(statAbsent) },
    { key: "out", title: "Sudah pulang", value: safeVal(statOut), sub: "clock-out tercatat", color: "text-blue-600 dark:text-blue-400", bar: "bg-blue-500", pct: calcPct(statOut) },
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

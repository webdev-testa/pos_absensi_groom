import { Card, CardContent } from "@/components/ui/card";
import { fmtCurrency } from "@/lib/utils";

interface PayrollStatsProps {
  stats: {
    totalGajiBersih: number;
    countPaid: number;
    countTotal: number;
    totalInsentif: number;
    totalKasbonDipotong: number;
  };
}

export function PayrollStats({ stats }: PayrollStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[14px]">
      <Card className="bg-card border border-border rounded-xl shadow-xs">
        <CardContent className="p-[18px_20px]">
          <div className="stat-title mb-2">Total Gaji Bersih</div>
          <div className="font-mono text-2xl sm:text-3xl font-bold tracking-tight leading-none text-foreground tabular-nums">
            {fmtCurrency(stats.totalGajiBersih)}
          </div>
          <div className="text-[12px] text-muted-foreground mt-1.5">{stats.countTotal} slip gaji digenerate</div>
        </CardContent>
      </Card>

      <Card className="bg-card border border-border rounded-xl shadow-xs">
        <CardContent className="p-[18px_20px]">
          <div className="stat-title mb-2">Terbayar</div>
          <div className="font-mono text-2xl sm:text-3xl font-bold tracking-tight leading-none text-emerald-600 dark:text-emerald-400 tabular-nums">
            {stats.countPaid}
          </div>
          <div className="text-[12px] text-muted-foreground mt-1.5">dari {stats.countTotal} staf klinik</div>
        </CardContent>
      </Card>

      <Card className="bg-card border border-border rounded-xl shadow-xs">
        <CardContent className="p-[18px_20px]">
          <div className="stat-title mb-2">Total Insentif</div>
          <div className="font-mono text-2xl sm:text-3xl font-bold tracking-tight leading-none text-blue-600 dark:text-blue-400 tabular-nums">
            {fmtCurrency(stats.totalInsentif)}
          </div>
          <div className="text-[12px] text-muted-foreground mt-1.5">bonus bulan ini</div>
        </CardContent>
      </Card>

      <Card className="bg-card border border-border rounded-xl shadow-xs">
        <CardContent className="p-[18px_20px]">
          <div className="stat-title mb-2">Kasbon Dipotong</div>
          <div className="font-mono text-2xl sm:text-3xl font-bold tracking-tight leading-none text-brand-orange tabular-nums">
            {fmtCurrency(stats.totalKasbonDipotong)}
          </div>
          <div className="text-[12px] text-muted-foreground mt-1.5">potongan kasbon langsung</div>
        </CardContent>
      </Card>
    </div>
  );
}

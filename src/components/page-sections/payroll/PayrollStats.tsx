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
          <div className="font-heading text-[30px] font-bold tracking-tight leading-none text-foreground">
            {fmtCurrency(stats.totalGajiBersih)}
          </div>
          <div className="text-[12px] text-muted-foreground mt-1.5">{stats.countTotal} slip gaji digenerate</div>
        </CardContent>
      </Card>

      <Card className="bg-card border border-border rounded-xl shadow-xs">
        <CardContent className="p-[18px_20px]">
          <div className="stat-title mb-2">Terbayar</div>
          <div className="font-heading text-[30px] font-bold tracking-tight leading-none text-[#10B981]">
            {stats.countPaid}
          </div>
          <div className="text-[12px] text-muted-foreground mt-1.5">dari {stats.countTotal} staf klinik</div>
        </CardContent>
      </Card>

      <Card className="bg-card border border-border rounded-xl shadow-xs">
        <CardContent className="p-[18px_20px]">
          <div className="stat-title mb-2">Total Insentif</div>
          <div className="font-heading text-[30px] font-bold tracking-tight leading-none text-[#3B82F6]">
            {fmtCurrency(stats.totalInsentif)}
          </div>
          <div className="text-[12px] text-muted-foreground mt-1.5">bonus bulan ini</div>
        </CardContent>
      </Card>

      <Card className="bg-card border border-border rounded-xl shadow-xs">
        <CardContent className="p-[18px_20px]">
          <div className="stat-title mb-2">Kasbon Dipotong</div>
          <div className="font-heading text-[30px] font-bold tracking-tight leading-none text-[#FF5600]">
            {fmtCurrency(stats.totalKasbonDipotong)}
          </div>
          <div className="text-[12px] text-muted-foreground mt-1.5">potongan kasbon langsung</div>
        </CardContent>
      </Card>
    </div>
  );
}

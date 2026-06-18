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
    <div className="grid grid-cols-4 gap-[14px]">
      <Card className="bg-white border-[#E0DDD7] rounded-[16px] shadow-none">
        <CardContent className="p-[18px_20px]">
          <div className="text-[11px] text-[#A8A49E] uppercase tracking-[0.8px] font-mono mb-2">Total Gaji Bersih</div>
          <div className="font-['Syne'] text-[30px] font-bold tracking-[-1px] leading-none text-[#1A1814]">
            {fmtCurrency(stats.totalGajiBersih)}
          </div>
          <div className="text-[12px] text-[#A8A49E] mt-1.5">{stats.countTotal} slip gaji digenerate</div>
        </CardContent>
      </Card>

      <Card className="bg-white border-[#E0DDD7] rounded-[16px] shadow-none">
        <CardContent className="p-[18px_20px]">
          <div className="text-[11px] text-[#A8A49E] uppercase tracking-[0.8px] font-mono mb-2">Terbayar</div>
          <div className="font-['Syne'] text-[30px] font-bold tracking-[-1px] leading-none text-[#2A7A4B]">
            {stats.countPaid}
          </div>
          <div className="text-[12px] text-[#A8A49E] mt-1.5">dari {stats.countTotal} karyawan</div>
        </CardContent>
      </Card>

      <Card className="bg-white border-[#E0DDD7] rounded-[16px] shadow-none">
        <CardContent className="p-[18px_20px]">
          <div className="text-[11px] text-[#A8A49E] uppercase tracking-[0.8px] font-mono mb-2">Total Insentif</div>
          <div className="font-['Syne'] text-[30px] font-bold tracking-[-1px] leading-none text-[#C84B2F]">
            {fmtCurrency(stats.totalInsentif)}
          </div>
          <div className="text-[12px] text-[#A8A49E] mt-1.5">bonus bulan ini</div>
        </CardContent>
      </Card>

      <Card className="bg-white border-[#E0DDD7] rounded-[16px] shadow-none">
        <CardContent className="p-[18px_20px]">
          <div className="text-[11px] text-[#A8A49E] uppercase tracking-[0.8px] font-mono mb-2">Kasbon Dipotong</div>
          <div className="font-['Syne'] text-[30px] font-bold tracking-[-1px] leading-none text-[#B87333]">
            {fmtCurrency(stats.totalKasbonDipotong)}
          </div>
          <div className="text-[12px] text-[#A8A49E] mt-1.5">potongan kasbon langsung</div>
        </CardContent>
      </Card>
    </div>
  );
}

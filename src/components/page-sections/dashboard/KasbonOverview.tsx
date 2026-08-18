import { Link } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { fmtCurrency } from '@/lib/utils';

interface KasbonOverviewProps {
  kasbonStats: {
    totalKasbonAmt: number;
    countTransactions: number;
    unpaidKasbonAmt: number;
    deductedKasbonAmt: number;
  };
}

export function KasbonOverview({ kasbonStats }: KasbonOverviewProps) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-xs">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div>
          <div className="font-heading text-[14.5px] font-bold text-foreground">Kasbon Bulan Ini</div>
          <div className="text-[12px] text-muted-foreground mt-0.5">Pengambilan bulan ini</div>
        </div>
        <Link to="/admin/kasbon" className="text-[12.5px] text-[#3B82F6] font-medium hover:underline whitespace-nowrap">Log →</Link>
      </div>
      <div className="p-5">
        <div className="flex items-baseline gap-1.5 mb-1.5">
          <div className="font-heading text-[30px] font-bold tracking-tight text-[#FF5600]">
            {fmtCurrency(kasbonStats.totalKasbonAmt)}
          </div>
          <div className="text-[13px] text-muted-foreground font-mono">total</div>
        </div>
        <div className="text-[12.5px] text-muted-foreground mb-4">{kasbonStats.countTransactions} pengambilan aktif</div>
        <Progress 
          value={kasbonStats.totalKasbonAmt > 0 ? Math.round((kasbonStats.unpaidKasbonAmt / kasbonStats.totalKasbonAmt) * 100) : 0} 
          indicatorClassName="bg-[#FF5600]"
          className="h-2 rounded-full mb-4 bg-surface-soft"
        />
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-surface-soft rounded-xl p-3 border border-border/40">
            <div className="stat-title mb-1 text-xs">Belum dipotong</div>
            <div className="font-heading text-[17px] font-bold tracking-tight text-[#FF5600]">{fmtCurrency(kasbonStats.unpaidKasbonAmt)}</div>
          </div>
          <div className="bg-surface-soft rounded-xl p-3 border border-border/40">
            <div className="stat-title mb-1 text-xs">Sudah dipotong</div>
            <div className="font-heading text-[17px] font-bold tracking-tight text-[#10B981]">{fmtCurrency(kasbonStats.deductedKasbonAmt)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

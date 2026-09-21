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
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div>
          <div className="font-heading text-sm font-bold text-foreground">Kasbon Bulan Ini</div>
          <div className="text-xs text-muted-foreground mt-0.5">Pengambilan bulan ini</div>
        </div>
        <Link to="/admin/kasbon" className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline whitespace-nowrap">Log →</Link>
      </div>
      <div className="p-5">
        <div className="flex items-baseline gap-1.5 mb-1.5">
          <div className="font-mono text-2xl sm:text-3xl font-bold tracking-tight text-brand-orange tabular-nums">
            {fmtCurrency(kasbonStats.totalKasbonAmt)}
          </div>
          <div className="text-xs text-muted-foreground font-mono">total</div>
        </div>
        <div className="text-xs text-muted-foreground mb-4">{kasbonStats.countTransactions} pengambilan aktif</div>
        <Progress 
          value={kasbonStats.totalKasbonAmt > 0 ? Math.round((kasbonStats.unpaidKasbonAmt / kasbonStats.totalKasbonAmt) * 100) : 0} 
          indicatorClassName="bg-brand-accent"
          className="h-2 rounded-full mb-4 bg-surface-soft"
        />
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-surface-soft rounded-xl p-3 border border-border/60">
            <div className="stat-title mb-1 text-xs">Belum dipotong</div>
            <div className="font-mono text-base font-bold tracking-tight text-amber-600 dark:text-amber-400 tabular-nums">{fmtCurrency(kasbonStats.unpaidKasbonAmt)}</div>
          </div>
          <div className="bg-surface-soft rounded-xl p-3 border border-border/60">
            <div className="stat-title mb-1 text-xs">Sudah dipotong</div>
            <div className="font-mono text-base font-bold tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">{fmtCurrency(kasbonStats.deductedKasbonAmt)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

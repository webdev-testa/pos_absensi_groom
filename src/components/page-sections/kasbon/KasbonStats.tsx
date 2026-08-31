import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { fmtCurrency } from '@/lib/utils'

interface KasbonStatsProps {
  monthlyStats: {
    total: number
    unpaid: number
    settled: number
    uniqueEmps: number
    average: number
    pendingCount: number
    settledCount: number
    trxCount: number
  }
}

export function KasbonStats({ monthlyStats }: KasbonStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
      <Card className="rounded-xl shadow-xs border border-border bg-card">
        <CardContent className="p-[18px_20px]">
          <div className="stat-title mb-2">Total kasbon</div>
          <div className="font-mono text-2xl sm:text-3xl font-bold tracking-tight leading-none text-brand-orange tabular-nums">
            {fmtCurrency(monthlyStats.total)}
          </div>
          <div className="text-[12px] text-muted-foreground mt-1.5">dari {monthlyStats.uniqueEmps} staf</div>
          <Badge className="bg-surface-soft text-muted-foreground border border-border hover:bg-surface-soft shadow-none mt-2.5 font-semibold px-2.5 py-0.5 rounded-full text-[11px]">
            Bulan Terpilih
          </Badge>
        </CardContent>
      </Card>
      <Card className="rounded-xl shadow-xs border border-border bg-card">
        <CardContent className="p-[18px_20px]">
          <div className="stat-title mb-2">Belum dipotong</div>
          <div className="font-mono text-2xl sm:text-3xl font-bold tracking-tight leading-none text-amber-600 dark:text-amber-400 tabular-nums">
            {fmtCurrency(monthlyStats.unpaid)}
          </div>
          <div className="text-[12px] text-muted-foreground mt-1.5">{monthlyStats.pendingCount} transaksi pending</div>
          <Badge className="bg-amber-50 text-amber-900 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60 hover:bg-amber-50 shadow-none mt-2.5 font-semibold px-2.5 py-0.5 rounded-full text-[11px]">
            Akan dipotong gaji
          </Badge>
        </CardContent>
      </Card>
      <Card className="rounded-xl shadow-xs border border-border bg-card">
        <CardContent className="p-[18px_20px]">
          <div className="stat-title mb-2">Sudah dipotong</div>
          <div className="font-mono text-2xl sm:text-3xl font-bold tracking-tight leading-none text-emerald-600 dark:text-emerald-400 tabular-nums">
            {fmtCurrency(monthlyStats.settled)}
          </div>
          <div className="text-[12px] text-muted-foreground mt-1.5">{monthlyStats.settledCount} transaksi settled</div>
          <Badge className="bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60 hover:bg-emerald-50 shadow-none mt-2.5 font-semibold px-2.5 py-0.5 rounded-full text-[11px]">
            Lunas
          </Badge>
        </CardContent>
      </Card>
      <Card className="rounded-xl shadow-xs border border-border bg-card">
        <CardContent className="p-[18px_20px]">
          <div className="stat-title mb-2">Rata-rata per orang</div>
          <div className="font-mono text-2xl sm:text-3xl font-bold tracking-tight leading-none text-foreground tabular-nums">
            {fmtCurrency(monthlyStats.average)}
          </div>
          <div className="text-[12px] text-muted-foreground mt-1.5">per staf aktif</div>
          <Badge className="bg-surface-soft text-muted-foreground border border-border hover:bg-surface-soft shadow-none mt-2.5 font-semibold px-2.5 py-0.5 rounded-full text-[11px]">
            Statistik
          </Badge>
        </CardContent>
      </Card>
    </div>
  )
}

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
          <div className="font-heading text-[30px] font-bold tracking-tight leading-none text-[#FF5600]">
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
          <div className="font-heading text-[30px] font-bold tracking-tight leading-none text-[#F59E0B]">
            {fmtCurrency(monthlyStats.unpaid)}
          </div>
          <div className="text-[12px] text-muted-foreground mt-1.5">{monthlyStats.pendingCount} transaksi pending</div>
          <Badge className="bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] hover:bg-[#FEF3C7] shadow-none mt-2.5 font-semibold px-2.5 py-0.5 rounded-full text-[11px]">
            Akan dipotong gaji
          </Badge>
        </CardContent>
      </Card>
      <Card className="rounded-xl shadow-xs border border-border bg-card">
        <CardContent className="p-[18px_20px]">
          <div className="stat-title mb-2">Sudah dipotong</div>
          <div className="font-heading text-[30px] font-bold tracking-tight leading-none text-[#10B981]">
            {fmtCurrency(monthlyStats.settled)}
          </div>
          <div className="text-[12px] text-muted-foreground mt-1.5">{monthlyStats.settledCount} transaksi settled</div>
          <Badge className="bg-[#E6F7F0] text-[#065F46] border border-[#A7F3D0] hover:bg-[#E6F7F0] shadow-none mt-2.5 font-semibold px-2.5 py-0.5 rounded-full text-[11px]">
            Lunas
          </Badge>
        </CardContent>
      </Card>
      <Card className="rounded-xl shadow-xs border border-border bg-card">
        <CardContent className="p-[18px_20px]">
          <div className="stat-title mb-2">Rata-rata per orang</div>
          <div className="font-heading text-[30px] font-bold tracking-tight leading-none text-foreground">
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

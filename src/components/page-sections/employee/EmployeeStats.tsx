import { Card, CardContent } from '@/components/ui/card'
import { fmtCurrency } from '@/lib/utils'

interface EmployeeStatsProps {
  totalAktif: number
  totalNonaktif: number
  totalSalary: number
  topDept: [string, number] | undefined
}

export function EmployeeStats({ totalAktif, totalNonaktif, totalSalary, topDept }: EmployeeStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
      <Card className="rounded-xl shadow-xs border border-border bg-card">
        <CardContent className="p-[18px_20px]">
          <div className="stat-title mb-2">Total aktif</div>
          <div className="font-mono text-2xl sm:text-3xl font-bold tracking-tight leading-none text-[#10B981] tabular-nums">
            {totalAktif}
          </div>
          <div className="text-[12px] text-muted-foreground mt-1.5">staf aktif</div>
        </CardContent>
      </Card>
      <Card className="rounded-xl shadow-xs border border-border bg-card">
        <CardContent className="p-[18px_20px]">
          <div className="stat-title mb-2">Nonaktif</div>
          <div className="font-mono text-2xl sm:text-3xl font-bold tracking-tight leading-none text-muted-foreground tabular-nums">
            {totalNonaktif}
          </div>
          <div className="text-[12px] text-muted-foreground mt-1.5">diarsipkan</div>
        </CardContent>
      </Card>
      <Card className="rounded-xl shadow-xs border border-border bg-card">
        <CardContent className="p-[18px_20px]">
          <div className="stat-title mb-2">Total gaji pokok</div>
          <div className="font-mono text-2xl sm:text-3xl font-bold tracking-tight leading-none text-foreground tabular-nums">
            {fmtCurrency(totalSalary)}
          </div>
          <div className="text-[12px] text-muted-foreground mt-1.5">per bulan</div>
        </CardContent>
      </Card>
      <Card className="rounded-xl shadow-xs border border-border bg-card">
        <CardContent className="p-[18px_20px]">
          <div className="stat-title mb-2">Posisi terbanyak</div>
          <div className="font-heading text-[20px] font-bold tracking-tight leading-[28px] text-foreground truncate">
            {topDept?.[0] || '—'}
          </div>
          <div className="text-[12px] text-muted-foreground mt-1.5 font-mono">
            {topDept ? `${topDept[1]} orang` : '-'}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

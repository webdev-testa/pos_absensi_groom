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
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <Card className="rounded-[16px] shadow-sm border-[#C8E8F5]">
        <CardContent className="p-[18px_20px]">
          <div className="stat-title mb-2">Total kasbon</div>
          <div className="font-['Syne'] text-[26px] font-bold tracking-[-0.5px] leading-none text-[#F5A940]">
            {fmtCurrency(monthlyStats.total)}
          </div>
          <div className="text-[12px] text-[#8ABAC8] mt-1.5">dari {monthlyStats.uniqueEmps} karyawan</div>
          <Badge className="bg-[#FAF0E1] text-[#F5A940] hover:bg-[#FAF0E1] shadow-none mt-2 font-medium px-2 py-0.5 rounded-full text-[11px]">
            Bulan Terpilih
          </Badge>
        </CardContent>
      </Card>
      <Card className="rounded-[16px] shadow-sm border-[#C8E8F5]">
        <CardContent className="p-[18px_20px]">
          <div className="stat-title mb-2">Belum dipotong</div>
          <div className="font-['Syne'] text-[26px] font-bold tracking-[-0.5px] leading-none text-[#E89E3A]">
            {fmtCurrency(monthlyStats.unpaid)}
          </div>
          <div className="text-[12px] text-[#8ABAC8] mt-1.5">{monthlyStats.pendingCount} transaksi pending</div>
          <Badge className="bg-[#FAF0E1] text-[#E89E3A] hover:bg-[#FAF0E1] shadow-none mt-2 font-medium px-2 py-0.5 rounded-full text-[11px]">
            Akan dipotong gaji
          </Badge>
        </CardContent>
      </Card>
      <Card className="rounded-[16px] shadow-sm border-[#C8E8F5]">
        <CardContent className="p-[18px_20px]">
          <div className="stat-title mb-2">Sudah dipotong</div>
          <div className="font-['Syne'] text-[26px] font-bold tracking-[-0.5px] leading-none text-[#3AAD7A]">
            {fmtCurrency(monthlyStats.settled)}
          </div>
          <div className="text-[12px] text-[#8ABAC8] mt-1.5">{monthlyStats.settledCount} transaksi settled</div>
          <Badge className="bg-[#E2F0E8] text-[#3AAD7A] hover:bg-[#E2F0E8] shadow-none mt-2 font-medium px-2 py-0.5 rounded-full text-[11px]">
            Selesai
          </Badge>
        </CardContent>
      </Card>
      <Card className="rounded-[16px] shadow-sm border-[#C8E8F5]">
        <CardContent className="p-[18px_20px]">
          <div className="stat-title mb-2">Rata-rata per orang</div>
          <div className="font-['Syne'] text-[26px] font-bold tracking-[-0.5px] leading-none text-[#1A3A4A]">
            {fmtCurrency(monthlyStats.average)}
          </div>
          <div className="text-[12px] text-[#8ABAC8] mt-1.5">{monthlyStats.trxCount}x pengambilan</div>
          <Badge className="bg-[#F0FAFF] text-[#4A7A8A] hover:bg-[#F0FAFF] shadow-none mt-2 font-medium px-2 py-0.5 rounded-full text-[11px]">
            Rata-rata
          </Badge>
        </CardContent>
      </Card>
    </div>
  )
}

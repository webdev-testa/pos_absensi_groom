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
    <div className="grid grid-cols-4 gap-4 mb-7">
      <Card className="rounded-[16px] shadow-sm border-[#C8E8F5]">
        <CardContent className="p-[18px_20px]">
          <div className="stat-title mb-2">Total aktif</div>
          <div className="font-['Syne'] text-[30px] font-bold tracking-[-1px] leading-none text-[#3AAD7A]">
            {totalAktif}
          </div>
          <div className="text-[12px] text-[#8ABAC8] mt-1.5">karyawan aktif</div>
        </CardContent>
      </Card>
      <Card className="rounded-[16px] shadow-sm border-[#C8E8F5]">
        <CardContent className="p-[18px_20px]">
          <div className="stat-title mb-2">Nonaktif</div>
          <div className="font-['Syne'] text-[30px] font-bold tracking-[-1px] leading-none text-[#8ABAC8]">
            {totalNonaktif}
          </div>
          <div className="text-[12px] text-[#8ABAC8] mt-1.5">diarsipkan</div>
        </CardContent>
      </Card>
      <Card className="rounded-[16px] shadow-sm border-[#C8E8F5]">
        <CardContent className="p-[18px_20px]">
          <div className="stat-title mb-2">Total gaji pokok</div>
          <div className="font-['Syne'] text-[30px] font-bold tracking-[-1px] leading-none text-[#1A3A4A]">
            {fmtCurrency(totalSalary)}
          </div>
          <div className="text-[12px] text-[#8ABAC8] mt-1.5">per bulan</div>
        </CardContent>
      </Card>
      <Card className="rounded-[16px] shadow-sm border-[#C8E8F5]">
        <CardContent className="p-[18px_20px]">
          <div className="stat-title mb-2">Divisi terbanyak</div>
          <div className="font-['Syne'] text-[22px] font-bold tracking-[-0.5px] leading-[30px] text-[#1A3A4A]">
            {topDept?.[0] || '—'}
          </div>
          <div className="text-[12px] text-[#8ABAC8] mt-1.5">
            {topDept ? `${topDept[1]} orang` : '-'}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { KasbonStatus } from '@/types/kasbon'

interface KasbonFiltersProps {
  searchQ: string
  onSearchChange: (val: string) => void
  statusFilter: 'all' | KasbonStatus
  onStatusFilterChange: (val: 'all' | KasbonStatus) => void
  monthFilter: string
  onMonthFilterChange: (val: string) => void
  monthsList: { val: string; label: string }[]
  tabFilter: 'all' | 'minggu' | 'hari'
  onTabFilterChange: (val: 'all' | 'minggu' | 'hari') => void
}

export function KasbonFilters({
  searchQ,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  monthFilter,
  onMonthFilterChange,
  monthsList,
  tabFilter,
  onTabFilterChange,
}: KasbonFiltersProps) {
  return (
    <div className="flex items-center gap-3 mb-5 flex-wrap">
      <div className="relative flex-1 min-w-[200px] max-w-[320px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8ABAC8]" />
        <Input 
          className="pl-9 bg-white border-[#C8E8F5] rounded-[10px] text-[13px] h-[38px] placeholder:text-[#8ABAC8]" 
          placeholder="Cari karyawan..." 
          value={searchQ} 
          onChange={e => onSearchChange(e.target.value)} 
        />
      </div>

      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger className="w-[160px] bg-white border-[#C8E8F5] rounded-[10px] h-[38px] text-[13px]">
          <SelectValue placeholder="Semua status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua status</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="approved">Approved</SelectItem>
          <SelectItem value="deducted">Sudah dipotong</SelectItem>
          <SelectItem value="rejected">Ditolak</SelectItem>
        </SelectContent>
      </Select>

      <Select value={monthFilter} onValueChange={onMonthFilterChange}>
        <SelectTrigger className="w-[180px] bg-white border-[#C8E8F5] rounded-[10px] h-[38px] text-[13px]">
          <SelectValue placeholder="Pilih bulan" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Bulan</SelectItem>
          {monthsList.map(m => (
            <SelectItem key={m.val} value={m.val}>{m.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex gap-1 bg-[#F0FAFF] border border-[#C8E8F5] rounded-[10px] p-1 ml-auto">
        {(['all', 'minggu', 'hari'] as const).map(t => (
          <button
            key={t}
            type="button"
            className={`px-3.5 py-1.5 rounded-[7px] text-[12.5px] transition-all font-sans border-none bg-none cursor-pointer ${
              tabFilter === t 
                ? 'bg-white text-[#1A3A4A] font-medium shadow-[0_1px_3px_rgba(0,0,0,0.08)]' 
                : 'text-[#4A7A8A] hover:bg-[#E4F4FD]'
            }`}
            onClick={() => onTabFilterChange(t)}
          >
            {t === 'all' ? 'Semua' : t === 'minggu' ? 'Minggu ini' : 'Hari ini'}
          </button>
        ))}
      </div>
    </div>
  )
}

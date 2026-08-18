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
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
        <Input 
          className="pl-9 bg-card border-border rounded-lg text-[13px] h-[38px] text-foreground placeholder:text-muted-foreground/50 shadow-xs" 
          placeholder="Cari nama atau ID staf..." 
          value={searchQ} 
          onChange={e => onSearchChange(e.target.value)} 
        />
      </div>

      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger className="w-[160px] bg-card border-border rounded-lg h-[38px] text-[13px] text-foreground shadow-xs">
          <SelectValue placeholder="Semua status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua status</SelectItem>
          <SelectItem value="pending">⏳ Pending</SelectItem>
          <SelectItem value="approved">✓ Approved</SelectItem>
          <SelectItem value="deducted">Dipotong</SelectItem>
          <SelectItem value="rejected">✕ Ditolak</SelectItem>
        </SelectContent>
      </Select>

      <Select value={monthFilter} onValueChange={onMonthFilterChange}>
        <SelectTrigger className="w-[180px] bg-card border-border rounded-lg h-[38px] text-[13px] text-foreground shadow-xs">
          <SelectValue placeholder="Pilih bulan" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Bulan</SelectItem>
          {monthsList.map(m => (
            <SelectItem key={m.val} value={m.val}>{m.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex gap-[3px] bg-card border border-border rounded-lg p-[3px] shadow-xs">
        <button
          type="button"
          className={`px-3.5 py-1.5 rounded-md text-[12.5px] transition-all font-sans border-none cursor-pointer ${
            tabFilter === 'all' 
              ? 'bg-primary text-primary-foreground font-semibold shadow-xs' 
              : 'text-muted-foreground hover:text-foreground hover:bg-surface-soft'
          }`}
          onClick={() => onTabFilterChange('all')}
        >
          Semua
        </button>
        <button
          type="button"
          className={`px-3.5 py-1.5 rounded-md text-[12.5px] transition-all font-sans border-none cursor-pointer ${
            tabFilter === 'minggu' 
              ? 'bg-primary text-primary-foreground font-semibold shadow-xs' 
              : 'text-muted-foreground hover:text-foreground hover:bg-surface-soft'
          }`}
          onClick={() => onTabFilterChange('minggu')}
        >
          Minggu ini
        </button>
        <button
          type="button"
          className={`px-3.5 py-1.5 rounded-md text-[12.5px] transition-all font-sans border-none cursor-pointer ${
            tabFilter === 'hari' 
              ? 'bg-primary text-primary-foreground font-semibold shadow-xs' 
              : 'text-muted-foreground hover:text-foreground hover:bg-surface-soft'
          }`}
          onClick={() => onTabFilterChange('hari')}
        >
          Hari ini
        </button>
      </div>
    </div>
  )
}

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface EmployeeFiltersProps {
  searchQ: string
  onSearchChange: (val: string) => void
  deptFilter: string
  onDeptFilterChange: (val: string) => void
  departments: string[]
  statusFilter: 'active' | 'inactive' | 'all'
  onStatusFilterChange: (val: 'active' | 'inactive' | 'all') => void
}

export function EmployeeFilters({
  searchQ,
  onSearchChange,
  deptFilter,
  onDeptFilterChange,
  departments,
  statusFilter,
  onStatusFilterChange,
}: EmployeeFiltersProps) {
  return (
    <div className="flex items-center gap-2.5 mb-[18px] flex-wrap">
      <div className="relative flex-1 min-w-[200px] max-w-[300px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
        <Input 
          className="pl-9 bg-card border-border rounded-xl text-sm h-10 text-foreground placeholder:text-muted-foreground/50 shadow-xs" 
          placeholder="Cari nama atau ID..." 
          value={searchQ} 
          onChange={e => onSearchChange(e.target.value)} 
        />
      </div>
      
      <Select value={deptFilter} onValueChange={onDeptFilterChange}>
        <SelectTrigger className="w-[160px] bg-card border-border rounded-xl h-10 text-sm text-foreground shadow-xs">
          <SelectValue placeholder="Pilih divisi" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua divisi</SelectItem>
          {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
        </SelectContent>
      </Select>

      <div className="flex gap-[3px] bg-card border border-border rounded-xl p-[3px] shadow-xs">
        {(['active', 'inactive', 'all'] as const).map(s => (
          <button
            key={s}
            type="button"
            className={`px-3.5 py-1.5 rounded-lg text-xs transition-all font-sans border-none cursor-pointer ${
              statusFilter === s 
                ? 'bg-primary text-primary-foreground font-semibold shadow-xs' 
                : 'text-muted-foreground hover:text-foreground hover:bg-surface-soft'
            }`}
            onClick={() => onStatusFilterChange(s)}
          >
            {s === 'all' ? 'Semua' : s === 'active' ? 'Aktif' : 'Nonaktif'}
          </button>
        ))}
      </div>
    </div>
  )
}

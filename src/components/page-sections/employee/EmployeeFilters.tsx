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
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8ABAC8]" />
        <Input 
          className="pl-9 bg-white border-[#C8E8F5] rounded-[10px] text-[13px] h-[38px] placeholder:text-[#8ABAC8]" 
          placeholder="Cari nama atau ID..." 
          value={searchQ} 
          onChange={e => onSearchChange(e.target.value)} 
        />
      </div>
      
      <Select value={deptFilter} onValueChange={onDeptFilterChange}>
        <SelectTrigger className="w-[160px] bg-white border-[#C8E8F5] rounded-[10px] h-[38px] text-[13px]">
          <SelectValue placeholder="Pilih divisi" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua divisi</SelectItem>
          {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
        </SelectContent>
      </Select>

      <div className="flex gap-[3px] bg-white border border-[#C8E8F5] rounded-[10px] p-[3px]">
        {(['active', 'inactive', 'all'] as const).map(s => (
          <button
            key={s}
            type="button"
            className={`px-3.5 py-1.5 rounded-[7px] text-[12.5px] transition-all font-sans border-none bg-none cursor-pointer ${
              statusFilter === s 
                ? 'bg-[#0D2D3D] text-white font-medium' 
                : 'text-[#4A7A8A] hover:bg-[#F0FAFF]'
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

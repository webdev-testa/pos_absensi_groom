import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { fmtCurrency, fmtDate } from '@/lib/utils'
import { AV_COLORS, getInitials } from '@/utils/helpers'
import type { Employee } from '@/types'
import { Download, Plus } from 'lucide-react'

interface EmployeeTableProps {
  employees: Employee[]
  filtered: Employee[]
  selectedId: string | null
  statusFilter: 'active' | 'inactive' | 'all'
  onSelect: (id: string) => void
  onEdit: (emp: Employee) => void
  onToggleStatus: (emp: Employee) => void
  loading: boolean
  onAddClick: () => void
  onExportClick: () => void
}

export function EmployeeTable({
  employees,
  filtered,
  selectedId,
  statusFilter: _statusFilter,
  onSelect,
  onEdit,
  onToggleStatus,
  loading,
  onAddClick,
  onExportClick,
}: EmployeeTableProps) {
  return (
    <Card className="rounded-xl border border-border shadow-xs overflow-hidden bg-card">
      <div className="p-4 px-5 border-b border-border flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="font-heading text-[15px] font-bold text-foreground">
            Daftar Staf Klinik
          </div>
          <div className="text-[12px] text-muted-foreground mt-0.5">Klik baris untuk melihat profil lengkap</div>
        </div>
        <div className="flex gap-2.5">
          <Button 
            variant="outline" 
            className="border-border text-muted-foreground hover:text-foreground hover:bg-surface-soft h-[38px] cursor-pointer" 
            onClick={onExportClick}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button 
            className="bg-primary hover:bg-primary/90 text-primary-foreground border-none h-[38px] font-semibold cursor-pointer shadow-xs" 
            onClick={onAddClick}
          >
            <Plus className="w-4 h-4 mr-2" strokeWidth={2.5} />
            Tambah Karyawan
          </Button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-10 text-center text-muted-foreground text-sm">Memuat data staf...</div>
        ) : (
          <Table>
            <TableHeader className="bg-surface-soft">
              <TableRow className="border-b border-border hover:bg-transparent">
                <TableHead className="h-auto py-3 px-4 font-mono text-[11px] text-muted-foreground font-semibold tracking-wider uppercase whitespace-nowrap">Staf</TableHead>
                <TableHead className="h-auto py-3 px-4 font-mono text-[11px] text-muted-foreground font-semibold tracking-wider uppercase whitespace-nowrap">Posisi</TableHead>
                <TableHead className="h-auto py-3 px-4 font-mono text-[11px] text-muted-foreground font-semibold tracking-wider uppercase whitespace-nowrap">Email</TableHead>
                <TableHead className="h-auto py-3 px-4 font-mono text-[11px] text-muted-foreground font-semibold tracking-wider uppercase whitespace-nowrap">Gaji Pokok</TableHead>
                <TableHead className="h-auto py-3 px-4 font-mono text-[11px] text-muted-foreground font-semibold tracking-wider uppercase whitespace-nowrap">Tgl Bergabung</TableHead>
                <TableHead className="h-auto py-3 px-4 font-mono text-[11px] text-muted-foreground font-semibold tracking-wider uppercase whitespace-nowrap">Status</TableHead>
                <TableHead className="h-auto py-3 px-4"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((emp) => {
                const globalIdx = employees.indexOf(emp)
                const c = AV_COLORS[globalIdx % AV_COLORS.length]
                const isActive = selectedId === emp.id
                
                return (
                  <TableRow 
                    key={emp.id} 
                    className={`cursor-pointer border-b border-border/60 last:border-none transition-colors ${isActive ? 'bg-[#E6F7F0]/40' : 'hover:bg-surface-soft/60'}`}
                    onClick={() => onSelect(emp.id)}
                  >
                    <TableCell className="p-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <Avatar 
                          className="w-[34px] h-[34px] rounded-full shrink-0 flex items-center justify-center font-heading text-[12px] font-bold" 
                          style={{ backgroundColor: c.bg, color: c.fg }}
                        >
                          <AvatarFallback className="bg-transparent">{getInitials(emp.name || '?')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-[13.5px] text-foreground">{emp.name}</div>
                          <div className="text-[11px] text-muted-foreground font-mono">{emp.emp_id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="p-3 px-4">
                      <span className="text-[12.5px] text-foreground font-medium block">{emp.dept}</span>
                      <span className="text-[11px] text-muted-foreground">{emp.jabatan || (emp.role === 'admin' ? 'Admin' : 'Staff')}</span>
                    </TableCell>
                    <TableCell className="p-3 px-4">
                      <span className="font-mono text-[12px] text-muted-foreground">{emp.email}</span>
                    </TableCell>
                    <TableCell className="p-3 px-4">
                      <span className="font-mono text-[12.5px] text-foreground font-semibold">{fmtCurrency(emp.salary)}</span>
                    </TableCell>
                    <TableCell className="p-3 px-4">
                      <span className="text-[12.5px] text-muted-foreground">{fmtDate(emp.joined)}</span>
                    </TableCell>
                    <TableCell className="p-3 px-4">
                      {emp.status === 'active' ? (
                        <Badge className="bg-[#E6F7F0] text-[#065F46] border border-[#A7F3D0] hover:bg-[#E6F7F0] shadow-none font-semibold px-2.5 py-0.5 rounded-full text-[11.5px]">
                          ● Aktif
                        </Badge>
                      ) : (
                        <Badge className="bg-surface-soft text-muted-foreground border border-border hover:bg-surface-soft shadow-none font-semibold px-2.5 py-0.5 rounded-full text-[11.5px]">
                          ○ Nonaktif
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="p-3 px-4">
                      <div className="flex gap-1.5" onClick={e => e.stopPropagation()}>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-7 text-xs px-2.5 rounded-md border-border text-muted-foreground hover:text-foreground hover:bg-surface-soft cursor-pointer shadow-xs" 
                          onClick={() => onEdit(emp)}
                        >
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-7 text-xs px-2.5 rounded-md border-border text-muted-foreground hover:bg-[#FEE2E2] hover:border-[#FECACA] hover:text-[#991B1B] cursor-pointer shadow-xs" 
                          onClick={() => onToggleStatus(emp)}
                        >
                          {emp.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="p-10 text-center text-muted-foreground">
                    Tidak ada data staf
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </Card>
  )
}

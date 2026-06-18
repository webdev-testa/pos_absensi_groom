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
    <Card className="rounded-[16px] border-[#C8E8F5] shadow-sm overflow-hidden bg-white">
      <div className="p-4 px-5 border-b border-[#C8E8F5] flex items-center justify-between">
        <div>
          <div className="font-['Syne'] text-[15px] font-semibold text-[#1A3A4A]">
            Karyawan
          </div>
          <div className="text-[12px] text-[#8ABAC8] mt-0.5">Klik baris untuk lihat detail</div>
        </div>
        <div className="flex gap-2.5">
          <Button 
            variant="outline" 
            className="border-[#C8E8F5] text-[#4A7A8A] hover:text-[#1A3A4A] hover:bg-[#F0FAFF]" 
            onClick={onExportClick}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button 
            className="bg-[#F5A940] hover:bg-[#b03d24] text-white border-none" 
            onClick={onAddClick}
          >
            <Plus className="w-4 h-4 mr-2" strokeWidth={2.5} />
            Tambah Karyawan
          </Button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-10 text-center text-[#8ABAC8] text-sm">Memuat data...</div>
        ) : (
          <Table>
            <TableHeader className="bg-[#E4F4FD]">
              <TableRow className="border-none hover:bg-transparent">
                <TableHead className="h-auto py-3 px-4 font-mono text-[10.5px] text-[#8ABAC8] font-normal tracking-[0.8px] uppercase whitespace-nowrap">Karyawan</TableHead>
                <TableHead className="h-auto py-3 px-4 font-mono text-[10.5px] text-[#8ABAC8] font-normal tracking-[0.8px] uppercase whitespace-nowrap">Divisi</TableHead>
                <TableHead className="h-auto py-3 px-4 font-mono text-[10.5px] text-[#8ABAC8] font-normal tracking-[0.8px] uppercase whitespace-nowrap">Email</TableHead>
                <TableHead className="h-auto py-3 px-4 font-mono text-[10.5px] text-[#8ABAC8] font-normal tracking-[0.8px] uppercase whitespace-nowrap">Gaji pokok</TableHead>
                <TableHead className="h-auto py-3 px-4 font-mono text-[10.5px] text-[#8ABAC8] font-normal tracking-[0.8px] uppercase whitespace-nowrap">Tgl Bergabung</TableHead>
                <TableHead className="h-auto py-3 px-4 font-mono text-[10.5px] text-[#8ABAC8] font-normal tracking-[0.8px] uppercase whitespace-nowrap">Status</TableHead>
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
                    className={`cursor-pointer border-b border-[#C8E8F5] last:border-none transition-colors ${isActive ? 'bg-[#F0F7F3]' : 'hover:bg-[#FAFAF8]'}`}
                    onClick={() => onSelect(emp.id)}
                  >
                    <TableCell className="p-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <Avatar 
                          className="w-[34px] h-[34px] rounded-full shrink-0 flex items-center justify-center font-['Syne'] text-[12px] font-bold" 
                          style={{ backgroundColor: c.bg, color: c.fg }}
                        >
                          <AvatarFallback className="bg-transparent">{getInitials(emp.name || '?')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-[13.5px] text-[#1A3A4A]">{emp.name}</div>
                          <div className="text-[11px] text-[#8ABAC8] font-mono">{emp.emp_id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="p-3 px-4">
                      <span className="text-[12.5px] text-[#4A7A8A] block">{emp.dept}</span>
                      <span className="text-[11px] text-[#8ABAC8]">{emp.jabatan || (emp.role === 'admin' ? 'Admin' : 'Staff')}</span>
                    </TableCell>
                    <TableCell className="p-3 px-4">
                      <span className="font-mono text-[12px] text-[#1A3A4A]">{emp.email}</span>
                    </TableCell>
                    <TableCell className="p-3 px-4">
                      <span className="font-mono text-[12.5px] text-[#1A3A4A]">{fmtCurrency(emp.salary)}</span>
                    </TableCell>
                    <TableCell className="p-3 px-4">
                      <span className="text-[12.5px] text-[#4A7A8A]">{fmtDate(emp.joined)}</span>
                    </TableCell>
                    <TableCell className="p-3 px-4">
                      {emp.status === 'active' ? (
                        <Badge className="bg-[#E2F0E8] text-[#3AAD7A] hover:bg-[#E2F0E8] shadow-none font-medium px-2 py-0.5 rounded-full text-[11px]">
                          ● Aktif
                        </Badge>
                      ) : (
                        <Badge className="bg-[#E4F4FD] text-[#8ABAC8] hover:bg-[#E4F4FD] shadow-none font-medium px-2 py-0.5 rounded-full text-[11px]">
                          ○ Nonaktif
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="p-3 px-4">
                      <div className="flex gap-1.5" onClick={e => e.stopPropagation()}>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-7 text-xs px-2.5 rounded-[7px] border-[#C8E8F5] text-[#4A7A8A] hover:text-[#1A3A4A]" 
                          onClick={() => onEdit(emp)}
                        >
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-7 text-xs px-2.5 rounded-[7px] border-[#C8E8F5] text-[#F5A940] hover:bg-[#F5E8E4] hover:border-[#e8b4aa] hover:text-[#F5A940]" 
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
                  <TableCell colSpan={7} className="p-10 text-center text-[#8ABAC8]">
                    Tidak ada data
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

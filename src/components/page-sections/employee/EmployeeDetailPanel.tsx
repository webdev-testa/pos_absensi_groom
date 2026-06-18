import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Info } from 'lucide-react'
import { fmtCurrency, fmtDate } from '@/lib/utils'
import { AV_COLORS, getInitials } from '@/utils/helpers'
import type { Employee } from '@/types'

interface EmployeeDetailPanelProps {
  selectedEmployee: Employee | null
  selectedIdx: number
  onEdit: (emp: Employee) => void
  onShowAttendance: (name: string) => void
  onShowKasbon: (name: string) => void
}

export function EmployeeDetailPanel({
  selectedEmployee,
  selectedIdx,
  onEdit,
  onShowAttendance,
  onShowKasbon,
}: EmployeeDetailPanelProps) {
  return (
    <div className="sticky top-5">
      {selectedEmployee ? (() => {
        const c = AV_COLORS[selectedIdx % AV_COLORS.length]
        const kasbonPct = selectedEmployee.kasbon_limit
          ? Math.round(((selectedEmployee.kasbon_used || 0) / selectedEmployee.kasbon_limit) * 100)
          : 0
        const absenPct = Math.round(((selectedEmployee.absen || 0) / 26) * 100)

        return (
          <Card className="rounded-[16px] border-[#C8E8F5] shadow-sm overflow-hidden bg-white">
            <div className="bg-[#0D2D3D] p-6">
              <div className="flex items-center gap-3.5 mb-4">
                <Avatar 
                  className="w-[52px] h-[52px] rounded-full shrink-0 flex items-center justify-center font-['Syne'] text-[18px] font-bold" 
                  style={{ backgroundColor: c.bg, color: c.fg }}
                >
                  <AvatarFallback className="bg-transparent">{getInitials(selectedEmployee.name || '?')}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="font-['Syne'] text-[17px] font-bold text-white truncate">{selectedEmployee.name}</div>
                  <div className="text-[12px] text-white/40 font-mono mt-0.5 truncate">
                    {selectedEmployee.emp_id} · {selectedEmployee.dept}
                  </div>
                </div>
                <div className="ml-auto shrink-0">
                  {selectedEmployee.status === 'active' ? (
                    <Badge className="bg-[#E2F0E8] text-[#3AAD7A] hover:bg-[#E2F0E8] shadow-none font-medium px-2 py-0.5 rounded-full text-[11px]">
                      Aktif
                    </Badge>
                  ) : (
                    <Badge className="bg-white/10 text-[#8ABAC8] hover:bg-white/10 shadow-none font-medium px-2 py-0.5 rounded-full text-[11px]">
                      Nonaktif
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-[1px] bg-white/10 rounded-lg overflow-hidden">
                <div className="bg-white/5 p-2.5 text-center">
                  <div className="font-['Syne'] text-[16px] font-bold text-white">{selectedEmployee.absen || 0}</div>
                  <div className="text-[10px] text-white/35 uppercase tracking-[0.5px] font-mono mt-1">Hari hadir</div>
                </div>
                <div className="bg-white/5 p-2.5 text-center">
                  <div className="font-['Syne'] text-[16px] font-bold text-white">{fmtCurrency(selectedEmployee.kasbon_used || 0)}</div>
                  <div className="text-[10px] text-white/35 uppercase tracking-[0.5px] font-mono mt-1">Kasbon</div>
                </div>
                <div className="bg-white/5 p-2.5 text-center">
                  <div className="font-['Syne'] text-[16px] font-bold text-white">{fmtCurrency(selectedEmployee.salary)}</div>
                  <div className="text-[10px] text-white/35 uppercase tracking-[0.5px] font-mono mt-1">Gaji pokok</div>
                </div>
              </div>
            </div>

            <div className="p-5">
              <div className="mb-5 last:mb-0">
                <div className="text-[11px] text-[#8ABAC8] uppercase tracking-[0.8px] font-mono mb-2.5">Info pekerjaan</div>
                <div className="flex justify-between items-center py-1.5 border-b border-[#C8E8F5] last:border-none text-[13px]">
                  <span className="text-[#4A7A8A]">Hak Akses</span>
                  <span className="font-medium text-[#1A3A4A] uppercase text-[11px]">{selectedEmployee.role}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-[#C8E8F5] last:border-none text-[13px]">
                  <span className="text-[#4A7A8A]">Jabatan</span>
                  <span className="font-medium text-[#1A3A4A] truncate max-w-[180px]">{selectedEmployee.jabatan || '—'}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-[#C8E8F5] last:border-none text-[13px]">
                  <span className="text-[#4A7A8A]">Jam kerja</span>
                  <span className="font-medium text-[#1A3A4A] font-mono">{selectedEmployee.shift}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-[#C8E8F5] last:border-none text-[13px]">
                  <span className="text-[#4A7A8A]">Bergabung</span>
                  <span className="font-medium text-[#1A3A4A]">{fmtDate(selectedEmployee.joined)}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-[#C8E8F5] last:border-none text-[13px]">
                  <span className="text-[#4A7A8A]">Batas kasbon</span>
                  <span className="font-medium text-[#1A3A4A] font-mono">{fmtCurrency(selectedEmployee.kasbon_limit)}/bln</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-[#C8E8F5] last:border-none text-[13px]">
                  <span className="text-[#4A7A8A]">Slip terakhir</span>
                  <span className="font-medium text-[#1A3A4A]">{selectedEmployee.last_slip || '—'}</span>
                </div>
              </div>

              <div className="mb-5 last:mb-0">
                <div className="text-[11px] text-[#8ABAC8] uppercase tracking-[0.8px] font-mono mb-2.5">Kontak</div>
                <div className="flex justify-between items-center py-1.5 border-b border-[#C8E8F5] last:border-none text-[13px]">
                  <span className="text-[#4A7A8A]">Email</span>
                  <span className="font-medium text-[#1A3A4A] font-mono text-[12px] truncate max-w-[180px]">
                    {selectedEmployee.email}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-[#C8E8F5] last:border-none text-[13px]">
                  <span className="text-[#4A7A8A]">No. HP</span>
                  <span className="font-medium text-[#1A3A4A] font-mono text-[12px]">{selectedEmployee.phone}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-[#C8E8F5] last:border-none text-[13px]">
                  <span className="text-[#4A7A8A]">Alamat</span>
                  <span className="font-medium text-[#1A3A4A] text-[12px] text-right max-w-[180px] line-clamp-2">
                    {selectedEmployee.address}
                  </span>
                </div>
              </div>

              <div className="mb-5 last:mb-0">
                <div className="text-[11px] text-[#8ABAC8] uppercase tracking-[0.8px] font-mono mb-2.5">Bulan ini</div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <div className="text-[12px] text-[#4A7A8A] w-20">Kehadiran</div>
                    <div className="flex-1 bg-[#E4F4FD] h-[5px] rounded-full overflow-hidden">
                      <div className="h-full bg-[#3AAD7A] rounded-full" style={{ width: `${absenPct}%` }} />
                    </div>
                    <div className="font-mono text-[11px] text-[#8ABAC8] w-7 text-right">{absenPct}%</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-[12px] text-[#4A7A8A] w-20">Kasbon</div>
                    <div className="flex-1 bg-[#E4F4FD] h-[5px] rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full" 
                        style={{ 
                          width: `${Math.min(kasbonPct, 100)}%`, 
                          backgroundColor: kasbonPct > 80 ? '#F5A940' : '#B87333' 
                        }} 
                      />
                    </div>
                    <div className="font-mono text-[11px] text-[#8ABAC8] w-7 text-right">{kasbonPct}%</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 px-5 border-t border-[#C8E8F5] flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1 text-[13px] border-[#C8E8F5] text-[#4A7A8A] hover:bg-[#E4F4FD] hover:text-[#1A3A4A]" 
                onClick={() => onShowAttendance(selectedEmployee.name)}
              >
                Absensi
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 text-[13px] border-[#C8E8F5] text-[#4A7A8A] hover:bg-[#E4F4FD] hover:text-[#1A3A4A]" 
                onClick={() => onShowKasbon(selectedEmployee.name)}
              >
                Kasbon
              </Button>
              <Button 
                className="flex-1 text-[13px] bg-[#0D2D3D] text-white hover:bg-[#2a2620]" 
                onClick={() => onEdit(selectedEmployee)}
              >
                Edit data
              </Button>
            </div>
          </Card>
        )
      })() : (
        <Card className="rounded-[16px] border-[#C8E8F5] shadow-sm bg-white p-10 text-center text-[#8ABAC8] flex flex-col items-center justify-center">
          <Info className="w-10 h-10 mb-3 opacity-30" />
          <div className="text-[13.5px] font-medium text-[#4A7A8A] mb-1">Detail Karyawan</div>
          <div className="text-[12.5px]">Klik nama karyawan<br />untuk lihat profil lengkap</div>
        </Card>
      )}
    </div>
  )
}

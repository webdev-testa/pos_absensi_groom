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
          <Card className="rounded-xl border border-border shadow-xs overflow-hidden bg-card">
            <div className="bg-primary p-6">
              <div className="flex items-center gap-3.5 mb-4">
                <Avatar 
                  className="w-[52px] h-[52px] rounded-full shrink-0 flex items-center justify-center font-heading text-[18px] font-bold" 
                  style={{ backgroundColor: c.bg, color: c.fg }}
                >
                  <AvatarFallback className="bg-transparent text-white font-bold">{getInitials(selectedEmployee.name || '?')}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="font-heading text-[17px] font-bold text-white truncate">{selectedEmployee.name}</div>
                  <div className="text-[12px] text-white/50 font-mono mt-0.5 truncate">
                    {selectedEmployee.emp_id} · {selectedEmployee.dept}
                  </div>
                </div>
                <div className="ml-auto shrink-0">
                  {selectedEmployee.status === 'active' ? (
                    <Badge className="bg-[#E6F7F0] text-[#065F46] border border-[#A7F3D0] hover:bg-[#E6F7F0] shadow-none font-semibold px-2.5 py-0.5 rounded-full text-[11px]">
                      Aktif
                    </Badge>
                  ) : (
                    <Badge className="bg-white/10 text-white/70 border border-white/20 hover:bg-white/10 shadow-none font-semibold px-2.5 py-0.5 rounded-full text-[11px]">
                      Nonaktif
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-1 bg-white/10 rounded-lg overflow-hidden p-1">
                <div className="bg-white/5 p-2 text-center rounded-md">
                  <div className="font-heading text-[16px] font-bold text-white">{selectedEmployee.absen || 0}</div>
                  <div className="text-[10px] text-white/50 uppercase tracking-wider font-mono mt-0.5">Hari hadir</div>
                </div>
                <div className="bg-white/5 p-2 text-center rounded-md">
                  <div className="font-mono text-[14px] font-bold text-[#FF5600]">{fmtCurrency(selectedEmployee.kasbon_used || 0)}</div>
                  <div className="text-[10px] text-white/50 uppercase tracking-wider font-mono mt-0.5">Kasbon</div>
                </div>
                <div className="bg-white/5 p-2 text-center rounded-md">
                  <div className="font-mono text-[14px] font-bold text-white">{fmtCurrency(selectedEmployee.salary)}</div>
                  <div className="text-[10px] text-white/50 uppercase tracking-wider font-mono mt-0.5">Gaji pokok</div>
                </div>
              </div>
            </div>

            <div className="p-5">
              <div className="mb-5 last:mb-0">
                <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-mono font-semibold mb-2.5">Info pekerjaan</div>
                <div className="flex justify-between items-center py-1.5 border-b border-border/60 last:border-none text-[13px]">
                  <span className="text-muted-foreground">Hak Akses</span>
                  <span className="font-semibold text-foreground uppercase text-[11px]">{selectedEmployee.role}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-border/60 last:border-none text-[13px]">
                  <span className="text-muted-foreground">Jabatan</span>
                  <span className="font-medium text-foreground truncate max-w-[180px]">{selectedEmployee.jabatan || '—'}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-border/60 last:border-none text-[13px]">
                  <span className="text-muted-foreground">Jam kerja</span>
                  <span className="font-medium text-foreground font-mono">{selectedEmployee.shift}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-border/60 last:border-none text-[13px]">
                  <span className="text-muted-foreground">Bergabung</span>
                  <span className="font-medium text-foreground">{fmtDate(selectedEmployee.joined)}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-border/60 last:border-none text-[13px]">
                  <span className="text-muted-foreground">Batas kasbon</span>
                  <span className="font-medium text-foreground font-mono">{fmtCurrency(selectedEmployee.kasbon_limit)}/bln</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-border/60 last:border-none text-[13px]">
                  <span className="text-muted-foreground">Slip terakhir</span>
                  <span className="font-medium text-foreground">{selectedEmployee.last_slip || '—'}</span>
                </div>
              </div>

              <div className="mb-5 last:mb-0">
                <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-mono font-semibold mb-2.5">Kontak</div>
                <div className="flex justify-between items-center py-1.5 border-b border-border/60 last:border-none text-[13px]">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium text-foreground font-mono text-[12px] truncate max-w-[180px]">
                    {selectedEmployee.email}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-border/60 last:border-none text-[13px]">
                  <span className="text-muted-foreground">No. HP</span>
                  <span className="font-medium text-foreground font-mono text-[12px]">{selectedEmployee.phone}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-border/60 last:border-none text-[13px]">
                  <span className="text-muted-foreground">Alamat</span>
                  <span className="font-medium text-foreground text-[12px] text-right max-w-[180px] line-clamp-2">
                    {selectedEmployee.address}
                  </span>
                </div>
              </div>

              <div className="mb-5 last:mb-0">
                <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-mono font-semibold mb-2.5">Bulan ini</div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div className="text-[12px] text-muted-foreground w-20">Kehadiran</div>
                    <div className="flex-1 bg-surface-soft h-1.5 rounded-full overflow-hidden border border-border/40">
                      <div className="h-full bg-[#10B981] rounded-full" style={{ width: `${absenPct}%` }} />
                    </div>
                    <div className="font-mono text-[11px] text-muted-foreground w-7 text-right">{absenPct}%</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-[12px] text-muted-foreground w-20">Kasbon</div>
                    <div className="flex-1 bg-surface-soft h-1.5 rounded-full overflow-hidden border border-border/40">
                      <div 
                        className="h-full rounded-full" 
                        style={{ 
                          width: `${Math.min(kasbonPct, 100)}%`, 
                          backgroundColor: kasbonPct > 80 ? '#EF4444' : '#F59E0B' 
                        }} 
                      />
                    </div>
                    <div className="font-mono text-[11px] text-muted-foreground w-7 text-right">{kasbonPct}%</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 px-5 border-t border-border flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1 text-[13px] border-border text-muted-foreground hover:bg-surface-soft hover:text-foreground cursor-pointer shadow-xs" 
                onClick={() => onShowAttendance(selectedEmployee.name)}
              >
                Absensi
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 text-[13px] border-border text-muted-foreground hover:bg-surface-soft hover:text-foreground cursor-pointer shadow-xs" 
                onClick={() => onShowKasbon(selectedEmployee.name)}
              >
                Kasbon
              </Button>
              <Button 
                className="flex-1 text-[13px] bg-primary text-primary-foreground hover:bg-primary/90 font-semibold cursor-pointer shadow-xs" 
                onClick={() => onEdit(selectedEmployee)}
              >
                Edit data
              </Button>
            </div>
          </Card>
        )
      })() : (
        <Card className="rounded-xl border border-border shadow-xs bg-card p-10 text-center text-muted-foreground flex flex-col items-center justify-center">
          <Info className="w-10 h-10 mb-3 opacity-30 text-muted-foreground" />
          <div className="text-[13.5px] font-semibold text-foreground mb-1">Detail Staf Klinik</div>
          <div className="text-[12.5px]">Klik nama staf<br />untuk melihat profil lengkap</div>
        </Card>
      )}
    </div>
  )
}

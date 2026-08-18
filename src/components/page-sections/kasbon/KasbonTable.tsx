import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, RefreshCw, Download, Plus } from 'lucide-react'
import { KasbonStatusBadge } from '@/components/ui/status-badge'
import { fmtCurrency } from '@/lib/utils'
import { AV_COLORS, getInitials } from '@/utils/helpers'
import type { KasbonMapped } from '@/types/kasbon'

interface KasbonTableProps {
  filteredKasbon: KasbonMapped[]
  onApprove: (id: string) => void
  onReject: (id: string) => void
  onMarkDeducted: (id: string) => void
  approvePending: boolean
  rejectPending: boolean
  deductPending: boolean
  loadingKasbon: boolean
  onRefetch: () => void
  onExportClick: () => void
  onAddClick: () => void
}

export function KasbonTable({
  filteredKasbon,
  onApprove,
  onReject,
  onMarkDeducted,
  approvePending,
  rejectPending,
  deductPending,
  loadingKasbon,
  onRefetch,
  onExportClick,
  onAddClick,
}: KasbonTableProps) {
  return (
    <Card className="rounded-xl border border-border shadow-xs overflow-hidden bg-card">
      <div className="p-4 px-5 border-b border-border flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="font-heading text-[15px] font-bold text-foreground">Daftar Kasbon Staf</h3>
        </div>
        <div className="flex gap-2.5 items-center">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={onRefetch}
            disabled={loadingKasbon}
            className="border-border text-muted-foreground hover:bg-surface-soft h-[38px] w-[38px] cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loadingKasbon ? 'animate-spin' : ''}`} />
          </Button>
          <Button 
            variant="outline" 
            className="border-border text-muted-foreground hover:text-foreground hover:bg-surface-soft h-[38px] cursor-pointer" 
            onClick={onExportClick}
          >
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
          <Button 
            className="bg-primary hover:bg-primary/90 text-primary-foreground border-none h-[38px] font-semibold cursor-pointer shadow-xs" 
            onClick={onAddClick}
          >
            <Plus className="w-4 h-4 mr-2" strokeWidth={2.5} />
            Tambah Kasbon
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-surface-soft">
            <TableRow className="border-none hover:bg-transparent">
              <TableHead className="h-auto py-3 px-[18px] font-mono text-[11px] text-muted-foreground font-semibold tracking-wider uppercase whitespace-nowrap">Staf</TableHead>
              <TableHead className="h-auto py-3 px-[18px] font-mono text-[11px] text-muted-foreground font-semibold tracking-wider uppercase whitespace-nowrap">Tanggal</TableHead>
              <TableHead className="h-auto py-3 px-[18px] font-mono text-[11px] text-muted-foreground font-semibold tracking-wider uppercase whitespace-nowrap">Jumlah</TableHead>
              <TableHead className="h-auto py-3 px-[18px] font-mono text-[11px] text-muted-foreground font-semibold tracking-wider uppercase whitespace-nowrap">Keperluan</TableHead>
              <TableHead className="h-auto py-3 px-[18px] font-mono text-[11px] text-muted-foreground font-semibold tracking-wider uppercase whitespace-nowrap">Status</TableHead>
              <TableHead className="h-auto py-3 px-[18px] font-mono text-[11px] text-muted-foreground font-semibold tracking-wider uppercase whitespace-nowrap">Saldo Belum Lunas</TableHead>
              <TableHead className="h-auto py-3 px-[18px] font-mono text-[11px] text-muted-foreground font-semibold tracking-wider uppercase whitespace-nowrap"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredKasbon.map((row, i) => {
              const c = AV_COLORS[i % AV_COLORS.length]
              return (
                <TableRow key={row.id} className="border-b border-border/60 last:border-none hover:bg-surface-soft/60 transition-colors">
                  <TableCell className="py-3.5 px-[18px]">
                    <div className="flex items-center gap-2.5">
                      <Avatar 
                        className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center font-heading text-[12px] font-bold" 
                        style={{ backgroundColor: c.bg, color: c.fg }}
                      >
                        <AvatarFallback className="bg-transparent">{getInitials(row.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-[13.5px] text-foreground">{row.name}</div>
                        <div className="text-[11.5px] text-muted-foreground font-mono">{row.empId}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3.5 px-[18px]">
                    <span className="font-mono text-[12.5px] text-muted-foreground">{row.date}</span>
                  </TableCell>
                  <TableCell className="py-3.5 px-[18px]">
                    <span className="font-mono font-semibold text-[13.5px] text-[#FF5600]">− {fmtCurrency(row.amount)}</span>
                  </TableCell>
                  <TableCell className="py-3.5 px-[18px]">
                    <span className="text-[12.5px] text-muted-foreground max-w-[160px] block truncate" title={row.note}>
                      {row.note || <em className="text-muted-foreground/50 font-light">Tidak ada catatan</em>}
                    </span>
                  </TableCell>
                  <TableCell className="py-3.5 px-[18px]">
                    <KasbonStatusBadge status={row.status} />
                  </TableCell>
                  <TableCell className="py-3.5 px-[18px]">
                    <span className={`font-mono font-medium text-[13.5px] ${row.balance > 0 ? 'text-[#FF5600]' : 'text-muted-foreground'}`}>
                      {row.balance > 0 ? fmtCurrency(row.balance) : '—'}
                    </span>
                  </TableCell>
                  <TableCell className="py-3.5 px-[18px]">
                    {row.status === 'pending' ? (
                      <div className="flex gap-1.5">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-[28px] text-[12px] px-3 rounded-md bg-[#E6F7F0] border-[#A7F3D0] text-[#065F46] hover:bg-[#A7F3D0] hover:text-[#065F46] font-semibold cursor-pointer disabled:opacity-50"
                          onClick={() => onApprove(row.id)}
                          disabled={approvePending || rejectPending}
                        >
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-[28px] text-[12px] px-3 rounded-md bg-[#FEE2E2] border-[#FECACA] text-[#991B1B] hover:bg-[#FECACA] hover:text-[#991B1B] font-semibold cursor-pointer disabled:opacity-50"
                          onClick={() => onReject(row.id)}
                          disabled={approvePending || rejectPending}
                        >
                          Tolak
                        </Button>
                      </div>
                    ) : row.status === 'approved' ? (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-[28px] text-[12px] px-3 rounded-md border-border text-muted-foreground hover:text-foreground hover:bg-surface-soft whitespace-nowrap cursor-pointer disabled:opacity-50"
                        onClick={() => onMarkDeducted(row.id)}
                        disabled={deductPending}
                      >
                        Tandai dipotong
                      </Button>
                    ) : (
                      <span className="text-[12px] text-muted-foreground font-mono">—</span>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
            {filteredKasbon.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="p-10 text-center text-muted-foreground">
                  Tidak ada data transaksi kasbon
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between p-[14px_18px] border-t border-border text-[12.5px] text-muted-foreground">
        <span>Menampilkan {filteredKasbon.length} transaksi</span>
        <div className="flex gap-1">
          <Button variant="outline" size="icon" className="w-[30px] h-[30px] rounded-md border-border text-muted-foreground hover:text-foreground cursor-pointer">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" className="w-[30px] h-[30px] rounded-md border-primary bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground font-semibold">
            1
          </Button>
          <Button variant="outline" size="icon" className="w-[30px] h-[30px] rounded-md border-border text-muted-foreground hover:text-foreground cursor-pointer">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}

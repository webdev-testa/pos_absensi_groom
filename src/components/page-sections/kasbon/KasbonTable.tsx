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
    <Card className="rounded-[16px] border-[#C8E8F5] shadow-sm overflow-hidden bg-white">
      <div className="p-4 px-5 border-b border-[#C8E8F5] flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="font-['Syne'] text-[15px] font-semibold text-[#1A3A4A]">Kasbon Karyawan</h3>
        </div>
        <div className="flex gap-2.5 items-center">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={onRefetch}
            disabled={loadingKasbon}
            className="border-[#C8E8F5] text-[#4A7A8A] hover:bg-[#F0FAFF] h-[38px] w-[38px]"
          >
            <RefreshCw className={`w-4 h-4 ${loadingKasbon ? 'animate-spin' : ''}`} />
          </Button>
          <Button 
            variant="outline" 
            className="border-[#C8E8F5] text-[#4A7A8A] hover:text-[#1A3A4A] hover:bg-[#F0FAFF] h-[38px]" 
            onClick={onExportClick}
          >
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
          <Button 
            className="bg-[#F5A940] hover:bg-[#e09833] text-white border-none h-[38px] font-medium" 
            onClick={onAddClick}
          >
            <Plus className="w-4 h-4 mr-2" strokeWidth={2.5} />
            Tambah Kasbon
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-[#E4F4FD]">
            <TableRow className="border-none hover:bg-transparent">
              <TableHead className="h-auto py-3 px-[18px] font-mono text-[11px] text-[#8ABAC8] font-medium tracking-[0.8px] uppercase whitespace-nowrap">Karyawan</TableHead>
              <TableHead className="h-auto py-3 px-[18px] font-mono text-[11px] text-[#8ABAC8] font-medium tracking-[0.8px] uppercase whitespace-nowrap">Tanggal</TableHead>
              <TableHead className="h-auto py-3 px-[18px] font-mono text-[11px] text-[#8ABAC8] font-medium tracking-[0.8px] uppercase whitespace-nowrap">Jumlah</TableHead>
              <TableHead className="h-auto py-3 px-[18px] font-mono text-[11px] text-[#8ABAC8] font-medium tracking-[0.8px] uppercase whitespace-nowrap">Alasan</TableHead>
              <TableHead className="h-auto py-3 px-[18px] font-mono text-[11px] text-[#8ABAC8] font-medium tracking-[0.8px] uppercase whitespace-nowrap">Status</TableHead>
              <TableHead className="h-auto py-3 px-[18px] font-mono text-[11px] text-[#8ABAC8] font-medium tracking-[0.8px] uppercase whitespace-nowrap">Saldo kasbon</TableHead>
              <TableHead className="h-auto py-3 px-[18px] font-mono text-[11px] text-[#8ABAC8] font-medium tracking-[0.8px] uppercase whitespace-nowrap"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredKasbon.map((row, i) => {
              const c = AV_COLORS[i % AV_COLORS.length]
              return (
                <TableRow key={row.id} className="border-b border-[#C8E8F5] last:border-none hover:bg-[#FAFAF8]">
                  <TableCell className="py-3.5 px-[18px]">
                    <div className="flex items-center gap-2.5">
                      <Avatar 
                        className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center font-['Syne'] text-[12px] font-bold" 
                        style={{ backgroundColor: c.bg, color: c.fg }}
                      >
                        <AvatarFallback className="bg-transparent">{getInitials(row.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-[13.5px] text-[#1A3A4A]">{row.name}</div>
                        <div className="text-[11.5px] text-[#8ABAC8] font-mono">{row.empId}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3.5 px-[18px]">
                    <span className="font-mono text-[12.5px] text-[#4A7A8A]">{row.date}</span>
                  </TableCell>
                  <TableCell className="py-3.5 px-[18px]">
                    <span className="font-mono font-medium text-[13.5px] text-[#F5A940]">− {fmtCurrency(row.amount)}</span>
                  </TableCell>
                  <TableCell className="py-3.5 px-[18px]">
                    <span className="text-[12.5px] text-[#4A7A8A] max-w-[160px] block truncate" title={row.note}>
                      {row.note || <em className="text-[#8ABAC8] font-light">Tidak ada catatan</em>}
                    </span>
                  </TableCell>
                  <TableCell className="py-3.5 px-[18px]">
                    <KasbonStatusBadge status={row.status} />
                  </TableCell>
                  <TableCell className="py-3.5 px-[18px]">
                    <span className={`font-mono font-medium text-[13.5px] ${row.balance > 0 ? 'text-[#F5A940]' : 'text-[#8ABAC8]'}`}>
                      {row.balance > 0 ? fmtCurrency(row.balance) : '—'}
                    </span>
                  </TableCell>
                  <TableCell className="py-3.5 px-[18px]">
                    {row.status === 'pending' ? (
                      <div className="flex gap-1.5">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-[28px] text-[12px] px-3 rounded-[7px] bg-[#E2F0E8] border-[#b8dfc8] text-[#3AAD7A] hover:bg-[#d0ead9] hover:text-[#3AAD7A] disabled:opacity-50"
                          onClick={() => onApprove(row.id)}
                          disabled={approvePending || rejectPending}
                        >
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-[28px] text-[12px] px-3 rounded-[7px] border-[#C8E8F5] text-[#4A7A8A] hover:text-[#1A3A4A] hover:bg-[#F0FAFF] disabled:opacity-50"
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
                        className="h-[28px] text-[12px] px-3 rounded-[7px] border-[#C8E8F5] text-[#4A7A8A] hover:text-[#1A3A4A] hover:bg-[#F0FAFF] whitespace-nowrap disabled:opacity-50"
                        onClick={() => onMarkDeducted(row.id)}
                        disabled={deductPending}
                      >
                        Tandai dipotong
                      </Button>
                    ) : (
                      <span className="text-[12px] text-[#8ABAC8] font-mono">—</span>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
            {filteredKasbon.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="p-10 text-center text-[#8ABAC8]">
                  Tidak ada data transaksi kasbon
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between p-[14px_18px] border-t border-[#C8E8F5] text-[12.5px] text-[#8ABAC8]">
        <span>Menampilkan {filteredKasbon.length} transaksi</span>
        <div className="flex gap-1">
          <Button variant="outline" size="icon" className="w-[30px] h-[30px] rounded-[7px] border-[#C8E8F5] text-[#4A7A8A] hover:text-[#1A3A4A]">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" className="w-[30px] h-[30px] rounded-[7px] border-[#1A3A4A] bg-[#1A3A4A] text-white hover:bg-[#1A3A4A] hover:text-white">
            1
          </Button>
          <Button variant="outline" size="icon" className="w-[30px] h-[30px] rounded-[7px] border-[#C8E8F5] text-[#4A7A8A] hover:text-[#1A3A4A]">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}

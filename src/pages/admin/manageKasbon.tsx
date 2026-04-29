import { useState } from 'react'
import { toast } from 'sonner'
import { AdminLayout, AV_COLORS, initials } from '@/components/layout/AdminLayout'
import { fmtCurrency } from '@/lib/utils'

import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Download, Plus, ChevronLeft, ChevronRight } from 'lucide-react'

type KasbonStatus = 'pending' | 'approved' | 'deducted'

interface Kasbon {
  id: number
  name: string
  empId: string
  date: string
  amount: number
  note: string
  status: KasbonStatus
  balance: number
}

const INITIAL_DATA: Kasbon[] = [
  { id:1, name:'Andi Saputra',  empId:'EMP-001', date:'20 Apr 2025', amount:300000, note:'Biaya berobat',    status:'pending',  balance:300000 },
  { id:2, name:'Budi Santoso',  empId:'EMP-002', date:'19 Apr 2025', amount:500000, note:'Keperluan darurat',status:'approved', balance:700000 },
  { id:3, name:'Citra Dewi',    empId:'EMP-003', date:'18 Apr 2025', amount:200000, note:'Biaya sekolah',    status:'deducted', balance:0      },
  { id:4, name:'Budi Santoso',  empId:'EMP-002', date:'17 Apr 2025', amount:200000, note:'Bayar kos',        status:'deducted', balance:700000 },
  { id:5, name:'Dian Permata',  empId:'EMP-004', date:'15 Apr 2025', amount:400000, note:'Kebutuhan rumah',  status:'approved', balance:400000 },
  { id:6, name:'Eko Prasetyo',  empId:'EMP-005', date:'14 Apr 2025', amount:350000, note:'Keperluan keluarga',status:'deducted',balance:0     },
  { id:7, name:'Fitri Rahayu', empId:'EMP-006', date:'13 Apr 2025', amount:250000, note:'Biaya transport',  status:'deducted', balance:0      },
  { id:8, name:'Andi Saputra',  empId:'EMP-001', date:'10 Apr 2025', amount:200000, note:'Darurat',          status:'deducted', balance:300000 },
  { id:9, name:'Citra Dewi',    empId:'EMP-003', date:'08 Apr 2025', amount:300000, note:'Biaya sekolah',    status:'deducted', balance:0      },
  { id:10,name:'Budi Santoso',  empId:'EMP-002', date:'05 Apr 2025', amount:200000, note:'Keperluan',        status:'deducted', balance:700000 },
  { id:11,name:'Dian Permata',  empId:'EMP-004', date:'03 Apr 2025', amount:150000, note:'Transport',        status:'pending',  balance:400000 },
]

export default function ManageKasbon() {
  const [data, setData] = useState<Kasbon[]>(INITIAL_DATA)
  const [searchQ, setSearchQ] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | KasbonStatus>('all')
  const [tabFilter, setTabFilter] = useState<'all' | 'minggu' | 'hari'>('all')
  const [showModal, setShowModal] = useState(false)

  const filtered = data.filter(r => {
    const q = searchQ.toLowerCase()
    const matchSearch = r.name.toLowerCase().includes(q) || r.note.toLowerCase().includes(q)
    const matchStatus = statusFilter === 'all' || r.status === statusFilter
    return matchSearch && matchStatus
  })

  const totalKasbon = data.reduce((sum, item) => sum + item.amount, 0)
  const belumDipotong = data.filter(d => d.status !== 'deducted').reduce((sum, item) => sum + item.amount, 0)
  const sudahDipotong = data.filter(d => d.status === 'deducted').reduce((sum, item) => sum + item.amount, 0)

  function approveRow(id: number) {
    setData(prev => prev.map(d => d.id === id ? { ...d, status: 'approved' } : d))
    const item = data.find(d => d.id === id)
    if (item) toast.success(`Kasbon ${item.name} disetujui`)
  }

  function rejectRow(id: number) {
    setData(prev => prev.filter(d => d.id !== id))
    toast.success('Kasbon ditolak')
  }

  function markDeducted(id: number) {
    setData(prev => prev.map(d => d.id === id ? { ...d, status: 'deducted', balance: 0 } : d))
    toast.success('Ditandai sudah dipotong gaji')
  }

  function saveKasbon(e: React.FormEvent) {
    e.preventDefault()
    setShowModal(false)
    toast.success('Kasbon berhasil disimpan')
  }

  return (
    <AdminLayout>
      {/* HEADER */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-['Syne'] text-[28px] font-bold tracking-tight text-[#1A3A4A]">Log Kasbon</h1>
          <p className="text-[13.5px] text-[#4A7A8A] mt-1.5">Rekap pengambilan gaji di muka · April 2025</p>
        </div>
        <div className="flex gap-2.5">
          <Button variant="outline" className="border-[#C8E8F5] text-[#4A7A8A] hover:text-[#1A3A4A] hover:bg-[#F0FAFF]" onClick={() => toast.success('Export Excel')}>
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
          <Button className="bg-[#F5A940] hover:bg-[#b03d24] text-white border-none" onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4 mr-2" strokeWidth={2.5} />
            Tambah Kasbon
          </Button>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <Card className="rounded-[16px] shadow-sm border-[#C8E8F5]">
          <CardContent className="p-[18px_20px]">
             <div className="text-[11px] text-[#8ABAC8] uppercase tracking-[0.8px] font-mono mb-2">Total kasbon bulan ini</div>
             <div className="font-['Syne'] text-[26px] font-bold tracking-[-0.5px] leading-none text-[#F5A940]">{fmtCurrency(totalKasbon)}</div>
             <div className="text-[12px] text-[#8ABAC8] mt-1.5">dari 6 karyawan</div>
             <Badge className="bg-[#F5E8E4] text-[#F5A940] hover:bg-[#F5E8E4] shadow-none mt-2 font-medium px-2 py-0.5 rounded-full text-[11px]">↑ 12% vs bulan lalu</Badge>
          </CardContent>
        </Card>
        <Card className="rounded-[16px] shadow-sm border-[#C8E8F5]">
          <CardContent className="p-[18px_20px]">
             <div className="text-[11px] text-[#8ABAC8] uppercase tracking-[0.8px] font-mono mb-2">Belum dipotong</div>
             <div className="font-['Syne'] text-[26px] font-bold tracking-[-0.5px] leading-none text-[#E89E3A]">{fmtCurrency(belumDipotong)}</div>
             <div className="text-[12px] text-[#8ABAC8] mt-1.5">3 transaksi pending</div>
             <Badge className="bg-[#FAF0E1] text-[#E89E3A] hover:bg-[#FAF0E1] shadow-none mt-2 font-medium px-2 py-0.5 rounded-full text-[11px]">Akan dipotong gaji</Badge>
          </CardContent>
        </Card>
        <Card className="rounded-[16px] shadow-sm border-[#C8E8F5]">
          <CardContent className="p-[18px_20px]">
             <div className="text-[11px] text-[#8ABAC8] uppercase tracking-[0.8px] font-mono mb-2">Sudah dipotong</div>
             <div className="font-['Syne'] text-[26px] font-bold tracking-[-0.5px] leading-none text-[#3AAD7A]">{fmtCurrency(sudahDipotong)}</div>
             <div className="text-[12px] text-[#8ABAC8] mt-1.5">8 transaksi settled</div>
             <Badge className="bg-[#E2F0E8] text-[#3AAD7A] hover:bg-[#E2F0E8] shadow-none mt-2 font-medium px-2 py-0.5 rounded-full text-[11px]">Selesai</Badge>
          </CardContent>
        </Card>
        <Card className="rounded-[16px] shadow-sm border-[#C8E8F5]">
          <CardContent className="p-[18px_20px]">
             <div className="text-[11px] text-[#8ABAC8] uppercase tracking-[0.8px] font-mono mb-2">Rata-rata per orang</div>
             <div className="font-['Syne'] text-[26px] font-bold tracking-[-0.5px] leading-none text-[#1A3A4A]">{fmtCurrency(700000)}</div>
             <div className="text-[12px] text-[#8ABAC8] mt-1.5">bulan April</div>
             <Badge className="bg-[#FAF0E1] text-[#E89E3A] hover:bg-[#FAF0E1] shadow-none mt-2 font-medium px-2 py-0.5 rounded-full text-[11px]">4x pengambilan</Badge>
          </CardContent>
        </Card>
      </div>

      {/* FILTERS */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-[320px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8ABAC8]" />
          <Input 
            className="pl-9 bg-white border-[#C8E8F5] rounded-[10px] text-[13px] h-[38px] placeholder:text-[#8ABAC8]" 
            placeholder="Cari karyawan..." 
            value={searchQ} 
            onChange={e => setSearchQ(e.target.value)} 
          />
        </div>

        <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
          <SelectTrigger className="w-[160px] bg-white border-[#C8E8F5] rounded-[10px] h-[38px] text-[13px]">
            <SelectValue placeholder="Semua status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="deducted">Sudah dipotong</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue="apr">
          <SelectTrigger className="w-[140px] bg-white border-[#C8E8F5] rounded-[10px] h-[38px] text-[13px]">
            <SelectValue placeholder="Pilih bulan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="apr">April 2025</SelectItem>
            <SelectItem value="mar">Maret 2025</SelectItem>
            <SelectItem value="feb">Februari 2025</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-1 bg-[#F0FAFF] border border-[#C8E8F5] rounded-[10px] p-1 ml-auto">
          {(['all', 'minggu', 'hari'] as const).map(t => (
            <button
              key={t}
              className={`px-3.5 py-1.5 rounded-[7px] text-[12.5px] transition-all font-sans border-none bg-none cursor-pointer ${
                tabFilter === t 
                  ? 'bg-white text-[#1A3A4A] font-medium shadow-[0_1px_3px_rgba(0,0,0,0.08)]' 
                  : 'text-[#4A7A8A] hover:bg-[#E4F4FD]'
              }`}
              onClick={() => setTabFilter(t)}
            >
              {t === 'all' ? 'Semua' : t === 'minggu' ? 'Minggu ini' : 'Hari ini'}
            </button>
          ))}
        </div>
      </div>

      {/* TABLE */}
      <Card className="rounded-[16px] border-[#C8E8F5] shadow-sm overflow-hidden bg-white">
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
              {filtered.map((row, i) => {
                const c = AV_COLORS[i % AV_COLORS.length]
                return (
                  <TableRow key={row.id} className="border-b border-[#C8E8F5] last:border-none hover:bg-[#FAFAF8]">
                    <TableCell className="py-3.5 px-[18px]">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center font-['Syne'] text-[12px] font-bold" style={{ backgroundColor: c.bg, color: c.fg }}>
                          <AvatarFallback className="bg-transparent">{initials(row.name)}</AvatarFallback>
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
                      <span className="text-[12.5px] text-[#4A7A8A] max-w-[160px] block truncate" title={row.note}>{row.note}</span>
                    </TableCell>
                    <TableCell className="py-3.5 px-[18px]">
                      {row.status === 'pending' && (
                        <Badge className="bg-[#FAF0E1] text-[#E89E3A] hover:bg-[#FAF0E1] shadow-none font-medium px-2.5 py-1 rounded-full text-[12px] whitespace-nowrap gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#E89E3A]" /> Menunggu
                        </Badge>
                      )}
                      {row.status === 'approved' && (
                        <Badge className="bg-[#E2F0E8] text-[#3AAD7A] hover:bg-[#E2F0E8] shadow-none font-medium px-2.5 py-1 rounded-full text-[12px] whitespace-nowrap gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#3AAD7A]" /> Disetujui
                        </Badge>
                      )}
                      {row.status === 'deducted' && (
                        <Badge className="bg-[#F0FAFF] text-[#4A7A8A] hover:bg-[#F0FAFF] shadow-none font-medium px-2.5 py-1 rounded-full text-[12px] whitespace-nowrap gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#8ABAC8]" /> Dipotong
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="py-3.5 px-[18px]">
                      <span className={`font-mono font-medium text-[13.5px] ${row.balance > 0 ? 'text-[#F5A940]' : 'text-[#8ABAC8]'}`}>
                        {row.balance > 0 ? fmtCurrency(row.balance) : '—'}
                      </span>
                    </TableCell>
                    <TableCell className="py-3.5 px-[18px]">
                      {row.status === 'pending' ? (
                        <div className="flex gap-1.5">
                          <Button size="sm" variant="outline" className="h-[28px] text-[12px] px-3 rounded-[7px] bg-[#E2F0E8] border-[#b8dfc8] text-[#3AAD7A] hover:bg-[#d0ead9] hover:text-[#3AAD7A]" onClick={() => approveRow(row.id)}>Approve</Button>
                          <Button size="sm" variant="outline" className="h-[28px] text-[12px] px-3 rounded-[7px] border-[#C8E8F5] text-[#4A7A8A] hover:text-[#1A3A4A] hover:bg-[#F0FAFF]" onClick={() => rejectRow(row.id)}>Tolak</Button>
                        </div>
                      ) : row.status === 'approved' ? (
                        <Button size="sm" variant="outline" className="h-[28px] text-[12px] px-3 rounded-[7px] border-[#C8E8F5] text-[#4A7A8A] hover:text-[#1A3A4A] hover:bg-[#F0FAFF] whitespace-nowrap" onClick={() => markDeducted(row.id)}>Tandai dipotong</Button>
                      ) : (
                        <span className="text-[12px] text-[#8ABAC8] font-mono">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={7} className="p-10 text-center text-[#8ABAC8]">Tidak ada data</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between p-[14px_18px] border-t border-[#C8E8F5] text-[12.5px] text-[#8ABAC8]">
          <span>Menampilkan {filtered.length} transaksi</span>
          <div className="flex gap-1">
            <Button variant="outline" size="icon" className="w-[30px] h-[30px] rounded-[7px] border-[#C8E8F5] text-[#4A7A8A] hover:text-[#1A3A4A]"><ChevronLeft className="w-4 h-4"/></Button>
            <Button variant="outline" size="icon" className="w-[30px] h-[30px] rounded-[7px] border-[#1A3A4A] bg-[#1A3A4A] text-white hover:bg-[#1A3A4A] hover:text-white">1</Button>
            <Button variant="outline" size="icon" className="w-[30px] h-[30px] rounded-[7px] border-[#C8E8F5] text-[#4A7A8A] hover:text-[#1A3A4A]">2</Button>
            <Button variant="outline" size="icon" className="w-[30px] h-[30px] rounded-[7px] border-[#C8E8F5] text-[#4A7A8A] hover:text-[#1A3A4A]"><ChevronRight className="w-4 h-4"/></Button>
          </div>
        </div>
      </Card>

      {/* MODAL */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-[460px] p-0 border-[#C8E8F5] rounded-[16px] overflow-hidden gap-0">
          <form onSubmit={saveKasbon}>
            <DialogHeader className="p-8 pb-6 bg-white">
              <DialogTitle className="font-['Syne'] text-[20px] font-bold text-[#1A3A4A] mb-1">Tambah Kasbon</DialogTitle>
              <DialogDescription className="text-[13px] text-[#4A7A8A]">
                Catat pengambilan gaji di muka karyawan
              </DialogDescription>
            </DialogHeader>
            <div className="p-8 pt-0 space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] text-[#4A7A8A] font-medium tracking-[0.2px]">Karyawan</label>
                <Select defaultValue="">
                  <SelectTrigger className="rounded-[10px] border-[#C8E8F5] h-[42px] text-[13.5px]">
                    <SelectValue placeholder="Pilih karyawan..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="andi">Andi Saputra</SelectItem>
                    <SelectItem value="budi">Budi Santoso</SelectItem>
                    <SelectItem value="citra">Citra Dewi</SelectItem>
                    <SelectItem value="dian">Dian Permata</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] text-[#4A7A8A] font-medium tracking-[0.2px]">Jumlah (Rp)</label>
                  <Input type="number" placeholder="200000" required className="rounded-[10px] border-[#C8E8F5] h-[42px] text-[13.5px]" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] text-[#4A7A8A] font-medium tracking-[0.2px]">Tanggal</label>
                  <Input type="date" defaultValue="2025-04-20" required className="rounded-[10px] border-[#C8E8F5] h-[42px] text-[13.5px]" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 pt-1">
                <label className="text-[12px] text-[#4A7A8A] font-medium tracking-[0.2px]">Alasan / catatan</label>
                <Input type="text" placeholder="Keperluan darurat, biaya sekolah, dll..." className="rounded-[10px] border-[#C8E8F5] h-[42px] text-[13.5px]" />
              </div>
            </div>
            <DialogFooter className="p-6 pt-0 bg-white gap-2.5 sm:justify-end">
              <Button type="button" variant="ghost" className="rounded-[10px] text-[#4A7A8A] hover:text-[#1A3A4A] h-[42px] px-6" onClick={() => setShowModal(false)}>Batal</Button>
              <Button type="submit" className="rounded-[10px] bg-[#F5A940] hover:bg-[#b03d24] text-white h-[42px] px-6">
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
import { useState, useEffect, useCallback, useRef, type ChangeEvent, type FormEvent } from 'react'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { AdminLayout } from '@/components/layout/AdminLayout'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Search, Download, Plus, AlertTriangle, UserX, CheckCircle, Info } from 'lucide-react'

/* ─── types ────────────────────────────────────────────── */
interface Employee {
  id: string           // auth.users id
  email: string
  name: string
  emp_id: string
  dept: string
  role: string         // jabatan
  phone: string
  salary: number
  kasbon_limit: number
  shift: string
  address: string
  joined: string
  status: 'aktif' | 'nonaktif'
  absen?: number
  kasbon_used?: number
  last_slip?: string
}

interface FormData {
  name: string
  emp_id: string
  email: string
  password: string
  phone: string
  address: string
  dept: string
  role: string
  salary: string
  shift: string
  kasbon_limit: string
  status: 'aktif' | 'nonaktif'
  joined: string
}

const EMPTY_FORM: FormData = {
  name: '',
  emp_id: '',
  email: '',
  password: '',
  phone: '',
  address: '',
  dept: 'staff',
  role: '',
  salary: '',
  shift: '08:00 – 17:00',
  kasbon_limit: '',
  status: 'aktif',
  joined: new Date().toISOString().slice(0, 10),
}

const AV_COLORS = [
  { bg: '#F5E8E4', fg: '#C84B2F' }, { bg: '#E2F0E8', fg: '#2A7A4B' },
  { bg: '#F5EDE0', fg: '#B87333' }, { bg: '#EDE8F5', fg: '#6B4F9E' },
  { bg: '#E0EDF5', fg: '#1A6FAA' }, { bg: '#F5E8ED', fg: '#A0374F' },
  { bg: '#E8F5E0', fg: '#3A6B1A' }, { bg: '#F0EDE8', fg: '#6B5A3A' },
  { bg: '#E8EDF5', fg: '#3A4A8B' }, { bg: '#F5F0E8', fg: '#8B6A3A' },
  { bg: '#EBF5E8', fg: '#2A6B4B' }, { bg: '#F5E8F0', fg: '#8B3A6A' },
]

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

function fmtCurrency(n: number) {
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1).replace('.0', '')}jt`
  if (n >= 1_000) return `Rp ${(n / 1_000)}k`
  return `Rp ${n}`
}

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })
  } catch { return iso }
}

/* ─── component ────────────────────────────────────────── */
export default function ManageEmployee() {
  /* ── state ── */
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQ, setSearchQ] = useState('')
  const [deptFilter, setDeptFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState<'aktif' | 'nonaktif' | 'all'>('aktif')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // modal
  const [showFormModal, setShowFormModal] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  // confirm modal
  const [showConfirm, setShowConfirm] = useState(false)
  const [confirmData, setConfirmData] = useState<{ id: string; name: string; newStatus: 'aktif' | 'nonaktif' } | null>(null)

  // toast
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 3000)
  }, [])

  /* ── fetch employees ── */
  const fetchEmployees = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Fetch employees error:', error)
      showToast('Gagal memuat data karyawan')
    } else if (data) {
      const mapped: Employee[] = data.map((u: Record<string, unknown>) => ({
        id: u.id as string,
        email: (u.email as string) || '',
        name: (u.name as string) || '',
        emp_id: (u.emp_id as string) || '',
        dept: (u.dept as string) || '',
        role: (u.role as string) || (u.jabatan as string) || '',
        phone: (u.phone as string) || '',
        salary: Number(u.salary) || 0,
        kasbon_limit: Number(u.kasbon_limit) || 0,
        shift: (u.shift as string) || '08:00 – 17:00',
        address: (u.address as string) || '',
        joined: (u.created_at as string) || '',
        status: ((u.status as string) || 'aktif') as 'aktif' | 'nonaktif',
        absen: Number(u.absen) || 0,
        kasbon_used: Number(u.kasbon_used) || 0,
        last_slip: (u.last_slip as string) || '—',
      }))
      setEmployees(mapped)
    }
    setLoading(false)
  }, [showToast])

  useEffect(() => { fetchEmployees() }, [fetchEmployees])

  /* ── filtering ── */
  const filtered = employees.filter(e => {
    const matchStatus = statusFilter === 'all' || e.status === statusFilter
    const matchDept = deptFilter === 'all' || e.dept === deptFilter
    const q = searchQ.toLowerCase()
    const matchSearch = e.name.toLowerCase().includes(q) || e.emp_id.toLowerCase().includes(q)
    return matchStatus && matchDept && matchSearch
  })

  const departments = [...new Set(employees.map(e => e.dept).filter(Boolean))]
  const totalAktif = employees.filter(e => e.status === 'aktif').length
  const totalNonaktif = employees.filter(e => e.status === 'nonaktif').length
  const totalSalary = employees.filter(e => e.status === 'aktif').reduce((s, e) => s + e.salary, 0)
  const deptCounts = employees.filter(e => e.status === 'aktif').reduce<Record<string, number>>((acc, e) => {
    acc[e.dept] = (acc[e.dept] || 0) + 1; return acc
  }, {})
  const topDept = Object.entries(deptCounts).sort((a, b) => b[1] - a[1])[0]

  const selectedEmployee = selectedId ? employees.find(e => e.id === selectedId) : null
  const selectedIdx = selectedEmployee ? employees.indexOf(selectedEmployee) : -1

  /* ── form helpers ── */
  const setField = (field: keyof FormData) => (ev: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [field]: ev.target.value }))
  }
  
  // Custom setter for shadcn Select
  const setFieldDirectly = (field: keyof FormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function openAddModal() {
    setIsEdit(false)
    setEditId(null)
    setForm(EMPTY_FORM)
    setShowFormModal(true)
  }

  function openEditModal(emp: Employee) {
    setIsEdit(true)
    setEditId(emp.id)
    setForm({
      name: emp.name,
      emp_id: emp.emp_id,
      email: emp.email,
      password: '', // never show
      phone: emp.phone,
      address: emp.address,
      dept: emp.dept,
      role: emp.role,
      salary: String(emp.salary),
      shift: emp.shift,
      kasbon_limit: String(emp.kasbon_limit),
      status: emp.status,
      joined: emp.joined ? emp.joined.slice(0, 10) : '',
    })
    setShowFormModal(true)
  }

  /* ── save (create / update) ── */
  async function handleSave(ev: FormEvent) {
    ev.preventDefault()
    setSaving(true)

    if (!isEdit) {
      if (!form.email || !form.password) {
        showToast('Email dan password wajib diisi')
        setSaving(false)
        return
      }

      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: form.email,
        password: form.password,
        email_confirm: true,
        user_metadata: {
          name: form.name,
          emp_id: form.emp_id,
          dept: form.dept,
        },
      })

      if (error) {
        showToast(`Gagal: ${error.message}`)
        setSaving(false)
        return
      }

      if (data?.user) {
        const { error: profileError } = await supabaseAdmin
          .from('users')
          .upsert({
            id: data.user.id,
            email: form.email,
            name: form.name,
            emp_id: form.emp_id,
            dept: form.dept,
            role: form.dept, 
            jabatan: form.role,
            phone: form.phone,
            salary: parseInt(form.salary) || 0,
            kasbon_limit: parseInt(form.kasbon_limit) || 0,
            shift: form.shift,
            address: form.address,
            status: form.status,
          })

        if (profileError) showToast(`User dibuat tapi profil gagal: ${profileError.message}`)
        else showToast(`${form.name} berhasil ditambahkan`)
      }
    } else {
      const updateData: Record<string, unknown> = {
        name: form.name,
        emp_id: form.emp_id,
        dept: form.dept,
        jabatan: form.role,
        phone: form.phone,
        salary: parseInt(form.salary) || 0,
        kasbon_limit: parseInt(form.kasbon_limit) || 0,
        shift: form.shift,
        address: form.address,
        status: form.status,
      }

      const { error } = await supabaseAdmin
        .from('users')
        .update(updateData)
        .eq('id', editId!)

      if (error) showToast(`Gagal update: ${error.message}`)
      else showToast(`Data ${form.name} berhasil diperbarui`)
    }

    setSaving(false)
    setShowFormModal(false)
    fetchEmployees()
  }

  /* ── toggle status ── */
  function openToggleConfirm(emp: Employee) {
    setConfirmData({
      id: emp.id,
      name: emp.name,
      newStatus: emp.status === 'aktif' ? 'nonaktif' : 'aktif',
    })
    setShowConfirm(true)
  }

  async function doToggleStatus() {
    if (!confirmData) return
    const { error } = await supabaseAdmin
      .from('users')
      .update({ status: confirmData.newStatus })
      .eq('id', confirmData.id)

    if (error) {
      showToast(`Gagal: ${error.message}`)
    } else {
      showToast(`${confirmData.name} berhasil ${confirmData.newStatus === 'nonaktif' ? 'dinonaktifkan' : 'diaktifkan'}`)
    }
    setShowConfirm(false)
    setConfirmData(null)
    fetchEmployees()
  }

  /* ── render ── */
  return (
    <AdminLayout>
      {/* HEADER */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-['Syne'] text-[28px] font-bold tracking-tight text-[#1A1814]">Kelola Karyawan</h1>
          <p className="text-[13.5px] text-[#6B6760] mt-1.5">Data master karyawan · gaji pokok · divisi</p>
        </div>
        <div className="flex gap-2.5">
          <Button variant="outline" className="border-[#E0DDD7] text-[#6B6760] hover:text-[#1A1814] hover:bg-[#F5F2ED]" onClick={() => showToast('Export daftar karyawan')}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button className="bg-[#C84B2F] hover:bg-[#b03d24] text-white border-none" onClick={openAddModal}>
            <Plus className="w-4 h-4 mr-2" strokeWidth={2.5} />
            Tambah Karyawan
          </Button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-4 gap-4 mb-7">
        <Card className="rounded-[16px] shadow-sm border-[#E0DDD7]">
          <CardContent className="p-[18px_20px]">
             <div className="text-[11px] text-[#A8A49E] uppercase tracking-[0.8px] font-mono mb-2">Total aktif</div>
             <div className="font-['Syne'] text-[30px] font-bold tracking-[-1px] leading-none text-[#2A7A4B]">{totalAktif}</div>
             <div className="text-[12px] text-[#A8A49E] mt-1.5">karyawan aktif</div>
          </CardContent>
        </Card>
        <Card className="rounded-[16px] shadow-sm border-[#E0DDD7]">
          <CardContent className="p-[18px_20px]">
             <div className="text-[11px] text-[#A8A49E] uppercase tracking-[0.8px] font-mono mb-2">Nonaktif</div>
             <div className="font-['Syne'] text-[30px] font-bold tracking-[-1px] leading-none text-[#A8A49E]">{totalNonaktif}</div>
             <div className="text-[12px] text-[#A8A49E] mt-1.5">diarsipkan</div>
          </CardContent>
        </Card>
        <Card className="rounded-[16px] shadow-sm border-[#E0DDD7]">
          <CardContent className="p-[18px_20px]">
             <div className="text-[11px] text-[#A8A49E] uppercase tracking-[0.8px] font-mono mb-2">Total gaji pokok</div>
             <div className="font-['Syne'] text-[30px] font-bold tracking-[-1px] leading-none text-[#1A1814]">{fmtCurrency(totalSalary)}</div>
             <div className="text-[12px] text-[#A8A49E] mt-1.5">per bulan</div>
          </CardContent>
        </Card>
        <Card className="rounded-[16px] shadow-sm border-[#E0DDD7]">
          <CardContent className="p-[18px_20px]">
             <div className="text-[11px] text-[#A8A49E] uppercase tracking-[0.8px] font-mono mb-2">Divisi terbanyak</div>
             <div className="font-['Syne'] text-[22px] font-bold tracking-[-0.5px] leading-[30px] text-[#1A1814]">{topDept?.[0] || '—'}</div>
             <div className="text-[12px] text-[#A8A49E] mt-1.5">{topDept ? `${topDept[1]} orang` : '-'}</div>
          </CardContent>
        </Card>
      </div>

      {/* FILTER BAR */}
      <div className="flex items-center gap-2.5 mb-[18px] flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#A8A49E]" />
          <Input 
            className="pl-9 bg-white border-[#E0DDD7] rounded-[10px] text-[13px] h-[38px] placeholder:text-[#A8A49E]" 
            placeholder="Cari nama atau ID..." 
            value={searchQ} 
            onChange={e => setSearchQ(e.target.value)} 
          />
        </div>
        
        <Select value={deptFilter} onValueChange={setDeptFilter}>
          <SelectTrigger className="w-[160px] bg-white border-[#E0DDD7] rounded-[10px] h-[38px] text-[13px]">
            <SelectValue placeholder="Pilih divisi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua divisi</SelectItem>
            {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>

        <div className="flex gap-[3px] bg-white border border-[#E0DDD7] rounded-[10px] p-[3px]">
          {(['aktif', 'nonaktif', 'all'] as const).map(s => (
            <button
              key={s}
              className={`px-3.5 py-1.5 rounded-[7px] text-[12.5px] transition-all font-sans border-none bg-none cursor-pointer ${
                statusFilter === s 
                  ? 'bg-[#1A1814] text-white font-medium' 
                  : 'text-[#6B6760] hover:bg-[#F5F2ED]'
              }`}
              onClick={() => setStatusFilter(s)}
            >
              {s === 'all' ? 'Semua' : s === 'aktif' ? 'Aktif' : 'Nonaktif'}
            </button>
          ))}
        </div>
      </div>

      {/* LAYOUT: TABLE + DETAIL */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5 items-start">
        
        {/* TABLE CARD */}
        <Card className="rounded-[16px] border-[#E0DDD7] shadow-sm overflow-hidden bg-white">
          <div className="p-4 px-5 border-b border-[#E0DDD7] flex items-center justify-between">
            <div>
              <div className="font-['Syne'] text-[15px] font-semibold text-[#1A1814]">
                {filtered.length} karyawan {statusFilter === 'all' ? '' : statusFilter}
              </div>
              <div className="text-[12px] text-[#A8A49E] mt-0.5">Klik baris untuk lihat detail</div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-10 text-center text-[#A8A49E] text-sm">Memuat data...</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#EDEAE4]">
                  <tr>
                    <th className="p-3 px-4 font-mono text-[10.5px] text-[#A8A49E] font-normal tracking-[0.8px] uppercase whitespace-nowrap">Karyawan</th>
                    <th className="p-3 px-4 font-mono text-[10.5px] text-[#A8A49E] font-normal tracking-[0.8px] uppercase whitespace-nowrap">Divisi</th>
                    <th className="p-3 px-4 font-mono text-[10.5px] text-[#A8A49E] font-normal tracking-[0.8px] uppercase whitespace-nowrap">Email</th>
                    <th className="p-3 px-4 font-mono text-[10.5px] text-[#A8A49E] font-normal tracking-[0.8px] uppercase whitespace-nowrap">Gaji pokok</th>
                    <th className="p-3 px-4 font-mono text-[10.5px] text-[#A8A49E] font-normal tracking-[0.8px] uppercase whitespace-nowrap">Tgl Bergabung</th>
                    <th className="p-3 px-4 font-mono text-[10.5px] text-[#A8A49E] font-normal tracking-[0.8px] uppercase whitespace-nowrap">Status</th>
                    <th className="p-3 px-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((emp, fi) => {
                    const globalIdx = employees.indexOf(emp)
                    const c = AV_COLORS[globalIdx % AV_COLORS.length]
                    const isActive = selectedId === emp.id
                    
                    return (
                      <tr 
                        key={emp.id} 
                        className={`cursor-pointer border-b border-[#E0DDD7] last:border-none transition-colors ${isActive ? 'bg-[#F0F7F3]' : 'hover:bg-[#FAFAF8]'}`}
                        onClick={() => setSelectedId(emp.id)}
                      >
                        <td className="p-3 px-4 align-middle">
                          <div className="flex items-center gap-2.5">
                            <Avatar className="w-[34px] h-[34px] rounded-full shrink-0 flex items-center justify-center font-['Syne'] text-[12px] font-bold" style={{ backgroundColor: c.bg, color: c.fg }}>
                              <AvatarFallback className="bg-transparent">{initials(emp.name || '?')}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-[13.5px] text-[#1A1814]">{emp.name}</div>
                              <div className="text-[11px] text-[#A8A49E] font-mono">{emp.emp_id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 px-4 align-middle">
                          <span className="text-[12.5px] text-[#6B6760] block">{emp.dept}</span>
                          <span className="text-[11px] text-[#A8A49E]">{emp.role}</span>
                        </td>
                        <td className="p-3 px-4 align-middle">
                          <span className="font-mono text-[12px] text-[#1A1814]">{emp.email}</span>
                        </td>
                        <td className="p-3 px-4 align-middle">
                          <span className="font-mono text-[12.5px] text-[#1A1814]">{fmtCurrency(emp.salary)}</span>
                        </td>
                        <td className="p-3 px-4 align-middle">
                          <span className="text-[12.5px] text-[#6B6760]">{fmtDate(emp.joined)}</span>
                        </td>
                        <td className="p-3 px-4 align-middle">
                          {emp.status === 'aktif' ? (
                            <Badge className="bg-[#E2F0E8] text-[#2A7A4B] hover:bg-[#E2F0E8] shadow-none font-medium px-2 py-0.5 rounded-full text-[11px]">
                              ● Aktif
                            </Badge>
                          ) : (
                            <Badge className="bg-[#EDEAE4] text-[#A8A49E] hover:bg-[#EDEAE4] shadow-none font-medium px-2 py-0.5 rounded-full text-[11px]">
                              ○ Nonaktif
                            </Badge>
                          )}
                        </td>
                        <td className="p-3 px-4 align-middle">
                           <div className="flex gap-1.5" onClick={e => e.stopPropagation()}>
                             <Button size="sm" variant="outline" className="h-7 text-xs px-2.5 rounded-[7px] border-[#E0DDD7] text-[#6B6760] hover:text-[#1A1814]" onClick={() => openEditModal(emp)}>Edit</Button>
                             <Button size="sm" variant="outline" className="h-7 text-xs px-2.5 rounded-[7px] border-[#E0DDD7] text-[#C84B2F] hover:bg-[#F5E8E4] hover:border-[#e8b4aa] hover:text-[#C84B2F]" onClick={() => openToggleConfirm(emp)}>
                               {emp.status === 'aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                             </Button>
                           </div>
                        </td>
                      </tr>
                    )
                  })}
                  {filtered.length === 0 && (
                    <tr><td colSpan={7} className="p-10 text-center text-[#A8A49E]">Tidak ada data</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </Card>

        {/* DETAIL PANEL */}
        <div className="sticky top-5">
          {selectedEmployee ? (() => {
            const c = AV_COLORS[selectedIdx % AV_COLORS.length]
            const kasbonPct = selectedEmployee.kasbon_limit ? Math.round(((selectedEmployee.kasbon_used || 0) / selectedEmployee.kasbon_limit) * 100) : 0
            const absenPct = Math.round(((selectedEmployee.absen || 0) / 26) * 100)

            return (
              <Card className="rounded-[16px] border-[#E0DDD7] shadow-sm overflow-hidden bg-white">
                <div className="bg-[#1A1814] p-6">
                  <div className="flex items-center gap-3.5 mb-4">
                    <Avatar className="w-[52px] h-[52px] rounded-full shrink-0 flex items-center justify-center font-['Syne'] text-[18px] font-bold" style={{ backgroundColor: c.bg, color: c.fg }}>
                      <AvatarFallback className="bg-transparent">{initials(selectedEmployee.name || '?')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-['Syne'] text-[17px] font-bold text-white">{selectedEmployee.name}</div>
                      <div className="text-[12px] text-white/40 font-mono mt-0.5">{selectedEmployee.emp_id} · {selectedEmployee.dept}</div>
                    </div>
                    <div className="ml-auto">
                      {selectedEmployee.status === 'aktif' ? (
                        <Badge className="bg-[#E2F0E8] text-[#2A7A4B] hover:bg-[#E2F0E8] shadow-none font-medium px-2 py-0.5 rounded-full text-[11px]">
                          Aktif
                        </Badge>
                      ) : (
                        <Badge className="bg-white/10 text-[#A8A49E] hover:bg-white/10 shadow-none font-medium px-2 py-0.5 rounded-full text-[11px]">
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
                    <div className="text-[11px] text-[#A8A49E] uppercase tracking-[0.8px] font-mono mb-2.5">Info pekerjaan</div>
                    <div className="flex justify-between items-center py-1.5 border-b border-[#E0DDD7] last:border-none text-[13px]">
                      <span className="text-[#6B6760]">Jabatan</span><span className="font-medium text-[#1A1814]">{selectedEmployee.role}</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-[#E0DDD7] last:border-none text-[13px]">
                      <span className="text-[#6B6760]">Jam kerja</span><span className="font-medium text-[#1A1814] font-mono">{selectedEmployee.shift}</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-[#E0DDD7] last:border-none text-[13px]">
                      <span className="text-[#6B6760]">Bergabung</span><span className="font-medium text-[#1A1814]">{fmtDate(selectedEmployee.joined)}</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-[#E0DDD7] last:border-none text-[13px]">
                      <span className="text-[#6B6760]">Batas kasbon</span><span className="font-medium text-[#1A1814] font-mono">{fmtCurrency(selectedEmployee.kasbon_limit)}/bln</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-[#E0DDD7] last:border-none text-[13px]">
                      <span className="text-[#6B6760]">Slip terakhir</span><span className="font-medium text-[#1A1814]">{selectedEmployee.last_slip || '—'}</span>
                    </div>
                  </div>

                  <div className="mb-5 last:mb-0">
                    <div className="text-[11px] text-[#A8A49E] uppercase tracking-[0.8px] font-mono mb-2.5">Kontak</div>
                    <div className="flex justify-between items-center py-1.5 border-b border-[#E0DDD7] last:border-none text-[13px]">
                      <span className="text-[#6B6760]">Email</span><span className="font-medium text-[#1A1814] font-mono text-[12px]">{selectedEmployee.email}</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-[#E0DDD7] last:border-none text-[13px]">
                      <span className="text-[#6B6760]">No. HP</span><span className="font-medium text-[#1A1814] font-mono text-[12px]">{selectedEmployee.phone}</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-[#E0DDD7] last:border-none text-[13px]">
                      <span className="text-[#6B6760]">Alamat</span><span className="font-medium text-[#1A1814] text-[12px] text-right max-w-[180px]">{selectedEmployee.address}</span>
                    </div>
                  </div>

                  <div className="mb-5 last:mb-0">
                    <div className="text-[11px] text-[#A8A49E] uppercase tracking-[0.8px] font-mono mb-2.5">Bulan ini</div>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <div className="text-[12px] text-[#6B6760] w-20">Kehadiran</div>
                        <div className="flex-1 bg-[#EDEAE4] h-[5px] rounded-full overflow-hidden">
                           <div className="h-full bg-[#2A7A4B] rounded-full" style={{ width: `${absenPct}%` }} />
                        </div>
                        <div className="font-mono text-[11px] text-[#A8A49E] w-7 text-right">{absenPct}%</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-[12px] text-[#6B6760] w-20">Kasbon</div>
                        <div className="flex-1 bg-[#EDEAE4] h-[5px] rounded-full overflow-hidden">
                           <div className="h-full rounded-full" style={{ width: `${Math.min(kasbonPct, 100)}%`, backgroundColor: kasbonPct > 80 ? '#C84B2F' : '#B87333' }} />
                        </div>
                        <div className="font-mono text-[11px] text-[#A8A49E] w-7 text-right">{kasbonPct}%</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 px-5 border-t border-[#E0DDD7] flex gap-2">
                  <Button variant="outline" className="flex-1 text-[13px] border-[#E0DDD7] text-[#6B6760] hover:bg-[#EDEAE4] hover:text-[#1A1814]" onClick={() => showToast(`Riwayat absensi ${selectedEmployee.name}`)}>Absensi</Button>
                  <Button variant="outline" className="flex-1 text-[13px] border-[#E0DDD7] text-[#6B6760] hover:bg-[#EDEAE4] hover:text-[#1A1814]" onClick={() => showToast(`Riwayat kasbon ${selectedEmployee.name}`)}>Kasbon</Button>
                  <Button className="flex-1 text-[13px] bg-[#1A1814] text-white hover:bg-[#2a2620]" onClick={() => openEditModal(selectedEmployee)}>Edit data</Button>
                </div>
              </Card>
            )
          })() : (
            <Card className="rounded-[16px] border-[#E0DDD7] shadow-sm bg-white p-10 text-center text-[#A8A49E] flex flex-col items-center justify-center">
               <Info className="w-10 h-10 mb-3 opacity-30"/>
               <div className="text-[13.5px] font-medium text-[#6B6760] mb-1">Detail Karyawan</div>
               <div className="text-[12.5px]">Klik nama karyawan<br />untuk lihat profil lengkap</div>
            </Card>
          )}
        </div>
      </div>

      {/* ── ADD / EDIT MODAL ── */}
      <Dialog open={showFormModal} onOpenChange={setShowFormModal}>
        <DialogContent className="sm:max-w-[520px] p-0 border-[#E0DDD7] rounded-[16px] overflow-hidden gap-0">
          <form onSubmit={handleSave}>
            <DialogHeader className="p-6 pb-4 border-b border-[#E0DDD7] bg-white sticky top-0 z-10">
              <DialogTitle className="font-['Syne'] text-[18px] font-bold text-[#1A1814]">
                {isEdit ? 'Edit Karyawan' : 'Tambah Karyawan'}
              </DialogTitle>
              <DialogDescription className="hidden">Employee form details</DialogDescription>
            </DialogHeader>
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {/* Account section — only for new employees */}
              {!isEdit && (
                <div className="mb-5 last:mb-0">
                  <div className="text-[11px] text-[#A8A49E] uppercase tracking-[0.8px] font-mono mb-3">Akun login</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] text-[#6B6760] font-medium">Email *</label>
                      <Input type="email" placeholder="nama@drmeow.com" value={form.email} onChange={setField('email')} required className="rounded-[10px] border-[#E0DDD7]" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] text-[#6B6760] font-medium">Password *</label>
                      <Input type="password" placeholder="Min. 6 karakter" value={form.password} onChange={setField('password')} required minLength={6} className="rounded-[10px] border-[#E0DDD7]" />
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-5 last:mb-0">
                <div className="text-[11px] text-[#A8A49E] uppercase tracking-[0.8px] font-mono mb-3">Data pribadi</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] text-[#6B6760] font-medium">Nama lengkap</label>
                    <Input type="text" placeholder="Nama karyawan" value={form.name} onChange={setField('name')} required className="rounded-[10px] border-[#E0DDD7]" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] text-[#6B6760] font-medium">ID Karyawan</label>
                    <Input type="text" placeholder="EMP-001" value={form.emp_id} onChange={setField('emp_id')} className="rounded-[10px] border-[#E0DDD7]" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] text-[#6B6760] font-medium">No. HP / WhatsApp</label>
                    <Input type="text" placeholder="08xx-xxxx-xxxx" value={form.phone} onChange={setField('phone')} className="rounded-[10px] border-[#E0DDD7]" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] text-[#6B6760] font-medium">Tanggal bergabung</label>
                    <Input type="date" value={form.joined} onChange={setField('joined')} className="rounded-[10px] border-[#E0DDD7]" />
                  </div>
                  <div className="flex flex-col gap-1.5 col-span-2">
                    <label className="text-[12px] text-[#6B6760] font-medium">Alamat</label>
                    <Input type="text" placeholder="Alamat lengkap" value={form.address} onChange={setField('address')} className="rounded-[10px] border-[#E0DDD7]" />
                  </div>
                </div>
              </div>

              <div className="mb-5 last:mb-0">
                <div className="text-[11px] text-[#A8A49E] uppercase tracking-[0.8px] font-mono mb-3">Pekerjaan & gaji</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] text-[#6B6760] font-medium">Divisi (dept)</label>
                    <Select value={form.dept} onValueChange={v => setFieldDirectly('dept', v)}>
                      <SelectTrigger className="rounded-[10px] border-[#E0DDD7]">
                        <SelectValue placeholder="Pilih divisi" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="kasir">Kasir</SelectItem>
                        <SelectItem value="gudang">Gudang</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] text-[#6B6760] font-medium">Jabatan</label>
                    <Input type="text" placeholder="Staff, Senior, dll" value={form.role} onChange={setField('role')} className="rounded-[10px] border-[#E0DDD7]" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] text-[#6B6760] font-medium">Gaji pokok (Rp)</label>
                    <Input type="number" placeholder="3000000" value={form.salary} onChange={setField('salary')} className="rounded-[10px] border-[#E0DDD7]" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] text-[#6B6760] font-medium">Jam kerja</label>
                    <Select value={form.shift} onValueChange={v => setFieldDirectly('shift', v)}>
                      <SelectTrigger className="rounded-[10px] border-[#E0DDD7]">
                        <SelectValue placeholder="Pilih jam kerja" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="08:00 – 17:00">08:00 – 17:00</SelectItem>
                        <SelectItem value="09:00 – 18:00">09:00 – 18:00</SelectItem>
                        <SelectItem value="07:00 – 16:00">07:00 – 16:00</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] text-[#6B6760] font-medium">Batas kasbon / bulan (Rp)</label>
                    <Input type="number" placeholder="1000000" value={form.kasbon_limit} onChange={setField('kasbon_limit')} className="rounded-[10px] border-[#E0DDD7]" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] text-[#6B6760] font-medium">Status</label>
                    <Select value={form.status} onValueChange={v => setFieldDirectly('status', v)}>
                      <SelectTrigger className="rounded-[10px] border-[#E0DDD7]">
                        <SelectValue placeholder="Pilih status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="aktif">Aktif</SelectItem>
                        <SelectItem value="nonaktif">Nonaktif</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter className="p-6 pt-4 border-t border-[#E0DDD7] bg-white">
              <Button type="button" variant="ghost" className="rounded-[10px] text-[#6B6760] hover:text-[#1A1814]" onClick={() => setShowFormModal(false)}>Batal</Button>
              <Button type="submit" className="rounded-[10px] bg-[#C84B2F] hover:bg-[#b03d24] text-white" disabled={saving}>
                {saving ? 'Menyimpan...' : 'Simpan Karyawan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── CONFIRM MODAL ── */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="sm:max-w-[400px] p-0 border-[#E0DDD7] rounded-[16px] overflow-hidden gap-0">
          <div className="p-7 px-6 text-center">
            <div className="mx-auto mb-4 flex justify-center">
              {confirmData?.newStatus === 'nonaktif' ? (
                <div className="w-14 h-14 bg-[#F5E8E4] rounded-full flex items-center justify-center">
                  <UserX className="w-6 h-6 text-[#C84B2F]" />
                </div>
              ) : (
                 <div className="w-14 h-14 bg-[#E2F0E8] rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-[#2A7A4B]" />
                 </div>
              )}
            </div>
            <div className="font-['Syne'] text-[18px] font-bold text-[#1A1814] mb-2">
              {confirmData?.newStatus === 'nonaktif' ? `Nonaktifkan ${confirmData.name}?` : `Aktifkan ${confirmData.name}?`}
            </div>
            <div className="text-[13.5px] text-[#6B6760] leading-relaxed">
              {confirmData?.newStatus === 'nonaktif'
                ? 'Data karyawan akan diarsipkan. Riwayat absensi dan kasbon tetap tersimpan. Karyawan tidak bisa login atau absen.'
                : 'Karyawan akan diaktifkan kembali dan bisa melakukan absensi mulai hari ini.'}
            </div>
          </div>
          <DialogFooter className="p-6 pt-0 sm:justify-end gap-2">
             <Button variant="ghost" className="rounded-[10px] text-[#6B6760]" onClick={() => setShowConfirm(false)}>Batal</Button>
             <Button 
               className="rounded-[10px] border-none text-white"
               style={{ backgroundColor: confirmData?.newStatus === 'nonaktif' ? '#C84B2F' : '#2A7A4B' }}
               onClick={doToggleStatus}
             >
               {confirmData?.newStatus === 'nonaktif' ? 'Nonaktifkan' : 'Aktifkan'}
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── TOAST ── */}
      {/* Keeping simple custom toast for simplicity as replacing it fully with sonner requires app-level setup */}
      <div className={`fixed bottom-7 right-7 bg-[#1A1814] text-white px-[18px] py-3 rounded-[10px] text-[13.5px] z-50 flex items-center gap-2 transition-all duration-300 font-sans ${toast ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-5 opacity-0 pointer-events-none'}`}>
        <div className="w-2 h-2 rounded-full bg-[#4ade80] shrink-0" />
        <span>{toast}</span>
      </div>
    </AdminLayout>
  )
}

import { useState, useCallback, type ChangeEvent, type FormEvent } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import type { Employee, EmployeeFormData } from '@/types'
import * as XLSX from 'xlsx'

export const EMPTY_FORM: EmployeeFormData = {
  name: '',
  emp_id: '',
  email: '',
  password: '',
  phone: '',
  address: '',
  dept: 'staff',
  jabatan: '',
  role: 'employee',
  salary: '',
  shift: '08:00 – 17:00',
  kasbon_limit: '',
  status: 'active',
  joined: new Date().toISOString().slice(0, 10),
}

export function useEmployee() {
  const queryClient = useQueryClient()
  const [searchQ, setSearchQ] = useState('')
  const [deptFilter, setDeptFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | 'all'>('active')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // modal
  const [showFormModal, setShowFormModal] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<EmployeeFormData>(EMPTY_FORM)

  // confirm modal
  const [showConfirm, setShowConfirm] = useState(false)
  const [confirmData, setConfirmData] = useState<{ id: string; name: string; newStatus: 'active' | 'inactive' } | null>(null)

  /* ── fetch employees (React Query) ── */
  const { data: employees = [], isLoading: loading } = useQuery<Employee[]>({
    queryKey: ['employees'],
    queryFn: async () => {
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString()

      // Fetch users
      const { data: userData, error: userError } = await supabaseAdmin
        .schema('hr')
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (userError) {
        console.error('Fetch employees error:', userError)
        toast.error('Gagal memuat data karyawan')
        throw userError
      }

      // Fetch kasbon usage for the current month
      const { data: kasbonData, error: kasbonError } = await supabaseAdmin
        .schema('hr')
        .from('kasbon')
        .select('user_id, amount')
        .neq('status', 'rejected')
        .gte('requested_at', startOfMonth)
        .lt('requested_at', endOfMonth)

      if (kasbonError) {
        console.error('Fetch kasbon usage error:', kasbonError)
      }

      const kasbonMap: Record<string, number> = {}
      if (kasbonData) {
        kasbonData.forEach((k: any) => {
          if (k.user_id) {
            kasbonMap[k.user_id] = (kasbonMap[k.user_id] || 0) + Number(k.amount)
          }
        })
      }

      return (userData || []).map((u: Record<string, unknown>) => ({
        id: u.id as string,
        email: (u.email as string) || '',
        name: (u.name as string) || '',
        emp_id: (u.emp_id as string) || '',
        dept: (u.dept as string) || '',
        jabatan: (u.jabatan as string) || '',
        role: ((u.role as string) || 'employee') as 'admin' | 'employee',
        phone: (u.phone as string) || '',
        salary: Number(u.salary) || 0,
        kasbon_limit: Number(u.kasbon_limit) || 0,
        shift: (u.shift as string) || '08:00 – 17:00',
        address: (u.address as string) || '',
        joined: (u.created_at as string) || '',
        status: ((u.status as string) === 'inactive' ? 'inactive' : 'active') as 'active' | 'inactive',
        absen: Number(u.absen) || 0,
        kasbon_used: kasbonMap[u.id as string] || 0,
        last_slip: (u.last_slip as string) || '—',
      })) as Employee[]
    }
  })

  /* ── filtering ── */
  const filtered = employees.filter(e => {
    const matchStatus = statusFilter === 'all' || e.status === statusFilter
    const matchDept = deptFilter === 'all' || e.dept === deptFilter
    const q = searchQ.toLowerCase()
    const matchSearch = e.name.toLowerCase().includes(q) || e.emp_id.toLowerCase().includes(q)
    return matchStatus && matchDept && matchSearch
  })

  const departments = Array.from(new Set(employees.map(e => e.dept).filter(Boolean)))
  const totalAktif = employees.filter(e => e.status === 'active').length
  const totalNonaktif = employees.filter(e => e.status === 'inactive').length
  const totalSalary = employees.filter(e => e.status === 'active').reduce((s, e) => s + e.salary, 0)
  
  const deptCounts = employees.filter(e => e.status === 'active').reduce<Record<string, number>>((acc, e) => {
    acc[e.dept] = (acc[e.dept] || 0) + 1
    return acc
  }, {})
  const topDept = Object.entries(deptCounts).sort((a, b) => b[1] - a[1])[0] as [string, number] | undefined

  const selectedEmployee = selectedId ? employees.find(e => e.id === selectedId) || null : null
  const selectedIdx = selectedEmployee ? employees.indexOf(selectedEmployee) : -1

  /* ── form helpers ── */
  const setField = (field: keyof EmployeeFormData) => (ev: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [field]: ev.target.value }))
  }
  
  const setFieldDirectly = (field: keyof EmployeeFormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const openAddModal = useCallback(() => {
    setIsEdit(false)
    setEditId(null)
    setForm(EMPTY_FORM)
    setShowFormModal(true)
  }, [])

  const openEditModal = useCallback((emp: Employee) => {
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
      jabatan: emp.jabatan,
      role: emp.role,
      salary: String(emp.salary || '').replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
      shift: emp.shift,
      kasbon_limit: String(emp.kasbon_limit || '').replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
      status: emp.status,
      joined: emp.joined ? emp.joined.slice(0, 10) : '',
    })
    setShowFormModal(true)
  }, [])

  /* ── save (create / update) ── */
  const saveMutation = useMutation({
    mutationFn: async (payload: { isEdit: boolean, form: EmployeeFormData, editId: string | null }) => {
      const { isEdit, form, editId } = payload
      if (!isEdit) {
        if (!form.email || !form.password) throw new Error('Email dan password wajib diisi')

        const { data, error } = await supabaseAdmin.auth.admin.createUser({
          email: form.email,
          password: form.password,
          email_confirm: true,
          user_metadata: {
            name: form.name,
            emp_id: form.emp_id,
            dept: form.dept,
            role: form.role,
          },
        })

        if (error) throw error

        if (data?.user) {
          const { error: profileError } = await supabaseAdmin
            .schema('hr')
            .from('users')
            .upsert({
              id: data.user.id,
              email: form.email,
              name: form.name,
              emp_id: form.emp_id,
              dept: form.dept,
              role: form.role, 
              jabatan: form.jabatan,
              phone: form.phone,
              salary: Number(String(form.salary).replace(/\./g, '')) || 0,
              kasbon_limit: Number(String(form.kasbon_limit).replace(/\./g, '')) || 0,
              shift: form.shift,
              address: form.address,
              status: form.status,
              must_change_password: true,
            })

          if (profileError) throw new Error(`User dibuat tapi profil gagal: ${profileError.message}`)
        }
        return { action: 'add', name: form.name }
      } else {
        // 1. Update the email in Supabase Auth (since it's a login credential)
        const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
          editId!,
          { email: form.email }
        )
        if (authError) throw authError

        // 2. Update the profile in the hr.users table
        const updateData = {
          email: form.email,
          name: form.name,
          emp_id: form.emp_id,
          dept: form.dept,
          role: form.role,
          jabatan: form.jabatan,
          phone: form.phone,
          salary: Number(String(form.salary).replace(/\./g, '')) || 0,
          kasbon_limit: Number(String(form.kasbon_limit).replace(/\./g, '')) || 0,
          shift: form.shift,
          address: form.address,
          status: form.status,
        }

        const { error } = await supabaseAdmin
          .schema('hr')
          .from('users')
          .update(updateData)
          .eq('id', editId!)

        if (error) throw error
        return { action: 'edit', name: form.name }
      }
    },
    onSuccess: (res) => {
      toast.success(res.action === 'add' ? `${res.name} berhasil ditambahkan` : `Data ${res.name} berhasil diperbarui`)
      setShowFormModal(false)
      queryClient.invalidateQueries({ queryKey: ['employees'] })
    },
    onError: (err: Error) => {
      toast.error(`Gagal: ${err.message}`)
    }
  })

  const handleSave = useCallback((ev: FormEvent) => {
    ev.preventDefault()
    saveMutation.mutate({ isEdit, form, editId })
  }, [isEdit, form, editId, saveMutation])

  /* ── toggle status ── */
  const openToggleConfirm = useCallback((emp: Employee) => {
    setConfirmData({
      id: emp.id,
      name: emp.name,
      newStatus: emp.status === 'active' ? 'inactive' : 'active',
    })
    setShowConfirm(true)
  }, [])

  const toggleStatusMutation = useMutation({
    mutationFn: async (data: { id: string, name: string, newStatus: 'active' | 'inactive' }) => {
      const { error } = await supabaseAdmin
        .schema('hr')
        .from('users')
        .update({ status: data.newStatus })
        .eq('id', data.id)

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      toast.success(`${data.name} berhasil ${data.newStatus === 'inactive' ? 'dinonaktifkan' : 'diaktifkan'}`)
      setShowConfirm(false)
      setConfirmData(null)
      queryClient.invalidateQueries({ queryKey: ['employees'] })
    },
    onError: (err: Error) => {
      toast.error(`Gagal: ${err.message}`)
    }
  })

  const doToggleStatus = useCallback(() => {
    if (!confirmData) return
    toggleStatusMutation.mutate(confirmData)
  }, [confirmData, toggleStatusMutation])

  /* ── export excel ── */
  const exportExcel = useCallback(() => {
    const wsData = filtered.map(e => ({
      'Nama': e.name,
      'ID Karyawan': e.emp_id,
      'Divisi / Dept': e.dept,
      'Jabatan': e.jabatan,
      'Gaji Pokok': e.salary,
      'Shift': e.shift,
      'Status': e.status === 'active' ? 'Aktif' : 'Nonaktif',
      'No. HP': e.phone || '-',
      'Alamat': e.address || '-',
      'Tanggal Bergabung': e.joined || '-',
    }))

    const ws = XLSX.utils.json_to_sheet(wsData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Karyawan')
    XLSX.writeFile(wb, `Data_Karyawan_${new Date().toISOString().slice(0, 10)}.xlsx`)
  }, [filtered])

  return {
    employees,
    loading,
    searchQ,
    setSearchQ,
    deptFilter,
    setDeptFilter,
    statusFilter,
    setStatusFilter,
    selectedId,
    setSelectedId,
    showFormModal,
    setShowFormModal,
    isEdit,
    editId,
    form,
    showConfirm,
    setShowConfirm,
    confirmData,
    filtered,
    departments,
    totalAktif,
    totalNonaktif,
    totalSalary,
    topDept,
    selectedEmployee,
    selectedIdx,
    setField,
    setFieldDirectly,
    openAddModal,
    openEditModal,
    handleSave,
    saveMutation,
    openToggleConfirm,
    doToggleStatus,
    toggleStatusMutation,
    exportExcel,
  }
}

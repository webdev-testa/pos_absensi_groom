import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import ManageEmployee from '../manageEmployee'

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'usr-admin', name: 'Dr. Meow Admin', role: 'superadmin' },
  }),
}))

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signOut: vi.fn(),
    },
  },
}))

const mockEmployee = {
  id: 'emp-1',
  name: 'Dr. Sarah Smith',
  emp_id: 'DM-001',
  email: 'sarah@meow.com',
  jabatan: 'Dokter Hewan',
  role: 'employee',
  phone: '081234567890',
  shift: 'Pagi (08:00 - 16:00)',
  address: 'Jl. Kucing No. 1',
  joined: '2024-01-15',
  status: 'active',
  salary: 5000000,
  dept: 'Dokter',
  kasbon_limit: 2000000,
}

const mockUseEmployee = {
  employees: [mockEmployee],
  loading: false,
  searchQ: '',
  setSearchQ: vi.fn(),
  deptFilter: 'all',
  setDeptFilter: vi.fn(),
  statusFilter: 'all',
  setStatusFilter: vi.fn(),
  selectedId: 'emp-1',
  setSelectedId: vi.fn(),
  showFormModal: false,
  setShowFormModal: vi.fn(),
  isEdit: false,
  form: {
    name: '',
    emp_id: '',
    email: '',
    phone: '',
    address: '',
    dept: 'Dokter',
    jabatan: '',
    role: 'employee',
    salary: '',
    shift: 'Pagi',
  },
  showConfirm: false,
  setShowConfirm: vi.fn(),
  confirmData: null,
  filtered: [mockEmployee],
  departments: ['Dokter', 'Grooming'],
  totalAktif: 1,
  totalNonaktif: 0,
  totalSalary: 5000000,
  topDept: 'Dokter',
  selectedEmployee: mockEmployee,
  selectedIdx: 0,
  setField: vi.fn(),
  setFieldDirectly: vi.fn(),
  openAddModal: vi.fn(),
  openEditModal: vi.fn(),
  handleSave: vi.fn(),
  saveMutation: { isPending: false },
  openToggleConfirm: vi.fn(),
  doToggleStatus: vi.fn(),
  toggleStatusMutation: { isPending: false },
  exportExcel: vi.fn(),
}

vi.mock('@/hooks/useEmployee', () => ({
  useEmployee: () => mockUseEmployee,
}))

describe('manageEmployee.tsx - Admin Page Tests', () => {
  it('renders manage employee page with stats, filters, and employee details', () => {
    render(
      <MemoryRouter>
        <ManageEmployee />
      </MemoryRouter>
    )

    expect(screen.getByText('Kelola Staf Klinik')).toBeInTheDocument()
    expect(screen.getByText(/Data master staf · gaji pokok · posisi & jadwal/i)).toBeInTheDocument()
    expect(screen.getAllByText('Dr. Sarah Smith').length).toBeGreaterThanOrEqual(1)
  })

  it('triggers openAddModal when Tambah Karyawan button is clicked', () => {
    render(
      <MemoryRouter>
        <ManageEmployee />
      </MemoryRouter>
    )

    const addBtn = screen.getByRole('button', { name: /Tambah Karyawan/i })
    fireEvent.click(addBtn)
    expect(mockUseEmployee.openAddModal).toHaveBeenCalled()
  })
})

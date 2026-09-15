import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { EmployeeTable } from '../EmployeeTable'
import type { Employee } from '@/types'

describe('EmployeeTable.tsx - Component Tests', () => {
  const mockEmployees: Employee[] = [
    {
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
      created_at: '2024-01-15T00:00:00Z',
    },
    {
      id: 'emp-2',
      name: 'Budi Groomer',
      emp_id: 'DM-002',
      email: 'budi@meow.com',
      jabatan: 'Senior Groomer',
      role: 'employee',
      phone: '081298765432',
      shift: 'Siang (12:00 - 20:00)',
      address: 'Jl. Meow No. 2',
      joined: '2024-02-01',
      status: 'inactive',
      salary: 3500000,
      dept: 'Grooming',
      kasbon_limit: 1500000,
      created_at: '2024-02-01T00:00:00Z',
    },
  ]

  it('renders employee table header and employee list', () => {
    render(
      <EmployeeTable
        employees={mockEmployees}
        filtered={mockEmployees}
        selectedId={null}
        statusFilter="all"
        onSelect={vi.fn()}
        onEdit={vi.fn()}
        onToggleStatus={vi.fn()}
        loading={false}
        onAddClick={vi.fn()}
        onExportClick={vi.fn()}
      />
    )

    expect(screen.getByText('Daftar Staf Klinik')).toBeInTheDocument()
    expect(screen.getByText('Dr. Sarah Smith')).toBeInTheDocument()
    expect(screen.getByText('DM-001')).toBeInTheDocument()
    expect(screen.getByText('sarah@meow.com')).toBeInTheDocument()
    expect(screen.getByText('Budi Groomer')).toBeInTheDocument()
    expect(screen.getByText('● Aktif')).toBeInTheDocument()
    expect(screen.getByText('○ Nonaktif')).toBeInTheDocument()
  })

  it('triggers onSelect, onEdit, and onToggleStatus callbacks', () => {
    const handleSelect = vi.fn()
    const handleEdit = vi.fn()
    const handleToggle = vi.fn()

    render(
      <EmployeeTable
        employees={mockEmployees}
        filtered={mockEmployees}
        selectedId={null}
        statusFilter="all"
        onSelect={handleSelect}
        onEdit={handleEdit}
        onToggleStatus={handleToggle}
        loading={false}
        onAddClick={vi.fn()}
        onExportClick={vi.fn()}
      />
    )

    // Click on row to select
    const rowName = screen.getByText('Dr. Sarah Smith')
    fireEvent.click(rowName)
    expect(handleSelect).toHaveBeenCalledWith('emp-1')

    // Click Edit button for Sarah
    const editBtns = screen.getAllByRole('button', { name: /Edit/i })
    fireEvent.click(editBtns[0])
    expect(handleEdit).toHaveBeenCalledWith(mockEmployees[0])

    // Click Toggle Status button (Nonaktifkan for active user)
    const toggleBtn = screen.getByRole('button', { name: /Nonaktifkan/i })
    fireEvent.click(toggleBtn)
    expect(handleToggle).toHaveBeenCalledWith(mockEmployees[0])
  })

  it('shows empty state when filtered list is empty', () => {
    render(
      <EmployeeTable
        employees={mockEmployees}
        filtered={[]}
        selectedId={null}
        statusFilter="all"
        onSelect={vi.fn()}
        onEdit={vi.fn()}
        onToggleStatus={vi.fn()}
        loading={false}
        onAddClick={vi.fn()}
        onExportClick={vi.fn()}
      />
    )

    expect(screen.getByText('Tidak ada data staf')).toBeInTheDocument()
  })

  it('displays loading state correctly', () => {
    render(
      <EmployeeTable
        employees={[]}
        filtered={[]}
        selectedId={null}
        statusFilter="all"
        onSelect={vi.fn()}
        onEdit={vi.fn()}
        onToggleStatus={vi.fn()}
        loading={true}
        onAddClick={vi.fn()}
        onExportClick={vi.fn()}
      />
    )

    expect(screen.getByText('Memuat data staf...')).toBeInTheDocument()
  })
})

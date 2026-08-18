import { AdminLayout } from '@/components/layout/AdminLayout'
import { useEmployee } from '@/hooks/useEmployee'
import { useNavigate } from 'react-router-dom'
import { EmployeeStats } from '@/components/page-sections/employee/EmployeeStats'
import { EmployeeFilters } from '@/components/page-sections/employee/EmployeeFilters'
import { EmployeeTable } from '@/components/page-sections/employee/EmployeeTable'
import { EmployeeDetailPanel } from '@/components/page-sections/employee/EmployeeDetailPanel'
import { EmployeeFormDialog } from '@/components/page-sections/employee/EmployeeFormDialog'
import { ConfirmToggleDialog } from '@/components/page-sections/employee/ConfirmToggleDialog'

import { toast } from 'sonner'

export default function ManageEmployee() {
  const navigate = useNavigate()
  const {
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
  } = useEmployee()

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">Kelola Staf Klinik</h1>
        <p className="text-sm text-muted-foreground mt-1">Data master staf · gaji pokok · posisi & jadwal</p>
      </div>

      <EmployeeStats 
        totalAktif={totalAktif} 
        totalNonaktif={totalNonaktif} 
        totalSalary={totalSalary} 
        topDept={topDept} 
      />

      <EmployeeFilters 
        searchQ={searchQ}
        onSearchChange={setSearchQ}
        deptFilter={deptFilter}
        onDeptFilterChange={setDeptFilter}
        departments={departments}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      {/* LAYOUT: TABLE + DETAIL */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5 items-start">
        <EmployeeTable 
          employees={employees}
          filtered={filtered}
          selectedId={selectedId}
          statusFilter={statusFilter}
          onSelect={setSelectedId}
          onEdit={openEditModal}
          onToggleStatus={openToggleConfirm}
          loading={loading}
          onAddClick={openAddModal}
          onExportClick={exportExcel}
        />

        <EmployeeDetailPanel 
          selectedEmployee={selectedEmployee}
          selectedIdx={selectedIdx}
          onEdit={openEditModal}
          onShowAttendance={name => toast.info(`Riwayat absensi ${name}`)}
          onShowKasbon={name => navigate(`/admin/kasbon?search=${encodeURIComponent(name)}`)}
        />
      </div>

      <EmployeeFormDialog 
        open={showFormModal}
        onOpenChange={setShowFormModal}
        isEdit={isEdit}
        form={form}
        onChange={setField}
        onSelectChange={setFieldDirectly}
        onSubmit={handleSave}
        isPending={saveMutation.isPending}
      />

      <ConfirmToggleDialog 
        open={showConfirm}
        onOpenChange={setShowConfirm}
        confirmData={confirmData}
        onConfirm={doToggleStatus}
        isPending={toggleStatusMutation.isPending}
      />
    </AdminLayout>
  )
}

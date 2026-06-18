import { AdminLayout } from '@/components/layout/AdminLayout'
import { useEmployee } from '@/hooks/useEmployee'
import { EmployeeHeader } from '@/components/page-sections/employee/EmployeeHeader'
import { EmployeeStats } from '@/components/page-sections/employee/EmployeeStats'
import { EmployeeFilters } from '@/components/page-sections/employee/EmployeeFilters'
import { EmployeeTable } from '@/components/page-sections/employee/EmployeeTable'
import { EmployeeDetailPanel } from '@/components/page-sections/employee/EmployeeDetailPanel'
import { EmployeeFormDialog } from '@/components/page-sections/employee/EmployeeFormDialog'
import { ConfirmToggleDialog } from '@/components/page-sections/employee/ConfirmToggleDialog'

export default function ManageEmployee() {
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
    showToast,
    exportExcel,
  } = useEmployee()

  return (
    <AdminLayout>
      <EmployeeHeader />

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
          onShowAttendance={name => showToast(`Riwayat absensi ${name}`)}
          onShowKasbon={name => showToast(`Riwayat kasbon ${name}`)}
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

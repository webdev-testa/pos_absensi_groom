import { AdminLayout } from '@/components/layout/AdminLayout'
import { useKasbon } from '@/hooks/useKasbon'
import { KasbonStats } from '@/components/page-sections/kasbon/KasbonStats'
import { KasbonFilters } from '@/components/page-sections/kasbon/KasbonFilters'
import { KasbonTable } from '@/components/page-sections/kasbon/KasbonTable'
import { KasbonFormDialog } from '@/components/page-sections/kasbon/KasbonFormDialog'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function ManageKasbon() {
  const {
    searchQ,
    setSearchQ,
    statusFilter,
    setStatusFilter,
    tabFilter,
    setTabFilter,
    monthFilter,
    setMonthFilter,
    showModal,
    setShowModal,
    selectedUserId,
    setSelectedUserId,
    amountInput,
    setAmountInput,
    dateInput,
    setDateInput,
    reasonInput,
    setReasonInput,
    categoryInput,
    setCategoryInput,
    monthsList,
    employees,
    loadingKasbon,
    refetchKasbon,
    monthlyStats,
    filteredKasbon,
    handleApprove,
    handleReject,
    handleMarkDeducted,
    handleCreateKasbon,
    approveMutation,
    rejectMutation,
    markDeductedMutation,
    addKasbonMutation,
    selectedEmpLimitInfo,
  } = useKasbon()

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">Log Kasbon Staf</h1>
        <p className="text-sm text-muted-foreground mt-1">Rekap dan persetujuan penarikan gaji di muka (kasbon)</p>
      </div>

      {loadingKasbon ? (
        <div className="flex flex-col items-center justify-center py-20 bg-card border border-border rounded-xl shadow-xs">
          <Loader2 className="w-8 h-8 text-[#FF5600] animate-spin mb-4" />
          <p className="text-sm text-muted-foreground">Memuat data kasbon...</p>
        </div>
      ) : (
        <>
          <KasbonStats monthlyStats={monthlyStats} />

          <KasbonFilters 
            searchQ={searchQ}
            onSearchChange={setSearchQ}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            monthFilter={monthFilter}
            onMonthFilterChange={setMonthFilter}
            monthsList={monthsList}
            tabFilter={tabFilter}
            onTabFilterChange={setTabFilter}
          />

          <KasbonTable 
            filteredKasbon={filteredKasbon}
            onApprove={handleApprove}
            onReject={handleReject}
            onMarkDeducted={handleMarkDeducted}
            approvePending={approveMutation.isPending}
            rejectPending={rejectMutation.isPending}
            deductPending={markDeductedMutation.isPending}
            loadingKasbon={loadingKasbon}
            onRefetch={refetchKasbon}
            onExportClick={() => toast.success('Export Excel')}
            onAddClick={() => setShowModal(true)}
          />
        </>
      )}

      <KasbonFormDialog 
        open={showModal}
        onOpenChange={setShowModal}
        onSubmit={handleCreateKasbon}
        employees={employees}
        selectedUserId={selectedUserId}
        onSelectedUserIdChange={setSelectedUserId}
        amountInput={amountInput}
        onAmountInputChange={setAmountInput}
        dateInput={dateInput}
        onDateInputChange={setDateInput}
        categoryInput={categoryInput}
        onCategoryInputChange={setCategoryInput}
        reasonInput={reasonInput}
        onReasonInputChange={setReasonInput}
        isPending={addKasbonMutation.isPending}
        selectedEmpLimitInfo={selectedEmpLimitInfo}
      />
    </AdminLayout>
  )
}
import { AdminLayout } from '@/components/layout/AdminLayout'
import { useKasbon } from '@/hooks/useKasbon'
import { KasbonHeader } from '@/components/page-sections/kasbon/KasbonHeader'
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
  } = useKasbon()

  return (
    <AdminLayout>
      <KasbonHeader />

      {loadingKasbon ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-[#C8E8F5] rounded-[16px] shadow-sm">
          <Loader2 className="w-8 h-8 text-[#F5A940] animate-spin mb-4" />
          <p className="text-[14px] text-[#4A7A8A]">Memuat data kasbon...</p>
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
      />
    </AdminLayout>
  )
}
import { usePayroll } from "@/hooks/usePayroll";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { PayrollHeader } from "@/components/page-sections/payroll/PayrollHeader";
import { PayrollStats } from "@/components/page-sections/payroll/PayrollStats";
import { PayrollFilters } from "@/components/page-sections/payroll/PayrollFilters";
import { PayrollTable } from "@/components/page-sections/payroll/PayrollTable";
import { PayrollDetailPanel } from "@/components/page-sections/payroll/PayrollDetailPanel";
import { PrintPayslip } from "@/components/page-sections/payroll/PrintPayslip";
import { IncentiveDialog } from "@/components/page-sections/payroll/IncentiveDialog";
import { Loader2 } from "lucide-react";

export default function Payroll() {
  const {
    selectedPeriod,
    setSelectedPeriod,
    searchQ,
    setSearchQ,
    deptFilter,
    setDeptFilter,
    statusFilter,
    setStatusFilter,
    selectedUserId,
    setSelectedUserId,
    showIncentiveModal,
    setShowIncentiveModal,
    incentiveAmount,
    setIncentiveAmount,
    monthsList,
    selectedPeriodLabel,
    isInitialLoading,

    // Compiled data & subsets
    mappedPayrollData,
    filteredData,
    departments,
    selectedItem,
    stats,

    // print slip metadata
    printItem,

    // Operations
    exportExcel,
    handlePrint,
    openIncentiveModal,
    handleSaveIncentive,
    generateMutation,
    markPaidMutation,
    markAllPaidMutation,
    updateIncentiveMutation,
  } = usePayroll();

  if (isInitialLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[500px] bg-[#F5F2ED] -m-10 lg:-m-12 p-10 lg:p-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#C84B2F]" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Dynamic Printing Style overrides */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #print-payslip, #print-payslip * {
            visibility: visible;
          }
          #print-payslip {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            display: block !important;
            background: white !important;
            color: black !important;
            padding: 40px !important;
          }
        }
      `,
        }}
      />

      <div className="bg-[#F5F2ED] text-[#1A1814] -m-10 lg:-m-12 p-10 lg:p-12 min-h-screen font-sans flex flex-col gap-6 select-none">
        {/* HEADER */}
        <PayrollHeader />

        {/* STATS COUNTER */}
        <PayrollStats stats={stats} />

        {/* FILTER BAR */}
        <PayrollFilters
          searchQ={searchQ}
          setSearchQ={setSearchQ}
          deptFilter={deptFilter}
          setDeptFilter={setDeptFilter}
          departments={departments}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          mappedPayrollData={mappedPayrollData}
          markAllPaidMutation={markAllPaidMutation}
        />

        {/* MAIN LAYOUT */}
        <div className="grid grid-cols-[1fr_360px] gap-5 items-start">
          <PayrollTable
            filteredData={filteredData}
            selectedUserId={selectedUserId}
            setSelectedUserId={setSelectedUserId}
            openIncentiveModal={openIncentiveModal}
            markPaidMutation={markPaidMutation}
            handlePrint={handlePrint}
            selectedPeriod={selectedPeriod}
            setSelectedPeriod={setSelectedPeriod}
            monthsList={monthsList}
            exportExcel={exportExcel}
            generateMutation={generateMutation}
          />
          <div className="sticky top-5">
            <PayrollDetailPanel
              selectedItem={selectedItem}
              selectedPeriodLabel={selectedPeriodLabel}
              openIncentiveModal={openIncentiveModal}
              handlePrint={handlePrint}
            />
          </div>
        </div>

        {/* PRINT PAYSLIP TEMPLATE CONTAINER */}
        {printItem && (
          <PrintPayslip
            printItem={printItem}
            selectedPeriodLabel={selectedPeriodLabel}
          />
        )}

        {/* EDIT INCENTIVE DIALOG */}
        <IncentiveDialog
          showIncentiveModal={showIncentiveModal}
          setShowIncentiveModal={setShowIncentiveModal}
          selectedPeriodLabel={selectedPeriodLabel}
          incentiveAmount={incentiveAmount}
          setIncentiveAmount={setIncentiveAmount}
          handleSaveIncentive={handleSaveIncentive}
          updateIncentiveMutation={updateIncentiveMutation}
        />
      </div>
    </AdminLayout>
  );
}

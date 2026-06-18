import { useAttendance } from "@/hooks/useAttendance";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { AttendanceStats } from "@/components/page-sections/attendance/AttendanceStats";
import { AttendanceTable } from "@/components/page-sections/attendance/AttendanceTable";
import { AttendanceFeed } from "@/components/page-sections/attendance/AttendanceFeed";
import { LeaveRequests } from "@/components/page-sections/attendance/LeaveRequests";
import { HolidayManagement } from "@/components/page-sections/attendance/HolidayManagement";
import { Clock, Plus, Users, FileText, CalendarDays } from "lucide-react";
import { toast } from "sonner";

export default function AbsenEmployee() {
  const {
    // Basic settings
    mainTab,
    setMainTab,
    activeTab,
    setActiveTab,

    // Filters
    searchQ,
    setSearchQ,
    deptFilter,
    setDeptFilter,
    statusFilter,
    setStatusFilter,

    // Attendance records
    filteredData,
    feedEvents,

    // Cuti records & loading
    cutiLoading,
    actionLoading,
    pendingGroups,
    rejectedGroups,

    // Holiday records & forms
    holidays,
    holidayLoading,
    newHolidayName,
    setNewHolidayName,
    newHolidayDate,
    setNewHolidayDate,
    newHolidayType,
    setNewHolidayType,
    upcomingHolidays,
    pastHolidays,

    // Operations
    toggleFlag,
    handleApproveCuti,
    handleRejectCuti,
    handleAddHoliday,
    handleDeleteHoliday,
    fetchCutiRequests,

    // Attendance stats
    totalEmployees,
    statOntime,
    statLate,
    statOut,
    statAbsent,

    // Cuti stats
    statPendingCuti,
    statPendingIzin,
    statPendingSakit,
    statTotalPending,
  } = useAttendance();

  return (
    <AdminLayout>
      <div className="font-sans text-[#1A1814] -m-10 lg:-m-12 p-10 lg:p-12 min-h-screen" style={{ backgroundColor: "#F5F2ED" }}>
        
        {/* HEADER */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="font-['Syne'] text-[28px] font-bold tracking-tight text-[#1A1814]">
              {mainTab === "absensi" && "Dashboard Absensi"}
              {mainTab === "cuti" && "Kelola Cuti & Izin"}
              {mainTab === "libur" && "Hari Libur & Cuti Bersama"}
            </h1>
            <p className="text-[13.5px] text-[#6B6760] mt-1.5">
              {mainTab === "absensi" && "Pantau kehadiran karyawan secara real-time"}
              {mainTab === "cuti" && "Setujui atau tolak pengajuan cuti, izin, dan sakit karyawan"}
              {mainTab === "libur" && "Kelola hari libur nasional, cuti bersama, dan jadwal tutup kantor"}
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            {mainTab === "absensi" && (
              <div className="flex items-center gap-2 bg-white border border-[#E0DDD7] rounded-[10px] px-3.5 py-2 text-[13px] text-[#6B6760]">
                <div className="w-2 h-2 rounded-full bg-[#2A7A4B] shrink-0 animate-pulse"></div>
                <span>Live · <strong className="text-[#1A1814] font-semibold">
                  {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                </strong></span>
              </div>
            )}
            {mainTab === "cuti" && (
              <button
                onClick={() => fetchCutiRequests()}
                className="bg-white border border-[#E0DDD7] hover:border-[#CBC8C2] hover:text-[#1A1814] text-[#6B6760] rounded-[10px] px-4 py-2 text-[13px] font-medium flex items-center gap-2 transition-colors"
              >
                <Clock className="w-4 h-4" />
                Refresh
              </button>
            )}
            {mainTab === "libur" && (
              <button
                onClick={() => document.getElementById('holiday-form')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-[#1A1814] text-white rounded-[10px] px-4 py-2 text-[13px] font-medium flex items-center gap-2 hover:bg-[#2A2824] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Tambah Hari Libur
              </button>
            )}
          </div>
        </div>

        {/* ─── MAIN TAB BAR ─── */}
        <div className="flex bg-white border border-[#E0DDD7] p-1 rounded-[12px] mb-7 w-fit">
          {([
            { key: "absensi", label: "Absensi", icon: <Users className="w-4 h-4" /> },
            { key: "cuti", label: "Kelola Cuti", icon: <FileText className="w-4 h-4" />, badge: statTotalPending },
            { key: "libur", label: "Hari Libur", icon: <CalendarDays className="w-4 h-4" /> },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setMainTab(tab.key)}
              className={`relative px-5 py-2.5 rounded-[10px] text-[13.5px] font-medium transition-all flex items-center gap-2 ${
                mainTab === tab.key
                  ? "bg-[#1A1814] text-white shadow-sm"
                  : "text-[#6B6760] hover:text-[#1A1814] hover:bg-[#F5F2ED]"
              }`}
            >
              {tab.icon}
              {tab.label}
              {"badge" in tab && tab.badge > 0 && (
                <span className={`ml-1 min-w-[18px] h-[18px] flex items-center justify-center text-[10.5px] font-bold rounded-full px-1 ${
                  mainTab === tab.key ? "bg-white text-[#1A1814]" : "bg-[#C84B2F] text-white"
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ═══════════════════════════════════════════════════ */}
        {/* ══  TAB 1 — ABSENSI                              ══ */}
        {/* ═══════════════════════════════════════════════════ */}
        {mainTab === "absensi" && (
          <>
            <AttendanceStats
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              totalEmployees={totalEmployees}
              statOntime={statOntime}
              statLate={statLate}
              statAbsent={statAbsent}
              statOut={statOut}
            />
            <div className="flex flex-col xl:flex-row gap-5 items-start">
              <AttendanceTable
                filteredData={filteredData}
                searchQ={searchQ}
                setSearchQ={setSearchQ}
                deptFilter={deptFilter}
                setDeptFilter={setDeptFilter}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                toggleFlag={toggleFlag}
                onExportClick={() => toast.success("Export rekap kehadiran")}
              />
              <AttendanceFeed feedEvents={feedEvents} />
            </div>
          </>
        )}

        {/* ═══════════════════════════════════════════════════ */}
        {/* ══  TAB 2 — KELOLA CUTI                          ══ */}
        {/* ═══════════════════════════════════════════════════ */}
        {mainTab === "cuti" && (
          <LeaveRequests
            statTotalPending={statTotalPending}
            statPendingCuti={statPendingCuti}
            statPendingIzin={statPendingIzin}
            statPendingSakit={statPendingSakit}
            cutiLoading={cutiLoading}
            actionLoading={actionLoading}
            pendingGroups={pendingGroups}
            rejectedGroups={rejectedGroups}
            handleApproveCuti={handleApproveCuti}
            handleRejectCuti={handleRejectCuti}
          />
        )}

        {/* ═══════════════════════════════════════════════════ */}
        {/* ══  TAB 3 — HARI LIBUR                           ══ */}
        {/* ═══════════════════════════════════════════════════ */}
        {mainTab === "libur" && (
          <HolidayManagement
            holidays={holidays}
            holidayLoading={holidayLoading}
            actionLoading={actionLoading}
            newHolidayName={newHolidayName}
            setNewHolidayName={setNewHolidayName}
            newHolidayDate={newHolidayDate}
            setNewHolidayDate={setNewHolidayDate}
            newHolidayType={newHolidayType}
            setNewHolidayType={setNewHolidayType}
            upcomingHolidays={upcomingHolidays}
            pastHolidays={pastHolidays}
            handleAddHoliday={handleAddHoliday}
            handleDeleteHoliday={handleDeleteHoliday}
          />
        )}

      </div>
    </AdminLayout>
  );
}

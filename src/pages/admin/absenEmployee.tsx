import { useAttendance } from "@/hooks/useAttendance";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { AttendanceStats } from "@/components/page-sections/attendance/AttendanceStats";
import { AttendanceTable } from "@/components/page-sections/attendance/AttendanceTable";
import { AttendanceFeed } from "@/components/page-sections/attendance/AttendanceFeed";
import { LeaveRequests } from "@/components/page-sections/attendance/LeaveRequests";
import { HolidayManagement } from "@/components/page-sections/attendance/HolidayManagement";
import { Link } from "react-router-dom";
import { Clock, Plus, Users, FileText, CalendarDays, MapPin } from "lucide-react";
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
      <div className="font-sans text-foreground w-full">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
              {mainTab === "absensi" && "Dashboard Absensi & Shift"}
              {mainTab === "cuti" && "Kelola Cuti & Izin"}
              {mainTab === "libur" && "Hari Libur & Cuti Bersama"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {mainTab === "absensi" && "Pantau absensi staf klinik Dr. Meow dan verifikasi GPS secara real-time"}
              {mainTab === "cuti" && "Setujui atau tolak pengajuan cuti, izin, dan sakit staf klinik"}
              {mainTab === "libur" && "Kelola hari libur klinik, cuti bersama, dan jadwal operasional"}
            </p>
          </div>
          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            {mainTab === "absensi" && (
              <>
                <Link
                  to="/admin/absensi/sebaran"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-3.5 py-2 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  Lihat Sebaran GPS
                </Link>
                <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3.5 py-2 text-xs text-muted-foreground shadow-xs">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></div>
                  <span>Live · <strong className="text-foreground font-semibold font-mono">
                    {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                  </strong></span>
                </div>
              </>
            )}
            {mainTab === "cuti" && (
              <button
                type="button"
                aria-label="Refresh data pengajuan cuti"
                onClick={() => fetchCutiRequests()}
                className="bg-card border border-border hover:border-foreground/25 hover:text-foreground text-muted-foreground rounded-xl px-3.5 py-2 text-xs font-semibold flex items-center gap-2 transition-all shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <Clock className="w-4 h-4" />
                Refresh
              </button>
            )}
            {mainTab === "libur" && (
              <button
                type="button"
                aria-label="Tambah hari libur baru"
                onClick={() => document.getElementById('holiday-form')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-primary text-primary-foreground rounded-lg px-3.5 py-2 text-xs font-semibold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <Plus className="w-4 h-4" />
                Tambah Hari Libur
              </button>
            )}
          </div>
        </div>

        {/* ─── MAIN TAB BAR ─── */}
        <div className="flex bg-card border border-border p-1 rounded-xl mb-7 w-fit shadow-xs">
          {([
            { key: "absensi", label: "Absensi", icon: <Users className="w-4 h-4" /> },
            { key: "cuti", label: "Kelola Cuti", icon: <FileText className="w-4 h-4" />, badge: statTotalPending },
            { key: "libur", label: "Hari Libur", icon: <CalendarDays className="w-4 h-4" /> },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setMainTab(tab.key)}
              className={`relative px-4 sm:px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                mainTab === tab.key
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-surface-soft"
              }`}
            >
              {tab.icon}
              {tab.label}
              {"badge" in tab && tab.badge > 0 && (
                <span className={`ml-1 min-w-[18px] h-[18px] flex items-center justify-center text-[11px] font-bold rounded-full px-1 ${
                  mainTab === tab.key ? "bg-white text-primary" : "bg-brand-orange text-white"
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

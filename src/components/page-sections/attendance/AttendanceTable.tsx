import { Search, Image as ImageIcon, Download } from "lucide-react";
import type { AttendanceRecord } from "@/types/attendance";
import { AttendanceStatusBadge } from "@/components/ui/status-badge";
import { AV_COLORS, getInitials, calcDur, durPct, formatDayAndDate } from "@/utils/helpers";
 
interface AttendanceTableProps {
  filteredData: AttendanceRecord[];
  searchQ: string;
  setSearchQ: (q: string) => void;
  deptFilter: string;
  setDeptFilter: (dept: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  toggleFlag: (id: string, currentFlag: boolean) => void;
  onExportClick: () => void;
}
 
export function AttendanceTable({
  filteredData,
  searchQ,
  setSearchQ,
  deptFilter,
  setDeptFilter,
  activeTab,
  setActiveTab,
  toggleFlag,
  onExportClick,
}: AttendanceTableProps) {
  return (
    <div className="flex-1 bg-card border border-border rounded-xl overflow-hidden w-full shadow-xs">
      <div className="p-4 px-5 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="font-heading text-[15px] font-bold text-foreground">
            {activeTab === "today"
              ? "Rekap kehadiran hari ini"
              : activeTab === "week"
              ? "Rekap kehadiran minggu ini"
              : "Rekap kehadiran bulan ini"}
          </h2>
          <p className="text-[12px] text-muted-foreground mt-0.5">
            Klik baris untuk detail foto & koordinat GPS
          </p>
        </div>
        <button 
          onClick={onExportClick}
          className="bg-card border border-border hover:border-foreground/20 hover:text-foreground text-muted-foreground rounded-xl px-4 py-2 text-sm font-medium flex items-center gap-2 transition-all shadow-xs cursor-pointer h-10"
        >
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap gap-2.5 items-center p-3.5 px-5 border-b border-border bg-surface-soft">
        <div className="relative flex-1 min-w-[160px] max-w-[260px]">
          <Search className="w-4 h-4 text-muted-foreground/60 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari karyawan..."
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            className="w-full pl-9 pr-3 h-10 bg-card border border-border rounded-xl text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 text-foreground placeholder:text-muted-foreground/50 transition-colors shadow-xs"
          />
        </div>
        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="bg-card border border-border rounded-xl pl-3 pr-8 h-10 text-sm text-foreground outline-none cursor-pointer focus:border-ring focus:ring-2 focus:ring-ring/20 transition-colors shadow-xs"
        >
          <option value="all">Semua posisi</option>
          <option value="dokter">Dokter Hewan</option>
          <option value="groomer">Pet Groomer</option>
          <option value="paramedis">Paramedis</option>
          <option value="kasir">Kasir</option>
          <option value="admin">Admin</option>
        </select>
        <div className="flex bg-card p-[3px] rounded-xl ml-auto border border-border shadow-xs">
          <button
            onClick={() => setActiveTab("today")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-sans transition-all cursor-pointer ${activeTab === "today" ? "bg-primary text-primary-foreground font-semibold shadow-xs" : "text-muted-foreground hover:text-foreground hover:bg-surface-soft"}`}
          >
            Hari ini
          </button>
          <button
            onClick={() => setActiveTab("week")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-sans transition-all cursor-pointer ${activeTab === "week" ? "bg-primary text-primary-foreground font-semibold shadow-xs" : "text-muted-foreground hover:text-foreground hover:bg-surface-soft"}`}
          >
            Minggu ini
          </button>
          <button
            onClick={() => setActiveTab("month")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-sans transition-all cursor-pointer ${activeTab === "month" ? "bg-primary text-primary-foreground font-semibold shadow-xs" : "text-muted-foreground hover:text-foreground hover:bg-surface-soft"}`}
          >
            Bulan ini
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-surface-soft">
            <tr>
              <th className="px-4 py-3 text-[11px] font-mono tracking-wider text-muted-foreground uppercase font-semibold whitespace-nowrap">
                Staf Klinik
              </th>
              {activeTab !== "today" && (
                <th className="px-4 py-3 text-[11px] font-mono tracking-wider text-muted-foreground uppercase font-semibold whitespace-nowrap">
                  Hari & Tanggal
                </th>
              )}
              <th className="px-4 py-3 text-[11px] font-mono tracking-wider text-muted-foreground uppercase font-semibold whitespace-nowrap">
                Posisi
              </th>
              <th className="px-4 py-3 text-[11px] font-mono tracking-wider text-muted-foreground uppercase font-semibold whitespace-nowrap">
                Clock-in
              </th>
              <th className="px-4 py-3 text-[11px] font-mono tracking-wider text-muted-foreground uppercase font-semibold whitespace-nowrap">
                Clock-out
              </th>
              <th className="px-4 py-3 text-[11px] font-mono tracking-wider text-muted-foreground uppercase font-semibold whitespace-nowrap">
                Durasi
              </th>
              <th className="px-4 py-3 text-[11px] font-mono tracking-wider text-muted-foreground uppercase font-semibold whitespace-nowrap">
                Status
              </th>
              <th className="px-4 py-3 text-[11px] font-mono tracking-wider text-muted-foreground uppercase font-semibold whitespace-nowrap">
                Foto
              </th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td
                  colSpan={activeTab === "today" ? 8 : 9}
                  className="px-4 py-12 text-center text-muted-foreground text-[13px]"
                >
                  Tidak ada data absensi yang sesuai.
                </td>
              </tr>
            ) : (
              filteredData.map((record, i) => {
                const c = AV_COLORS[i % AV_COLORS.length];
                const dur = calcDur(
                  record.clock_in_time,
                  record.clock_out_time,
                );
                const pct = durPct(record.clock_in_time, record.clock_out_time);

                return (
                  <tr
                    key={record.id}
                    className="border-b border-border/60 last:border-b-0 hover:bg-surface-soft/60 cursor-pointer group transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-[11.5px] font-bold font-heading shrink-0"
                          style={{ backgroundColor: c.bg, color: c.fg }}
                        >
                          {getInitials(record.users?.name)}
                        </div>
                        <div>
                          <div className="text-[13px] font-medium text-foreground">
                            {record.users?.name || "Unknown"}
                          </div>
                          <div className="text-[11px] text-muted-foreground font-mono">
                            {record.users?.emp_id || "EMP-???"}
                          </div>
                        </div>
                      </div>
                    </td>
                    {activeTab !== "today" && (
                      <td className="px-4 py-3 text-[12.5px] text-foreground font-medium whitespace-nowrap">
                        {formatDayAndDate(record.date)}
                      </td>
                    )}
                    <td className="px-4 py-3 text-[12.5px] text-muted-foreground">
                      {record.users?.dept || "—"}
                    </td>
                    <td className="px-4 py-3">
                      {record.clock_in_time ? (
                        <div className="inline-flex items-center gap-1.5 font-mono text-[12.5px] font-medium text-foreground">
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${record.status === "late" ? "bg-amber-500" : "bg-emerald-500"}`}
                          ></div>
                          {new Date(record.clock_in_time).toLocaleTimeString(
                            "id-ID",
                            { hour: "2-digit", minute: "2-digit" },
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-[12.5px]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {record.clock_out_time ? (
                        <div className="inline-flex items-center gap-1.5 font-mono text-[12.5px] font-medium text-foreground">
                          <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60"></div>
                          {new Date(record.clock_out_time).toLocaleTimeString(
                            "id-ID",
                            { hour: "2-digit", minute: "2-digit" },
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-[12.5px]">
                          {record.clock_in_time ? "Belum" : "—"}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {dur ? (
                        <div className="flex items-center gap-2">
                          <div className="w-[60px] h-1.5 bg-surface-soft rounded-full overflow-hidden border border-border/40">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${pct}%` }}
                            ></div>
                          </div>
                          <span className="font-mono text-[12px] text-muted-foreground whitespace-nowrap">
                            {dur}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-[12.5px]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <AttendanceStatusBadge
                        status={record.status}
                        className="whitespace-nowrap"
                      />
                    </td>
                    <td className="px-4 py-3">
                      {record.clock_in_time ? (
                        <div className="w-8 h-8 rounded-lg bg-surface-soft border border-border flex items-center justify-center text-muted-foreground hover:border-foreground/30 hover:scale-105 transition-all">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-[12px]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFlag(record.id, record.is_flagged);
                        }}
                        className={`min-h-[34px] px-3 py-1.5 rounded-lg text-[11.5px] font-medium border transition-colors whitespace-nowrap cursor-pointer inline-flex items-center justify-center ${
                          record.is_flagged
                            ? "bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/60 dark:border-rose-800/60 dark:text-rose-300"
                            : "bg-card border-border text-muted-foreground hover:bg-rose-50 hover:border-rose-200 hover:text-rose-800 dark:hover:bg-rose-950/60 dark:hover:border-rose-800/60 dark:hover:text-rose-300 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
                        }`}
                      >
                        {record.is_flagged ? "⚑ Flagged" : "⚐ Flag"}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

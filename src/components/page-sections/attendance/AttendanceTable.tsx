import { Search, Image as ImageIcon, Download } from "lucide-react";
import type { AttendanceRecord } from "@/types/attendance";
import { AttendanceStatusBadge } from "@/components/ui/status-badge";
import { avColors, ini, calcDur, durPct } from "@/utils/helpers";
 
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
    <div className="flex-1 bg-white border border-[#E0DDD7] rounded-[16px] overflow-hidden w-full">
      <div className="p-4 px-5 border-b border-[#E0DDD7] flex items-center justify-between">
        <div>
          <h2 className="font-['Syne'] text-[15px] font-semibold text-[#1A1814]">
            Rekap kehadiran hari ini
          </h2>
          <p className="text-[12px] text-[#A8A49E] mt-0.5">
            Klik baris untuk detail foto & lokasi
          </p>
        </div>
        <button 
          onClick={onExportClick}
          className="bg-white border border-[#E0DDD7] hover:border-[#CBC8C2] hover:text-[#1A1814] text-[#6B6760] rounded-[10px] px-4 py-2 text-[13px] font-medium flex items-center gap-2 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap gap-2 items-center p-3.5 px-5 border-b border-[#E0DDD7] bg-[#F5F2ED]">
        <div className="relative flex-1 min-w-[160px] max-w-[260px]">
          <Search className="w-4 h-4 text-[#A8A49E] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari karyawan..."
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-[#E0DDD7] rounded-[10px] text-[13px] outline-none focus:border-[#CBC8C2] text-[#1A1814] placeholder-[#A8A49E]"
          />
        </div>
        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="bg-white border border-[#E0DDD7] rounded-[10px] pl-3 pr-8 py-2 text-[13px] text-[#1A1814] outline-none appearance-none cursor-pointer"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B6760' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 8px center",
          }}
        >
          <option value="all">Semua divisi</option>
          <option value="kasir">Kasir</option>
          <option value="gudang">Gudang</option>
          <option value="admin">Admin</option>
        </select>
        <div className="flex bg-[#EDEAE4] p-[3px] rounded-[8px] ml-auto">
          <button
            onClick={() => setActiveTab("today")}
            className={`px-3 py-1.5 rounded-[6px] text-[12.5px] transition-all ${activeTab === "today" ? "bg-white text-[#1A1814] font-medium shadow-sm" : "text-[#6B6760] hover:text-[#1A1814]"}`}
          >
            Hari ini
          </button>
          <button
            onClick={() => setActiveTab("week")}
            className={`px-3 py-1.5 rounded-[6px] text-[12.5px] transition-all ${activeTab === "week" ? "bg-white text-[#1A1814] font-medium shadow-sm" : "text-[#6B6760] hover:text-[#1A1814]"}`}
          >
            Minggu ini
          </button>
          <button
            onClick={() => setActiveTab("month")}
            className={`px-3 py-1.5 rounded-[6px] text-[12.5px] transition-all ${activeTab === "month" ? "bg-white text-[#1A1814] font-medium shadow-sm" : "text-[#6B6760] hover:text-[#1A1814]"}`}
          >
            Bulan ini
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#EDEAE4]">
            <tr>
              <th className="px-4 py-3 text-[10.5px] font-mono tracking-[0.8px] text-[#A8A49E] uppercase font-normal whitespace-nowrap">
                Karyawan
              </th>
              <th className="px-4 py-3 text-[10.5px] font-mono tracking-[0.8px] text-[#A8A49E] uppercase font-normal whitespace-nowrap">
                Divisi
              </th>
              <th className="px-4 py-3 text-[10.5px] font-mono tracking-[0.8px] text-[#A8A49E] uppercase font-normal whitespace-nowrap">
                Clock-in
              </th>
              <th className="px-4 py-3 text-[10.5px] font-mono tracking-[0.8px] text-[#A8A49E] uppercase font-normal whitespace-nowrap">
                Clock-out
              </th>
              <th className="px-4 py-3 text-[10.5px] font-mono tracking-[0.8px] text-[#A8A49E] uppercase font-normal whitespace-nowrap">
                Durasi
              </th>
              <th className="px-4 py-3 text-[10.5px] font-mono tracking-[0.8px] text-[#A8A49E] uppercase font-normal whitespace-nowrap">
                Status
              </th>
              <th className="px-4 py-3 text-[10.5px] font-mono tracking-[0.8px] text-[#A8A49E] uppercase font-normal whitespace-nowrap">
                Foto
              </th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-12 text-center text-[#A8A49E] text-[13px]"
                >
                  Tidak ada data absensi yang sesuai.
                </td>
              </tr>
            ) : (
              filteredData.map((record, i) => {
                const c = avColors[i % avColors.length];
                const dur = calcDur(
                  record.clock_in_time,
                  record.clock_out_time,
                );
                const pct = durPct(record.clock_in_time, record.clock_out_time);

                return (
                  <tr
                    key={record.id}
                    className="border-b border-[#E0DDD7] last:border-b-0 hover:bg-[#FAFAF8] cursor-pointer group transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-[11.5px] font-bold font-['Syne'] shrink-0"
                          style={{ backgroundColor: c.bg, color: c.fg }}
                        >
                          {ini(record.users?.name)}
                        </div>
                        <div>
                          <div className="text-[13px] font-medium text-[#1A1814]">
                            {record.users?.name || "Unknown"}
                          </div>
                          <div className="text-[11px] text-[#A8A49E] font-mono">
                            {record.users?.emp_id || "EMP-???"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[12.5px] text-[#6B6760]">
                      {record.users?.dept || "—"}
                    </td>
                    <td className="px-4 py-3">
                      {record.clock_in_time ? (
                        <div className="inline-flex items-center gap-1.5 font-mono text-[12.5px] font-medium text-[#1A1814]">
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${record.status === "late" ? "bg-[#B87333]" : "bg-[#2A7A4B]"}`}
                          ></div>
                          {new Date(record.clock_in_time).toLocaleTimeString(
                            "id-ID",
                            { hour: "2-digit", minute: "2-digit" },
                          )}
                        </div>
                      ) : (
                        <span className="text-[#A8A49E] text-[12.5px]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {record.clock_out_time ? (
                        <div className="inline-flex items-center gap-1.5 font-mono text-[12.5px] font-medium text-[#1A1814]">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#A8A49E]"></div>
                          {new Date(record.clock_out_time).toLocaleTimeString(
                            "id-ID",
                            { hour: "2-digit", minute: "2-digit" },
                          )}
                        </div>
                      ) : (
                        <span className="text-[#A8A49E] text-[12.5px]">
                          {record.clock_in_time ? "Belum" : "—"}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {dur ? (
                        <div className="flex items-center gap-2">
                          <div className="w-[60px] h-1 bg-[#EDEAE4] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#2A7A4B] rounded-full"
                              style={{ width: `${pct}%` }}
                            ></div>
                          </div>
                          <span className="font-mono text-[12px] text-[#6B6760] whitespace-nowrap">
                            {dur}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[#A8A49E] text-[12.5px]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <AttendanceStatusBadge
                        status={record.status}
                        className="px-2.5 py-1 rounded-full text-[11.5px] font-medium whitespace-nowrap"
                      />
                    </td>
                    <td className="px-4 py-3">
                      {record.clock_in_time ? (
                        <div className="w-9 h-9 rounded-[6px] bg-[#EDEAE4] border border-[#E0DDD7] flex items-center justify-center text-[#A8A49E] hover:border-[#CBC8C2] hover:scale-105 transition-all">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                      ) : (
                        <span className="text-[#A8A49E] text-[12px]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFlag(record.id, record.is_flagged);
                        }}
                        className={`px-2.5 py-1 rounded-[6px] text-[11.5px] font-medium border transition-colors whitespace-nowrap ${
                          record.is_flagged
                            ? "bg-[#F5E8E4] border-[#e8b4aa] text-[#C84B2F]"
                            : "bg-white border-[#E0DDD7] text-[#6B6760] hover:bg-[#F5E8E4] hover:border-[#e8b4aa] hover:text-[#C84B2F] opacity-0 group-hover:opacity-100 focus:opacity-100"
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

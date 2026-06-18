import { CalendarDays, Check, X } from "lucide-react";
import type { CutiGroup } from "@/types/attendance";
import {
  avColors,
  ini,
  getCutiTypeColor,
  getCutiTypeLabel,
  formatDateRange,
} from "@/utils/helpers";

interface LeaveRequestsProps {
  statTotalPending: number;
  statPendingCuti: number;
  statPendingIzin: number;
  statPendingSakit: number;
  cutiLoading: boolean;
  actionLoading: string | null;
  pendingGroups: CutiGroup[];
  rejectedGroups: CutiGroup[];
  handleApproveCuti: (group: CutiGroup) => void;
  handleRejectCuti: (group: CutiGroup) => void;
}

export function LeaveRequests({
  statTotalPending,
  statPendingCuti,
  statPendingIzin,
  statPendingSakit,
  cutiLoading,
  actionLoading,
  pendingGroups,
  rejectedGroups,
  handleApproveCuti,
  handleRejectCuti,
}: LeaveRequestsProps) {
  return (
    <>
      {/* CUTI STAT CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-7">
        <div className="bg-white border border-[#E0DDD7] rounded-[16px] p-4.5 transition-all hover:-translate-y-[1px]">
          <div className="text-[11px] text-[#A8A49E] uppercase tracking-[0.8px] font-mono mb-2.5">
            Total Menunggu
          </div>
          <div className="font-['Syne'] text-[32px] font-bold tracking-[-1px] leading-none text-[#B87333]">
            {statTotalPending}
          </div>
          <div className="text-[12px] text-[#A8A49E] mt-1.5">
            perlu ditinjau
          </div>
          <div className="h-[3px] rounded-[2px] mt-3 bg-[#EDEAE4] overflow-hidden">
            <div
              className="h-full bg-[#B87333] rounded-[2px]"
              style={{ width: statTotalPending > 0 ? "100%" : "0%" }}
            ></div>
          </div>
        </div>

        <div className="bg-white border border-[#E0DDD7] rounded-[16px] p-4.5 transition-all hover:-translate-y-[1px]">
          <div className="text-[11px] text-[#A8A49E] uppercase tracking-[0.8px] font-mono mb-2.5">
            Cuti
          </div>
          <div className="font-['Syne'] text-[32px] font-bold tracking-[-1px] leading-none text-[#6B4F9E]">
            {statPendingCuti}
          </div>
          <div className="text-[12px] text-[#A8A49E] mt-1.5">hari pending</div>
          <div className="h-[3px] rounded-[2px] mt-3 bg-[#EDEAE4] overflow-hidden">
            <div
              className="h-full bg-[#6B4F9E] rounded-[2px]"
              style={{
                width: `${Math.min(100, (statPendingCuti / Math.max(1, statTotalPending)) * 100)}%`,
              }}
            ></div>
          </div>
        </div>

        <div className="bg-white border border-[#E0DDD7] rounded-[16px] p-4.5 transition-all hover:-translate-y-[1px]">
          <div className="text-[11px] text-[#A8A49E] uppercase tracking-[0.8px] font-mono mb-2.5">
            Izin
          </div>
          <div className="font-['Syne'] text-[32px] font-bold tracking-[-1px] leading-none text-[#B87333]">
            {statPendingIzin}
          </div>
          <div className="text-[12px] text-[#A8A49E] mt-1.5">hari pending</div>
          <div className="h-[3px] rounded-[2px] mt-3 bg-[#EDEAE4] overflow-hidden">
            <div
              className="h-full bg-[#B87333] rounded-[2px]"
              style={{
                width: `${Math.min(100, (statPendingIzin / Math.max(1, statTotalPending)) * 100)}%`,
              }}
            ></div>
          </div>
        </div>

        <div className="bg-white border border-[#E0DDD7] rounded-[16px] p-4.5 transition-all hover:-translate-y-[1px]">
          <div className="text-[11px] text-[#A8A49E] uppercase tracking-[0.8px] font-mono mb-2.5">
            Sakit
          </div>
          <div className="font-['Syne'] text-[32px] font-bold tracking-[-1px] leading-none text-[#C84B2F]">
            {statPendingSakit}
          </div>
          <div className="text-[12px] text-[#A8A49E] mt-1.5">hari pending</div>
          <div className="h-[3px] rounded-[2px] mt-3 bg-[#EDEAE4] overflow-hidden">
            <div
              className="h-full bg-[#C84B2F] rounded-[2px]"
              style={{
                width: `${Math.min(100, (statPendingSakit / Math.max(1, statTotalPending)) * 100)}%`,
              }}
            ></div>
          </div>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-5 items-start">
        {/* PENDING REQUESTS */}
        <div className="flex-1 w-full">
          <div className="bg-white border border-[#E0DDD7] rounded-[16px] overflow-hidden">
            <div className="p-4 px-5 border-b border-[#E0DDD7] flex items-center justify-between">
              <div>
                <h2 className="font-['Syne'] text-[15px] font-semibold text-[#1A1814]">
                  Pengajuan Menunggu Persetujuan
                </h2>
                <p className="text-[12px] text-[#A8A49E] mt-0.5">
                  {pendingGroups.length} pengajuan dari karyawan
                </p>
              </div>
            </div>

            {cutiLoading ? (
              <div className="p-12 text-center text-[#A8A49E] text-[13px]">
                <div className="inline-block w-5 h-5 border-2 border-[#E0DDD7] border-t-[#1A1814] rounded-full animate-spin mb-2"></div>
                <div>Memuat data cuti...</div>
              </div>
            ) : pendingGroups.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-[40px] mb-3">✓</div>
                <div className="text-[14px] font-medium text-[#1A1814] mb-1">
                  Semua pengajuan sudah diproses
                </div>
                <div className="text-[13px] text-[#A8A49E]">
                  Tidak ada pengajuan cuti yang menunggu persetujuan.
                </div>
              </div>
            ) : (
              <div className="divide-y divide-[#E0DDD7]">
                {pendingGroups.map((group) => {
                  const typeColor = getCutiTypeColor(group.type);
                  const c =
                    avColors[group.userName.charCodeAt(0) % avColors.length];
                  const isActioning = actionLoading?.includes(
                    group.userId + "_" + group.status,
                  );

                  return (
                    <div
                      key={`${group.userId}_${group.status}`}
                      className="p-5 hover:bg-[#FAFAF8] transition-colors"
                    >
                      <div className="flex items-start gap-3.5">
                        {/* Avatar */}
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-bold font-['Syne'] shrink-0"
                          style={{ backgroundColor: c.bg, color: c.fg }}
                        >
                          {ini(group.userName)}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[14px] font-semibold text-[#1A1814]">
                              {group.userName}
                            </span>
                            <span className="text-[11px] font-mono text-[#A8A49E]">
                              {group.empId}
                            </span>
                            <span
                              className="inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-semibold"
                              style={{
                                backgroundColor: typeColor.bg,
                                color: typeColor.fg,
                              }}
                            >
                              {getCutiTypeLabel(group.type)}
                            </span>
                          </div>
                          <div className="text-[12.5px] text-[#6B6760] mb-2">
                            Divisi:{" "}
                            <span className="font-medium">{group.dept}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="flex items-center gap-1.5 text-[12.5px] text-[#1A1814]">
                              <CalendarDays className="w-3.5 h-3.5 text-[#A8A49E]" />
                              <span className="font-medium">
                                {formatDateRange(group.dates)}
                              </span>
                            </div>
                            <span className="inline-flex items-center px-2 py-0.5 bg-[#F5F2ED] rounded text-[11px] font-mono text-[#6B6760]">
                              {group.dates.length} hari kerja
                            </span>
                            {group.dates.some(d => d.clock_in_photo_url) && (
                              <a
                                href={group.dates.find(d => d.clock_in_photo_url)?.clock_in_photo_url || "#"}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#FAF0E1] border border-[#E89E3A]/30 text-[#E89E3A] hover:bg-[#FAF0E1]/80 text-[11px] font-medium rounded transition-colors"
                              >
                                📄 Lihat Lampiran
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleApproveCuti(group)}
                            disabled={!!isActioning}
                            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#2A7A4B] hover:bg-[#237340] text-white text-[12.5px] font-medium rounded-[10px] transition-colors disabled:opacity-50"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Setujui
                          </button>
                          <button
                            onClick={() => handleRejectCuti(group)}
                            disabled={!!isActioning}
                            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#E0DDD7] hover:bg-[#F5E8E4] hover:border-[#e8b4aa] hover:text-[#C84B2F] text-[#6B6760] text-[12.5px] font-medium rounded-[10px] transition-colors disabled:opacity-50"
                          >
                            <X className="w-3.5 h-3.5" />
                            Tolak
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* SIDE PANEL — Rejected History */}
        <div className="w-full xl:w-[340px] shrink-0">
          <div className="bg-white border border-[#E0DDD7] rounded-[16px] overflow-hidden">
            <div className="p-3.5 px-4.5 border-b border-[#E0DDD7]">
              <h3 className="font-['Syne'] text-[14px] font-semibold text-[#1A1814]">
                Riwayat Ditolak
              </h3>
              <p className="text-[12px] text-[#A8A49E] mt-0.5">
                {rejectedGroups.length} pengajuan ditolak
              </p>
            </div>
            <div className="max-h-[480px] overflow-y-auto">
              {rejectedGroups.length === 0 ? (
                <div className="p-8 text-center text-[#A8A49E] text-[13px]">
                  Belum ada pengajuan yang ditolak.
                </div>
              ) : (
                <div className="divide-y divide-[#E0DDD7]">
                  {rejectedGroups.map((group) => {
                    const typeColor = getCutiTypeColor(group.type);
                    const c =
                      avColors[group.userName.charCodeAt(0) % avColors.length];
                    return (
                      <div
                        key={`rej_${group.userId}_${group.status}`}
                        className="p-3.5 px-4.5 hover:bg-[#FAFAF8] transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-[10.5px] font-bold font-['Syne'] shrink-0"
                            style={{ backgroundColor: c.bg, color: c.fg }}
                          >
                            {ini(group.userName)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className="text-[13px] font-medium text-[#1A1814] truncate">
                                {group.userName}
                              </span>
                              <span
                                className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold"
                                style={{
                                  backgroundColor: typeColor.bg,
                                  color: typeColor.fg,
                                }}
                              >
                                {getCutiTypeLabel(group.type)}
                              </span>
                            </div>
                            <div className="text-[11.5px] text-[#A8A49E] flex items-center gap-2">
                              <span>
                                {formatDateRange(group.dates)} · {group.dates.length} hari
                              </span>
                              {group.dates.some(d => d.clock_in_photo_url) && (
                                <a
                                  href={group.dates.find(d => d.clock_in_photo_url)?.clock_in_photo_url || "#"}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[11px] text-[#E89E3A] hover:underline"
                                >
                                  (Lampiran)
                                </a>
                              )}
                            </div>
                          </div>
                          <span className="inline-flex items-center px-2 py-0.5 bg-[#F5E8E4] text-[#C84B2F] rounded-full text-[10.5px] font-semibold shrink-0">
                            ✕ Ditolak
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

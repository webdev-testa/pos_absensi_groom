import { CalendarDays, Check, X } from "lucide-react";
import type { CutiGroup } from "@/types/attendance";
import {
  AV_COLORS,
  getInitials,
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
        <div className="bg-card border border-border rounded-2xl p-4.5 transition-all hover:-translate-y-[1px] shadow-xs">
          <div className="stat-title mb-2.5">
            Total Menunggu
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-bold tracking-tight leading-none text-amber-600 dark:text-amber-400 tabular-nums">
            {statTotalPending}
          </div>
          <div className="text-[12px] text-muted-foreground mt-1.5">
            perlu ditinjau
          </div>
          <div className="h-[3px] rounded-full mt-3 bg-surface-soft overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full"
              style={{ width: statTotalPending > 0 ? "100%" : "0%" }}
            ></div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4.5 transition-all hover:-translate-y-[1px] shadow-xs">
          <div className="stat-title mb-2.5">
            Cuti
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-bold tracking-tight leading-none text-purple-600 dark:text-purple-400 tabular-nums">
            {statPendingCuti}
          </div>
          <div className="text-[12px] text-muted-foreground mt-1.5">hari pending</div>
          <div className="h-[3px] rounded-full mt-3 bg-surface-soft overflow-hidden">
            <div
              className="h-full bg-purple-500 rounded-full"
              style={{
                width: `${Math.min(100, (statPendingCuti / Math.max(1, statTotalPending)) * 100)}%`,
              }}
            ></div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4.5 transition-all hover:-translate-y-[1px] shadow-xs">
          <div className="stat-title mb-2.5">
            Izin
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-bold tracking-tight leading-none text-amber-600 dark:text-amber-400 tabular-nums">
            {statPendingIzin}
          </div>
          <div className="text-[12px] text-muted-foreground mt-1.5">hari pending</div>
          <div className="h-[3px] rounded-full mt-3 bg-surface-soft overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full"
              style={{
                width: `${Math.min(100, (statPendingIzin / Math.max(1, statTotalPending)) * 100)}%`,
              }}
            ></div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4.5 transition-all hover:-translate-y-[1px] shadow-xs">
          <div className="stat-title mb-2.5">
            Sakit
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-bold tracking-tight leading-none text-destructive tabular-nums">
            {statPendingSakit}
          </div>
          <div className="text-[12px] text-muted-foreground mt-1.5">hari pending</div>
          <div className="h-[3px] rounded-full mt-3 bg-surface-soft overflow-hidden">
            <div
              className="h-full bg-destructive rounded-full"
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
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 px-5 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="font-heading text-base font-bold text-foreground">
                  Pengajuan Menunggu Persetujuan
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {pendingGroups.length} pengajuan dari karyawan
                </p>
              </div>
            </div>

            {cutiLoading ? (
              <div className="p-12 text-center text-muted-foreground text-xs font-medium">
                <div className="inline-block w-5 h-5 border-2 border-border border-t-primary rounded-full animate-spin mb-2 motion-reduce:animate-none"></div>
                <div>Memuat data cuti...</div>
              </div>
            ) : pendingGroups.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-[40px] mb-3">✓</div>
                <div className="text-sm font-semibold text-foreground mb-1">
                  Semua pengajuan sudah diproses
                </div>
                <div className="text-xs text-muted-foreground">
                  Tidak ada pengajuan cuti yang menunggu persetujuan.
                </div>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {pendingGroups.map((group) => {
                  const typeColor = getCutiTypeColor(group.type);
                  const c =
                    AV_COLORS[group.userName.charCodeAt(0) % AV_COLORS.length];
                  const isActioning = actionLoading?.includes(
                    group.userId + "_" + group.status,
                  );

                  return (
                    <div
                      key={`${group.userId}_${group.status}`}
                      className="p-5 hover:bg-surface-soft/60 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex items-start gap-3.5 min-w-0">
                          {/* Avatar */}
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold font-heading shrink-0"
                            style={{ backgroundColor: c.bg, color: c.fg }}
                          >
                            {getInitials(group.userName)}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className="text-sm font-bold text-foreground">
                                {group.userName}
                              </span>
                              <span className="text-xs font-mono text-muted-foreground">
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
                            <div className="text-xs text-muted-foreground mb-2">
                              Divisi:{" "}
                              <span className="font-medium text-foreground">{group.dept}</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
                                <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
                                <span>
                                  {formatDateRange(group.dates)}
                                </span>
                              </div>
                              <span className="inline-flex items-center px-2 py-0.5 bg-surface-soft rounded-md text-[11px] font-mono text-muted-foreground">
                                {group.dates.length} hari kerja
                              </span>
                              {group.dates.some(d => d.clock_in_photo_url) && (
                                <a
                                  href={group.dates.find(d => d.clock_in_photo_url)?.clock_in_photo_url || "#"}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 hover:bg-amber-100 text-xs font-semibold rounded-lg transition-colors"
                                >
                                  📄 Lihat Lampiran
                                </a>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                          <button
                            type="button"
                            aria-label={`Setujui pengajuan cuti ${group.userName}`}
                            onClick={() => handleApproveCuti(group)}
                            disabled={!!isActioning}
                            className="min-h-[40px] flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-all disabled:opacity-50 cursor-pointer shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <Check className="w-4 h-4" />
                            Setujui
                          </button>
                          <button
                            type="button"
                            aria-label={`Tolak pengajuan cuti ${group.userName}`}
                            onClick={() => handleRejectCuti(group)}
                            disabled={!!isActioning}
                            className="min-h-[40px] flex items-center gap-1.5 px-4 py-2 bg-card border border-border hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive text-muted-foreground text-xs font-semibold rounded-xl transition-all disabled:opacity-50 cursor-pointer shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <X className="w-4 h-4" />
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
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs">
            <div className="p-3.5 px-4.5 border-b border-border">
              <h3 className="font-heading text-sm font-bold text-foreground">
                Riwayat Ditolak
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {rejectedGroups.length} pengajuan ditolak
              </p>
            </div>
            <div className="max-h-[480px] overflow-y-auto">
              {rejectedGroups.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-xs">
                  Belum ada pengajuan yang ditolak.
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {rejectedGroups.map((group) => {
                    const typeColor = getCutiTypeColor(group.type);
                    const c =
                      AV_COLORS[group.userName.charCodeAt(0) % AV_COLORS.length];
                    return (
                      <div
                        key={`rej_${group.userId}_${group.status}`}
                        className="p-3.5 px-4.5 hover:bg-surface-soft/60 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold font-heading shrink-0"
                            style={{ backgroundColor: c.bg, color: c.fg }}
                          >
                            {getInitials(group.userName)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className="text-xs font-semibold text-foreground truncate">
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
                            <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                              <span>
                                {formatDateRange(group.dates)} · {group.dates.length} hari
                              </span>
                              {group.dates.some(d => d.clock_in_photo_url) && (
                                <a
                                  href={group.dates.find(d => d.clock_in_photo_url)?.clock_in_photo_url || "#"}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[11px] text-amber-700 dark:text-amber-400 hover:underline font-medium"
                                >
                                  (Lampiran)
                                </a>
                              )}
                            </div>
                          </div>
                          <span className="inline-flex items-center px-2 py-0.5 bg-destructive/10 text-destructive rounded-full text-[10.5px] font-semibold shrink-0">
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

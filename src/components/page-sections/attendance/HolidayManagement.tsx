import React from "react";
import { Trash2, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Holiday } from "@/types/attendance";
import { getHolidayTypeColor, getHolidayTypeLabel } from "@/utils/helpers";

interface HolidayManagementProps {
  holidays: Holiday[];
  holidayLoading: boolean;
  actionLoading: string | null;
  newHolidayName: string;
  setNewHolidayName: (name: string) => void;
  newHolidayDate: string;
  setNewHolidayDate: (date: string) => void;
  newHolidayType: "holiday" | "cuti_bersama" | "closed" | string;
  setNewHolidayType: (
    type: "holiday" | "cuti_bersama" | "closed" | string,
  ) => void;
  upcomingHolidays: Holiday[];
  pastHolidays: Holiday[];
  handleAddHoliday: (e: React.FormEvent) => void;
  handleDeleteHoliday: (id: string) => void;
}

export function HolidayManagement({
  holidays,
  holidayLoading,
  actionLoading,
  newHolidayName,
  setNewHolidayName,
  newHolidayDate,
  setNewHolidayDate,
  newHolidayType,
  setNewHolidayType,
  upcomingHolidays,
  pastHolidays,
  handleAddHoliday,
  handleDeleteHoliday,
}: HolidayManagementProps) {
  return (
    <>
      {/* HOLIDAY STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3.5 mb-7">
        <div className="bg-card border border-border rounded-2xl p-4.5 shadow-xs">
          <div className="stat-title mb-2.5">
            Total Hari Libur
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-bold tracking-tight leading-none text-foreground tabular-nums">
            {holidays.length}
          </div>
          <div className="text-[12px] text-muted-foreground mt-1.5">
            sudah dikonfigurasi
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4.5 shadow-xs">
          <div className="stat-title mb-2.5">
            Akan Datang
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-bold tracking-tight leading-none text-emerald-600 dark:text-emerald-400 tabular-nums">
            {upcomingHolidays.length}
          </div>
          <div className="text-[12px] text-muted-foreground mt-1.5">
            sisa tahun ini
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4.5 shadow-xs">
          <div className="stat-title mb-2.5">
            Sudah Lewat
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-bold tracking-tight leading-none text-muted-foreground tabular-nums">
            {pastHolidays.length}
          </div>
          <div className="text-[12px] text-muted-foreground mt-1.5">tahun ini</div>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-5 items-start">
        {/* HOLIDAY LIST */}
        <div className="flex-1 w-full">
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 px-5 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="font-heading text-base font-bold text-foreground">
                  Daftar Hari Libur
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Karyawan otomatis tidak perlu absen pada hari-hari ini
                </p>
              </div>
            </div>

            {holidayLoading ? (
              <div className="p-12 text-center text-muted-foreground text-xs font-medium">
                <div className="inline-block w-5 h-5 border-2 border-border border-t-primary rounded-full animate-spin mb-2 motion-reduce:animate-none"></div>
                <div>Memuat data libur...</div>
              </div>
            ) : holidays.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-[40px] mb-3">📅</div>
                <div className="text-sm font-semibold text-foreground mb-1">
                  Belum ada hari libur
                </div>
                <div className="text-xs text-muted-foreground">
                  Klik &quot;Tambah Hari Libur&quot; untuk mulai mengatur jadwal libur.
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-surface-soft border-b border-border">
                    <tr>
                      <th className="px-5 py-3 text-[11px] font-mono tracking-wider text-muted-foreground uppercase font-semibold">
                        Tanggal
                      </th>
                      <th className="px-5 py-3 text-[11px] font-mono tracking-wider text-muted-foreground uppercase font-semibold">
                        Nama
                      </th>
                      <th className="px-5 py-3 text-[11px] font-mono tracking-wider text-muted-foreground uppercase font-semibold">
                        Tipe
                      </th>
                      <th className="px-5 py-3 text-[11px] font-mono tracking-wider text-muted-foreground uppercase font-semibold">
                        Status
                      </th>
                      <th className="px-5 py-3 text-right">
                        <span className="sr-only">Aksi</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {holidays.map((holiday) => {
                      const typeColor = getHolidayTypeColor(holiday.type);
                      const today = new Date().toISOString().split("T")[0];
                      const isPast = holiday.date < today;
                      const isToday = holiday.date === today;

                      return (
                        <tr
                          key={holiday.id}
                          className={`hover:bg-surface-soft/60 transition-colors ${isPast ? "opacity-60" : ""}`}
                        >
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center text-center shrink-0 border ${
                                  isToday
                                    ? "border-emerald-500/50 bg-emerald-50 dark:bg-emerald-950/40"
                                    : "border-border bg-surface-soft"
                                }`}
                              >
                                <div
                                  className={`text-[9px] font-mono uppercase leading-none font-semibold ${
                                    isToday ? "text-emerald-700 dark:text-emerald-300" : "text-muted-foreground"
                                  }`}
                                >
                                  {new Date(
                                    holiday.date + "T00:00:00",
                                  ).toLocaleDateString("id-ID", {
                                    month: "short",
                                  })}
                                </div>
                                <div
                                  className={`text-[15px] font-bold font-heading leading-none mt-0.5 ${
                                    isToday ? "text-emerald-700 dark:text-emerald-300" : "text-foreground"
                                  }`}
                                >
                                  {new Date(
                                    holiday.date + "T00:00:00",
                                  ).getDate()}
                                </div>
                              </div>
                              <div>
                                <div className="font-mono text-xs text-foreground font-medium">
                                  {new Date(
                                    holiday.date + "T00:00:00",
                                  ).toLocaleDateString("id-ID", {
                                    weekday: "long",
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                  })}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-xs font-semibold text-foreground">
                            {holiday.name}
                          </td>
                          <td className="px-5 py-3.5">
                            <Badge
                              variant="outline"
                              className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold border-transparent"
                              style={{
                                backgroundColor: typeColor.bg,
                                color: typeColor.fg,
                              }}
                            >
                              {getHolidayTypeLabel(holiday.type)}
                            </Badge>
                          </td>
                          <td className="px-5 py-3.5">
                            {isToday ? (
                              <Badge
                                variant="outline"
                                className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                              >
                                ● Hari ini
                              </Badge>
                            ) : isPast ? (
                              <span className="text-xs text-muted-foreground">
                                Sudah lewat
                              </span>
                            ) : (
                              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                                Akan datang
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteHoliday(holiday.id)}
                              disabled={actionLoading === `del_${holiday.id}`}
                              aria-label={`Hapus hari libur ${holiday.name}`}
                              className="min-h-[36px] min-w-[36px] p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50 inline-flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* ADD HOLIDAY FORM — Side Panel */}
        <div id="holiday-form" className="w-full xl:w-[360px] shrink-0">
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 px-5 border-b border-border">
              <h3 className="font-heading text-base font-bold text-foreground">
                Tambah Hari Libur
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Tentukan tanggal libur atau cuti bersama
              </p>
            </div>
            <form onSubmit={handleAddHoliday} className="p-5 space-y-4">
              {/* Date */}
              <div>
                <label htmlFor="holiday-date" className="block text-[11px] text-muted-foreground uppercase tracking-wider font-mono font-semibold mb-1.5">
                  Tanggal *
                </label>
                <input
                  id="holiday-date"
                  type="date"
                  value={newHolidayDate}
                  onChange={(e) => setNewHolidayDate(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs sm:text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-mono"
                />
              </div>

              {/* Name */}
              <div>
                <label htmlFor="holiday-name" className="block text-[11px] text-muted-foreground uppercase tracking-wider font-mono font-semibold mb-1.5">
                  Nama Hari Libur *
                </label>
                <input
                  id="holiday-name"
                  type="text"
                  value={newHolidayName}
                  onChange={(e) => setNewHolidayName(e.target.value)}
                  placeholder="cth: Idul Fitri, Natal, Cuti Bersama..."
                  required
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs sm:text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/60 transition-all"
                />
              </div>

              {/* Type */}
              <div>
                <span className="block text-[11px] text-muted-foreground uppercase tracking-wider font-mono font-semibold mb-1.5">
                  Tipe *
                </span>
                <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Tipe hari libur">
                  {(["holiday", "cuti_bersama", "closed"] as const).map(
                    (type) => {
                      const tc = getHolidayTypeColor(type);
                      const isSelected = newHolidayType === type;
                      return (
                        <button
                          key={type}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          onClick={() => setNewHolidayType(type)}
                          className={`min-h-[40px] px-2 py-2 rounded-xl text-xs font-semibold border transition-all text-center cursor-pointer ${
                            isSelected
                              ? "ring-2 ring-primary border-primary shadow-xs"
                              : "border-border bg-surface-soft hover:bg-card text-foreground"
                          }`}
                          style={
                            isSelected
                              ? { backgroundColor: tc.bg, color: tc.fg }
                              : {}
                          }
                        >
                          {getHolidayTypeLabel(type)}
                        </button>
                      );
                    },
                  )}
                </div>
              </div>

              {/* Preview */}
              {newHolidayDate && newHolidayName && (
                <div className="bg-surface-soft border border-border rounded-xl p-3.5">
                  <div className="text-[10.5px] text-muted-foreground uppercase tracking-wider font-mono font-semibold mb-1.5">
                    Preview
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-card border border-border flex flex-col items-center justify-center">
                      <div className="text-[8px] font-mono text-muted-foreground uppercase leading-none font-semibold">
                        {new Date(
                          newHolidayDate + "T00:00:00",
                        ).toLocaleDateString("id-ID", { month: "short" })}
                      </div>
                      <div className="text-sm font-bold font-heading text-foreground leading-none mt-0.5">
                        {new Date(newHolidayDate + "T00:00:00").getDate()}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-foreground truncate">
                        {newHolidayName}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {new Date(
                          newHolidayDate + "T00:00:00",
                        ).toLocaleDateString("id-ID", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                        })}
                        {" · "}
                        {getHolidayTypeLabel(newHolidayType)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={!newHolidayName || !newHolidayDate || holidayLoading}
                className="w-full min-h-[44px] py-2.5 bg-primary text-primary-foreground text-xs font-semibold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Plus className="w-4 h-4" />
                Simpan Hari Libur
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

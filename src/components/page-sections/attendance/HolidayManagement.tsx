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
        <div className="bg-white border border-[#E0DDD7] rounded-[16px] p-4.5">
          <div className="stat-title mb-2.5">
            Total Hari Libur
          </div>
          <div className="font-['Syne'] text-[32px] font-bold tracking-[-1px] leading-none text-[#1A1814]">
            {holidays.length}
          </div>
          <div className="text-[12px] text-[#A8A49E] mt-1.5">
            sudah dikonfigurasi
          </div>
        </div>
        <div className="bg-white border border-[#E0DDD7] rounded-[16px] p-4.5">
          <div className="stat-title mb-2.5">
            Akan Datang
          </div>
          <div className="font-['Syne'] text-[32px] font-bold tracking-[-1px] leading-none text-[#2A7A4B]">
            {upcomingHolidays.length}
          </div>
          <div className="text-[12px] text-[#A8A49E] mt-1.5">
            sisa tahun ini
          </div>
        </div>
        <div className="bg-white border border-[#E0DDD7] rounded-[16px] p-4.5">
          <div className="stat-title mb-2.5">
            Sudah Lewat
          </div>
          <div className="font-['Syne'] text-[32px] font-bold tracking-[-1px] leading-none text-[#A8A49E]">
            {pastHolidays.length}
          </div>
          <div className="text-[12px] text-[#A8A49E] mt-1.5">tahun ini</div>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-5 items-start">
        {/* HOLIDAY LIST */}
        <div className="flex-1 w-full">
          <div className="bg-white border border-[#E0DDD7] rounded-[16px] overflow-hidden">
            <div className="p-4 px-5 border-b border-[#E0DDD7] flex items-center justify-between">
              <div>
                <h2 className="font-['Syne'] text-[15px] font-semibold text-[#1A1814]">
                  Daftar Hari Libur
                </h2>
                <p className="text-[12px] text-[#A8A49E] mt-0.5">
                  Karyawan otomatis tidak perlu absen pada hari-hari ini
                </p>
              </div>
            </div>

            {holidayLoading ? (
              <div className="p-12 text-center text-[#A8A49E] text-[13px]">
                <div className="inline-block w-5 h-5 border-2 border-[#E0DDD7] border-t-[#1A1814] rounded-full animate-spin mb-2"></div>
                <div>Memuat data libur...</div>
              </div>
            ) : holidays.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-[40px] mb-3">📅</div>
                <div className="text-[14px] font-medium text-[#1A1814] mb-1">
                  Belum ada hari libur
                </div>
                <div className="text-[13px] text-[#A8A49E]">
                  Klik "Tambah Hari Libur" untuk mulai mengatur jadwal libur.
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[#EDEAE4]">
                    <tr>
                      <th className="px-5 py-3 text-[10.5px] font-mono tracking-[0.8px] text-[#A8A49E] uppercase font-normal">
                        Tanggal
                      </th>
                      <th className="px-5 py-3 text-[10.5px] font-mono tracking-[0.8px] text-[#A8A49E] uppercase font-normal">
                        Nama
                      </th>
                      <th className="px-5 py-3 text-[10.5px] font-mono tracking-[0.8px] text-[#A8A49E] uppercase font-normal">
                        Tipe
                      </th>
                      <th className="px-5 py-3 text-[10.5px] font-mono tracking-[0.8px] text-[#A8A49E] uppercase font-normal">
                        Status
                      </th>
                      <th className="px-5 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {holidays.map((holiday) => {
                      const typeColor = getHolidayTypeColor(holiday.type);
                      const today = new Date().toISOString().split("T")[0];
                      const isPast = holiday.date < today;
                      const isToday = holiday.date === today;

                      return (
                        <tr
                          key={holiday.id}
                          className={`border-b border-[#E0DDD7] last:border-b-0 hover:bg-[#FAFAF8] transition-colors ${isPast ? "opacity-50" : ""}`}
                        >
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`w-10 h-10 rounded-[10px] flex flex-col items-center justify-center text-center shrink-0 border ${isToday ? "border-[#2A7A4B] bg-[#E2F0E8]" : "border-[#E0DDD7] bg-[#F5F2ED]"}`}
                              >
                                <div
                                  className={`text-[8px] font-mono uppercase leading-none ${isToday ? "text-[#2A7A4B]" : "text-[#A8A49E]"}`}
                                >
                                  {new Date(
                                    holiday.date + "T00:00:00",
                                  ).toLocaleDateString("id-ID", {
                                    month: "short",
                                  })}
                                </div>
                                <div
                                  className={`text-[15px] font-bold font-['Syne'] leading-none mt-0.5 ${isToday ? "text-[#2A7A4B]" : "text-[#1A1814]"}`}
                                >
                                  {new Date(
                                    holiday.date + "T00:00:00",
                                  ).getDate()}
                                </div>
                              </div>
                              <div>
                                <div className="font-mono text-[12.5px] text-[#1A1814] font-medium">
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
                          <td className="px-5 py-3.5 text-[13px] font-medium text-[#1A1814]">
                            {holiday.name}
                          </td>
                          <td className="px-5 py-3.5">
                            <Badge
                              variant="outline"
                              className="px-2.5 py-1 rounded-full text-[11px] font-semibold border-transparent"
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
                                className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#E2F0E8] text-[#2A7A4B] border-transparent"
                              >
                                ● Hari ini
                              </Badge>
                            ) : isPast ? (
                              <span className="text-[12px] text-[#A8A49E]">
                                Sudah lewat
                              </span>
                            ) : (
                              <span className="text-[12px] text-[#2A7A4B] font-medium">
                                Akan datang
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteHoliday(holiday.id)}
                              disabled={actionLoading === `del_${holiday.id}`}
                              className="p-2 rounded-[8px] text-[#A8A49E] hover:text-[#C84B2F] hover:bg-[#F5E8E4] transition-colors disabled:opacity-50"
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
          <div className="bg-white border border-[#E0DDD7] rounded-[16px] overflow-hidden">
            <div className="p-4 px-5 border-b border-[#E0DDD7]">
              <h3 className="font-['Syne'] text-[15px] font-semibold text-[#1A1814]">
                Tambah Hari Libur
              </h3>
              <p className="text-[12px] text-[#A8A49E] mt-0.5">
                Tentukan tanggal libur atau cuti bersama
              </p>
            </div>
            <form onSubmit={handleAddHoliday} className="p-5 space-y-4">
              {/* Date */}
              <div>
                <label className="block text-[11px] text-[#A8A49E] uppercase tracking-[0.8px] font-mono mb-2">
                  Tanggal
                </label>
                <input
                  type="date"
                  value={newHolidayDate}
                  onChange={(e) => setNewHolidayDate(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E0DDD7] rounded-[10px] text-[13px] text-[#1A1814] outline-none focus:border-[#CBC8C2] focus:ring-1 focus:ring-[#E0DDD7] transition-colors"
                />
              </div>

              {/* Name */}
              <div>
                <label className="block text-[11px] text-[#A8A49E] uppercase tracking-[0.8px] font-mono mb-2">
                  Nama Hari Libur
                </label>
                <input
                  type="text"
                  value={newHolidayName}
                  onChange={(e) => setNewHolidayName(e.target.value)}
                  placeholder="cth: Idul Fitri, Natal, Cuti Bersama..."
                  required
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E0DDD7] rounded-[10px] text-[13px] text-[#1A1814] outline-none focus:border-[#CBC8C2] focus:ring-1 focus:ring-[#E0DDD7] placeholder-[#A8A49E] transition-colors"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-[11px] text-[#A8A49E] uppercase tracking-[0.8px] font-mono mb-2">
                  Tipe
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["holiday", "cuti_bersama", "closed"] as const).map(
                    (type) => {
                      const tc = getHolidayTypeColor(type);
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setNewHolidayType(type)}
                          className={`px-3 py-2.5 rounded-[10px] text-[12px] font-medium border transition-all text-center ${
                            newHolidayType === type
                              ? "ring-1 ring-[#1A1814] border-[#1A1814]"
                              : "border-[#E0DDD7] hover:border-[#CBC8C2]"
                          }`}
                          style={
                            newHolidayType === type
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
                <div className="bg-[#F5F2ED] border border-[#E0DDD7] rounded-[10px] p-3.5">
                  <div className="text-[10.5px] text-[#A8A49E] uppercase tracking-[0.8px] font-mono mb-1.5">
                    Preview
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-[8px] bg-white border border-[#E0DDD7] flex flex-col items-center justify-center">
                      <div className="text-[7px] font-mono text-[#A8A49E] uppercase leading-none">
                        {new Date(
                          newHolidayDate + "T00:00:00",
                        ).toLocaleDateString("id-ID", { month: "short" })}
                      </div>
                      <div className="text-[14px] font-bold font-['Syne'] text-[#1A1814] leading-none mt-0.5">
                        {new Date(newHolidayDate + "T00:00:00").getDate()}
                      </div>
                    </div>
                    <div>
                      <div className="text-[13px] font-medium text-[#1A1814]">
                        {newHolidayName}
                      </div>
                      <div className="text-[11.5px] text-[#A8A49E]">
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
                className="w-full py-2.5 bg-[#1A1814] text-white text-[13px] font-medium rounded-[10px] hover:bg-[#2A2824] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

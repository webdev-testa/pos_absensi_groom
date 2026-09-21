import { useState } from "react";
import { 
  Search, 
  MapPin, 
  ExternalLink, 
  Image as ImageIcon, 
  Navigation,
  ShieldCheck, 
  AlertTriangle, 
  HelpCircle,
  Building2
} from "lucide-react";
import type { AttendanceGPSItem, DateFilterType, AreaFilterType } from "@/hooks/useGeolocation";
import type { BranchOffice } from "@/types/branch";
import { AttendanceStatusBadge } from "@/components/ui/status-badge";
import { AV_COLORS, getInitials, formatDayAndDate } from "@/utils/helpers";
import { formatCoordinates } from "@/utils/geofence.utils";
import { GEOFENCE_RADIUS } from "@/constants/geofence.constants";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface GPSDetailTableProps {
  records: AttendanceGPSItem[];
  selectedRecordId: string | null;
  onSelectRecord: (id: string) => void;
  // Filters
  searchQ: string;
  setSearchQ: (q: string) => void;
  deptFilter: string;
  setDeptFilter: (dept: string) => void;
  areaFilter: AreaFilterType;
  setAreaFilter: (area: AreaFilterType) => void;
  dateFilter: DateFilterType;
  setDateFilter: (date: DateFilterType) => void;
  branches?: BranchOffice[];
  branchFilter?: string;
  setBranchFilter?: (branch: string) => void;
}

export function GPSDetailTable({
  records,
  selectedRecordId,
  onSelectRecord,
  searchQ,
  setSearchQ,
  deptFilter,
  setDeptFilter,
  areaFilter,
  setAreaFilter,
  dateFilter,
  setDateFilter,
  branches,
  branchFilter,
  setBranchFilter,
}: GPSDetailTableProps) {
  const [photoPreview, setPhotoPreview] = useState<{
    url: string;
    name: string;
    time: string;
    coords: string;
  } | null>(null);

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs">
      {/* Table Header & Title */}
      <div className="p-4 px-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card">
        <div>
          <h3 className="font-heading text-base font-bold text-foreground flex items-center gap-2">
            <Navigation className="w-4 h-4 text-primary" />
            Detail Audit Verifikasi GPS
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Daftar absensi karyawan beserta koordinat dan radius kepatuhan ({GEOFENCE_RADIUS}m)
          </p>
        </div>

        {/* Date Filter Tabs */}
        <div className="flex bg-muted/60 p-1 rounded-xl border border-border/80 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setDateFilter("today")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              dateFilter === "today"
                ? "bg-card text-foreground font-semibold shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Hari ini
          </button>
          <button
            type="button"
            onClick={() => setDateFilter("week")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              dateFilter === "week"
                ? "bg-card text-foreground font-semibold shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Minggu ini
          </button>
          <button
            type="button"
            onClick={() => setDateFilter("month")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              dateFilter === "month"
                ? "bg-card text-foreground font-semibold shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Bulan ini
          </button>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="p-3.5 px-5 border-b border-border bg-muted/30 flex flex-wrap items-center gap-2.5">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px] max-w-[280px]">
          <Search className="w-4 h-4 text-muted-foreground/60 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari staf klinik..."
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            className="w-full pl-9 pr-3 h-9 bg-card border border-border rounded-xl text-xs outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 text-foreground placeholder:text-muted-foreground/50 transition-colors shadow-xs"
          />
        </div>

        {/* Department Filter */}
        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="bg-card border border-border rounded-xl px-3 pr-8 h-9 text-xs text-foreground outline-none cursor-pointer focus:border-ring focus:ring-2 focus:ring-ring/20 transition-colors shadow-xs"
        >
          <option value="all">Semua Posisi</option>
          <option value="dokter">Dokter Hewan</option>
          <option value="groomer">Pet Groomer</option>
          <option value="paramedis">Paramedis</option>
          <option value="kasir">Kasir</option>
          <option value="admin">Admin</option>
        </select>

        {/* Branch Filter */}
        {branches && branches.length > 0 && setBranchFilter && (
          <select
            value={branchFilter || "all"}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="bg-card border border-border rounded-xl px-3 pr-8 h-9 text-xs text-foreground outline-none cursor-pointer focus:border-ring focus:ring-2 focus:ring-ring/20 transition-colors shadow-xs"
          >
            <option value="all">Semua Cabang ({branches.length})</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        )}

        {/* Area Compliance Filter */}
        <select
          value={areaFilter}
          onChange={(e) => setAreaFilter(e.target.value as AreaFilterType)}
          className="bg-card border border-border rounded-xl px-3 pr-8 h-9 text-xs text-foreground outline-none cursor-pointer focus:border-ring focus:ring-2 focus:ring-ring/20 transition-colors shadow-xs"
        >
          <option value="all">Semua Kategori Area</option>
          <option value="inside">✓ Dalam Radius (&le; 100m)</option>
          <option value="outside">⚠ Luar Radius (&gt; 100m)</option>
          <option value="no_gps">Tanpa GPS</option>
        </select>
      </div>

      {/* Table Data */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-muted/40 text-[11px] font-mono tracking-wider text-muted-foreground uppercase font-semibold">
            <tr>
              <th className="px-4 py-3">Staf Klinik</th>
              {dateFilter !== "today" && <th className="px-4 py-3">Tanggal</th>}
              <th className="px-4 py-3">Jam Masuk</th>
              <th className="px-4 py-3">Status Kepatuhan Geofence</th>
              <th className="px-4 py-3">Jarak ke Kantor</th>
              <th className="px-4 py-3">Koordinat GPS</th>
              <th className="px-4 py-3 text-center">Foto Selfie</th>
              <th className="px-4 py-3 text-right">Aksi Peta</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 text-xs">
            {records.length === 0 ? (
              <tr>
                <td
                  colSpan={dateFilter === "today" ? 7 : 8}
                  className="px-4 py-12 text-center text-muted-foreground"
                >
                  <MapPin className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                  Tidak ada data absensi GPS yang cocok dengan filter yang dipilih.
                </td>
              </tr>
            ) : (
              records.map((record, index) => {
                const c = AV_COLORS[index % AV_COLORS.length];
                const isSelected = selectedRecordId === record.id;
                const hasGps =
                  record.clock_in_lat != null &&
                  record.clock_in_lng != null &&
                  Number.isFinite(record.clock_in_lat);

                return (
                  <tr
                    key={record.id}
                    onClick={() => {
                      if (hasGps) onSelectRecord(record.id);
                    }}
                    className={`transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-primary/10 hover:bg-primary/15"
                        : "hover:bg-muted/40"
                    }`}
                  >
                    {/* Employee Info */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                          style={{ backgroundColor: c.bg, color: c.fg }}
                        >
                          {getInitials(record.users?.name)}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">
                            {record.users?.name || "Unknown"}
                          </div>
                          <div className="text-[11px] text-muted-foreground font-mono">
                            {record.users?.dept || "—"} · {record.users?.emp_id || "EMP-???"}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Date (if not today) */}
                    {dateFilter !== "today" && (
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {formatDayAndDate(record.date)}
                      </td>
                    )}

                    {/* Clock In Time & Status */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {record.clock_in_time ? (
                        <div className="space-y-1">
                          <div className="font-mono font-medium text-foreground">
                            {new Date(record.clock_in_time).toLocaleTimeString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                          <AttendanceStatusBadge status={record.status} />
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>

                    {/* Geofence Status Badge */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {record.isInsideGeofence === true && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          Dalam Radius ({record.distanceFormatted})
                        </span>
                      )}
                      {record.isInsideGeofence === false && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                          Di Luar Radius ({record.distanceFormatted})
                        </span>
                      )}
                      {record.isInsideGeofence === null && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-muted text-muted-foreground">
                          <HelpCircle className="w-3.5 h-3.5" />
                          Tanpa Koordinat GPS
                        </span>
                      )}
                    </td>

                    {/* Distance & Branch */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-mono font-medium text-foreground text-xs">
                        {record.distanceFormatted}
                      </div>
                      {record.nearestBranch && (
                        <div
                          className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5 truncate max-w-[130px]"
                          title={record.nearestBranch.name}
                        >
                          <Building2 className="w-2.5 h-2.5 text-primary/70 shrink-0" />
                          <span className="truncate">{record.nearestBranch.name}</span>
                        </div>
                      )}
                    </td>

                    {/* Coordinates */}
                    <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                      {formatCoordinates(record.clock_in_lat, record.clock_in_lng)}
                    </td>

                    {/* Selfie Photo */}
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      {record.clock_in_photo_url ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPhotoPreview({
                              url: record.clock_in_photo_url!,
                              name: record.users?.name || "Karyawan",
                              time: record.clock_in_time
                                ? new Date(record.clock_in_time).toLocaleTimeString("id-ID", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "—",
                              coords: formatCoordinates(
                                record.clock_in_lat,
                                record.clock_in_lng
                              ),
                            });
                          }}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-muted border border-border hover:border-primary/40 hover:scale-105 transition-all text-muted-foreground hover:text-foreground cursor-pointer"
                          title="Lihat Foto Selfie Clock-In"
                        >
                          <ImageIcon className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-muted-foreground/50 text-[11px]">—</span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {hasGps ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectRecord(record.id);
                            }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors inline-flex items-center gap-1 cursor-pointer ${
                              isSelected
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-card border-border hover:bg-muted text-foreground"
                            }`}
                          >
                            <MapPin className="w-3 h-3" />
                            Fokus di Peta
                          </button>
                          <a
                            href={`https://www.google.com/maps?q=${record.clock_in_lat},${record.clock_in_lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors inline-flex items-center"
                            title="Buka di Google Maps External"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      ) : (
                        <span className="text-muted-foreground/40 text-[11px]">N/A</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Photo Preview Modal */}
      {photoPreview && (
        <Dialog open={!!photoPreview} onOpenChange={() => setPhotoPreview(null)}>
          <DialogContent className="max-w-sm p-4">
            <DialogHeader>
              <DialogTitle className="text-sm font-semibold flex items-center justify-between">
                <span>Foto Selfie Kehadiran</span>
              </DialogTitle>
              <DialogDescription className="sr-only">
                Pratinjau foto selfie kehadiran dan koordinat lokasi
              </DialogDescription>
            </DialogHeader>
            <div className="mt-2 space-y-3">
              <div className="rounded-xl overflow-hidden border border-border bg-muted/30 aspect-[3/4] flex items-center justify-center">
                <img
                  src={photoPreview.url}
                  alt={photoPreview.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-3 bg-muted/40 rounded-xl text-xs space-y-1 font-mono">
                <div className="font-semibold font-sans text-foreground">
                  {photoPreview.name}
                </div>
                <div className="text-muted-foreground">Jam: {photoPreview.time}</div>
                <div className="text-muted-foreground text-[11px]">
                  Koordinat: {photoPreview.coords}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

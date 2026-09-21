import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  MapPin, 
  ArrowLeft, 
  RefreshCw, 
  AlertCircle, 
  Building2, 
  ShieldCheck, 
  Sparkles 
} from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useGeolocation } from "@/hooks/useGeolocation";
import { AttendanceMap } from "@/components/page-sections/attendance/AttendanceMap";
import { GPSStats } from "@/components/page-sections/attendance/GPSStats";
import { GPSDetailTable } from "@/components/page-sections/attendance/GPSDetailTable";
import { BranchManagementModal } from "@/components/page-sections/attendance/BranchManagementModal";
import { 
  OFFICE_NAME, 
  GEOFENCE_RADIUS 
} from "@/constants/geofence.constants";

export default function SebaranGPS() {
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);

  const {
    loading,
    refresh,
    records = [],
    plottableRecords = [],
    stats = { total: 0, withGps: 0, inside: 0, outside: 0, noGps: 0, insidePct: 0, outsidePct: 0 },
    branches = [],
    activeBranches = [],
    reloadBranches = () => {},
    branchFilter = "all",
    setBranchFilter = () => {},
    dateFilter,
    setDateFilter,
    deptFilter,
    setDeptFilter,
    areaFilter,
    setAreaFilter,
    searchQ,
    setSearchQ,
    selectedRecordId,
    setSelectedRecordId,
  } = useGeolocation();

  return (
    <AdminLayout>
      <div className="font-sans text-foreground w-full space-y-6">
        {/* Top Breadcrumb & Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link
                to="/admin/absensi"
                className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors p-1 -ml-1 rounded-md"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Kembali ke Absensi
              </Link>
              <span className="text-muted-foreground/40 text-xs">/</span>
              <span className="text-xs font-semibold text-primary">
                Sebaran GPS
              </span>
            </div>

            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
              <span className="p-1.5 rounded-xl bg-primary/10 text-primary">
                <MapPin className="w-6 h-6" />
              </span>
              Sebaran Geolokasi GPS Staf
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Verifikasi titik lokasi GPS saat karyawan melakukan clock-in untuk memastikan kehadiran di area klinik.
            </p>
          </div>

          {/* Header Action Button */}
          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setIsBranchModalOpen(true)}
              className="bg-card border border-border hover:border-primary/50 text-foreground rounded-xl px-3.5 py-2 text-xs font-semibold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5 text-primary" />
              Kelola Cabang ({activeBranches.length})
            </button>
            <button
              type="button"
              onClick={() => refresh()}
              disabled={loading}
              className="bg-card border border-border hover:border-foreground/25 hover:text-foreground text-muted-foreground rounded-xl px-3.5 py-2 text-xs font-semibold flex items-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Memperbarui..." : "Perbarui Data"}
            </button>
          </div>
        </div>

        {/* Office Location Banner */}
        <div className="bg-surface-soft border border-border/80 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start md:items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5 md:mt-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-sm text-foreground">
                  {activeBranches.length > 1
                    ? `${activeBranches.length} Lokasi Kantor Cabang Dr. Meow`
                    : activeBranches[0]?.name || OFFICE_NAME}
                </span>
                <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
                  Radius Geofence: {activeBranches[0]?.radius || GEOFENCE_RADIUS}m
                </span>
              </div>
              <div className="text-xs text-muted-foreground mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                {activeBranches.map((b) => (
                  <span key={b.id} className="inline-flex items-center gap-1 font-mono text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    <strong>{b.name}</strong>: {Number(b.lat).toFixed(5)}, {Number(b.lng).toFixed(5)}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Karyawan terverifikasi jika berada dalam radius cabang aktif mana saja</span>
            </div>
            <button
              type="button"
              onClick={() => setIsBranchModalOpen(true)}
              className="text-xs text-primary hover:underline font-semibold shrink-0 cursor-pointer"
            >
              Atur Cabang &rarr;
            </button>
          </div>
        </div>

        {/* Outside Area Alert (if any detected) */}
        {stats.outside > 0 && (
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 flex items-start gap-3 text-rose-900 dark:text-rose-200">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <strong className="font-semibold text-rose-700 dark:text-rose-300 block mb-0.5">
                Perhatian: Terdeteksi {stats.outside} absensi di luar radius kantor ({dateFilter === "today" ? "Hari Ini" : "Periode Ini"})!
              </strong>
              Karyawan tersebut melakukan absensi pada jarak lebih dari batas geofence kantor cabang Dr. Meow. Periksa baris bertanda merah pada tabel untuk rincian jarak dan foto selfie.
            </div>
          </div>
        )}

        {/* Key Statistics */}
        <GPSStats stats={stats} />

        {/* Interactive Map */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-sm font-bold text-foreground uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-primary" />
              Visualisasi Peta Interaktif
            </h2>
            <span className="text-xs text-muted-foreground">
              Menampilkan {plottableRecords.length} titik lokasi &bull; {activeBranches.length} cabang
            </span>
          </div>

          <AttendanceMap
            records={plottableRecords}
            selectedRecordId={selectedRecordId}
            onSelectRecord={(id) => setSelectedRecordId(id)}
            className="h-[460px] w-full"
            branches={branches}
            onOpenManageBranches={() => setIsBranchModalOpen(true)}
          />
        </div>

        {/* Detail Audit Table */}
        <GPSDetailTable
          records={records}
          selectedRecordId={selectedRecordId}
          onSelectRecord={(id) => setSelectedRecordId(id)}
          searchQ={searchQ}
          setSearchQ={setSearchQ}
          deptFilter={deptFilter}
          setDeptFilter={setDeptFilter}
          areaFilter={areaFilter}
          setAreaFilter={setAreaFilter}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          branches={activeBranches}
          branchFilter={branchFilter}
          setBranchFilter={setBranchFilter}
        />

        {/* Branch Management Modal */}
        <BranchManagementModal
          isOpen={isBranchModalOpen}
          onClose={() => setIsBranchModalOpen(false)}
          branches={branches}
          onBranchesUpdated={reloadBranches}
        />
      </div>
    </AdminLayout>
  );
}

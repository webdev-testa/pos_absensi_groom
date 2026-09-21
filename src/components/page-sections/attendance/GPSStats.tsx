import { ShieldCheck, AlertTriangle, MapPin, HelpCircle } from "lucide-react";

interface GPSStatsProps {
  stats: {
    total: number;
    withGps: number;
    inside: number;
    outside: number;
    noGps: number;
    insidePct: number;
    outsidePct: number;
  };
}

export function GPSStats({ stats }: GPSStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* 1. Inside Geofence */}
      <div className="bg-card border border-border rounded-2xl p-4 shadow-xs relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-muted-foreground">
            Dalam Radius (&le; 100m)
          </span>
          <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-heading text-foreground">
              {stats.inside}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
              {stats.insidePct}%
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Absensi valid di area kerja
          </p>
        </div>
      </div>

      {/* 2. Outside Geofence */}
      <div className="bg-card border border-border rounded-2xl p-4 shadow-xs relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-muted-foreground">
            Di Luar Radius (&gt; 100m)
          </span>
          <div className="p-1.5 rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-heading text-rose-600 dark:text-rose-400">
              {stats.outside}
            </span>
            {stats.outside > 0 && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-300">
                {stats.outsidePct}%
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Absen di luar radius kantor
          </p>
        </div>
      </div>

      {/* 3. With GPS Captured */}
      <div className="bg-card border border-border rounded-2xl p-4 shadow-xs relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-muted-foreground">
            Total Terekam GPS
          </span>
          <div className="p-1.5 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400">
            <MapPin className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-heading text-foreground">
              {stats.withGps}
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              / {stats.total} staf
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Memiliki koordinat akurat
          </p>
        </div>
      </div>

      {/* 4. Missing GPS */}
      <div className="bg-card border border-border rounded-2xl p-4 shadow-xs relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-muted-foreground">
            Tanpa Koordinat GPS
          </span>
          <div className="p-1.5 rounded-lg bg-muted text-muted-foreground">
            <HelpCircle className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-heading text-muted-foreground">
              {stats.noGps}
            </span>
            <span className="text-xs text-muted-foreground">
              staf
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Absen manual atau sistem lama
          </p>
        </div>
      </div>
    </div>
  );
}

/// <reference types="@types/google.maps" />
import { useEffect, useRef, useState, useCallback } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import { 
  RefreshCw, 
  Maximize2, 
  AlertTriangle,
  Building2
} from "lucide-react";
import type { AttendanceGPSItem } from "@/hooks/useGeolocation";
import type { BranchOffice } from "@/types/branch";
import { DEFAULT_BRANCHES, GEOFENCE_RADIUS } from "@/constants/geofence.constants";

interface AttendanceMapProps {
  records: AttendanceGPSItem[];
  selectedRecordId: string | null;
  onSelectRecord?: (id: string | null) => void;
  className?: string;
  branches?: BranchOffice[];
  onOpenManageBranches?: () => void;
}

function escapeHtml(str?: string | null): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function sanitizeHttpUrl(url?: string | null): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return encodeURI(trimmed);
  }
  return null;
}

export function AttendanceMap({
  records,
  selectedRecordId,
  onSelectRecord,
  className = "h-[500px] w-full",
  branches = DEFAULT_BRANCHES,
  onOpenManageBranches,
}: AttendanceMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Map<string, google.maps.marker.AdvancedMarkerElement>>(new Map());
  const branchMarkersRef = useRef<Map<string, google.maps.marker.AdvancedMarkerElement>>(new Map());
  const branchCirclesRef = useRef<Map<string, google.maps.Circle>>(new Map());
  const activeInfoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const markerLibRef = useRef<google.maps.MarkerLibrary | null>(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showGeofence, setShowGeofence] = useState(true);

  // Active branches
  const activeBranches = branches.filter((b) => b.is_active !== false);
  const primaryBranch = activeBranches[0] || DEFAULT_BRANCHES[0];

  // Initialize Google Maps with Advanced Markers
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY;
    if (!apiKey) {
      setLoadError("API Key Google Maps (VITE_GOOGLE_MAPS_KEY) belum dikonfigurasi di .env");
      return;
    }

    let isMounted = true;

    setOptions({
      key: apiKey,
      v: "weekly",
    });

    Promise.all([
      importLibrary("maps") as Promise<google.maps.MapsLibrary>,
      importLibrary("marker") as Promise<google.maps.MarkerLibrary>,
    ])
      .then(([mapsLib, markerLib]) => {
        if (!isMounted || !mapContainerRef.current) return;

        markerLibRef.current = markerLib;
        const { Map } = mapsLib;
        const centerPos = { lat: primaryBranch.lat, lng: primaryBranch.lng };

        const map = new Map(mapContainerRef.current, {
          center: centerPos,
          zoom: 16,
          mapId: "DR_MEOW_PRESENCE_MAP", // Required for AdvancedMarkerElement
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
        });

        mapInstanceRef.current = map;
        setMapLoaded(true);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("Gagal memuat Google Maps:", err);
        setLoadError(err?.message || "Gagal memuat Google Maps SDK");
      });

    return () => {
      isMounted = false;
      if (activeInfoWindowRef.current) {
        activeInfoWindowRef.current.close();
        activeInfoWindowRef.current = null;
      }
      markersRef.current.forEach((m) => {
        if (typeof window.google?.maps?.event?.clearInstanceListeners === "function") {
          google.maps.event.clearInstanceListeners(m);
        }
        m.map = null;
      });
      markersRef.current.clear();
      branchMarkersRef.current.forEach((m) => {
        if (typeof window.google?.maps?.event?.clearInstanceListeners === "function") {
          google.maps.event.clearInstanceListeners(m);
        }
        m.map = null;
      });
      branchMarkersRef.current.clear();
      branchCirclesRef.current.forEach((c) => c.setMap(null));
      branchCirclesRef.current.clear();
    };
  }, []);

  // Render & update branch markers and geofence circles
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded || !markerLibRef.current) return;

    const { AdvancedMarkerElement, PinElement } = markerLibRef.current;

    // Clear old branch markers and circles
    branchMarkersRef.current.forEach((m) => {
      if (typeof window.google?.maps?.event?.clearInstanceListeners === "function") {
        google.maps.event.clearInstanceListeners(m);
      }
      m.map = null;
    });
    branchMarkersRef.current.clear();

    branchCirclesRef.current.forEach((c) => c.setMap(null));
    branchCirclesRef.current.clear();

    activeBranches.forEach((branch) => {
      const branchPos = { lat: branch.lat, lng: branch.lng };

      // Geofence Circle for this branch
      const circle = new google.maps.Circle({
        strokeColor: "#2563EB", // Blue
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#3B82F6",
        fillOpacity: 0.15,
        map: showGeofence ? map : null,
        center: branchPos,
        radius: branch.radius || GEOFENCE_RADIUS,
      });
      branchCirclesRef.current.set(branch.id, circle);

      // Office Pin for this branch
      const officePin = new PinElement({
        background: "#1D4ED8",
        borderColor: "#1E40AF",
        glyphColor: "#FFFFFF",
        scale: 1.25,
      });

      const branchMarker = new AdvancedMarkerElement({
        position: branchPos,
        map: map,
        title: branch.name,
        zIndex: 100,
        content: officePin.element,
      });

      const officeInfo = new google.maps.InfoWindow({
        content: `
          <div style="font-family: inherit; padding: 6px 8px; max-width: 230px;">
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
              <span style="font-size: 16px;">🏢</span>
              <strong style="font-size: 13px; color: #1E293B;">${escapeHtml(branch.name)}</strong>
            </div>
            <div style="font-size: 11px; color: #64748B; line-height: 1.4;">
              ${escapeHtml(branch.address || "Pusat Geofence Absensi")}<br/>
              Radius Aman: <strong>${branch.radius || GEOFENCE_RADIUS} meter</strong>
            </div>
            <div style="color: #94A3B8; font-size: 10px; margin-top: 4px; font-family: monospace;">
              ${Number(branch.lat).toFixed(5)}, ${Number(branch.lng).toFixed(5)}
            </div>
          </div>
        `,
      });

      branchMarker.addListener("click", () => {
        if (activeInfoWindowRef.current) activeInfoWindowRef.current.close();
        officeInfo.open({
          anchor: branchMarker,
          map: map,
        });
        activeInfoWindowRef.current = officeInfo;
      });

      branchMarkersRef.current.set(branch.id, branchMarker);
    });
  }, [branches, activeBranches, mapLoaded, showGeofence]);

  // Update employee markers whenever plottable records change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded || !markerLibRef.current) return;

    const { AdvancedMarkerElement, PinElement } = markerLibRef.current;

    // Clear old employee markers and listeners
    if (activeInfoWindowRef.current) {
      activeInfoWindowRef.current.close();
      activeInfoWindowRef.current = null;
    }
    markersRef.current.forEach((m) => {
      if (typeof window.google?.maps?.event?.clearInstanceListeners === "function") {
        google.maps.event.clearInstanceListeners(m);
      }
      m.map = null;
    });
    markersRef.current.clear();

    const bounds = new google.maps.LatLngBounds();
    // Include all active branches in initial bounds
    activeBranches.forEach((b) => {
      bounds.extend({ lat: b.lat, lng: b.lng });
    });

    records.forEach((record) => {
      if (
        record.clock_in_lat == null ||
        record.clock_in_lng == null ||
        !Number.isFinite(record.clock_in_lat) ||
        !Number.isFinite(record.clock_in_lng)
      ) {
        return;
      }

      const pos = { lat: record.clock_in_lat, lng: record.clock_in_lng };
      bounds.extend(pos);

      const isInside = record.isInsideGeofence;

      const pin = new PinElement({
        background: isInside ? "#10B981" : "#EF4444",
        borderColor: isInside ? "#047857" : "#B91C1C",
        glyphColor: "#FFFFFF",
        scale: 0.95,
      });

      const safeName = escapeHtml(record.users?.name || "Karyawan");

      const marker = new AdvancedMarkerElement({
        position: pos,
        map: map,
        title: safeName,
        content: pin.element,
      });

      const timeStr = record.clock_in_time
        ? new Date(record.clock_in_time).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "—";

      const safeDept = escapeHtml(record.users?.dept || "—");
      const safeEmpId = escapeHtml(record.users?.emp_id || "-");
      const safePhotoUrl = sanitizeHttpUrl(record.clock_in_photo_url);
      const safeDistance = escapeHtml(record.distanceFormatted);
      const safeStatus = record.status === "late" ? "Terlambat" : "Tepat Waktu";
      const branchName = record.nearestBranch?.name || "Klinik";
      const branchDistText = record.nearestBranch
        ? `Cabang Terdekat: <strong>${escapeHtml(branchName)}</strong> (${safeDistance})`
        : `Jarak: <strong>${safeDistance}</strong>`;

      const infoContent = `
        <div style="font-family: inherit; padding: 6px 8px; min-width: 220px; max-width: 260px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <strong style="font-size: 13px; color: #0F172A;">${safeName}</strong>
            <span style="font-size: 10px; font-weight: 600; padding: 2px 6px; border-radius: 9999px; background: ${
              isInside ? "#DCFCE7; color: #15803D" : "#FEE2E2; color: #B91C1C"
            };">
              ${isInside ? "✓ Dalam Area" : "⚠ Luar Radius"}
            </span>
          </div>
          
          <div style="font-size: 11px; color: #475569; space-y: 2px; line-height: 1.5;">
            <div>Posisi: <strong>${safeDept}</strong> (${safeEmpId})</div>
            <div>Jam Masuk: <strong>${timeStr}</strong> (${safeStatus})</div>
            <div>${branchDistText}</div>
            <div style="color: #64748B; font-size: 10px; margin-top: 4px;">
              Koordinat: ${record.clock_in_lat.toFixed(5)}, ${record.clock_in_lng.toFixed(5)}
            </div>
          </div>

          ${
            safePhotoUrl
              ? `<div style="margin-top: 8px; text-align: center;">
                  <img src="${safePhotoUrl}" alt="Foto Selfie" style="width: 100%; height: 90px; object-fit: cover; border-radius: 8px; border: 1px solid #E2E8F0;" />
                 </div>`
              : ""
          }

          <div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid #F1F5F9; display: flex; justify-content: flex-end;">
            <a href="https://www.google.com/maps?q=${record.clock_in_lat},${record.clock_in_lng}" target="_blank" rel="noopener noreferrer" style="font-size: 11px; color: #2563EB; text-decoration: none; display: flex; align-items: center; gap: 3px; font-weight: 500;">
              Lihat di Google Maps ↗
            </a>
          </div>
        </div>
      `;

      const infoWindow = new google.maps.InfoWindow({
        content: infoContent,
      });

      marker.addListener("click", () => {
        if (activeInfoWindowRef.current) activeInfoWindowRef.current.close();
        infoWindow.open({
          anchor: marker,
          map: map,
        });
        activeInfoWindowRef.current = infoWindow;
        if (onSelectRecord) onSelectRecord(record.id);
      });

      markersRef.current.set(record.id, marker);
    });

    // Auto-fit bounds if we have coordinates
    if (records.length > 0 && mapInstanceRef.current) {
      mapInstanceRef.current.fitBounds(bounds, 50);
    }
  }, [records, mapLoaded, activeBranches, onSelectRecord]);

  // Focus and open info window when selectedRecordId changes
  useEffect(() => {
    if (!selectedRecordId || !mapLoaded || !mapInstanceRef.current) return;

    const marker = markersRef.current.get(selectedRecordId);
    if (marker) {
      const pos = marker.position;
      if (pos) {
        mapInstanceRef.current.panTo(pos);
        mapInstanceRef.current.setZoom(18);
        google.maps.event.trigger(marker, "click");
      }
    }
  }, [selectedRecordId, mapLoaded]);

  // Toggle geofence circle visibility
  const toggleCircle = useCallback(() => {
    const nextState = !showGeofence;
    branchCirclesRef.current.forEach((circle) => {
      circle.setVisible(nextState);
    });
    setShowGeofence(nextState);
  }, [showGeofence]);

  // Reset view to bounds covering all branches and records
  const resetBounds = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const bounds = new google.maps.LatLngBounds();
    activeBranches.forEach((b) => bounds.extend({ lat: b.lat, lng: b.lng }));
    records.forEach((r) => {
      if (r.clock_in_lat != null && r.clock_in_lng != null) {
        bounds.extend({ lat: r.clock_in_lat, lng: r.clock_in_lng });
      }
    });
    map.fitBounds(bounds, 50);
  }, [records, activeBranches]);

  if (loadError) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 bg-card border border-destructive/30 rounded-2xl text-center ${className}`}>
        <AlertTriangle className="w-12 h-12 text-destructive mb-3" />
        <h3 className="font-heading text-base font-bold text-foreground mb-1">
          Tidak Dapat Memuat Google Maps
        </h3>
        <p className="text-xs text-muted-foreground max-w-md mb-4 leading-relaxed">
          {loadError}
        </p>
        <div className="text-xs bg-muted/60 p-3 rounded-xl border border-border text-muted-foreground font-mono">
          Periksa variabel VITE_GOOGLE_MAPS_KEY pada file .env
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl overflow-hidden border border-border bg-card shadow-xs group">
      {/* Map Canvas */}
      <div ref={mapContainerRef} className={className} />

      {/* Loading Overlay */}
      {!mapLoaded && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-xs flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-6 h-6 text-primary animate-spin" />
          <span className="text-xs font-semibold text-muted-foreground">
            Memuat Peta Sebaran GPS...
          </span>
        </div>
      )}

      {/* Floating Map Controls Top-Right */}
      {mapLoaded && (
        <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-background/90 backdrop-blur-md p-1 rounded-xl border border-border/80 shadow-md">
          {onOpenManageBranches && (
            <button
              type="button"
              onClick={onOpenManageBranches}
              title="Kelola Kantor Cabang"
              aria-label="Kelola Kantor Cabang"
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-muted/80 rounded-lg transition-colors border border-border/60"
            >
              <Building2 className="w-3.5 h-3.5 text-primary" />
              <span>{activeBranches.length} Cabang</span>
            </button>
          )}
          <button
            type="button"
            onClick={resetBounds}
            title="Reset Tampilan Peta"
            aria-label="Reset Tampilan Peta"
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-lg text-xs font-medium transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={toggleCircle}
            title={showGeofence ? "Sembunyikan Lingkaran Geofence" : "Tampilkan Lingkaran Geofence"}
            aria-label="Toggle Lingkaran Geofence"
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors border ${
              showGeofence
                ? "bg-primary/10 text-primary border-primary/20"
                : "bg-muted text-muted-foreground border-transparent"
            }`}
          >
            Radius Perimeter
          </button>
        </div>
      )}

      {/* Legend Bottom-Left */}
      <div className="absolute bottom-3 left-3 bg-background/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-border/80 shadow-md flex flex-wrap items-center gap-3.5 text-[11px] font-medium text-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#1D4ED8] ring-2 ring-blue-200"></div>
          <span>Kantor Cabang ({activeBranches.length})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#10B981] ring-2 ring-emerald-200"></div>
          <span>Dalam Radius Cabang</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444] ring-2 ring-rose-200"></div>
          <span>Luar Radius Cabang</span>
        </div>
      </div>
    </div>
  );
}

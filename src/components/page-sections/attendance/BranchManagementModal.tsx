import { useState, useEffect, useRef } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Building2,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  HelpCircle,
  MapPin,
  Loader2,
  Sparkles,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import type { BranchOffice, BranchFormData } from "@/types/branch";
import { branchService } from "@/services/branchService";
import { isValidCoordinate } from "@/utils/geofence.utils";

export interface ParsedLocationInfo {
  lat: string | null;
  lng: string | null;
  placeName: string | null;
  isShortlink: boolean;
}

/**
 * Extracts coordinates and place names from various Google Maps link formats or direct raw coordinates.
 */
export function parseGoogleMapsUrlOrText(input: string): ParsedLocationInfo {
  const trimmed = input.trim();
  if (!trimmed) {
    return { lat: null, lng: null, placeName: null, isShortlink: false };
  }

  const isShortlink = /maps\.app\.goo\.gl|goo\.gl\/maps/i.test(trimmed);

  let placeName: string | null = null;
  const placeMatch = trimmed.match(/\/maps\/place\/([^/@?]+)/);
  if (placeMatch && placeMatch[1]) {
    try {
      placeName = decodeURIComponent(placeMatch[1].replace(/\+/g, " ")).trim();
    } catch {
      placeName = placeMatch[1].replace(/\+/g, " ").trim();
    }
  }

  // 1. Check !3d and !4d (most accurate place coordinates in Google Maps)
  const placeCoordMatch = trimmed.match(/!3d(-?\d+(?:\.\d+)?)\!4d(-?\d+(?:\.\d+)?)/);
  if (placeCoordMatch && placeCoordMatch[1] && placeCoordMatch[2]) {
    return { lat: placeCoordMatch[1], lng: placeCoordMatch[2], placeName, isShortlink };
  }

  // 2. Check ?q= or ?ll=
  const qMatch = trimmed.match(/[?&](?:q|ll)=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (qMatch && qMatch[1] && qMatch[2]) {
    return { lat: qMatch[1], lng: qMatch[2], placeName, isShortlink };
  }

  // 3. Check @lat,lng
  const atMatch = trimmed.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (atMatch && atMatch[1] && atMatch[2]) {
    return { lat: atMatch[1], lng: atMatch[2], placeName, isShortlink };
  }

  // 4. Check raw lat, lng coordinates (e.g. "-8.00973, 112.61069" or "-8.00973 112.61069")
  const rawMatch = trimmed.match(/^(-?\d+(?:\.\d+)?)[,\s]+(-?\d+(?:\.\d+)?)$/);
  if (rawMatch && rawMatch[1] && rawMatch[2]) {
    return { lat: rawMatch[1], lng: rawMatch[2], placeName, isShortlink };
  }

  return { lat: null, lng: null, placeName, isShortlink };
}

/**
 * Interactive mini Google Map picker allowing users to click or drag the branch coordinate pin.
 */
function BranchMiniMapPicker({
  lat,
  lng,
  radius,
  onChange,
}: {
  lat: number | null;
  lng: number | null;
  radius: number;
  onChange: (lat: number, lng: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const circleRef = useRef<google.maps.Circle | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Default center coordinates: Malang area (-8.0097357, 112.6106983)
  const defaultLat =
    typeof lat === "number" && Number.isFinite(lat) ? lat : -8.0097357;
  const defaultLng =
    typeof lng === "number" && Number.isFinite(lng) ? lng : 112.6106983;

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY;
    if (!apiKey) {
      setLoadError("Google Maps API Key belum diset di .env");
      return;
    }

    let isMounted = true;
    try {
      setOptions({ key: apiKey, v: "weekly" });
    } catch {
      // Options already set elsewhere
    }

    Promise.all([
      importLibrary("maps") as Promise<google.maps.MapsLibrary>,
      importLibrary("marker") as Promise<google.maps.MarkerLibrary>,
    ])
      .then(([mapsLib, markerLib]) => {
        if (!isMounted || !containerRef.current) return;

        const initialPos = { lat: defaultLat, lng: defaultLng };

        const map = new mapsLib.Map(containerRef.current, {
          center: initialPos,
          zoom: lat && lng ? 17 : 14,
          mapId: "DR_MEOW_BRANCH_MINI_PICKER",
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          zoomControl: true,
        });
        mapRef.current = map;

        const pinDiv = document.createElement("div");
        pinDiv.className = "cursor-grab active:cursor-grabbing flex flex-col items-center select-none";
        pinDiv.innerHTML = `
          <div style="background-color: #6366f1; color: white; padding: 3px 8px; border-radius: 9999px; font-size: 11px; font-weight: 700; box-shadow: 0 2px 8px rgba(0,0,0,0.25); border: 2px solid white; display: flex; align-items: center; gap: 4px;">
            <svg style="width: 12px; height: 12px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            Geser / Klik
          </div>
          <div style="width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 6px solid #6366f1; margin-top: -1px;"></div>
        `;

        const marker = new markerLib.AdvancedMarkerElement({
          map,
          position: initialPos,
          gmpDraggable: true,
          content: pinDiv,
          title: "Klik atau geser pin ini untuk menentukan lokasi cabang",
        });
        markerRef.current = marker;

        if (window.google?.maps?.Circle) {
          const circle = new window.google.maps.Circle({
            map,
            center: initialPos,
            radius,
            fillColor: "#6366f1",
            fillOpacity: 0.15,
            strokeColor: "#6366f1",
            strokeOpacity: 0.7,
            strokeWeight: 2,
          });
          circleRef.current = circle;
        }

        marker.addListener("dragend", () => {
          const pos = marker.position;
          if (pos && typeof pos.lat === "number" && typeof pos.lng === "number") {
            onChange(pos.lat, pos.lng);
            circleRef.current?.setCenter(pos);
          }
        });

        map.addListener("click", (e: google.maps.MapMouseEvent) => {
          if (e.latLng) {
            const newLat = e.latLng.lat();
            const newLng = e.latLng.lng();
            marker.position = e.latLng;
            circleRef.current?.setCenter(e.latLng);
            onChange(newLat, newLng);
          }
        });

        setIsMapReady(true);
      })
      .catch((err) => {
        if (!isMounted) return;
        setLoadError(err?.message || "Gagal memuat peta interaktif");
      });

    return () => {
      isMounted = false;
      if (markerRef.current) {
        markerRef.current.map = null;
        markerRef.current = null;
      }
      if (circleRef.current) {
        circleRef.current.setMap(null);
        circleRef.current = null;
      }
      mapRef.current = null;
    };
  }, []);

  // Update map and circle when external coordinates or radius change
  useEffect(() => {
    if (
      !mapRef.current ||
      !markerRef.current ||
      lat == null ||
      lng == null ||
      !Number.isFinite(lat) ||
      !Number.isFinite(lng)
    ) {
      return;
    }
    const pos = { lat, lng };
    markerRef.current.position = pos;
    circleRef.current?.setCenter(pos);
    circleRef.current?.setRadius(radius);
    mapRef.current.panTo(pos);
  }, [lat, lng, radius]);

  if (loadError) {
    return (
      <div className="p-3 bg-muted/40 rounded-xl border border-dashed border-border text-center text-xs text-muted-foreground">
        {loadError}
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-foreground flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-primary" />
          Peta Titik Cabang (Klik pada peta atau geser pin)
        </span>
        <span className="text-[11px] text-muted-foreground">
          Radius: {radius}m
        </span>
      </div>
      <div className="relative rounded-xl overflow-hidden border border-border h-44 w-full bg-muted/30 shadow-inner">
        <div ref={containerRef} className="w-full h-full" />
        {!isMapReady && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-xs flex items-center justify-center text-xs text-muted-foreground gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            Memuat peta interaktif...
          </div>
        )}
      </div>
      <div className="text-[11px] text-muted-foreground flex items-center justify-between">
        <span>💡 Tips: Klik pada peta atau geser pin untuk mengubah koordinat secara instan.</span>
      </div>
    </div>
  );
}

interface BranchManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  branches: BranchOffice[];
  onBranchesUpdated: () => void;
}

export function BranchManagementModal({
  isOpen,
  onClose,
  branches,
  onBranchesUpdated,
}: BranchManagementModalProps) {
  const [editingBranch, setEditingBranch] = useState<BranchOffice | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [radius, setRadius] = useState("100");
  const [isActive, setIsActive] = useState(true);

  // Quick URL parser & shortlink resolver state
  const [pasteUrlInput, setPasteUrlInput] = useState("");
  const [isResolvingUrl, setIsResolvingUrl] = useState(false);
  const [resolveFailed, setResolveFailed] = useState(false);
  const activeRequestIdRef = useRef(0);

  const applyExtractedLocation = (info: ParsedLocationInfo) => {
    if (info.lat && info.lng) {
      const nLat = Number(info.lat);
      const nLng = Number(info.lng);
      if (!isValidCoordinate(nLat, nLng)) {
        return false;
      }
      setLat(info.lat);
      setLng(info.lng);
      setResolveFailed(false);
      if (
        info.placeName &&
        (!name.trim() || name.toLowerCase().includes("cabang baru"))
      ) {
        setName(info.placeName);
      }
      return true;
    }
    return false;
  };

  const handleResolveUrl = async (rawInput: string) => {
    const trimmed = rawInput.trim();
    if (!trimmed) return;

    // 1. Direct parsing (for full URLs, place links, query params, or raw coords)
    const directInfo = parseGoogleMapsUrlOrText(trimmed);
    if (applyExtractedLocation(directInfo)) {
      toast.success("Koordinat berhasil diekstrak!");
      return;
    }

    // 2. If it is a shortlink (maps.app.goo.gl or goo.gl/maps), resolve via proxy endpoint
    if (directInfo.isShortlink) {
      const requestId = ++activeRequestIdRef.current;
      setIsResolvingUrl(true);
      setResolveFailed(false);
      try {
        const res = await fetch(`/api/resolve-maps-url?url=${encodeURIComponent(trimmed)}`);
        if (!res.ok) {
          throw new Error(`Server status ${res.status}`);
        }
        const data = await res.json();
        if (requestId !== activeRequestIdRef.current) return;

        if (data.resolvedUrl) {
          const resolvedInfo = parseGoogleMapsUrlOrText(data.resolvedUrl);
          if (applyExtractedLocation(resolvedInfo)) {
            toast.success("Koordinat & nama tempat berhasil diekstrak dari link Google Maps!");
            return;
          }
        }
        setResolveFailed(true);
        toast.warning("Link Google Maps berhasil dibuka, namun koordinat belum ditemukan.", {
          description: "Silakan buka link di browser dan salin koordinatnya, atau klik langsung pada peta.",
        });
      } catch (err: unknown) {
        if (requestId !== activeRequestIdRef.current) return;
        console.warn("Gagal auto-resolve shortlink:", err);
        setResolveFailed(true);
        toast.error("Gagal membuka link pendek otomatis", {
          description: "Silakan buka link di browser lalu salin koordinatnya, atau pilih titik langsung di peta.",
        });
      } finally {
        if (requestId === activeRequestIdRef.current) {
          setIsResolvingUrl(false);
        }
      }
    }
  };

  const handleParseUrlOrCoords = (raw: string) => {
    setPasteUrlInput(raw);
    const trimmed = raw.trim();
    if (!trimmed) {
      setResolveFailed(false);
      return;
    }

    // Try direct parsing first
    const directInfo = parseGoogleMapsUrlOrText(trimmed);
    if (applyExtractedLocation(directInfo)) {
      toast.success("Koordinat berhasil diekstrak!");
      return;
    }

    // If it is a shortlink, trigger auto-resolve
    if (directInfo.isShortlink) {
      handleResolveUrl(trimmed);
    }
  };

  const handleMapCoordinatePick = (newLat: number, newLng: number) => {
    setLat(newLat.toFixed(7));
    setLng(newLng.toFixed(7));
    setResolveFailed(false);
  };

  const openAddForm = () => {
    setEditingBranch(null);
    setName("");
    setAddress("");
    setLat("");
    setLng("");
    setRadius("100");
    setIsActive(true);
    setPasteUrlInput("");
    setResolveFailed(false);
    setIsAdding(true);
  };

  const openEditForm = (branch: BranchOffice) => {
    setEditingBranch(branch);
    setName(branch.name);
    setAddress(branch.address || "");
    setLat(String(branch.lat));
    setLng(String(branch.lng));
    setRadius(String(branch.radius || 100));
    setIsActive(branch.is_active !== false);
    setPasteUrlInput("");
    setResolveFailed(false);
    setIsAdding(true);
  };

  const cancelForm = () => {
    setIsAdding(false);
    setEditingBranch(null);
    setResolveFailed(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isResolvingUrl) return;

    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error("Nama cabang tidak boleh kosong");
      return;
    }

    const numLat = Number(lat);
    const numLng = Number(lng);
    if (!isValidCoordinate(numLat, numLng)) {
      toast.error("Koordinat Latitude atau Longitude tidak valid", {
        description: "Contoh: Lat -8.00973, Lng 112.61069",
      });
      return;
    }

    // Defensive clamping between 10m and 5000m
    const numRadius = Math.min(5000, Math.max(10, Number(radius) || 100));

    // Prevent deactivating all branches (must retain at least 1 active branch)
    if (!isActive) {
      const otherActive = branches.filter(
        (b) => b.id !== editingBranch?.id && b.is_active !== false
      );
      if (otherActive.length === 0) {
        toast.error("Minimal harus ada 1 kantor cabang yang aktif");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const formData: BranchFormData = {
        name: trimmedName,
        address: address.trim(),
        lat: numLat,
        lng: numLng,
        radius: numRadius,
        is_active: isActive,
      };

      if (editingBranch) {
        await branchService.updateBranch(editingBranch.id, formData);
        toast.success(`Cabang "${trimmedName}" berhasil diperbarui`);
      } else {
        await branchService.createBranch(formData);
        toast.success(`Cabang baru "${trimmedName}" berhasil ditambahkan`);
      }

      onBranchesUpdated();
      cancelForm();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menyimpan cabang";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (branch: BranchOffice) => {
    if (deletingId || isSubmitting) return;

    if (branches.length <= 1) {
      toast.error("Tidak dapat menghapus cabang terakhir");
      return;
    }

    const confirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus kantor cabang "${branch.name}"?`
    );
    if (!confirmed) return;

    setDeletingId(branch.id);
    try {
      await branchService.deleteBranch(branch.id);
      toast.success(`Cabang "${branch.name}" telah dihapus`);
      onBranchesUpdated();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menghapus cabang";
      toast.error(msg);
    } finally {
      setDeletingId(null);
    }
  };

  // Coordinates validation check
  const numLat = lat ? Number(lat) : null;
  const numLng = lng ? Number(lng) : null;
  const hasValidCoords =
    numLat !== null && numLng !== null && isValidCoordinate(numLat, numLng);
  const isShortlinkPasted = /maps\.app\.goo\.gl|goo\.gl\/maps/i.test(pasteUrlInput);
  const isSafeExternalUrl = /^https:\/\//i.test(pasteUrlInput.trim());

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">
                  Kelola Lokasi Kantor Cabang
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Atur daftar kantor cabang dan radius geofence untuk absensi karyawan
                </DialogDescription>
              </div>
            </div>
            {!isAdding && (
              <Button
                size="sm"
                onClick={openAddForm}
                className="gap-1.5 h-8 text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Cabang
              </Button>
            )}
          </div>
        </DialogHeader>

        {/* Content View: Form or List */}
        {isAdding ? (
          <form onSubmit={handleSave} className="space-y-4 py-2">
            {/* Quick URL / Coordinates Parser Box */}
            <div className="p-3 bg-muted/50 rounded-xl border border-border/70 text-xs space-y-2.5">
              <div className="font-semibold text-foreground flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  Pintasan Cepat: Tempel Link Google Maps atau Koordinat
                </div>
                {isResolvingUrl && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-primary font-medium">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Mengekstrak otomatis...
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <Input
                  placeholder="Contoh: https://maps.app.goo.gl/... atau -8.0097, 112.6106"
                  value={pasteUrlInput}
                  onChange={(e) => handleParseUrlOrCoords(e.target.value)}
                  className="h-8 text-xs bg-background flex-1"
                />
                {pasteUrlInput.trim() && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={isResolvingUrl}
                    onClick={() => handleResolveUrl(pasteUrlInput)}
                    className="h-8 text-xs gap-1 shrink-0"
                  >
                    <Search className="w-3 h-3" />
                    Ekstrak
                  </Button>
                )}
              </div>

              <span className="text-[11px] text-muted-foreground block">
                Mendukung link pendek (maps.app.goo.gl), link lengkap Google Maps, atau koordinat langsung.
              </span>

              {/* Shortlink Resolution Feedback Banner */}
              {isShortlinkPasted && resolveFailed && (
                <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-lg text-xs space-y-1.5">
                  <div className="font-semibold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                    Link Pendek Google Maps Terdeteksi
                  </div>
                  <p className="text-[11px] text-amber-800 dark:text-amber-300">
                    Jika link pendek tidak dapat diselesaikan otomatis, klik tombol di bawah untuk membukanya di browser:
                  </p>
                  {isSafeExternalUrl && (
                    <div className="flex items-center gap-2 pt-1">
                      <a
                        href={pasteUrlInput.trim()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
                      >
                        Buka di Tab Baru <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                  <p className="text-[10px] text-muted-foreground">
                    Di Google Maps, klik kanan titik lokasi lalu pilih angka koordinat paling atas untuk menyalinnya.
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label htmlFor="branch-name" className="text-xs font-semibold block">
                  Nama Cabang <span className="text-destructive">*</span>
                </label>
                <Input
                  id="branch-name"
                  placeholder="Contoh: Dr.Meoww Cabang 3 - Sawojajar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-1 h-9 text-xs"
                />
              </div>

              <div>
                <label htmlFor="branch-addr" className="text-xs font-semibold block">
                  Alamat / Keterangan Lokasi
                </label>
                <Input
                  id="branch-addr"
                  placeholder="Contoh: Jl. Danau Sentani No. 15, Sawojajar, Malang"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="mt-1 h-9 text-xs"
                />
              </div>

              {/* Coordinates Status Feedback */}
              {hasValidCoords ? (
                <div className="flex items-center justify-between p-2.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-lg text-xs text-emerald-800 dark:text-emerald-300">
                  <div className="flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      Koordinat Terisi: <strong>{numLat?.toFixed(6)}, {numLng?.toFixed(6)}</strong>
                    </span>
                  </div>
                  <a
                    href={`https://www.google.com/maps?q=${lat},${lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 dark:text-emerald-300 hover:underline"
                  >
                    Cek di Google Maps <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 p-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-lg text-[11px] text-amber-800 dark:text-amber-300">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>
                    Koordinat belum terisi. Tempel link Google Maps pada kolom pintasan di atas, atau klik langsung pada peta di bawah.
                  </span>
                </div>
              )}

              {/* Interactive Mini Map Picker */}
              <BranchMiniMapPicker
                lat={numLat}
                lng={numLng}
                radius={Number(radius) || 100}
                onChange={handleMapCoordinatePick}
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="branch-lat" className="text-xs font-semibold block">
                    Latitude <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="branch-lat"
                    placeholder="Belum terisi (Contoh: -8.0027589)"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    required
                    className={`mt-1 h-9 text-xs font-mono ${
                      hasValidCoords
                        ? "border-emerald-500/70 focus-visible:ring-emerald-500"
                        : ""
                    }`}
                  />
                </div>
                <div>
                  <label htmlFor="branch-lng" className="text-xs font-semibold block">
                    Longitude <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="branch-lng"
                    placeholder="Belum terisi (Contoh: 112.6997836)"
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    required
                    className={`mt-1 h-9 text-xs font-mono ${
                      hasValidCoords
                        ? "border-emerald-500/70 focus-visible:ring-emerald-500"
                        : ""
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="branch-radius" className="text-xs font-semibold block">
                    Radius Geofence (Meter)
                  </label>
                  <Input
                    id="branch-radius"
                    type="number"
                    min="10"
                    max="5000"
                    placeholder="100"
                    value={radius}
                    onChange={(e) => setRadius(e.target.value)}
                    className="mt-1 h-9 text-xs font-mono"
                  />
                  <span className="text-[10px] text-muted-foreground block mt-0.5">
                    Standar: 100 meter (Maksimal 5000m)
                  </span>
                </div>

                <div className="flex flex-col justify-center pt-2">
                  <span className="text-xs font-semibold mb-2 block">Status Cabang</span>
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded border-border w-4 h-4 text-primary focus:ring-primary"
                    />
                    <span>Aktifkan verifikasi geofence di cabang ini</span>
                  </label>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 pt-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={cancelForm}
                disabled={isSubmitting}
                className="h-8 text-xs"
              >
                Batal
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting || isResolvingUrl || !hasValidCoords}
                className="h-8 text-xs font-semibold"
              >
                {isSubmitting
                  ? "Menyimpan..."
                  : isResolvingUrl
                  ? "Mengekstrak..."
                  : editingBranch
                  ? "Simpan Perubahan"
                  : "Tambah Cabang"}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="space-y-3 py-2">
            {branches.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-xs">
                Belum ada data cabang kantor.
              </div>
            ) : (
              branches.map((b) => {
                const isSingle = branches.length <= 1;
                return (
                  <div
                    key={b.id}
                    className="p-3.5 rounded-xl border border-border/80 bg-card hover:border-primary/40 transition-colors flex items-center justify-between gap-3 shadow-xs"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-foreground truncate">
                          {b.name}
                        </span>
                        {b.is_active !== false ? (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 font-medium">
                            <CheckCircle2 className="w-3 h-3" />
                            Aktif ({b.radius || 100}m)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                            <XCircle className="w-3 h-3" />
                            Nonaktif
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-muted-foreground truncate">
                        {b.address || "Tidak ada alamat detail"}
                      </div>

                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground/80 font-mono">
                        <span>
                          {Number(b.lat).toFixed(5)}, {Number(b.lng).toFixed(5)}
                        </span>
                        <a
                          href={`https://www.google.com/maps?q=${b.lat},${b.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline inline-flex items-center gap-0.5"
                        >
                          Peta <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditForm(b)}
                        title="Edit Cabang"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(b)}
                        disabled={isSingle || deletingId !== null || isSubmitting}
                        title={
                          isSingle
                            ? "Tidak dapat menghapus cabang terakhir"
                            : deletingId === b.id
                            ? "Menghapus..."
                            : "Hapus Cabang"
                        }
                        className={`h-8 w-8 p-0 ${
                          isSingle || deletingId !== null || isSubmitting
                            ? "opacity-30 cursor-not-allowed"
                            : "text-destructive/80 hover:text-destructive hover:bg-destructive/10"
                        }`}
                      >
                        <Trash2 className={`w-3.5 h-3.5 ${deletingId === b.id ? "animate-spin" : ""}`} />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}

            <DialogFooter className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="h-8 text-xs"
              >
                Tutup
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

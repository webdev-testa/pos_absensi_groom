import type { BranchOffice } from "@/types/branch";

// Geofence constants for Dr. Meow clinic
// Can be customized via .env (VITE_OFFICE_LAT, VITE_OFFICE_LNG, VITE_GEOFENCE_RADIUS, VITE_OFFICE_NAME)
const envLat = import.meta.env.VITE_OFFICE_LAT ? Number(import.meta.env.VITE_OFFICE_LAT) : NaN;
const envLng = import.meta.env.VITE_OFFICE_LNG ? Number(import.meta.env.VITE_OFFICE_LNG) : NaN;
const envRadius = import.meta.env.VITE_GEOFENCE_RADIUS ? Number(import.meta.env.VITE_GEOFENCE_RADIUS) : NaN;

export const OFFICE_LAT = Number.isFinite(envLat) ? envLat : -8.0097357;
export const OFFICE_LNG = Number.isFinite(envLng) ? envLng : 112.6106983;
export const GEOFENCE_RADIUS = Number.isFinite(envRadius) && envRadius > 0 ? envRadius : 100; // Radius in meters
export const OFFICE_NAME = import.meta.env.VITE_OFFICE_NAME || "Dr.Meoww Cabang 2 - Malang";
export const OFFICE_ADDRESS = import.meta.env.VITE_OFFICE_ADDRESS || "Grooming dan Penitipan Kucing Malang";

export const DEFAULT_BRANCHES: BranchOffice[] = [
  {
    id: "malang-cabang-2",
    name: OFFICE_NAME,
    address: OFFICE_ADDRESS,
    lat: OFFICE_LAT,
    lng: OFFICE_LNG,
    radius: GEOFENCE_RADIUS,
    is_active: true,
  },
];

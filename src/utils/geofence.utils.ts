/**
 * Geofence & GPS Distance Utilities
 * Uses the Haversine formula to compute great-circle distance between two points in meters.
 */
import type { BranchOffice } from "@/types/branch";

export function isValidCoordinate(lat: unknown, lng: unknown): boolean {
  if (lat == null || lng == null) return false;
  const numLat = typeof lat === "number" ? lat : Number(lat);
  const numLng = typeof lng === "number" ? lng : Number(lng);
  return (
    Number.isFinite(numLat) &&
    Number.isFinite(numLng) &&
    numLat >= -90 &&
    numLat <= 90 &&
    numLng >= -180 &&
    numLng <= 180
  );
}

export function getDistance(
  userLat: number,
  userLng: number,
  officeLat: number,
  officeLng: number
): number {
  if (!isValidCoordinate(userLat, userLng) || !isValidCoordinate(officeLat, officeLng)) {
    return Infinity;
  }

  const R = 6371000; // Earth radius in meters
  const dLat = ((officeLat - userLat) * Math.PI) / 180;
  const dLng = ((officeLng - userLng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((userLat * Math.PI) / 180) *
      Math.cos((officeLat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;

  // Clamp a between 0 and 1 to prevent NaN from floating point rounding errors
  const clampedA = Math.min(1, Math.max(0, a));
  return R * 2 * Math.atan2(Math.sqrt(clampedA), Math.sqrt(1 - clampedA));
}

export function isWithinArea(
  userLat: number,
  userLng: number,
  officeLat: number,
  officeLng: number,
  radiusMeters: number = 100
): boolean {
  if (!isValidCoordinate(userLat, userLng) || !isValidCoordinate(officeLat, officeLng)) {
    return false;
  }
  return getDistance(userLat, userLng, officeLat, officeLng) <= radiusMeters;
}

export function formatDistance(meters: number): string {
  if (!Number.isFinite(meters) || meters === Infinity) {
    return "Tidak diketahui";
  }
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(2)} km`;
}

export function formatCoordinates(lat?: number | string | null, lng?: number | string | null): string {
  if (!isValidCoordinate(lat, lng)) {
    return "Tidak ada koordinat";
  }
  const numLat = Number(lat);
  const numLng = Number(lng);
  return `${numLat.toFixed(5)}, ${numLng.toFixed(5)}`;
}

export interface GeofenceEvaluation {
  nearestBranch: BranchOffice | null;
  distanceMeters: number | null;
  isInsideGeofence: boolean | null;
  distanceFormatted: string;
}

export function getNearestBranch(
  userLat: unknown,
  userLng: unknown,
  branches: BranchOffice[]
): {
  branch: BranchOffice | null;
  distance: number;
  isInside: boolean;
} {
  if (!isValidCoordinate(userLat, userLng) || !Array.isArray(branches) || branches.length === 0) {
    return { branch: null, distance: Infinity, isInside: false };
  }

  const numLat = Number(userLat);
  const numLng = Number(userLng);

  let nearest: BranchOffice | null = null;
  let minDistance = Infinity;

  for (const branch of branches) {
    if (branch.is_active === false) continue;
    const dist = getDistance(numLat, numLng, branch.lat, branch.lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = branch;
    }
  }

  const isInside = nearest ? minDistance <= (nearest.radius || 100) : false;

  return {
    branch: nearest,
    distance: minDistance,
    isInside,
  };
}

export function evaluateLocationAgainstBranches(
  lat: unknown,
  lng: unknown,
  branches: BranchOffice[]
): GeofenceEvaluation {
  if (!isValidCoordinate(lat, lng)) {
    return {
      nearestBranch: null,
      distanceMeters: null,
      isInsideGeofence: null,
      distanceFormatted: "Tanpa GPS",
    };
  }

  const { branch, distance, isInside } = getNearestBranch(lat, lng, branches);

  if (!branch || distance === Infinity) {
    return {
      nearestBranch: null,
      distanceMeters: null,
      isInsideGeofence: false,
      distanceFormatted: "Tidak ada cabang aktif",
    };
  }

  return {
    nearestBranch: branch,
    distanceMeters: distance,
    isInsideGeofence: isInside,
    distanceFormatted: formatDistance(distance),
  };
}

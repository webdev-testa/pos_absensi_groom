import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { toast } from "sonner";
import type { AttendanceRecord } from "@/types/attendance";
import type { BranchOffice } from "@/types/branch";
import { DEFAULT_BRANCHES } from "@/constants/geofence.constants";
import { 
  isValidCoordinate, 
  evaluateLocationAgainstBranches 
} from "@/utils/geofence.utils";
import { branchService, getCachedBranches } from "@/services/branchService";

export interface AttendanceGPSItem extends AttendanceRecord {
  distanceMeters: number | null;
  isInsideGeofence: boolean | null;
  distanceFormatted: string;
  nearestBranch?: BranchOffice | null;
}

export type DateFilterType = "today" | "week" | "month" | "all";
export type AreaFilterType = "all" | "inside" | "outside" | "no_gps";

export function useGeolocation() {
  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>([]);
  const [branches, setBranches] = useState<BranchOffice[]>(DEFAULT_BRANCHES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [dateFilter, setDateFilter] = useState<DateFilterType>("today");
  const [deptFilter, setDeptFilter] = useState("all");
  const [areaFilter, setAreaFilter] = useState<AreaFilterType>("all");
  const [branchFilter, setBranchFilter] = useState<string>("all");
  const [searchQ, setSearchQ] = useState("");
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);

  // Helper to compute date range strings
  const getDatesInfo = useCallback(() => {
    const now = new Date();
    
    // Today: YYYY-MM-DD
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    const todayStr = `${y}-${m}-${d}`;
    
    // Monday of current week
    const day = now.getDay();
    const diffToMonday = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.getFullYear(), now.getMonth(), diffToMonday);
    const wy = monday.getFullYear();
    const wm = String(monday.getMonth() + 1).padStart(2, "0");
    const wd = String(monday.getDate()).padStart(2, "0");
    const weekStartStr = `${wy}-${wm}-${wd}`;
    
    // 1st of current month
    const monthStartStr = `${y}-${m}-01`;

    return { todayStr, weekStartStr, monthStartStr };
  }, []);

  const fetchAttendance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { weekStartStr, monthStartStr } = getDatesInfo();
      const earliestThreshold = weekStartStr < monthStartStr ? weekStartStr : monthStartStr;

      // Fetch from beginning of month or week (or further back if dateFilter is "all")
      let query = supabaseAdmin
        .schema("hr")
        .from("attendance")
        .select(`*, users (name, emp_id, dept)`)
        .order("clock_in_time", { ascending: false });

      if (dateFilter !== "all") {
        query = query.gte("date", earliestThreshold);
      }

      const { data, error: err } = await query;

      if (err) throw err;
      setAttendanceList((data as AttendanceRecord[]) || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal memuat data absensi";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [dateFilter, getDatesInfo]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const fetchRef = useRef(fetchAttendance);
  useEffect(() => {
    fetchRef.current = fetchAttendance;
  });

  // Real-time listener for live updates when an employee clocks in or out
  useEffect(() => {
    const channel = supabaseAdmin
      .channel("attendance-gps-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "hr", table: "attendance" },
        () => {
          fetchRef.current();
        }
      )
      .subscribe();

    return () => {
      supabaseAdmin.removeChannel(channel);
    };
  }, []);

  const reloadBranches = useCallback(async () => {
    try {
      const list = await branchService.fetchBranches();
      setBranches(list);
    } catch {
      setBranches(getCachedBranches());
    }
  }, []);

  useEffect(() => {
    reloadBranches();
  }, [reloadBranches]);

  // Enrich records with calculated distance & geofence status
  const enrichedList = useMemo((): AttendanceGPSItem[] => {
    return attendanceList.map((rec) => {
      const lat = rec.clock_in_lat != null ? Number(rec.clock_in_lat) : null;
      const lng = rec.clock_in_lng != null ? Number(rec.clock_in_lng) : null;

      const evalResult = evaluateLocationAgainstBranches(lat, lng, branches);

      return {
        ...rec,
        clock_in_lat: lat,
        clock_in_lng: lng,
        distanceMeters: evalResult.distanceMeters,
        isInsideGeofence: evalResult.isInsideGeofence,
        distanceFormatted: evalResult.distanceFormatted,
        nearestBranch: evalResult.nearestBranch,
      };
    });
  }, [attendanceList, branches]);

  // Filter records
  const filteredRecords = useMemo(() => {
    const { todayStr, weekStartStr, monthStartStr } = getDatesInfo();

    return enrichedList.filter((item) => {
      // 1. Date filter
      if (dateFilter === "today" && item.date !== todayStr) return false;
      if (dateFilter === "week" && item.date < weekStartStr) return false;
      if (dateFilter === "month" && item.date < monthStartStr) return false;

      // 2. Department filter
      if (
        deptFilter !== "all" &&
        item.users?.dept?.toLowerCase() !== deptFilter.toLowerCase()
      ) {
        return false;
      }

      // 3. Area filter
      if (areaFilter === "inside" && item.isInsideGeofence !== true) return false;
      if (areaFilter === "outside" && item.isInsideGeofence !== false) return false;
      if (areaFilter === "no_gps" && item.distanceMeters !== null) return false;

      // 4. Branch filter
      if (branchFilter !== "all" && item.nearestBranch?.id !== branchFilter) {
        return false;
      }

      // 5. Search query
      if (searchQ.trim()) {
        const q = searchQ.toLowerCase();
        const matchName = item.users?.name?.toLowerCase().includes(q);
        const matchEmpId = item.users?.emp_id?.toLowerCase().includes(q);
        const matchDept = item.users?.dept?.toLowerCase().includes(q);
        const matchBranch = item.nearestBranch?.name.toLowerCase().includes(q);
        if (!matchName && !matchEmpId && !matchDept && !matchBranch) return false;
      }

      return true;
    });
  }, [enrichedList, dateFilter, deptFilter, areaFilter, branchFilter, searchQ, getDatesInfo]);

  // Overall stats based on dateFilter (prior to dept/area filtering)
  const stats = useMemo(() => {
    const { todayStr, weekStartStr, monthStartStr } = getDatesInfo();
    const periodList = enrichedList.filter((item) => {
      if (dateFilter === "today" && item.date !== todayStr) return false;
      if (dateFilter === "week" && item.date < weekStartStr) return false;
      if (dateFilter === "month" && item.date < monthStartStr) return false;
      if (branchFilter !== "all" && item.nearestBranch?.id !== branchFilter) return false;
      return true;
    });

    const total = periodList.length;
    const withGps = periodList.filter((r) => r.distanceMeters !== null).length;
    const inside = periodList.filter((r) => r.isInsideGeofence === true).length;
    const outside = periodList.filter((r) => r.isInsideGeofence === false).length;
    const noGps = periodList.filter((r) => r.distanceMeters === null).length;

    const insidePct = total > 0 ? Math.round((inside / total) * 100) : 0;
    const outsidePct = total > 0 ? Math.round((outside / total) * 100) : 0;

    return {
      total,
      withGps,
      inside,
      outside,
      noGps,
      insidePct,
      outsidePct,
    };
  }, [enrichedList, dateFilter, branchFilter, getDatesInfo]);

  // Records with valid GPS coordinates for plotting on map
  const plottableRecords = useMemo(() => {
    return filteredRecords.filter(
      (r) => isValidCoordinate(r.clock_in_lat, r.clock_in_lng)
    );
  }, [filteredRecords]);

  return {
    loading,
    error,
    refresh: fetchAttendance,
    records: filteredRecords,
    plottableRecords,
    stats,
    // Branch controls
    branches,
    activeBranches: branches.filter((b) => b.is_active !== false),
    reloadBranches,
    branchFilter,
    setBranchFilter,
    // Filter controls
    dateFilter,
    setDateFilter,
    deptFilter,
    setDeptFilter,
    areaFilter,
    setAreaFilter,
    searchQ,
    setSearchQ,
    // Selection for focusing on map
    selectedRecordId,
    setSelectedRecordId,
  };
}

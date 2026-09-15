import { useEffect, useState, useMemo } from "react";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { toast } from "sonner";
import type { AttendanceRecord, CutiRecord, CutiGroup, Holiday } from "@/types/attendance";

export function useAttendance() {
  // ── Attendance state (existing) ──
  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [searchQ, setSearchQ] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("today");

  // ── New: main tab navigation ──
  const [mainTab, setMainTab] = useState<"absensi" | "cuti" | "libur">("absensi");

  // ── Cuti state ──
  const [cutiRecords, setCutiRecords] = useState<CutiRecord[]>([]);
  const [cutiLoading, setCutiLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // ── Holiday state ──
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [holidayLoading, setHolidayLoading] = useState(false);
  const [newHolidayName, setNewHolidayName] = useState("");
  const [newHolidayDate, setNewHolidayDate] = useState("");
  const [newHolidayType, setNewHolidayType] = useState("holiday");

  /* ──── ATTENDANCE EFFECTS (existing) ──── */

  // Helper to get relative dates for filtering
  const getDatesInfo = () => {
    const now = new Date();
    
    // Today YYYY-MM-DD
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    const todayStr = `${y}-${m}-${d}`;
    
    // Start of week (Monday)
    const day = now.getDay();
    const diffToMonday = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diffToMonday));
    const wy = monday.getFullYear();
    const wm = String(monday.getMonth() + 1).padStart(2, "0");
    const wd = String(monday.getDate()).padStart(2, "0");
    const weekStartStr = `${wy}-${wm}-${wd}`;
    
    // Start of month
    const now2 = new Date();
    const my = now2.getFullYear();
    const mm = String(now2.getMonth() + 1).padStart(2, "0");
    const monthStartStr = `${my}-${mm}-01`;
    
    return { todayStr, weekStartStr, monthStartStr };
  };

  const fetchInitialData = async () => {
    // 1. Fetch active employees
    const { data: usersData } = await supabaseAdmin
      .schema("hr")
      .from("users")
      .select("*")
      .eq("role", "employee")
      .eq("status", "active");

    if (usersData) {
      setEmployees(usersData);
    }

    // 2. Fetch attendance (since start of current month)
    const { monthStartStr } = getDatesInfo();
    const { data: attData } = await supabaseAdmin
      .schema("hr")
      .from("attendance")
      .select(`*,users (name,emp_id,dept)`)
      .gte("date", monthStartStr)
      .order("clock_in_time", { ascending: false });

    if (attData) {
      setAttendanceList(attData as any);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    const channel = supabaseAdmin
      .channel("attendance-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "hr", table: "attendance" },
        () => {
          fetchInitialData();
        }
      )
      .subscribe();

    return () => {
      supabaseAdmin.removeChannel(channel);
    };
  }, []);

  const toggleFlag = async (id: string, currentFlag: boolean) => {
    // Optimistic UI update
    setAttendanceList((prev) =>
      prev.map((r) => (r.id === id ? { ...r, is_flagged: !currentFlag } : r))
    );
    // Real update
    await supabaseAdmin
      .schema("hr")
      .from("attendance")
      .update({ is_flagged: !currentFlag })
      .eq("id", id);
  };

  /* ──── CUTI EFFECTS & HANDLERS ──── */

  const fetchCutiRequests = async () => {
    setCutiLoading(true);
    const { data, error } = await supabaseAdmin
      .schema("hr")
      .from("attendance")
      .select("id, user_id, date, status, is_flagged, clock_in_photo_url, users(name, emp_id, dept)")
      .or(
        "status.eq.cuti_pending,status.eq.izin_pending,status.eq.sakit_pending," +
        "status.eq.cuti_rejected,status.eq.izin_rejected,status.eq.sakit_rejected"
      )
      .order("date", { ascending: true });

    if (!error && data) {
      setCutiRecords(data as any);
    }
    setCutiLoading(false);
  };

  // Load cuti when tab changes
  useEffect(() => {
    if (mainTab === "cuti") fetchCutiRequests();
  }, [mainTab]);

  // Real-time subscription for cuti changes
  useEffect(() => {
    if (mainTab !== "cuti") return;

    const channel = supabaseAdmin
      .channel("cuti-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "hr", table: "attendance" },
        () => {
          // Refetch on any change to attendance
          fetchCutiRequests();
        }
      )
      .subscribe();

    return () => {
      supabaseAdmin.removeChannel(channel);
    };
  }, [mainTab]);

  // Group cuti records by user + status
  const cutiGroups = useMemo((): CutiGroup[] => {
    const groups: Record<string, CutiGroup> = {};
    cutiRecords.forEach((record) => {
      const baseType = record.status.replace("_pending", "").replace("_rejected", "");
      const key = `${record.user_id}_${record.status}`;
      if (!groups[key]) {
        groups[key] = {
          userId: record.user_id,
          userName: record.users?.name || "Unknown",
          empId: record.users?.emp_id || "???",
          dept: record.users?.dept || "—",
          type: baseType,
          status: record.status,
          dates: [],
        };
      }
      groups[key].dates.push({ id: record.id, date: record.date, clock_in_photo_url: record.clock_in_photo_url });
    });
    // Sort: pending first, then by earliest date
    return Object.values(groups).sort((a, b) => {
      const aPending = a.status.endsWith("_pending") ? 0 : 1;
      const bPending = b.status.endsWith("_pending") ? 0 : 1;
      if (aPending !== bPending) return aPending - bPending;
      return (a.dates[0]?.date || "").localeCompare(b.dates[0]?.date || "");
    });
  }, [cutiRecords]);

  const pendingGroups = cutiGroups.filter((g) => g.status.endsWith("_pending"));
  const rejectedGroups = cutiGroups.filter((g) => g.status.endsWith("_rejected"));

  // Approve: cuti_pending → cuti
  const handleApproveCuti = async (group: CutiGroup) => {
    const newStatus = group.type;
    const ids = group.dates.map((d) => d.id);
    setActionLoading(`approve_${group.userId}_${group.status}`);

    try {
      const { error } = await supabaseAdmin
        .schema("hr")
        .from("attendance")
        .update({ status: newStatus, is_flagged: false })
        .in("id", ids);

      if (error) throw error;
      await fetchCutiRequests();
      toast.success(`Cuti ${group.userName} disetujui`);
    } catch (err: any) {
      toast.error(`Gagal menyetujui cuti: ${err.message || 'Terjadi kesalahan'}`);
    } finally {
      setActionLoading(null);
    }
  };

  // Reject: cuti_pending → cuti_rejected
  const handleRejectCuti = async (group: CutiGroup) => {
    const newStatus = `${group.type}_rejected`;
    const ids = group.dates.map((d) => d.id);
    setActionLoading(`reject_${group.userId}_${group.status}`);

    try {
      const { error } = await supabaseAdmin
        .schema("hr")
        .from("attendance")
        .update({ status: newStatus, is_flagged: false })
        .in("id", ids);

      if (error) throw error;
      await fetchCutiRequests();
      toast.success(`Cuti ${group.userName} ditolak`);
    } catch (err: any) {
      toast.error(`Gagal menolak cuti: ${err.message || 'Terjadi kesalahan'}`);
    } finally {
      setActionLoading(null);
    }
  };

  /* ──── HOLIDAY EFFECTS & HANDLERS ──── */

  const fetchHolidays = async () => {
    setHolidayLoading(true);
    try {
      const { data, error } = await supabaseAdmin
        .schema("hr")
        .from("holidays")
        .select("*")
        .order("date", { ascending: true });

      if (!error && data) {
        setHolidays(data as any);
      }
    } finally {
      setHolidayLoading(false);
    }
  };

  useEffect(() => {
    if (mainTab === "libur") fetchHolidays();
  }, [mainTab]);

  const handleAddHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHolidayName.trim() || !newHolidayDate) return;
    setHolidayLoading(true);

    try {
      const { error } = await supabaseAdmin
        .schema("hr")
        .from("holidays")
        .insert({
          date: newHolidayDate,
          name: newHolidayName.trim(),
          type: newHolidayType,
        });

      if (!error) {
        setNewHolidayName("");
        setNewHolidayDate("");
        setNewHolidayType("holiday");
        await fetchHolidays();
      }
    } finally {
      setHolidayLoading(false);
    }
  };

  const handleDeleteHoliday = async (id: string) => {
    setActionLoading(`del_${id}`);

    try {
      await supabaseAdmin
        .schema("hr")
        .from("holidays")
        .delete()
        .eq("id", id);

      await fetchHolidays();
    } finally {
      setActionLoading(null);
    }
  };

  /* ──── ATTENDANCE COMPUTED (existing) ──── */

  const filteredData = useMemo(() => {
    const { todayStr, weekStartStr, monthStartStr } = getDatesInfo();
    return attendanceList.filter((record) => {
      // 1. Filter by period (activeTab)
      if (activeTab === "today" && record.date !== todayStr) return false;
      if (activeTab === "week" && record.date < weekStartStr) return false;
      if (activeTab === "month" && record.date < monthStartStr) return false;

      // 2. Filter by search query
      const matchSearch =
        record.users?.name?.toLowerCase().includes(searchQ.toLowerCase()) ||
        record.users?.dept?.toLowerCase().includes(searchQ.toLowerCase()) ||
        record.users?.emp_id?.toLowerCase().includes(searchQ.toLowerCase());
      
      // 3. Filter by department
      const matchDept = deptFilter === "all" || record.users?.dept?.toLowerCase() === deptFilter.toLowerCase();
      
      // 4. Filter by status
      const matchStatus =
        statusFilter === "all" ||
        record.status === statusFilter ||
        (statusFilter === "out" && record.clock_out_time !== null);

      return matchSearch && matchDept && matchStatus;
    });
  }, [attendanceList, searchQ, deptFilter, statusFilter, activeTab]);

  // Derived stats (live from DB)
  const { todayStr } = getDatesInfo();

  const attendanceToday = useMemo(() => {
    return attendanceList.filter((r) => r.date === todayStr);
  }, [attendanceList, todayStr]);

  const totalEmployees = employees.length;

  const statOntime = useMemo(() => {
    return attendanceToday.filter((r) => r.status === "ontime").length;
  }, [attendanceToday]);

  const statLate = useMemo(() => {
    return attendanceToday.filter((r) => r.status === "late").length;
  }, [attendanceToday]);

  const statOut = useMemo(() => {
    return attendanceToday.filter((r) => r.clock_out_time !== null).length;
  }, [attendanceToday]);

  const statAbsent = useMemo(() => {
    const todayDate = new Date();
    const isWeekend = todayDate.getDay() === 0 || todayDate.getDay() === 6;
    const isHoliday = holidays.some(h => h.date === todayStr);
    if (isWeekend || isHoliday) return 0;

    return employees.filter(e => 
      !attendanceToday.some(a => a.user_id === e.id)
    ).length;
  }, [employees, attendanceToday, holidays, todayStr]);

  // Unified Chronological Activity Feed Events
  const feedEvents = useMemo(() => {
    const events: any[] = [];
    attendanceToday.forEach((record) => {
      const name = record.users?.name || "Unknown";
      
      if (record.clock_in_time) {
        const timeObj = new Date(record.clock_in_time);
        events.push({
          id: `${record.id}-in`,
          name,
          action: record.status === "late" ? "Clock-in · terlambat" : "Clock-in",
          time: timeObj.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
          dotColor: record.status === "late" ? "#B87333" : "#2A7A4B",
          rawTime: timeObj.getTime(),
        });
      }
      
      if (record.clock_out_time) {
        const timeObj = new Date(record.clock_out_time);
        events.push({
          id: `${record.id}-out`,
          name,
          action: "Clock-out",
          time: timeObj.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
          dotColor: "#A8A49E",
          rawTime: timeObj.getTime(),
        });
      }
    });
    
    // Sort events by timestamp descending
    return events.sort((a, b) => b.rawTime - a.rawTime).slice(0, 6);
  }, [attendanceToday]);

  // Cuti stats
  const statPendingCuti = pendingGroups.filter((g) => g.type === "cuti").reduce((s, g) => s + g.dates.length, 0);
  const statPendingIzin = pendingGroups.filter((g) => g.type === "izin").reduce((s, g) => s + g.dates.length, 0);
  const statPendingSakit = pendingGroups.filter((g) => g.type === "sakit").reduce((s, g) => s + g.dates.length, 0);
  const statTotalPending = statPendingCuti + statPendingIzin + statPendingSakit;

  // Holiday stats
  const upcomingHolidays = holidays.filter((h) => h.date >= new Date().toISOString().split("T")[0]);
  const pastHolidays = holidays.filter((h) => h.date < new Date().toISOString().split("T")[0]);

  return {
    // Basic settings
    todayStr,
    mainTab,
    setMainTab,
    activeTab,
    setActiveTab,

    // Filters
    searchQ,
    setSearchQ,
    deptFilter,
    setDeptFilter,
    statusFilter,
    setStatusFilter,

    // Attendance records
    filteredData,
    feedEvents,

    // Cuti records & loading
    cutiLoading,
    actionLoading,
    pendingGroups,
    rejectedGroups,

    // Holiday records & forms
    holidays,
    holidayLoading,
    newHolidayName,
    setNewHolidayName,
    newHolidayDate,
    setNewHolidayDate,
    newHolidayType,
    setNewHolidayType,
    upcomingHolidays,
    pastHolidays,

    // Operations
    toggleFlag,
    handleApproveCuti,
    handleRejectCuti,
    handleAddHoliday,
    handleDeleteHoliday,
    fetchCutiRequests,

    // Attendance stats
    totalEmployees,
    statOntime,
    statLate,
    statOut,
    statAbsent,

    // Cuti stats
    statPendingCuti,
    statPendingIzin,
    statPendingSakit,
    statTotalPending,
  };
}

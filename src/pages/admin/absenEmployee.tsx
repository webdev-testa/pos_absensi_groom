import { useEffect, useState, useMemo } from "react";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { AdminLayout } from "@/components/layout/AdminLayout";
import {
  Search,
  Download,
  Image as ImageIcon,
  Check,
  X,
  Plus,
  Trash2,
  CalendarDays,
  Clock,
  Users,
  FileText,
} from "lucide-react";

/* ──────────── INTERFACES ──────────── */

interface AttendanceRecord {
  id: string;
  user_id: string;
  date: string;
  clock_in_time: string;
  clock_out_time: string | null;
  status: string;
  is_flagged: boolean;
  clock_in_photo_url: string | null;
  users: {
    name: string;
    emp_id: string;
    dept: string;
  } | null;
}

interface CutiRecord {
  id: string;
  user_id: string;
  date: string;
  status: string;
  is_flagged: boolean | null;
  users: { name: string; emp_id: string; dept: string } | null;
}

interface CutiGroup {
  userId: string;
  userName: string;
  empId: string;
  dept: string;
  type: string; // "cuti" | "izin" | "sakit"
  status: string; // full status e.g. "cuti_pending"
  dates: { id: string; date: string }[];
}

interface Holiday {
  id: string;
  date: string;
  name: string;
  type: string;
  created_at: string;
}

/* ──────────── HELPERS ──────────── */

const avColors = [
  { bg: "#F5E8E4", fg: "#C84B2F" },
  { bg: "#E2F0E8", fg: "#2A7A4B" },
  { bg: "#F5EDE0", fg: "#B87333" },
  { bg: "#EDE8F5", fg: "#6B4F9E" },
  { bg: "#E0EDF5", fg: "#1A6FAA" },
  { bg: "#F5E8ED", fg: "#A0374F" },
];

function ini(name: string | undefined) {
  if (!name) return "??";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function calcDur(inTime: string | null, outTime: string | null) {
  if (!inTime || !outTime) return null;
  const i = new Date(inTime);
  const o = new Date(outTime);
  const mins = Math.floor((o.getTime() - i.getTime()) / 60000);
  return `${Math.floor(mins / 60)}j ${mins % 60}m`;
}

function durPct(inTime: string | null, outTime: string | null) {
  if (!inTime || !outTime) return 0;
  const i = new Date(inTime);
  const o = new Date(outTime);
  const mins = Math.floor((o.getTime() - i.getTime()) / 60000);
  return Math.min(100, Math.round((mins / 540) * 100)); // 9 hours = 540 mins
}

function getCutiTypeLabel(type: string) {
  switch (type) {
    case "cuti": return "Cuti";
    case "izin": return "Izin";
    case "sakit": return "Sakit";
    default: return type;
  }
}

function getCutiTypeColor(type: string) {
  switch (type) {
    case "cuti": return { bg: "#EDE8F5", fg: "#6B4F9E" };
    case "izin": return { bg: "#F5EDE0", fg: "#B87333" };
    case "sakit": return { bg: "#F5E8E4", fg: "#C84B2F" };
    default: return { bg: "#EDEAE4", fg: "#6B6760" };
  }
}

function getHolidayTypeLabel(type: string) {
  switch (type) {
    case "holiday": return "Hari Libur";
    case "cuti_bersama": return "Cuti Bersama";
    case "closed": return "Tutup Kantor";
    default: return type;
  }
}

function getHolidayTypeColor(type: string) {
  switch (type) {
    case "holiday": return { bg: "#F5E8E4", fg: "#C84B2F" };
    case "cuti_bersama": return { bg: "#EDE8F5", fg: "#6B4F9E" };
    case "closed": return { bg: "#EDEAE4", fg: "#6B6760" };
    default: return { bg: "#EDEAE4", fg: "#6B6760" };
  }
}

function formatDateShort(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateRange(dates: { date: string }[]) {
  if (dates.length === 0) return "—";
  const sorted = [...dates].sort((a, b) => a.date.localeCompare(b.date));
  if (sorted.length === 1) return formatDateShort(sorted[0].date);
  return `${formatDateShort(sorted[0].date)} — ${formatDateShort(sorted[sorted.length - 1].date)}`;
}

/* ──────────── COMPONENT ──────────── */

export default function AbsenEmployee() {
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
      .select("id, user_id, date, status, is_flagged, users(name, emp_id, dept)")
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
      groups[key].dates.push({ id: record.id, date: record.date });
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

    await supabaseAdmin
      .schema("hr")
      .from("attendance")
      .update({ status: newStatus, is_flagged: false })
      .in("id", ids);

    await fetchCutiRequests();
    setActionLoading(null);
  };

  // Reject: cuti_pending → cuti_rejected
  const handleRejectCuti = async (group: CutiGroup) => {
    const newStatus = `${group.type}_rejected`;
    const ids = group.dates.map((d) => d.id);
    setActionLoading(`reject_${group.userId}_${group.status}`);

    await supabaseAdmin
      .schema("hr")
      .from("attendance")
      .update({ status: newStatus, is_flagged: false })
      .in("id", ids);

    await fetchCutiRequests();
    setActionLoading(null);
  };

  /* ──── HOLIDAY EFFECTS & HANDLERS ──── */

  const fetchHolidays = async () => {
    setHolidayLoading(true);
    const { data, error } = await supabaseAdmin
      .schema("hr")
      .from("holidays")
      .select("*")
      .order("date", { ascending: true });

    if (!error && data) {
      setHolidays(data as any);
    }
    setHolidayLoading(false);
  };

  useEffect(() => {
    if (mainTab === "libur") fetchHolidays();
  }, [mainTab]);

  const handleAddHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHolidayName.trim() || !newHolidayDate) return;
    setHolidayLoading(true);

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
    setHolidayLoading(false);
  };

  const handleDeleteHoliday = async (id: string) => {
    setActionLoading(`del_${id}`);

    await supabaseAdmin
      .schema("hr")
      .from("holidays")
      .delete()
      .eq("id", id);

    await fetchHolidays();
    setActionLoading(null);
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
    return employees.filter(e => 
      !attendanceToday.some(a => a.user_id === e.id)
    ).length;
  }, [employees, attendanceToday]);

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

  /* ──────────── RENDER ──────────── */

  return (
    <AdminLayout>
      <div className="font-sans text-[#1A1814] -m-10 lg:-m-12 p-10 lg:p-12 min-h-screen" style={{ backgroundColor: "#F5F2ED" }}>
        
        {/* HEADER */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="font-['Syne'] text-[28px] font-bold tracking-tight text-[#1A1814]">
              {mainTab === "absensi" && "Dashboard Absensi"}
              {mainTab === "cuti" && "Kelola Cuti & Izin"}
              {mainTab === "libur" && "Hari Libur & Cuti Bersama"}
            </h1>
            <p className="text-[13.5px] text-[#6B6760] mt-1.5">
              {mainTab === "absensi" && "Pantau kehadiran karyawan secara real-time"}
              {mainTab === "cuti" && "Setujui atau tolak pengajuan cuti, izin, dan sakit karyawan"}
              {mainTab === "libur" && "Kelola hari libur nasional, cuti bersama, dan jadwal tutup kantor"}
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            {mainTab === "absensi" && (
              <>
                <div className="flex items-center gap-2 bg-white border border-[#E0DDD7] rounded-[10px] px-3.5 py-2 text-[13px] text-[#6B6760]">
                  <div className="w-2 h-2 rounded-full bg-[#2A7A4B] shrink-0 animate-pulse"></div>
                  <span>Live · <strong className="text-[#1A1814] font-semibold">
                    {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                  </strong></span>
                </div>
                <button className="bg-white border border-[#E0DDD7] hover:border-[#CBC8C2] hover:text-[#1A1814] text-[#6B6760] rounded-[10px] px-4 py-2 text-[13px] font-medium flex items-center gap-2 transition-colors">
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </>
            )}
            {mainTab === "cuti" && (
              <button
                onClick={() => fetchCutiRequests()}
                className="bg-white border border-[#E0DDD7] hover:border-[#CBC8C2] hover:text-[#1A1814] text-[#6B6760] rounded-[10px] px-4 py-2 text-[13px] font-medium flex items-center gap-2 transition-colors"
              >
                <Clock className="w-4 h-4" />
                Refresh
              </button>
            )}
            {mainTab === "libur" && (
              <button
                onClick={() => document.getElementById('holiday-form')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-[#1A1814] text-white rounded-[10px] px-4 py-2 text-[13px] font-medium flex items-center gap-2 hover:bg-[#2A2824] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Tambah Hari Libur
              </button>
            )}
          </div>
        </div>

        {/* ─── MAIN TAB BAR ─── */}
        <div className="flex bg-white border border-[#E0DDD7] p-1 rounded-[12px] mb-7 w-fit">
          {([
            { key: "absensi", label: "Absensi", icon: <Users className="w-4 h-4" /> },
            { key: "cuti", label: "Kelola Cuti", icon: <FileText className="w-4 h-4" />, badge: statTotalPending },
            { key: "libur", label: "Hari Libur", icon: <CalendarDays className="w-4 h-4" /> },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setMainTab(tab.key)}
              className={`relative px-5 py-2.5 rounded-[10px] text-[13.5px] font-medium transition-all flex items-center gap-2 ${
                mainTab === tab.key
                  ? "bg-[#1A1814] text-white shadow-sm"
                  : "text-[#6B6760] hover:text-[#1A1814] hover:bg-[#F5F2ED]"
              }`}
            >
              {tab.icon}
              {tab.label}
              {"badge" in tab && tab.badge > 0 && (
                <span className={`ml-1 min-w-[18px] h-[18px] flex items-center justify-center text-[10.5px] font-bold rounded-full px-1 ${
                  mainTab === tab.key ? "bg-white text-[#1A1814]" : "bg-[#C84B2F] text-white"
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ═══════════════════════════════════════════════════ */}
        {/* ══  TAB 1 — ABSENSI (existing content)           ══ */}
        {/* ═══════════════════════════════════════════════════ */}
        {mainTab === "absensi" && (
          <>
            {/* STAT CARDS */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 mb-7">
              <div 
                onClick={() => setStatusFilter("all")}
                className={`bg-white border rounded-[16px] p-4.5 cursor-pointer transition-all ${statusFilter === "all" ? "border-[#1A1814] ring-1 ring-[#1A1814]" : "border-[#E0DDD7] hover:border-[#CBC8C2] hover:-translate-y-[1px]"}`}
              >
                <div className="text-[11px] text-[#A8A49E] uppercase tracking-[0.8px] font-mono mb-2.5">Total karyawan</div>
                <div className="font-['Syne'] text-[32px] font-bold tracking-[-1px] leading-none text-[#1A1814]">{totalEmployees}</div>
                <div className="text-[12px] text-[#A8A49E] mt-1.5">hari ini</div>
                <div className="h-[3px] rounded-[2px] mt-3 bg-[#EDEAE4] overflow-hidden"><div className="h-full bg-[#1A1814] rounded-[2px] w-full"></div></div>
              </div>
              
              <div 
                onClick={() => setStatusFilter("ontime")}
                className={`bg-white border rounded-[16px] p-4.5 cursor-pointer transition-all ${statusFilter === "ontime" ? "border-[#1A1814] ring-1 ring-[#1A1814]" : "border-[#E0DDD7] hover:border-[#CBC8C2] hover:-translate-y-[1px]"}`}
              >
                <div className="text-[11px] text-[#A8A49E] uppercase tracking-[0.8px] font-mono mb-2.5">Tepat waktu</div>
                <div className="font-['Syne'] text-[32px] font-bold tracking-[-1px] leading-none text-[#2A7A4B]">{statOntime}</div>
                <div className="text-[12px] text-[#A8A49E] mt-1.5">sebelum 08.00</div>
                <div className="h-[3px] rounded-[2px] mt-3 bg-[#EDEAE4] overflow-hidden"><div className="h-full bg-[#2A7A4B] rounded-[2px]" style={{ width: `${Math.min(100, (statOntime/totalEmployees)*100)}%`}}></div></div>
              </div>

              <div 
                onClick={() => setStatusFilter("late")}
                className={`bg-white border rounded-[16px] p-4.5 cursor-pointer transition-all ${statusFilter === "late" ? "border-[#1A1814] ring-1 ring-[#1A1814]" : "border-[#E0DDD7] hover:border-[#CBC8C2] hover:-translate-y-[1px]"}`}
              >
                <div className="text-[11px] text-[#A8A49E] uppercase tracking-[0.8px] font-mono mb-2.5">Terlambat</div>
                <div className="font-['Syne'] text-[32px] font-bold tracking-[-1px] leading-none text-[#B87333]">{statLate}</div>
                <div className="text-[12px] text-[#A8A49E] mt-1.5">setelah 08.00</div>
                <div className="h-[3px] rounded-[2px] mt-3 bg-[#EDEAE4] overflow-hidden"><div className="h-full bg-[#B87333] rounded-[2px]" style={{ width: `${Math.min(100, (statLate/totalEmployees)*100)}%`}}></div></div>
              </div>

              <div 
                onClick={() => setStatusFilter("absent")}
                className={`bg-white border rounded-[16px] p-4.5 cursor-pointer transition-all ${statusFilter === "absent" ? "border-[#1A1814] ring-1 ring-[#1A1814]" : "border-[#E0DDD7] hover:border-[#CBC8C2] hover:-translate-y-[1px]"}`}
              >
                <div className="text-[11px] text-[#A8A49E] uppercase tracking-[0.8px] font-mono mb-2.5">Tidak hadir</div>
                <div className="font-['Syne'] text-[32px] font-bold tracking-[-1px] leading-none text-[#C84B2F]">{statAbsent}</div>
                <div className="text-[12px] text-[#A8A49E] mt-1.5">belum absen</div>
                <div className="h-[3px] rounded-[2px] mt-3 bg-[#EDEAE4] overflow-hidden"><div className="h-full bg-[#C84B2F] rounded-[2px]" style={{ width: `${Math.min(100, (statAbsent/totalEmployees)*100)}%`}}></div></div>
              </div>

              <div 
                onClick={() => setStatusFilter("out")}
                className={`bg-white border rounded-[16px] p-4.5 cursor-pointer transition-all ${statusFilter === "out" ? "border-[#1A1814] ring-1 ring-[#1A1814]" : "border-[#E0DDD7] hover:border-[#CBC8C2] hover:-translate-y-[1px]"}`}
              >
                <div className="text-[11px] text-[#A8A49E] uppercase tracking-[0.8px] font-mono mb-2.5">Sudah pulang</div>
                <div className="font-['Syne'] text-[32px] font-bold tracking-[-1px] leading-none text-[#6B6760]">{statOut}</div>
                <div className="text-[12px] text-[#A8A49E] mt-1.5">clock-out selesai</div>
                <div className="h-[3px] rounded-[2px] mt-3 bg-[#EDEAE4] overflow-hidden"><div className="h-full bg-[#A8A49E] rounded-[2px]" style={{ width: `${Math.min(100, (statOut/totalEmployees)*100)}%`}}></div></div>
              </div>
            </div>

            {/* CONTENT ROW */}
            <div className="flex flex-col xl:flex-row gap-5 items-start">
              
              {/* TABLE SECTION */}
              <div className="flex-1 bg-white border border-[#E0DDD7] rounded-[16px] overflow-hidden w-full">
                <div className="p-4 px-5 border-b border-[#E0DDD7] flex items-center justify-between">
                  <div>
                    <h2 className="font-['Syne'] text-[15px] font-semibold text-[#1A1814]">Rekap kehadiran hari ini</h2>
                    <p className="text-[12px] text-[#A8A49E] mt-0.5">Klik baris untuk detail foto & lokasi</p>
                  </div>
                </div>
                
                {/* FILTERS */}
                <div className="flex flex-wrap gap-2 items-center p-3.5 px-5 border-b border-[#E0DDD7] bg-[#F5F2ED]">
                  <div className="relative flex-1 min-w-[160px] max-w-[260px]">
                    <Search className="w-4 h-4 text-[#A8A49E] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text" 
                      placeholder="Cari karyawan..." 
                      value={searchQ}
                      onChange={(e) => setSearchQ(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-[#E0DDD7] rounded-[10px] text-[13px] outline-none focus:border-[#CBC8C2] text-[#1A1814] placeholder-[#A8A49E]"
                    />
                  </div>
                  <select 
                    value={deptFilter}
                    onChange={(e) => setDeptFilter(e.target.value)}
                    className="bg-white border border-[#E0DDD7] rounded-[10px] pl-3 pr-8 py-2 text-[13px] text-[#1A1814] outline-none appearance-none cursor-pointer"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B6760' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
                  >
                    <option value="all">Semua divisi</option>
                    <option value="kasir">Kasir</option>
                    <option value="gudang">Gudang</option>
                    <option value="admin">Admin</option>
                  </select>
                  <div className="flex bg-[#EDEAE4] p-[3px] rounded-[8px] ml-auto">
                    <button onClick={() => setActiveTab('today')} className={`px-3 py-1.5 rounded-[6px] text-[12.5px] transition-all ${activeTab === 'today' ? 'bg-white text-[#1A1814] font-medium shadow-sm' : 'text-[#6B6760] hover:text-[#1A1814]'}`}>Hari ini</button>
                    <button onClick={() => setActiveTab('week')} className={`px-3 py-1.5 rounded-[6px] text-[12.5px] transition-all ${activeTab === 'week' ? 'bg-white text-[#1A1814] font-medium shadow-sm' : 'text-[#6B6760] hover:text-[#1A1814]'}`}>Minggu ini</button>
                    <button onClick={() => setActiveTab('month')} className={`px-3 py-1.5 rounded-[6px] text-[12.5px] transition-all ${activeTab === 'month' ? 'bg-white text-[#1A1814] font-medium shadow-sm' : 'text-[#6B6760] hover:text-[#1A1814]'}`}>Bulan ini</button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-[#EDEAE4]">
                      <tr>
                        <th className="px-4 py-3 text-[10.5px] font-mono tracking-[0.8px] text-[#A8A49E] uppercase font-normal whitespace-nowrap">Karyawan</th>
                        <th className="px-4 py-3 text-[10.5px] font-mono tracking-[0.8px] text-[#A8A49E] uppercase font-normal whitespace-nowrap">Divisi</th>
                        <th className="px-4 py-3 text-[10.5px] font-mono tracking-[0.8px] text-[#A8A49E] uppercase font-normal whitespace-nowrap">Clock-in</th>
                        <th className="px-4 py-3 text-[10.5px] font-mono tracking-[0.8px] text-[#A8A49E] uppercase font-normal whitespace-nowrap">Clock-out</th>
                        <th className="px-4 py-3 text-[10.5px] font-mono tracking-[0.8px] text-[#A8A49E] uppercase font-normal whitespace-nowrap">Durasi</th>
                        <th className="px-4 py-3 text-[10.5px] font-mono tracking-[0.8px] text-[#A8A49E] uppercase font-normal whitespace-nowrap">Status</th>
                        <th className="px-4 py-3 text-[10.5px] font-mono tracking-[0.8px] text-[#A8A49E] uppercase font-normal whitespace-nowrap">Foto</th>
                        <th className="px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-4 py-12 text-center text-[#A8A49E] text-[13px]">Tidak ada data absensi yang sesuai.</td>
                        </tr>
                      ) : (
                        filteredData.map((record, i) => {
                          const c = avColors[i % avColors.length];
                          const dur = calcDur(record.clock_in_time, record.clock_out_time);
                          const pct = durPct(record.clock_in_time, record.clock_out_time);
                          
                          return (
                            <tr key={record.id} className="border-b border-[#E0DDD7] last:border-b-0 hover:bg-[#FAFAF8] cursor-pointer group transition-colors">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11.5px] font-bold font-['Syne'] shrink-0" style={{ backgroundColor: c.bg, color: c.fg }}>
                                    {ini(record.users?.name)}
                                  </div>
                                  <div>
                                    <div className="text-[13px] font-medium text-[#1A1814]">{record.users?.name || "Unknown"}</div>
                                    <div className="text-[11px] text-[#A8A49E] font-mono">{record.users?.emp_id || "EMP-???"}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-[12.5px] text-[#6B6760]">{record.users?.dept || "—"}</td>
                              <td className="px-4 py-3">
                                {record.clock_in_time ? (
                                  <div className="inline-flex items-center gap-1.5 font-mono text-[12.5px] font-medium text-[#1A1814]">
                                    <div className={`w-1.5 h-1.5 rounded-full ${record.status === 'late' ? 'bg-[#B87333]' : 'bg-[#2A7A4B]'}`}></div>
                                    {new Date(record.clock_in_time).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                                  </div>
                                ) : (
                                  <span className="text-[#A8A49E] text-[12.5px]">—</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                {record.clock_out_time ? (
                                  <div className="inline-flex items-center gap-1.5 font-mono text-[12.5px] font-medium text-[#1A1814]">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#A8A49E]"></div>
                                    {new Date(record.clock_out_time).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                                  </div>
                                ) : (
                                  <span className="text-[#A8A49E] text-[12.5px]">{record.clock_in_time ? "Belum" : "—"}</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                {dur ? (
                                  <div className="flex items-center gap-2">
                                    <div className="w-[60px] h-1 bg-[#EDEAE4] rounded-full overflow-hidden">
                                      <div className="h-full bg-[#2A7A4B] rounded-full" style={{ width: `${pct}%`}}></div>
                                    </div>
                                    <span className="font-mono text-[12px] text-[#6B6760] whitespace-nowrap">{dur}</span>
                                  </div>
                                ) : (
                                  <span className="text-[#A8A49E] text-[12.5px]">—</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11.5px] font-medium whitespace-nowrap ${
                                  record.status === 'ontime' ? 'bg-[#E2F0E8] text-[#2A7A4B]' : 
                                  record.status === 'late' ? 'bg-[#F5EDE0] text-[#B87333]' : 
                                  record.status === 'absent' ? 'bg-[#F5E8E4] text-[#C84B2F]' :
                                  'bg-[#EDEAE4] text-[#A8A49E]'
                                }`}>
                                  {record.status === 'ontime' && "✓ Tepat waktu"}
                                  {record.status === 'late' && "⚠ Terlambat"}
                                  {record.status === 'absent' && "✕ Tidak hadir"}
                                  {!['ontime', 'late', 'absent'].includes(record.status) && record.status}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                {record.clock_in_time ? (
                                  <div className="w-9 h-9 rounded-[6px] bg-[#EDEAE4] border border-[#E0DDD7] flex items-center justify-center text-[#A8A49E] hover:border-[#CBC8C2] hover:scale-105 transition-all">
                                    <ImageIcon className="w-4 h-4" />
                                  </div>
                                ) : (
                                  <span className="text-[#A8A49E] text-[12px]">—</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); toggleFlag(record.id, record.is_flagged); }}
                                  className={`px-2.5 py-1 rounded-[6px] text-[11.5px] font-medium border transition-colors whitespace-nowrap ${
                                    record.is_flagged 
                                      ? 'bg-[#F5E8E4] border-[#e8b4aa] text-[#C84B2F]' 
                                      : 'bg-white border-[#E0DDD7] text-[#6B6760] hover:bg-[#F5E8E4] hover:border-[#e8b4aa] hover:text-[#C84B2F] opacity-0 group-hover:opacity-100 focus:opacity-100'
                                  }`}
                                >
                                  {record.is_flagged ? '⚑ Flagged' : '⚐ Flag'}
                                </button>
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SIDE PANEL */}
              <div className="w-full xl:w-[320px] flex flex-col gap-4 shrink-0">
                {/* REALTIME FEED */}
                <div className="bg-white border border-[#E0DDD7] rounded-[16px] overflow-hidden">
                  <div className="p-3.5 px-4.5 border-b border-[#E0DDD7] flex items-center justify-between">
                    <h3 className="font-['Syne'] text-[14px] font-semibold text-[#1A1814]">Aktivitas terkini</h3>
                    <div className="flex items-center gap-1.5 text-[11.5px] text-[#2A7A4B] font-medium">
                      <div className="w-2 h-2 rounded-full bg-[#2A7A4B] animate-pulse"></div>Live
                    </div>
                  </div>
                  <div className="p-1.5 max-h-[280px] overflow-y-auto">
                    {feedEvents.length === 0 ? (
                      <div className="text-center py-12 text-[#A8A49E] text-[13px]">
                        Belum ada aktivitas hari ini.
                      </div>
                    ) : (
                      feedEvents.map((event) => {
                        const c = avColors[event.name.charCodeAt(0) % avColors.length];
                        return (
                          <div key={event.id} className="flex items-center gap-2.5 px-4.5 py-2.5 border-b border-[#E0DDD7] last:border-b-0 hover:bg-[#FAFAF8] cursor-pointer transition-colors">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold font-['Syne'] shrink-0" style={{ backgroundColor: c.bg, color: c.fg }}>
                              {ini(event.name)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[13px] font-medium text-[#1A1814] truncate">{event.name}</div>
                              <div className="text-[11.5px] text-[#A8A49E] truncate">{event.action}</div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: event.dotColor }}></div>
                              <div className="font-mono text-[11.5px] text-[#A8A49E]">{event.time}</div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* MINI MAP */}
                <div className="bg-white border border-[#E0DDD7] rounded-[16px] overflow-hidden">
                  <div className="p-3.5 px-4.5 border-b border-[#E0DDD7] flex items-center justify-between">
                    <div>
                      <h3 className="font-['Syne'] text-[14px] font-semibold text-[#1A1814]">Sebaran lokasi</h3>
                      <p className="text-[12px] text-[#A8A49E]">Clock-in hari ini</p>
                    </div>
                    <button className="text-[12px] text-[#6B6760] font-medium hover:text-[#1A1814] px-2.5 py-1 rounded-[6px] hover:bg-[#F5F2ED] transition-colors border border-transparent">
                      Buka peta
                    </button>
                  </div>
                  
                  <div className="h-[200px] bg-[#E8EAE4] relative overflow-hidden cursor-pointer group">
                    <div className="absolute inset-0">
                      <div className="absolute bg-white/50 h-[2px] top-[35%] left-0 right-0"></div>
                      <div className="absolute bg-white/50 h-[2px] top-[65%] left-0 right-0"></div>
                      <div className="absolute bg-white/50 w-[2px] left-[30%] top-0 bottom-0"></div>
                      <div className="absolute bg-white/50 w-[2px] left-[70%] top-0 bottom-0"></div>
                      <div className="absolute bg-[#b4afa5]/40 rounded-[3px] top-[10%] left-[5%] w-[20%] h-[20%]"></div>
                      <div className="absolute bg-[#b4afa5]/40 rounded-[3px] top-[10%] left-[35%] w-[28%] h-[20%]"></div>
                      <div className="absolute bg-[#b4afa5]/40 rounded-[3px] top-[10%] left-[75%] w-[20%] h-[20%]"></div>
                      <div className="absolute bg-[#b4afa5]/40 rounded-[3px] top-[42%] left-[5%] w-[18%] h-[18%]"></div>
                      <div className="absolute bg-[#b4afa5]/40 rounded-[3px] top-[42%] left-[75%] w-[20%] h-[18%]"></div>
                      <div className="absolute bg-[#b4afa5]/40 rounded-[3px] top-[70%] left-[5%] w-[20%] h-[22%]"></div>
                      <div className="absolute bg-[#b4afa5]/40 rounded-[3px] top-[70%] left-[35%] w-[28%] h-[22%]"></div>
                      <div className="absolute bg-[#b4afa5]/40 rounded-[3px] top-[70%] left-[75%] w-[20%] h-[22%]"></div>
                    </div>
                    
                    <div className="absolute w-[90px] h-[90px] rounded-full border-2 border-dashed border-[#2A7A4B]/50 bg-[#2A7A4B]/[0.06] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"></div>
                    
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                      <div className="w-[14px] h-[14px] bg-[#2A7A4B] rounded-full border-2 border-white shadow-md"></div>
                    </div>

                    <div className="absolute left-[46%] top-[44%] -translate-x-1/2 -translate-y-full">
                      <svg width="18" height="22" viewBox="0 0 18 22"><circle cx="9" cy="9" r="7" fill="#C84B2F"/><text x="9" y="12" textAnchor="middle" fontSize="8" fill="white" fontWeight="700">A</text><path d="M9 22 L9 16" stroke="#C84B2F" strokeWidth="2"/></svg>
                    </div>
                    <div className="absolute left-[54%] top-[40%] -translate-x-1/2 -translate-y-full">
                      <svg width="18" height="22" viewBox="0 0 18 22"><circle cx="9" cy="9" r="7" fill="#2A7A4B"/><text x="9" y="12" textAnchor="middle" fontSize="8" fill="white" fontWeight="700">B</text><path d="M9 22 L9 16" stroke="#2A7A4B" strokeWidth="2"/></svg>
                    </div>

                    <div className="absolute inset-0 bg-[#1A1814]/35 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="text-white text-[13px] font-medium">Lihat peta lengkap →</div>
                    </div>
                  </div>

                  <div className="p-3 px-4 border-t border-[#E0DDD7] flex gap-3 flex-wrap">
                    <div className="flex items-center gap-1.5 text-[11.5px] text-[#6B6760]"><div className="w-2 h-2 rounded-full bg-[#2A7A4B]"></div>Kantor</div>
                    <div className="flex items-center gap-1.5 text-[11.5px] text-[#6B6760]"><div className="w-2 h-2 rounded-full border border-dashed border-[#2A7A4B] bg-[#2A7A4B]/40"></div>Area absen</div>
                    <div className="flex items-center gap-1.5 text-[11.5px] text-[#6B6760]"><div className="w-2 h-2 rounded-full bg-[#6B6760]"></div>Dalam area</div>
                    <div className="flex items-center gap-1.5 text-[11.5px] text-[#6B6760]"><div className="w-2 h-2 rounded-full bg-[#A8A49E]"></div>Di luar area</div>
                  </div>
                </div>

              </div>

            </div>
          </>
        )}

        {/* ═══════════════════════════════════════════════════ */}
        {/* ══  TAB 2 — KELOLA CUTI                          ══ */}
        {/* ═══════════════════════════════════════════════════ */}
        {mainTab === "cuti" && (
          <>
            {/* CUTI STAT CARDS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-7">
              <div className="bg-white border border-[#E0DDD7] rounded-[16px] p-4.5 transition-all hover:-translate-y-[1px]">
                <div className="text-[11px] text-[#A8A49E] uppercase tracking-[0.8px] font-mono mb-2.5">Total Menunggu</div>
                <div className="font-['Syne'] text-[32px] font-bold tracking-[-1px] leading-none text-[#B87333]">{statTotalPending}</div>
                <div className="text-[12px] text-[#A8A49E] mt-1.5">perlu ditinjau</div>
                <div className="h-[3px] rounded-[2px] mt-3 bg-[#EDEAE4] overflow-hidden">
                  <div className="h-full bg-[#B87333] rounded-[2px]" style={{ width: statTotalPending > 0 ? "100%" : "0%" }}></div>
                </div>
              </div>

              <div className="bg-white border border-[#E0DDD7] rounded-[16px] p-4.5 transition-all hover:-translate-y-[1px]">
                <div className="text-[11px] text-[#A8A49E] uppercase tracking-[0.8px] font-mono mb-2.5">Cuti</div>
                <div className="font-['Syne'] text-[32px] font-bold tracking-[-1px] leading-none text-[#6B4F9E]">{statPendingCuti}</div>
                <div className="text-[12px] text-[#A8A49E] mt-1.5">hari pending</div>
                <div className="h-[3px] rounded-[2px] mt-3 bg-[#EDEAE4] overflow-hidden">
                  <div className="h-full bg-[#6B4F9E] rounded-[2px]" style={{ width: `${Math.min(100, (statPendingCuti / Math.max(1, statTotalPending)) * 100)}%` }}></div>
                </div>
              </div>

              <div className="bg-white border border-[#E0DDD7] rounded-[16px] p-4.5 transition-all hover:-translate-y-[1px]">
                <div className="text-[11px] text-[#A8A49E] uppercase tracking-[0.8px] font-mono mb-2.5">Izin</div>
                <div className="font-['Syne'] text-[32px] font-bold tracking-[-1px] leading-none text-[#B87333]">{statPendingIzin}</div>
                <div className="text-[12px] text-[#A8A49E] mt-1.5">hari pending</div>
                <div className="h-[3px] rounded-[2px] mt-3 bg-[#EDEAE4] overflow-hidden">
                  <div className="h-full bg-[#B87333] rounded-[2px]" style={{ width: `${Math.min(100, (statPendingIzin / Math.max(1, statTotalPending)) * 100)}%` }}></div>
                </div>
              </div>

              <div className="bg-white border border-[#E0DDD7] rounded-[16px] p-4.5 transition-all hover:-translate-y-[1px]">
                <div className="text-[11px] text-[#A8A49E] uppercase tracking-[0.8px] font-mono mb-2.5">Sakit</div>
                <div className="font-['Syne'] text-[32px] font-bold tracking-[-1px] leading-none text-[#C84B2F]">{statPendingSakit}</div>
                <div className="text-[12px] text-[#A8A49E] mt-1.5">hari pending</div>
                <div className="h-[3px] rounded-[2px] mt-3 bg-[#EDEAE4] overflow-hidden">
                  <div className="h-full bg-[#C84B2F] rounded-[2px]" style={{ width: `${Math.min(100, (statPendingSakit / Math.max(1, statTotalPending)) * 100)}%` }}></div>
                </div>
              </div>
            </div>

            <div className="flex flex-col xl:flex-row gap-5 items-start">
              {/* PENDING REQUESTS */}
              <div className="flex-1 w-full">
                <div className="bg-white border border-[#E0DDD7] rounded-[16px] overflow-hidden">
                  <div className="p-4 px-5 border-b border-[#E0DDD7] flex items-center justify-between">
                    <div>
                      <h2 className="font-['Syne'] text-[15px] font-semibold text-[#1A1814]">Pengajuan Menunggu Persetujuan</h2>
                      <p className="text-[12px] text-[#A8A49E] mt-0.5">{pendingGroups.length} pengajuan dari karyawan</p>
                    </div>
                  </div>

                  {cutiLoading ? (
                    <div className="p-12 text-center text-[#A8A49E] text-[13px]">
                      <div className="inline-block w-5 h-5 border-2 border-[#E0DDD7] border-t-[#1A1814] rounded-full animate-spin mb-2"></div>
                      <div>Memuat data cuti...</div>
                    </div>
                  ) : pendingGroups.length === 0 ? (
                    <div className="p-12 text-center">
                      <div className="text-[40px] mb-3">✓</div>
                      <div className="text-[14px] font-medium text-[#1A1814] mb-1">Semua pengajuan sudah diproses</div>
                      <div className="text-[13px] text-[#A8A49E]">Tidak ada pengajuan cuti yang menunggu persetujuan.</div>
                    </div>
                  ) : (
                    <div className="divide-y divide-[#E0DDD7]">
                      {pendingGroups.map((group) => {
                        const typeColor = getCutiTypeColor(group.type);
                        const c = avColors[group.userName.charCodeAt(0) % avColors.length];
                        const isActioning = actionLoading?.includes(group.userId + "_" + group.status);

                        return (
                          <div key={`${group.userId}_${group.status}`} className="p-5 hover:bg-[#FAFAF8] transition-colors">
                            <div className="flex items-start gap-3.5">
                              {/* Avatar */}
                              <div className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-bold font-['Syne'] shrink-0" style={{ backgroundColor: c.bg, color: c.fg }}>
                                {ini(group.userName)}
                              </div>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-[14px] font-semibold text-[#1A1814]">{group.userName}</span>
                                  <span className="text-[11px] font-mono text-[#A8A49E]">{group.empId}</span>
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-semibold" style={{ backgroundColor: typeColor.bg, color: typeColor.fg }}>
                                    {getCutiTypeLabel(group.type)}
                                  </span>
                                </div>
                                <div className="text-[12.5px] text-[#6B6760] mb-2">
                                  Divisi: <span className="font-medium">{group.dept}</span>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <div className="flex items-center gap-1.5 text-[12.5px] text-[#1A1814]">
                                    <CalendarDays className="w-3.5 h-3.5 text-[#A8A49E]" />
                                    <span className="font-medium">{formatDateRange(group.dates)}</span>
                                  </div>
                                  <span className="inline-flex items-center px-2 py-0.5 bg-[#F5F2ED] rounded text-[11px] font-mono text-[#6B6760]">
                                    {group.dates.length} hari kerja
                                  </span>
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  onClick={() => handleApproveCuti(group)}
                                  disabled={!!isActioning}
                                  className="flex items-center gap-1.5 px-3.5 py-2 bg-[#2A7A4B] hover:bg-[#237340] text-white text-[12.5px] font-medium rounded-[10px] transition-colors disabled:opacity-50"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  Setujui
                                </button>
                                <button
                                  onClick={() => handleRejectCuti(group)}
                                  disabled={!!isActioning}
                                  className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#E0DDD7] hover:bg-[#F5E8E4] hover:border-[#e8b4aa] hover:text-[#C84B2F] text-[#6B6760] text-[12.5px] font-medium rounded-[10px] transition-colors disabled:opacity-50"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  Tolak
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* SIDE PANEL — Rejected History */}
              <div className="w-full xl:w-[340px] shrink-0">
                <div className="bg-white border border-[#E0DDD7] rounded-[16px] overflow-hidden">
                  <div className="p-3.5 px-4.5 border-b border-[#E0DDD7]">
                    <h3 className="font-['Syne'] text-[14px] font-semibold text-[#1A1814]">Riwayat Ditolak</h3>
                    <p className="text-[12px] text-[#A8A49E] mt-0.5">{rejectedGroups.length} pengajuan ditolak</p>
                  </div>
                  <div className="max-h-[480px] overflow-y-auto">
                    {rejectedGroups.length === 0 ? (
                      <div className="p-8 text-center text-[#A8A49E] text-[13px]">Belum ada pengajuan yang ditolak.</div>
                    ) : (
                      <div className="divide-y divide-[#E0DDD7]">
                        {rejectedGroups.map((group) => {
                          const typeColor = getCutiTypeColor(group.type);
                          const c = avColors[group.userName.charCodeAt(0) % avColors.length];
                          return (
                            <div key={`rej_${group.userId}_${group.status}`} className="p-3.5 px-4.5 hover:bg-[#FAFAF8] transition-colors">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10.5px] font-bold font-['Syne'] shrink-0" style={{ backgroundColor: c.bg, color: c.fg }}>
                                  {ini(group.userName)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 mb-0.5">
                                    <span className="text-[13px] font-medium text-[#1A1814] truncate">{group.userName}</span>
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold" style={{ backgroundColor: typeColor.bg, color: typeColor.fg }}>
                                      {getCutiTypeLabel(group.type)}
                                    </span>
                                  </div>
                                  <div className="text-[11.5px] text-[#A8A49E]">
                                    {formatDateRange(group.dates)} · {group.dates.length} hari
                                  </div>
                                </div>
                                <span className="inline-flex items-center px-2 py-0.5 bg-[#F5E8E4] text-[#C84B2F] rounded-full text-[10.5px] font-semibold shrink-0">
                                  ✕ Ditolak
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ═══════════════════════════════════════════════════ */}
        {/* ══  TAB 3 — HARI LIBUR                           ══ */}
        {/* ═══════════════════════════════════════════════════ */}
        {mainTab === "libur" && (
          <>
            {/* HOLIDAY STATS */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3.5 mb-7">
              <div className="bg-white border border-[#E0DDD7] rounded-[16px] p-4.5">
                <div className="text-[11px] text-[#A8A49E] uppercase tracking-[0.8px] font-mono mb-2.5">Total Hari Libur</div>
                <div className="font-['Syne'] text-[32px] font-bold tracking-[-1px] leading-none text-[#1A1814]">{holidays.length}</div>
                <div className="text-[12px] text-[#A8A49E] mt-1.5">sudah dikonfigurasi</div>
              </div>
              <div className="bg-white border border-[#E0DDD7] rounded-[16px] p-4.5">
                <div className="text-[11px] text-[#A8A49E] uppercase tracking-[0.8px] font-mono mb-2.5">Akan Datang</div>
                <div className="font-['Syne'] text-[32px] font-bold tracking-[-1px] leading-none text-[#2A7A4B]">{upcomingHolidays.length}</div>
                <div className="text-[12px] text-[#A8A49E] mt-1.5">sisa tahun ini</div>
              </div>
              <div className="bg-white border border-[#E0DDD7] rounded-[16px] p-4.5">
                <div className="text-[11px] text-[#A8A49E] uppercase tracking-[0.8px] font-mono mb-2.5">Sudah Lewat</div>
                <div className="font-['Syne'] text-[32px] font-bold tracking-[-1px] leading-none text-[#A8A49E]">{pastHolidays.length}</div>
                <div className="text-[12px] text-[#A8A49E] mt-1.5">tahun ini</div>
              </div>
            </div>

            <div className="flex flex-col xl:flex-row gap-5 items-start">
              {/* HOLIDAY LIST */}
              <div className="flex-1 w-full">
                <div className="bg-white border border-[#E0DDD7] rounded-[16px] overflow-hidden">
                  <div className="p-4 px-5 border-b border-[#E0DDD7] flex items-center justify-between">
                    <div>
                      <h2 className="font-['Syne'] text-[15px] font-semibold text-[#1A1814]">Daftar Hari Libur</h2>
                      <p className="text-[12px] text-[#A8A49E] mt-0.5">Karyawan otomatis tidak perlu absen pada hari-hari ini</p>
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
                      <div className="text-[14px] font-medium text-[#1A1814] mb-1">Belum ada hari libur</div>
                      <div className="text-[13px] text-[#A8A49E]">Klik "Tambah Hari Libur" untuk mulai mengatur jadwal libur.</div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-[#EDEAE4]">
                          <tr>
                            <th className="px-5 py-3 text-[10.5px] font-mono tracking-[0.8px] text-[#A8A49E] uppercase font-normal">Tanggal</th>
                            <th className="px-5 py-3 text-[10.5px] font-mono tracking-[0.8px] text-[#A8A49E] uppercase font-normal">Nama</th>
                            <th className="px-5 py-3 text-[10.5px] font-mono tracking-[0.8px] text-[#A8A49E] uppercase font-normal">Tipe</th>
                            <th className="px-5 py-3 text-[10.5px] font-mono tracking-[0.8px] text-[#A8A49E] uppercase font-normal">Status</th>
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
                              <tr key={holiday.id} className={`border-b border-[#E0DDD7] last:border-b-0 hover:bg-[#FAFAF8] transition-colors ${isPast ? "opacity-50" : ""}`}>
                                <td className="px-5 py-3.5">
                                  <div className="flex items-center gap-2.5">
                                    <div className={`w-10 h-10 rounded-[10px] flex flex-col items-center justify-center text-center shrink-0 border ${isToday ? "border-[#2A7A4B] bg-[#E2F0E8]" : "border-[#E0DDD7] bg-[#F5F2ED]"}`}>
                                      <div className={`text-[8px] font-mono uppercase leading-none ${isToday ? "text-[#2A7A4B]" : "text-[#A8A49E]"}`}>
                                        {new Date(holiday.date + "T00:00:00").toLocaleDateString("id-ID", { month: "short" })}
                                      </div>
                                      <div className={`text-[15px] font-bold font-['Syne'] leading-none mt-0.5 ${isToday ? "text-[#2A7A4B]" : "text-[#1A1814]"}`}>
                                        {new Date(holiday.date + "T00:00:00").getDate()}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="font-mono text-[12.5px] text-[#1A1814] font-medium">
                                        {new Date(holiday.date + "T00:00:00").toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-5 py-3.5 text-[13px] font-medium text-[#1A1814]">{holiday.name}</td>
                                <td className="px-5 py-3.5">
                                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold" style={{ backgroundColor: typeColor.bg, color: typeColor.fg }}>
                                    {getHolidayTypeLabel(holiday.type)}
                                  </span>
                                </td>
                                <td className="px-5 py-3.5">
                                  {isToday ? (
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#E2F0E8] text-[#2A7A4B]">● Hari ini</span>
                                  ) : isPast ? (
                                    <span className="text-[12px] text-[#A8A49E]">Sudah lewat</span>
                                  ) : (
                                    <span className="text-[12px] text-[#2A7A4B] font-medium">Akan datang</span>
                                  )}
                                </td>
                                <td className="px-5 py-3.5 text-right">
                                  <button
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
                    <h3 className="font-['Syne'] text-[15px] font-semibold text-[#1A1814]">Tambah Hari Libur</h3>
                    <p className="text-[12px] text-[#A8A49E] mt-0.5">Tentukan tanggal libur atau cuti bersama</p>
                  </div>
                  <form onSubmit={handleAddHoliday} className="p-5 space-y-4">
                    {/* Date */}
                    <div>
                      <label className="block text-[11px] text-[#A8A49E] uppercase tracking-[0.8px] font-mono mb-2">Tanggal</label>
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
                      <label className="block text-[11px] text-[#A8A49E] uppercase tracking-[0.8px] font-mono mb-2">Nama Hari Libur</label>
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
                      <label className="block text-[11px] text-[#A8A49E] uppercase tracking-[0.8px] font-mono mb-2">Tipe</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(["holiday", "cuti_bersama", "closed"] as const).map((type) => {
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
                              style={newHolidayType === type ? { backgroundColor: tc.bg, color: tc.fg } : {}}
                            >
                              {getHolidayTypeLabel(type)}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Preview */}
                    {newHolidayDate && newHolidayName && (
                      <div className="bg-[#F5F2ED] border border-[#E0DDD7] rounded-[10px] p-3.5">
                        <div className="text-[10.5px] text-[#A8A49E] uppercase tracking-[0.8px] font-mono mb-1.5">Preview</div>
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-[8px] bg-white border border-[#E0DDD7] flex flex-col items-center justify-center">
                            <div className="text-[7px] font-mono text-[#A8A49E] uppercase leading-none">
                              {new Date(newHolidayDate + "T00:00:00").toLocaleDateString("id-ID", { month: "short" })}
                            </div>
                            <div className="text-[14px] font-bold font-['Syne'] text-[#1A1814] leading-none mt-0.5">
                              {new Date(newHolidayDate + "T00:00:00").getDate()}
                            </div>
                          </div>
                          <div>
                            <div className="text-[13px] font-medium text-[#1A1814]">{newHolidayName}</div>
                            <div className="text-[11.5px] text-[#A8A49E]">
                              {new Date(newHolidayDate + "T00:00:00").toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })}
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
        )}

      </div>
    </AdminLayout>
  );
}

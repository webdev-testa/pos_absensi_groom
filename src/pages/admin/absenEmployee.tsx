import { useEffect, useState, useMemo } from "react";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Search, Download, Image as ImageIcon} from "lucide-react";

interface AttendanceRecord {
  id: string;
  user_id: string;
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

export default function AbsenEmployee() {
  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>([]);
  const [searchQ, setSearchQ] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("today");

  useEffect(() => {
    const fetchInitialData = async () => {
      const { data, error } = await supabaseAdmin
        .schema("hr")
        .from("attendance")
        .select(`*,users (name,emp_id,dept)`)
        .order("clock_in_time", { ascending: false })
        .limit(100);

      if (!error && data) {
        setAttendanceList(data as any);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    const channel = supabaseAdmin
      .channel("attendance-live")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "hr", table: "attendance" },
        async (payload) => {
          const newRecord = payload.new as AttendanceRecord;
          const { data: userData } = await supabaseAdmin
            .schema("hr")
            .from("users")
            .select("name, emp_id, dept")
            .eq("id", newRecord.user_id)
            .single();

          setAttendanceList((prev) => [
            { ...newRecord, users: userData ?? null },
            ...prev,
          ]);
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

  const filteredData = useMemo(() => {
    return attendanceList.filter((record) => {
      const matchSearch =
        record.users?.name?.toLowerCase().includes(searchQ.toLowerCase()) ||
        record.users?.dept?.toLowerCase().includes(searchQ.toLowerCase()) ||
        record.users?.emp_id?.toLowerCase().includes(searchQ.toLowerCase());
      
      const matchDept = deptFilter === "all" || record.users?.dept?.toLowerCase() === deptFilter.toLowerCase();
      
      const matchStatus =
        statusFilter === "all" ||
        record.status === statusFilter ||
        (statusFilter === "out" && record.clock_out_time !== null);

      return matchSearch && matchDept && matchStatus;
    });
  }, [attendanceList, searchQ, deptFilter, statusFilter]);

  // Derived stats
  const totalEmployees = 12; // Static for demo, could be derived from users table
  const statOntime = attendanceList.filter((r) => r.status === "ontime").length;
  const statLate = attendanceList.filter((r) => r.status === "late").length;
  const statAbsent = 2; // Assuming static or calculated diff
  const statOut = attendanceList.filter((r) => r.clock_out_time !== null).length;

  return (
    <AdminLayout>
      <div className="font-sans text-[#1A1814] -m-10 lg:-m-12 p-10 lg:p-12 min-h-screen" style={{ backgroundColor: "#F5F2ED" }}>
        
        {/* HEADER */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="font-['Syne'] text-[28px] font-bold tracking-tight text-[#1A1814]">
              Dashboard Absensi
            </h1>
            <p className="text-[13.5px] text-[#6B6760] mt-1.5">
              Pantau kehadiran karyawan secara real-time
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2 bg-white border border-[#E0DDD7] rounded-[10px] px-3.5 py-2 text-[13px] text-[#6B6760]">
              <div className="w-2 h-2 rounded-full bg-[#2A7A4B] shrink-0 animate-pulse"></div>
              <span>Live · <strong className="text-[#1A1814] font-semibold">Rabu, 20 April 2025</strong></span>
            </div>
            <button className="bg-white border border-[#E0DDD7] hover:border-[#CBC8C2] hover:text-[#1A1814] text-[#6B6760] rounded-[10px] px-4 py-2 text-[13px] font-medium flex items-center gap-2 transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

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
                {attendanceList.slice(0, 6).map((record, i) => {
                  if (!record.clock_in_time) return null;
                  const c = avColors[i % avColors.length];
                  const isOut = record.clock_out_time !== null;
                  const action = isOut ? "Clock-out" : (record.status === 'late' ? "Clock-in · terlambat" : "Clock-in");
                  const time = new Date(isOut ? record.clock_out_time! : record.clock_in_time).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
                  const dotColor = isOut ? '#A8A49E' : (record.status === 'late' ? '#B87333' : '#2A7A4B');
                  
                  return (
                    <div key={`feed-${record.id}`} className="flex items-center gap-2.5 px-4.5 py-2.5 border-b border-[#E0DDD7] last:border-b-0 hover:bg-[#FAFAF8] cursor-pointer transition-colors">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold font-['Syne'] shrink-0" style={{ backgroundColor: c.bg, color: c.fg }}>
                        {ini(record.users?.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-medium text-[#1A1814] truncate">{record.users?.name || "Unknown"}</div>
                        <div className="text-[11.5px] text-[#A8A49E] truncate">{action}</div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: dotColor }}></div>
                        <div className="font-mono text-[11.5px] text-[#A8A49E]">{time}</div>
                      </div>
                    </div>
                  )
                })}
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
      </div>
    </AdminLayout>
  );
}

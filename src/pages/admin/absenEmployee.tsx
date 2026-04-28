import { useEffect, useState } from "react";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { AdminLayout } from "@/components/layout/AdminLayout";

// Optional: Define a TypeScript interface for your attendance record
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

export default function AbsenEmployee() {
  // 1. Set up the React State to hold our list of records
  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>([]);

  // 2. Fetch the existing attendance records when the page first loads
  useEffect(() => {
    const fetchInitialData = async () => {
      const { data, error } = await supabaseAdmin
        .schema("hr")
        .from("attendance")
        .select(`*,users (name,emp_id,dept)`)
        .order("clock_in_time", { ascending: false })
        .limit(50);

      if (!error && data) {
        setAttendanceList(data);
      }
    };

    fetchInitialData();
  }, []);

  // 3. Listen for REAL-TIME changes to update the state
  useEffect(() => {
    const channel = supabaseAdmin
      .channel("attendance-live")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "hr",
          table: "attendance",
        },
        async (payload) => {
          const newRecord = payload.new as AttendanceRecord;

          // fetch user details to ensure we have the name
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
        },
      )
      .subscribe();

    // Cleanup the subscription when the user leaves the page
    return () => {
      supabaseAdmin.removeChannel(channel);
    };
  }, []);

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="font-['Syne'] text-[28px] font-bold tracking-tight text-[#1A1814]">
          Absensi Karyawan
        </h1>
        <p className="text-[13.5px] text-[#6B6760] mt-1.5">
          Mendengarkan perubahan absensi secara real-time...
        </p>
      </div>

      {/* 4. Render the data to the screen */}
      <div className="overflow-x-auto bg-white rounded-[16px] shadow-sm border border-[#E0DDD7]">
        <table className="min-w-full table-auto">
          <thead className="bg-[#EDEAE4]">
            <tr>
              <th className="px-6 py-3 text-left font-mono text-[10.5px] text-[#A8A49E] font-normal tracking-[0.8px] uppercase">
                Karyawan
              </th>
              <th className="px-6 py-3 text-left font-mono text-[10.5px] text-[#A8A49E] font-normal tracking-[0.8px] uppercase">
                Departemen
              </th>
              <th className="px-6 py-3 text-left font-mono text-[10.5px] text-[#A8A49E] font-normal tracking-[0.8px] uppercase">
                Clock In
              </th>
              <th className="px-6 py-3 text-left font-mono text-[10.5px] text-[#A8A49E] font-normal tracking-[0.8px] uppercase">
                Clock Out
              </th>
              <th className="px-6 py-3 text-left font-mono text-[10.5px] text-[#A8A49E] font-normal tracking-[0.8px] uppercase">
                Status
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#E0DDD7]">
            {attendanceList.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-10 text-center text-[#A8A49E]"
                >
                  No attendance records yet today.
                </td>
              </tr>
            ) : (
              attendanceList.map((record, index) => (
                <tr
                  key={record.id || index}
                  className="hover:bg-[#FAFAF8] transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="w-8 h-8 rounded-full bg-[#C84B2F] text-white flex items-center justify-center text-xs font-bold">
                        {record.users?.name
                          ?.split(" ")
                          .map((n) => n)
                          .join("")
                          .slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#1A1814]">
                          {record.users?.name}
                        </p>
                        <p className="text-xs text-[#A8A49E]">
                          {record.users?.emp_id}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#6B6760]">
                    {record.users?.dept}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#6B6760]">
                    {new Date(record.clock_in_time).toLocaleTimeString(
                      "id-ID",
                      { hour: "2-digit", minute: "2-digit" },
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#6B6760]">
                    {record.clock_out_time
                      ? new Date(record.clock_out_time).toLocaleTimeString(
                          "id-ID",
                          { hour: "2-digit", minute: "2-digit" },
                        )
                      : "—"}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-medium ${
                        record.status === "ontime"
                          ? "bg-[#E2F0E8] text-[#2A7A4B]"
                          : "bg-[#F5E8E4] text-[#C84B2F]"
                      }`}
                    >
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}

import { avColors, ini } from "@/utils/helpers";

interface AttendanceFeedProps {
  feedEvents: any[];
}

export function AttendanceFeed({ feedEvents }: AttendanceFeedProps) {
  return (
    <div className="w-full xl:w-[320px] flex flex-col gap-4 shrink-0">
      {/* REALTIME FEED */}
      <div className="bg-white border border-[#E0DDD7] rounded-[16px] overflow-hidden">
        <div className="p-3.5 px-4.5 border-b border-[#E0DDD7] flex items-center justify-between">
          <h3 className="font-['Syne'] text-[14px] font-semibold text-[#1A1814]">
            Aktivitas terkini
          </h3>
          <div className="flex items-center gap-1.5 text-[11.5px] text-[#2A7A4B] font-medium">
            <div className="w-2 h-2 rounded-full bg-[#2A7A4B] animate-pulse"></div>
            Live
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
                <div
                  key={event.id}
                  className="flex items-center gap-2.5 px-4.5 py-2.5 border-b border-[#E0DDD7] last:border-b-0 hover:bg-[#FAFAF8] cursor-pointer transition-colors"
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold font-['Syne'] shrink-0"
                    style={{ backgroundColor: c.bg, color: c.fg }}
                  >
                    {ini(event.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-[#1A1814] truncate">
                      {event.name}
                    </div>
                    <div className="text-[11.5px] text-[#A8A49E] truncate">
                      {event.action}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: event.dotColor }}
                    ></div>
                    <div className="font-mono text-[11.5px] text-[#A8A49E]">
                      {event.time}
                    </div>
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
            <h3 className="font-['Syne'] text-[14px] font-semibold text-[#1A1814]">
              Sebaran lokasi
            </h3>
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
            <svg width="18" height="22" viewBox="0 0 18 22">
              <circle cx="9" cy="9" r="7" fill="#C84B2F" />
              <text
                x="9"
                y="12"
                textAnchor="middle"
                fontSize="8"
                fill="white"
                fontWeight="700"
              >
                A
              </text>
              <path d="M9 22 L9 16" stroke="#C84B2F" strokeWidth="2" />
            </svg>
          </div>
          <div className="absolute left-[54%] top-[40%] -translate-x-1/2 -translate-y-full">
            <svg width="18" height="22" viewBox="0 0 18 22">
              <circle cx="9" cy="9" r="7" fill="#2A7A4B" />
              <text
                x="9"
                y="12"
                textAnchor="middle"
                fontSize="8"
                fill="white"
                fontWeight="700"
              >
                B
              </text>
              <path d="M9 22 L9 16" stroke="#2A7A4B" strokeWidth="2" />
            </svg>
          </div>

          <div className="absolute inset-0 bg-[#1A1814]/35 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="text-white text-[13px] font-medium">
              Lihat peta lengkap →
            </div>
          </div>
        </div>

        <div className="p-3 px-4 border-t border-[#E0DDD7] flex gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-[11.5px] text-[#6B6760]">
            <div className="w-2 h-2 rounded-full bg-[#2A7A4B]"></div>Kantor
          </div>
          <div className="flex items-center gap-1.5 text-[11.5px] text-[#6B6760]">
            <div className="w-2 h-2 rounded-full border border-dashed border-[#2A7A4B] bg-[#2A7A4B]/40"></div>
            Area absen
          </div>
          <div className="flex items-center gap-1.5 text-[11.5px] text-[#6B6760]">
            <div className="w-2 h-2 rounded-full bg-[#6B6760]"></div>Dalam area
          </div>
          <div className="flex items-center gap-1.5 text-[11.5px] text-[#6B6760]">
            <div className="w-2 h-2 rounded-full bg-[#A8A49E]"></div>Di luar
            area
          </div>
        </div>
      </div>
    </div>
  );
}

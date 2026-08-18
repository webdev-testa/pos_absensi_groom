import { AV_COLORS, getInitials } from "@/utils/helpers";

interface AttendanceFeedProps {
  feedEvents: any[];
}

export function AttendanceFeed({ feedEvents }: AttendanceFeedProps) {
  return (
    <div className="w-full xl:w-[320px] flex flex-col gap-4 shrink-0">
      {/* REALTIME FEED */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-xs">
        <div className="p-3.5 px-4.5 border-b border-border flex items-center justify-between">
          <h3 className="font-heading text-[14px] font-bold text-foreground">
            Aktivitas terkini
          </h3>
          <div className="flex items-center gap-1.5 text-[11.5px] text-[#10B981] font-semibold">
            <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></div>
            Live
          </div>
        </div>
        <div className="p-1.5 max-h-[280px] overflow-y-auto">
          {feedEvents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-[13px]">
              Belum ada aktivitas hari ini.
            </div>
          ) : (
            feedEvents.map((event) => {
              const c = AV_COLORS[event.name.charCodeAt(0) % AV_COLORS.length];
              return (
                <div
                  key={event.id}
                  className="flex items-center gap-2.5 px-4.5 py-2.5 border-b border-border/60 last:border-b-0 hover:bg-surface-soft/60 cursor-pointer transition-colors"
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold font-heading shrink-0"
                    style={{ backgroundColor: c.bg, color: c.fg }}
                  >
                    {getInitials(event.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-foreground truncate">
                      {event.name}
                    </div>
                    <div className="text-[11.5px] text-muted-foreground truncate">
                      {event.action}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: event.dotColor }}
                    ></div>
                    <div className="font-mono text-[11.5px] text-muted-foreground">
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
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-xs">
        <div className="p-3.5 px-4.5 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="font-heading text-[14px] font-bold text-foreground">
              Sebaran Geolocation GPS
            </h3>
            <p className="text-[12px] text-muted-foreground">Radius klinik Dr. Meow</p>
          </div>
          <button className="text-[12px] text-muted-foreground font-semibold hover:text-foreground px-2.5 py-1 rounded-md hover:bg-surface-soft transition-colors cursor-pointer border border-transparent">
            Buka peta
          </button>
        </div>

        <div className="h-[200px] bg-surface-soft relative overflow-hidden cursor-pointer group">
          <div className="absolute inset-0">
            <div className="absolute bg-white/70 h-[2px] top-[35%] left-0 right-0"></div>
            <div className="absolute bg-white/70 h-[2px] top-[65%] left-0 right-0"></div>
            <div className="absolute bg-white/70 w-[2px] left-[30%] top-0 bottom-0"></div>
            <div className="absolute bg-white/70 w-[2px] left-[70%] top-0 bottom-0"></div>
            <div className="absolute bg-[#b4afa5]/30 rounded-md top-[10%] left-[5%] w-[20%] h-[20%]"></div>
            <div className="absolute bg-[#b4afa5]/30 rounded-md top-[10%] left-[35%] w-[28%] h-[20%]"></div>
            <div className="absolute bg-[#b4afa5]/30 rounded-md top-[10%] left-[75%] w-[20%] h-[20%]"></div>
            <div className="absolute bg-[#b4afa5]/30 rounded-md top-[42%] left-[5%] w-[18%] h-[18%]"></div>
            <div className="absolute bg-[#b4afa5]/30 rounded-md top-[42%] left-[75%] w-[20%] h-[18%]"></div>
            <div className="absolute bg-[#b4afa5]/30 rounded-md top-[70%] left-[5%] w-[20%] h-[22%]"></div>
            <div className="absolute bg-[#b4afa5]/30 rounded-md top-[70%] left-[35%] w-[28%] h-[22%]"></div>
            <div className="absolute bg-[#b4afa5]/30 rounded-md top-[70%] left-[75%] w-[20%] h-[22%]"></div>
          </div>

          <div className="absolute w-[90px] h-[90px] rounded-full border-2 border-dashed border-[#10B981]/60 bg-[#10B981]/10 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"></div>

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-[14px] h-[14px] bg-primary rounded-full border-2 border-white shadow-md"></div>
          </div>

          <div className="absolute left-[46%] top-[44%] -translate-x-1/2 -translate-y-full">
            <svg width="18" height="22" viewBox="0 0 18 22">
              <circle cx="9" cy="9" r="7" fill="#EF4444" />
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
              <path d="M9 22 L9 16" stroke="#EF4444" strokeWidth="2" />
            </svg>
          </div>
          <div className="absolute left-[54%] top-[40%] -translate-x-1/2 -translate-y-full">
            <svg width="18" height="22" viewBox="0 0 18 22">
              <circle cx="9" cy="9" r="7" fill="#10B981" />
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
              <path d="M9 22 L9 16" stroke="#10B981" strokeWidth="2" />
            </svg>
          </div>

          <div className="absolute inset-0 bg-primary/40 backdrop-blur-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="text-white text-[13px] font-semibold">
              Lihat peta lengkap →
            </div>
          </div>
        </div>

        <div className="p-3 px-4 border-t border-border flex gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-primary"></div>Klinik
          </div>
          <div className="flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
            <div className="w-2 h-2 rounded-full border border-dashed border-[#10B981] bg-[#10B981]/40"></div>
            Radius Absen (50m)
          </div>
          <div className="flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-[#10B981]"></div>Dalam Radius
          </div>
          <div className="flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-[#EF4444]"></div>Luar Radius
          </div>
        </div>
      </div>
    </div>
  );
}

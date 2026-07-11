"use client"

import AnalogClock from "@/components/analog-clock"
import { useLanguage } from "@/lib/language-context"
import { useWallClock } from "@/hooks/use-wall-clock"

export default function CentralClock({ type, showSeconds, isFocusMode, hourlyPulse, backgroundType }) {
  const { t } = useLanguage()
  const time = useWallClock()
  const hours = String(time.getHours()).padStart(2, "0")
  const minutes = String(time.getMinutes()).padStart(2, "0")
  const seconds = String(time.getSeconds()).padStart(2, "0")
  const formattedDate = time.toLocaleDateString(t.dateLocale, { weekday: "long", month: "long", day: "numeric" })

  return (
    <div className="text-center flex flex-col items-center">
      {type === "analog" ? (
        <div className={`transition-all duration-500 mb-6 relative w-96 max-w-full ${hourlyPulse ? "scale-105" : ""}`}>
          <AnalogClock time={time} hideSeconds={isFocusMode || !showSeconds} className="w-full" />
          {hourlyPulse && <div className="absolute inset-0 rounded-full border-4 border-accent animate-ping opacity-50 z-[-1]" style={{ margin: "8%" }} />}
        </div>
      ) : (
        <div
          className={`font-mono text-9xl font-bold tracking-tight mb-3 transition-all duration-500 flex items-baseline ${hourlyPulse ? "text-accent scale-105 drop-shadow-[0_0_30px_var(--accent)]" : "text-primary"} ${backgroundType === "space" ? "text-stroke-2" : "text-shadow-sm"}`}
          style={backgroundType === "space" ? { textShadow: "0 0 20px rgba(255,255,255,0.3), 0 0 40px rgba(255,255,255,0.2)", WebkitTextStroke: "2px rgba(255,255,255,0.3)" } : {}}
        >
          {hours}:{minutes}{showSeconds && <span className="text-4xl text-muted-foreground ml-2">:{seconds}</span>}
        </div>
      )}
      <div className={`text-2xl text-muted-foreground capitalize transition-all duration-300 ${backgroundType === "space" ? "text-stroke-1 text-white/90" : "text-shadow-sm"}`}>
        {formattedDate}
      </div>
    </div>
  )
}

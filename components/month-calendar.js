"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { getPomodorosForMonth, getPomodorosForDay, savePomodoroLog, deletePomodoroLog } from "@/lib/pomodoro-store"
import { BookOpen, Dumbbell, Pencil, X, Plus, Trash2 } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { useWallClock } from "@/hooks/use-wall-clock"

const activityIcons = {
  study: { icon: BookOpen, color: "oklch(0.70 0.15 250)", label: "Estudiar" },
  exercise: { icon: Dumbbell, color: "oklch(0.70 0.18 150)", label: "Ejercitar" },
  draw: { icon: Pencil, color: "oklch(0.70 0.15 30)", label: "Dibujar" },
}

export default function MonthCalendar({ pomodoroRefresh }) {
  const currentDate = useWallClock(60_000)
  const { lang, t } = useLanguage()
  const [mounted, setMounted] = useState(false)
  const [displayDate, setDisplayDate] = useState(currentDate)
  const [pomodorosMap, setPomodorosMap] = useState({})
  const [selectedDay, setSelectedDay] = useState(null)
  const [dayPomodoros, setDayPomodoros] = useState([])
  const [showManualEntry, setShowManualEntry] = useState(false)
  const [manualActivity, setManualActivity] = useState("study")
  const [manualDuration, setManualDuration] = useState("60")
  const [manualDate, setManualDate] = useState(() => new Date().toISOString().split('T')[0])
  const [localRefresh, setLocalRefresh] = useState(0)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      const year = displayDate.getFullYear()
      const month = displayDate.getMonth()
      const pomodoros = getPomodorosForMonth(year, month)
      const map = {}
      for (const p of pomodoros) {
        if (!map[p.day]) map[p.day] = []
        map[p.day].push(p)
      }
      setPomodorosMap(map)
      
      if (selectedDay) {
          setDayPomodoros(getPomodorosForDay(year, month, selectedDay))
      }
    }
  }, [mounted, displayDate, pomodoroRefresh, localRefresh, selectedDay])

  const year = displayDate.getFullYear()
  const month = displayDate.getMonth()
  const today = currentDate.getDate()
  const isCurrentMonth = currentDate.getMonth() === month && currentDate.getFullYear() === year

  const getActLabel = (actId) => {
    return t.pomodoro[actId] || (activityIcons[actId]?.label || actId)
  }

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1

  const days = []
  for (let i = 0; i < adjustedFirstDay; i++) {
    days.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  const goToPreviousMonth = () => {
    setDisplayDate(new Date(year, month - 1, 1))
  }

  const goToNextMonth = () => {
    setDisplayDate(new Date(year, month + 1, 1))
  }

  const goToCurrentMonth = () => {
    setDisplayDate(currentDate)
  }

  if (!mounted) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-secondary rounded w-32 mb-4"></div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-8 bg-secondary rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <Button variant="ghost" size="icon" onClick={goToPreviousMonth} className="h-6 w-6">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Button>

        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-primary">
            {t.calendar.months[month]} {year}
          </h3>
          {!isCurrentMonth && (
            <Button
              variant="ghost"
              size="sm"
              onClick={goToCurrentMonth}
              className="h-5 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              {t.calendar.today}
            </Button>
          )}
        </div>

        <Button variant="ghost" size="icon" onClick={goToNextMonth} className="h-6 w-6">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {(() => {
          const weekdaysOrdered = [...t.calendar.weekdays.slice(1), t.calendar.weekdays[0]]
          return weekdaysOrdered.map((day, index) => (
            <div key={index} className="text-center text-[10px] font-medium text-muted-foreground pb-1 uppercase">
              {day}
            </div>
          ))
        })()}
        {days.map((day, index) => {
          const hasPomodoros = day && pomodorosMap[day]?.length > 0
          return (
            <button
              type="button"
              key={index}
              onClick={() => {
                if (day !== null) {
                  setSelectedDay(day)
                  setDayPomodoros(getPomodorosForDay(year, month, day))
                  setManualDate(`${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`)
                }
              }}
              className={`
                w-7 h-7 flex flex-col items-center justify-center text-xs rounded-md
                transition-all duration-200 relative
                ${day === null ? "invisible" : ""}
                ${day !== null ? "cursor-pointer hover:bg-secondary/50" : "cursor-default"}
                ${
                  day === today && isCurrentMonth
                    ? "bg-primary text-primary-foreground font-bold"
                    : "text-secondary-foreground"
                }
              `}
            >
              {day}
              {hasPomodoros && (
                <div className="absolute -bottom-0.5 flex gap-0.5">
                  {pomodorosMap[day].slice(0, 3).map((p, i) => (
                    <div
                      key={i}
                      className="w-1 h-1 rounded-full"
                      style={{ backgroundColor: activityIcons[p.activity]?.color }}
                    />
                  ))}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {selectedDay && (
        <div className="mt-3 p-3 bg-secondary/30 rounded-lg animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium">
              {lang === 'es' ? `${selectedDay} de ${t.calendar.months[month]}` : `${t.calendar.months[month]} ${selectedDay}`}
            </span>
            <button type="button" onClick={() => setSelectedDay(null)} className="text-muted-foreground hover:text-foreground">
              <X className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-1.5">
            {dayPomodoros.map((p) => {
              const activity = activityIcons[p.activity]
              const Icon = activity?.icon
              return (
                <div key={p.id} className="flex items-center gap-2 text-xs group">
                  {Icon && <Icon className="w-3 h-3" style={{ color: activity.color }} />}
                  <span>{getActLabel(p.activity)}</span>
                  <span className="text-muted-foreground ml-auto">{p.duration} min</span>
                  <button 
                    onClick={() => {
                      deletePomodoroLog(p.id);
                      setLocalRefresh(l => l + 1);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity ml-1"
                    title={t.calendar.deleteActivity || "Eliminar actividad"}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )
            })}
          </div>
          <div className="mt-4 border-t border-border/50 pt-4">
             <button onClick={() => setShowManualEntry(!showManualEntry)} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                 <Plus className="w-3 h-3"/> {t.calendar.manualEntry || "Registrar actividad manual"}
             </button>
             {showManualEntry && (
                 <form onSubmit={(e) => {
                     e.preventDefault();
                     if (manualDuration && !isNaN(manualDuration)) {
                         const dateParts = manualDate.split("-");
                         const date = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
                         savePomodoroLog(manualActivity, parseInt(manualDuration), date);
                         setLocalRefresh(l => l + 1);
                         setDayPomodoros(getPomodorosForDay(year, month, selectedDay));
                         setShowManualEntry(false);
                     }
                 }} className="mt-3 space-y-3 bg-background/50 p-3 rounded-xl text-xs animate-in fade-in slide-in-from-top-2 border border-border/50">
                     <div className="flex flex-col gap-1.5">
                          <label className="text-muted-foreground font-medium">{t.calendar.activity || "Actividad"}</label>
                          <select value={manualActivity} onChange={e => setManualActivity(e.target.value)} className="bg-background border border-border rounded-md px-2 py-1.5 outline-none focus:border-primary">
                              <option value="study">{t.pomodoro.study}</option>
                              <option value="exercise">{t.pomodoro.exercise}</option>
                              <option value="draw">{t.pomodoro.draw}</option>
                          </select>
                     </div>
                     <div className="flex gap-3">
                          <div className="flex flex-col gap-1.5 flex-1">
                              <label className="text-muted-foreground font-medium">{t.calendar.minutes || "Minutos"}</label>
                              <input type="number" value={manualDuration} onChange={e => setManualDuration(e.target.value)} className="bg-background border border-border rounded-md px-2 py-1.5 w-full outline-none focus:border-primary" required min="1"/>
                          </div>
                     </div>
                     <button type="submit" className="w-full bg-primary text-primary-foreground rounded-md py-2 mt-1 font-medium hover:bg-primary/90 transition-colors">{t.calendar.saveLog || "Guardar Registro"}</button>
                 </form>
             )}
          </div>
        </div>
      )}
    </div>
  )
}

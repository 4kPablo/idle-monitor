"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { BookOpen, Dumbbell, Pencil, Play, Pause, RotateCcw } from "lucide-react"
import { savePomodoroLog } from "@/lib/pomodoro-store"

const activities = [
  { id: "study", label: "Estudiar", icon: BookOpen, color: "oklch(0.70 0.15 250)" },
  { id: "exercise", label: "Ejercitar", icon: Dumbbell, color: "oklch(0.70 0.18 150)" },
  { id: "draw", label: "Dibujar", icon: Pencil, color: "oklch(0.70 0.15 30)" },
]

export default function PomodoroTimer({ onPomodoroComplete }) {
  const [isActive, setIsActive] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState(null)
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isBreak, setIsBreak] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const intervalRef = useRef(null)
  const startTimeRef = useRef(null)

  const WORK_TIME = 25 * 60
  const BREAK_TIME = 5 * 60
  const MIN_DURATION_TO_SAVE = 5 * 60

  const playNotificationSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      
      // Crear un sonido de campana suave
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.setValueAtTime(880, audioContext.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(440, audioContext.currentTime + 0.5)
      oscillator.type = "sine"
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 1)
      
      // Segundo tono
      setTimeout(() => {
        const osc2 = audioContext.createOscillator()
        const gain2 = audioContext.createGain()
        osc2.connect(gain2)
        gain2.connect(audioContext.destination)
        osc2.frequency.setValueAtTime(660, audioContext.currentTime)
        osc2.type = "sine"
        gain2.gain.setValueAtTime(0.2, audioContext.currentTime)
        gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8)
        osc2.start(audioContext.currentTime)
        osc2.stop(audioContext.currentTime + 0.8)
      }, 300)
    } catch (e) {
      console.error("Error playing notification sound:", e)
    }
  }, [])

  const showNotification = useCallback((title, body) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: "/icon-192.png",
        tag: "pomodoro",
      })
    } else if ("Notification" in window && Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification(title, {
            body,
            icon: "/icon-192.png",
            tag: "pomodoro",
          })
        }
      })
    }
  }, [])

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }
  }, [])

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      if (!startTimeRef.current && !isBreak) {
        startTimeRef.current = Date.now()
      }
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
        if (!isBreak) {
          setElapsedTime((prev) => prev + 1)
        }
      }, 1000)
    } else if (timeLeft === 0) {
      if (!isBreak) {
        playNotificationSound()
        const activityLabel = activities.find(a => a.id === selectedActivity)?.label || "Actividad"
        showNotification("Pomodoro completado", `${activityLabel} terminado. Tiempo de descanso.`)
        
        if (elapsedTime >= MIN_DURATION_TO_SAVE && selectedActivity) {
          const durationMinutes = Math.round(elapsedTime / 60)
          savePomodoroLog(selectedActivity, durationMinutes)
          if (onPomodoroComplete) {
            onPomodoroComplete()
          }
        }
        setIsBreak(true)
        setTimeLeft(BREAK_TIME)
        setElapsedTime(0)
        startTimeRef.current = null
      } else {
        playNotificationSound()
        showNotification("Descanso terminado", "Tiempo de volver al trabajo.")
        setIsBreak(false)
        setTimeLeft(WORK_TIME)
        setIsActive(false)
      }
    }

    return () => clearInterval(intervalRef.current)
  }, [isActive, timeLeft, isBreak, elapsedTime, selectedActivity, onPomodoroComplete, playNotificationSound, showNotification])

  const toggleTimer = () => {
    if (!selectedActivity) return
    setIsActive(!isActive)
  }

  const resetTimer = () => {
    // Guardar si se trabajó más de 5 minutos antes de resetear
    if (elapsedTime >= MIN_DURATION_TO_SAVE && selectedActivity && !isBreak) {
      const durationMinutes = Math.round(elapsedTime / 60)
      savePomodoroLog(selectedActivity, durationMinutes)
      if (onPomodoroComplete) {
        onPomodoroComplete()
      }
    }
    setIsActive(false)
    setIsBreak(false)
    setTimeLeft(WORK_TIME)
    setElapsedTime(0)
    startTimeRef.current = null
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const progress = isBreak ? (BREAK_TIME - timeLeft) / BREAK_TIME : (WORK_TIME - timeLeft) / WORK_TIME

  const currentActivity = activities.find((a) => a.id === selectedActivity)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">Pomodoro</h3>
        {isBreak && <span className="text-xs px-2 py-1 rounded-full bg-accent/20 text-accent">Descanso</span>}
      </div>

      {!selectedActivity ? (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">Selecciona una actividad:</p>
          <div className="flex gap-2 justify-center">
            {activities.map((activity) => {
              const Icon = activity.icon
              return (
                <Button
                  key={activity.id}
                  variant="outline"
                  className="flex-1 flex-col h-auto py-3 gap-1 hover:border-primary/50 transition-all bg-transparent"
                  onClick={() => setSelectedActivity(activity.id)}
                >
                  <Icon className="w-5 h-5" style={{ color: activity.color }} />
                  <span className="text-xs">{activity.label}</span>
                </Button>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2">
            {currentActivity && (
              <>
                <currentActivity.icon className="w-4 h-4" style={{ color: currentActivity.color }} />
                <span className="text-sm font-medium">{currentActivity.label}</span>
              </>
            )}
          </div>

          <div className="relative flex items-center justify-center">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="4" className="text-secondary" />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${progress * 283} 283`}
                  style={{ stroke: currentActivity?.color || "oklch(0.70 0.15 250)" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-mono font-bold">{formatTime(timeLeft)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2">
            <Button variant="outline" size="icon" className="h-9 w-9 bg-transparent" onClick={toggleTimer}>
              {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button variant="outline" size="icon" className="h-9 w-9 bg-transparent" onClick={resetTimer}>
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground"
              onClick={() => {
                setSelectedActivity(null)
                resetTimer()
              }}
            >
              Cambiar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

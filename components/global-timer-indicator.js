"use client"

import { useTimerStore } from "@/lib/timer-store"

const COLORS = {
  pomodoro: 'oklch(0.6 0.15 220)',
  timer: 'oklch(0.7 0.2 30)',
  stopwatch: 'oklch(0.65 0.18 150)',
  alarm: 'oklch(0.65 0.2 0)',
}

export default function GlobalTimerIndicator() {
  const { type, status, display, isBreak, activity } = useTimerStore()

  const isActive = status === 'running' || status === 'paused'
  const color = COLORS[type] || COLORS.pomodoro
  const pulse = status === 'running'

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] transition-all duration-500 ease-out pointer-events-none"
      style={{
        height: isActive ? '3px' : '0px',
        opacity: isActive ? 1 : 0,
        background: color,
        animation: pulse ? 'timer-bar-pulse 2s ease-in-out infinite' : 'none',
      }}
      title={isActive ? `${activity || type} · ${display}${isBreak ? ' (Descanso)' : ''}${status === 'paused' ? ' · Pausado' : ''}` : ''}
    >
      <style>{`
        @keyframes timer-bar-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}

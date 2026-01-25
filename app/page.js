"use client"

import { useState, useEffect, useCallback } from "react"
import AnalogClock from "@/components/analog-clock"
import MonthCalendar from "@/components/month-calendar"
import WeatherWidget from "@/components/weather-widget"
import TechNews from "@/components/tech-news"
import ProgressBars from "@/components/progress-bars"
import ParticlesBg from "@/components/particles-bg"
import GradientBg from "@/components/backgrounds/gradient-bg"
import GridBg from "@/components/backgrounds/grid-bg"
import SpaceBg from "@/components/backgrounds/space-bg"
import PomodoroTimer from "@/components/pomodoro-timer"
import AmbientSounds from "@/components/ambient-sounds"
import HourlyChime from "@/components/hourly-chime"
import DraggableWidget from "@/components/draggable-widget"
import { getWidgetLayout, saveWidgetLayout, moveWidget } from "@/lib/widget-store"
import { getSettings, saveSettings } from "@/lib/settings-store"
import { Settings2, Check, Palette, X, Image as ImageIcon } from "lucide-react"

const EMPTY_PROPS = {}

const widgetComponents = {
  "analog-clock": { component: AnalogClock, props: (state) => ({ time: state.currentTime }) },
  "calendar": { component: MonthCalendar, props: (state) => ({ currentDate: state.currentTime, pomodoroRefresh: state.pomodoroRefresh }) },
  "ambient": { component: AmbientSounds, props: () => EMPTY_PROPS },
  "weather": { component: WeatherWidget, props: () => EMPTY_PROPS },
  "pomodoro": { component: PomodoroTimer, props: (state) => ({ onPomodoroComplete: state.handlePomodoroComplete }) },
  "tech-news": { component: TechNews, props: () => EMPTY_PROPS },
  "progress-bars": { component: ProgressBars, props: (state) => ({ currentTime: state.currentTime }) },
  "progress": { component: ProgressBars, props: (state) => ({ currentTime: state.currentTime }) }, // Fallback for legacy layout
}

// Configuración de Temas por Fondo
const THEME_CONFIG = {
  'particles': [
    { name: "Azul", primary: "oklch(0.65 0.18 220)", accent: "oklch(0.7 0.2 180)" },
    { name: "Púrpura", primary: "oklch(0.65 0.25 300)", accent: "oklch(0.7 0.2 280)" },
    { name: "Esmeralda", primary: "oklch(0.7 0.2 160)", accent: "oklch(0.75 0.22 150)" },
    { name: "Rosa", primary: "oklch(0.7 0.2 340)", accent: "oklch(0.75 0.22 330)" },
  ],
  'gradient-aurora': [
    { name: "Cyber", primary: "oklch(0.6 0.15 240)", accent: "oklch(0.7 0.25 160)" },
    { name: "Neon", primary: "oklch(0.65 0.25 310)", accent: "oklch(0.7 0.2 280)" },
    { name: "Glacier", primary: "oklch(0.75 0.1 200)", accent: "oklch(0.8 0.1 190)" },
    { name: "Fuego", primary: "oklch(0.65 0.22 30)", accent: "oklch(0.7 0.25 20)" },
  ],
  'gradient-forest': [
    { name: "Verde", primary: "oklch(0.8 0.15 145)", accent: "oklch(0.75 0.2 130)" },
    { name: "Coral", primary: "oklch(0.75 0.15 25)", accent: "oklch(0.8 0.2 15)" },
    { name: "Ámbar", primary: "oklch(0.8 0.18 70)", accent: "oklch(0.85 0.2 60)" },
    { name: "Lavanda", primary: "oklch(0.75 0.12 290)", accent: "oklch(0.8 0.15 280)" },
  ],
  'grid': [
    { name: "Vapor", primary: "oklch(0.65 0.25 300)", accent: "oklch(0.7 0.2 190)" },
    { name: "Retro", primary: "oklch(0.6 0.2 20)", accent: "oklch(0.8 0.3 350)" },
    { name: "Cyan", primary: "oklch(0.7 0.2 200)", accent: "oklch(0.75 0.22 190)" },
    { name: "Lime", primary: "oklch(0.75 0.2 130)", accent: "oklch(0.8 0.22 120)" },
  ],
  'space': [
    { name: "Sci-Fi", primary: "oklch(0.7 0.05 240)", accent: "oklch(0.8 0.1 200)" },
    { name: "Void", primary: "oklch(0.8 0 0)", accent: "oklch(0.6 0.2 260)" },
    { name: "Nebula", primary: "oklch(0.65 0.2 310)", accent: "oklch(0.7 0.22 300)" },
    { name: "Stellar", primary: "oklch(0.7 0.18 180)", accent: "oklch(0.75 0.2 170)" },
  ],
  'solid': [
    { name: "Azul", primary: "#3b82f6", accent: "#60a5fa", bg: "#1e293b" },
    { name: "Verde", primary: "#10b981", accent: "#34d399", bg: "#064e3b" },
    { name: "Púrpura", primary: "#a855f7", accent: "#c084fc", bg: "#2e1065" },
    { name: "Rosa", primary: "#ec4899", accent: "#f472b6", bg: "#500724" },
    { name: "Naranja", primary: "#f97316", accent: "#fb923c", bg: "#431407" },
    { name: "Cyan", primary: "#06b6d4", accent: "#22d3ee", bg: "#083344" },
    { name: "Amarillo", primary: "#eab308", accent: "#facc15", bg: "#422006" },
    { name: "Rojo", primary: "#ef4444", accent: "#f87171", bg: "#450a0a" },
  ]
}

const backgroundOptions = [
  { id: 'particles', name: 'Partículas' },
  { id: 'gradient-aurora', name: 'Aurora' },
  { id: 'gradient-forest', name: 'Bosque' },
  { id: 'grid', name: 'Retro Grid' },
  { id: 'space', name: 'Espacio' },
  { id: 'solid', name: 'Solido' },
]

export default function HomePage() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [pomodoroRefresh, setPomodoroRefresh] = useState(0)
  const [hourlyPulse, setHourlyPulse] = useState(false)
  const [layout, setLayout] = useState({ left: [], right: [] })
  const [draggingWidget, setDraggingWidget] = useState(null)
  const [mounted, setMounted] = useState(false)
  const [isCustomizationMode, setIsCustomizationMode] = useState(false)
  const [backgroundType, setBackgroundType] = useState('particles')
  const [customBgColor, setCustomBgColor] = useState('#1a1a1a')

  const currentHour = currentTime.getHours()
  const isNightMode = currentHour >= 0 && currentHour < 7

  useEffect(() => {
    setMounted(true)
    setLayout(getWidgetLayout())

    // Load visual settings
    const savedSettings = getSettings()
    setBackgroundType(savedSettings.backgroundType)
    setCustomBgColor(savedSettings.customBgColor)

    // Apply saved theme
    const themes = THEME_CONFIG[savedSettings.backgroundType] || THEME_CONFIG['particles']
    const savedTheme = themes.find(t => t.name === savedSettings.themeName) || themes[0]
    if (savedTheme) {
      applyTheme(savedTheme, false) // false to avoid redundant save during load
    }
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handlePomodoroComplete = useCallback(() => {
    setPomodoroRefresh((prev) => prev + 1)
  }, [])

  const handleHourlyChime = useCallback(() => {
    setHourlyPulse(true)
    setTimeout(() => setHourlyPulse(false), 2000)
  }, [])

  const handleDrop = useCallback((targetColumn, targetIndex) => (draggedWidgetId) => {
    const sourceColumn = layout.left.includes(draggedWidgetId) ? "left" : "right"

    // Allow reordering in same column or moving between columns
    const newLayout = moveWidget(draggedWidgetId, sourceColumn, targetColumn, layout, targetIndex)
    setLayout(newLayout)
    saveWidgetLayout(newLayout)
  }, [layout])

  const applyTheme = (theme, shouldSave = true) => {
    document.documentElement.style.setProperty('--primary', theme.primary)
    document.documentElement.style.setProperty('--accent', theme.accent)
    document.documentElement.style.setProperty('--ring', theme.primary)
    if (theme.bg) {
      setCustomBgColor(theme.bg)
    }

    if (shouldSave) {
      saveSettings({
        themeName: theme.name,
        backgroundType: backgroundType,
        customBgColor: theme.bg || customBgColor
      })
    }
  }



  // Auto-switch theme when background changes
  const handleBackgroundChange = (type) => {
    setBackgroundType(type)
    const allowedThemes = THEME_CONFIG[type] || THEME_CONFIG['particles']
    if (allowedThemes.length > 0) {
      const defaultTheme = allowedThemes[0]
      applyTheme(defaultTheme, false)
      saveSettings({
        backgroundType: type,
        themeName: defaultTheme.name,
        customBgColor: defaultTheme.bg || customBgColor
      })
    }
  }

  const hours = currentTime.getHours().toString().padStart(2, "0")
  const minutes = currentTime.getMinutes().toString().padStart(2, "0")
  const dateOptions = {
    weekday: "long",
    month: "long",
    day: "numeric",
  }
  const formattedDate = currentTime.toLocaleDateString("es-ES", dateOptions)

  const cardClass = isNightMode
    ? "p-4 bg-black/60 backdrop-blur-sm border-border/50 transition-colors duration-500"
    : "p-4 bg-card/80 backdrop-blur-sm border-border transition-colors duration-500"

  const state = {
    currentTime,
    pomodoroRefresh,
    handlePomodoroComplete,
  }

  const renderWidget = (widgetId, index, column) => {
    const widgetConfig = widgetComponents[widgetId]
    if (!widgetConfig) return null

    const Component = widgetConfig.component
    const props = widgetConfig.props(state)

    return (
      <DraggableWidget
        key={widgetId}
        id={widgetId}
        index={index}
        cardClass={cardClass}
        onDragStart={setDraggingWidget}
        onDragEnd={() => setDraggingWidget(null)}
        onDrop={handleDrop(column, index)}
        isDragging={draggingWidget === widgetId}
        isDraggable={isCustomizationMode}
        animationDelay={100 + index * 50}
      >
        <Component {...props} />
      </DraggableWidget>
    )
  }

  const renderBackground = () => {
    switch (backgroundType) {
      case 'gradient-aurora': return <GradientBg type="aurora" />
      case 'gradient-forest': return <GradientBg type="forest" />
      case 'grid': return <GridBg />
      case 'space': return <SpaceBg />
      case 'solid': return null // Default bg color
      case 'particles':
      default: return <ParticlesBg />
    }
  }

  const currentThemes = THEME_CONFIG[backgroundType] || THEME_CONFIG['particles']

  if (!mounted) {
    return (
      <div className="min-h-screen animated-bg flex items-center justify-center">
        <div className="text-primary text-2xl font-mono animate-pulse">Cargando...</div>
      </div>
    )
  }

  return (
    <div
      className={`min-h-screen p-6 flex items-center justify-center relative transition-colors duration-1000 ${isNightMode ? "bg-black" : "animated-bg"}`}
      style={backgroundType === 'solid' ? { backgroundColor: customBgColor } : {}}
    >
      {renderBackground()}
      <HourlyChime currentTime={currentTime} isNightMode={isNightMode} onChime={handleHourlyChime} />

      {/* Button to toggle Customization Mode */}
      {!isCustomizationMode && (
        <button
          onClick={() => setIsCustomizationMode(true)}
          className="absolute top-6 right-6 p-3 bg-card/50 backdrop-blur-md border border-border rounded-full shadow-lg hover:scale-110 transition-transform z-50 group"
          title="Personalizar Interface"
        >
          <Settings2 className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
        </button>
      )}

      {/* Customization Toolbar */}
      {isCustomizationMode && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-card/90 backdrop-blur-xl border border-primary/20 p-4 rounded-2xl shadow-2xl z-50 flex flex-col gap-4 animate-in slide-in-from-top-10 min-w-[300px]">
          <div className="flex items-center justify-between gap-8">
            <div className="flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-primary" />
              <span className="font-medium text-sm">Personalización</span>
            </div>
            <button
              onClick={() => setIsCustomizationMode(false)}
              className="p-1 hover:bg-destructive/10 rounded-full group"
            >
              <X className="w-5 h-5 text-muted-foreground group-hover:text-destructive" />
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Palette className="w-3 h-3" /> Temas (Ajustados al Fondo)
            </div>
            <div className="flex gap-2">
              {currentThemes.map((theme) => (
                <button
                  key={theme.name}
                  onClick={() => applyTheme(theme)}
                  className="w-8 h-8 rounded-full border-2 border-border hover:scale-110 transition-transform shadow-sm"
                  style={{ background: theme.primary }}
                  title={theme.name}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <ImageIcon className="w-3 h-3" /> Fondos
            </div>
            <div className="grid grid-cols-3 gap-2">
              {backgroundOptions.map((bg) => (
                <button
                  key={bg.id}
                  onClick={() => handleBackgroundChange(bg.id)}
                  className={`text-xs p-2 rounded-md border transition-all ${backgroundType === bg.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-secondary text-secondary-foreground border-transparent hover:bg-secondary/80"
                    }`}
                >
                  {bg.name}
                </button>
              ))}
            </div>
          </div>


          <div className="text-xs text-muted-foreground text-center pt-2 border-t border-border/50">
            Arrastra los widgets para reordenarlos
          </div>
        </div>
      )}

      <div className={`w-full max-w-7xl relative z-10 flex gap-6 items-center transition-all ${isCustomizationMode ? "scale-95" : ""}`}>
        {/* Columna izquierda */}
        <div
          className={`w-72 flex-shrink-0 space-y-4 transition-all duration-300 min-h-[500px] ${isCustomizationMode ? "border-2 border-dashed border-primary/20 rounded-xl p-2 bg-primary/5" : ""
            }`}
          onDragOver={(e) => {
            e.preventDefault()
          }}
          onDrop={(e) => {
            e.preventDefault()
            const widgetId = e.dataTransfer.getData("widgetId")
            if (widgetId) {
              handleDrop("left", null)(widgetId)
            }
          }}
        >
          {layout.left.map((widgetId, index) => renderWidget(widgetId, index, "left"))}
        </div>

        {/* Centro - Reloj principal grande */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="text-center">
            <div
              className={`font-mono text-9xl font-bold tracking-tight mb-3 transition-all duration-500 ${hourlyPulse
                ? "text-accent scale-105 drop-shadow-[0_0_30px_var(--accent)]"
                : "text-primary"
                } ${backgroundType === 'space' ? "text-stroke-2" : "text-shadow-sm"}`}
              style={backgroundType === 'space' ? {
                textShadow: '0 0 20px rgba(255,255,255,0.3), 0 0 40px rgba(255,255,255,0.2)',
                WebkitTextStroke: '2px rgba(255,255,255,0.3)'
              } : {}}
            >
              {hours}:{minutes}
            </div>
            <div className={`text-2xl text-muted-foreground capitalize transition-all duration-300 ${backgroundType === 'space' ? "text-stroke-1 text-white/90" : "text-shadow-sm"}`}>
              {formattedDate}
            </div>
          </div>
        </div>

        {/* Columna derecha */}
        <div
          className={`w-72 flex-shrink-0 space-y-4 transition-all duration-300 min-h-[500px] ${isCustomizationMode ? "border-2 border-dashed border-primary/20 rounded-xl p-2 bg-primary/5" : ""
            }`}
          onDragOver={(e) => {
            e.preventDefault()
          }}
          onDrop={(e) => {
            e.preventDefault()
            const widgetId = e.dataTransfer.getData("widgetId")
            if (widgetId) {
              handleDrop("right", null)(widgetId)
            }
          }}
        >
          {layout.right.map((widgetId, index) => renderWidget(widgetId, index, "right"))}
        </div>
      </div>
    </div>
  )
}

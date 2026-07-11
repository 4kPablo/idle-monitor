"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import MonthCalendar from "@/components/month-calendar"
import WeatherWidget from "@/components/weather-widget"
import TechNews from "@/components/tech-news"
import ProgressBars from "@/components/progress-bars"
import YoutubeWidget from "@/components/youtube-widget"
import ParticlesBg from "@/components/particles-bg"
import GradientBg from "@/components/backgrounds/gradient-bg"
import GridBg from "@/components/backgrounds/grid-bg"
import SpaceBg from "@/components/backgrounds/space-bg"
import PomodoroTimer from "@/components/pomodoro-timer"
import AmbientSounds from "@/components/ambient-sounds"
import HourlyChime from "@/components/hourly-chime"
import DraggableWidget from "@/components/draggable-widget"
import QuickLinks from "@/components/quick-links"
import TaskList from "@/components/task-list"
import AiNewsSummary from "@/components/ai-news-summary"
import GlobalTimerIndicator from "@/components/global-timer-indicator"
import { getWidgetLayout, saveWidgetLayout, moveWidget } from "@/lib/widget-store"
import { getSettings, saveSettings } from "@/lib/settings-store"
import { useLanguage } from "@/lib/language-context"
import { Settings2, Check, X, Focus, Maximize, Minimize, EyeOff, LayoutTemplate, Volume2, VolumeX } from "lucide-react"
import DigitalClockWidget from "@/components/digital-clock"
import CentralClock from "@/components/central-clock"
import { useWallClock } from "@/hooks/use-wall-clock"
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import { THEME_CONFIG } from "@/lib/themes"
import SettingsDrawer from "@/components/settings-drawer"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
const AutoFitColumn = ({ id, items, children, isCustomizationMode, position }) => {
  const containerRef = useRef(null)
  const contentRef = useRef(null)
  const [scale, setScale] = useState(1)

  const { setNodeRef } = useDroppable({ id })

  const setRefs = useCallback(
    (node) => {
      containerRef.current = node;
      setNodeRef(node);
    },
    [setNodeRef]
  );

  useEffect(() => {
    if (!containerRef.current || !contentRef.current) return
    const checkScale = () => {
      if (isCustomizationMode) {
        setScale(1)
        return
      }
      const containerHeight = containerRef.current.clientHeight
      const contentHeight = contentRef.current.scrollHeight
      if (contentHeight > containerHeight && contentHeight > 0) {
        setScale(containerHeight / contentHeight)
      } else {
        setScale(1)
      }
    }

    const resizeObserver = new ResizeObserver(checkScale)
    resizeObserver.observe(containerRef.current)
    resizeObserver.observe(contentRef.current)
    checkScale()
    return () => resizeObserver.disconnect()
  }, [items, isCustomizationMode])

  return (
    <div
      ref={setRefs}
      className={`flex-shrink-0 h-[80vh] flex flex-col justify-center transition-all duration-700 ${isCustomizationMode ? "border-2 border-dashed border-primary/20 rounded-xl p-2 bg-primary/5" : ""}`}
      style={{ width: '19rem' }}
    >
      <div
        ref={contentRef}
        className={`w-full space-y-4 flex flex-col transition-transform duration-300 ${position === 'left' ? 'origin-left' : 'origin-right'}`}
        style={{ transform: scale < 1 ? `scale(${scale})` : 'none' }}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          {children}
        </SortableContext>
      </div>
    </div>
  )
}

const FocusLauncherWidget = ({ onFocusToggle, label }) => (
  <div
    onClick={onFocusToggle}
    className="flex flex-row items-center justify-center p-3 gap-2 h-full cursor-pointer group rounded-xl border border-transparent hover:border-primary/20 hover:bg-primary/5 transition-all duration-300"
  >
    <Focus className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors opacity-50 group-hover:opacity-100" />
    <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">{label}</span>
  </div>
)

const EMPTY_PROPS = {}

const HourlyChimeBoundary = (props) => {
  const currentTime = useWallClock()
  return <HourlyChime currentTime={currentTime} {...props} />
}

const CompactClock = () => {
  const time = useWallClock()
  return <>{String(time.getHours()).padStart(2, "0")}:{String(time.getMinutes()).padStart(2, "0")}</>
}

const widgetComponents = {
  "clock": { component: DigitalClockWidget, props: (state) => ({ showSeconds: state.widgetShowSeconds, clockStyle: state.widgetClockStyle, alarmSoundType: state.alarmSoundType, timerSoundType: state.timerSoundType }) },
  "calendar": { component: MonthCalendar, props: (state) => ({ pomodoroRefresh: state.pomodoroRefresh }) },
  "ambient": { component: AmbientSounds, props: () => ({}) },
  "weather": { component: WeatherWidget, props: (state) => ({ showLocation: state.weatherShowLocation, showStats: state.weatherShowStats }) },
  "pomodoro": { component: PomodoroTimer, props: (state) => ({ onPomodoroComplete: state.handlePomodoroComplete, onFocusToggle: state.handleFocusToggle, onPomodoroActive: state.handlePomodoroActive, isFocusMode: state.isFocusMode }) },
  "tech-news": { component: TechNews, props: () => EMPTY_PROPS },
  "progress-bars": { component: ProgressBars, props: () => EMPTY_PROPS },
  "youtube": { component: YoutubeWidget, props: (state) => ({ 
    videoId: state.videoId, 
    setVideoId: state.setVideoId, 
    isVideoBackground: state.isVideoBackground, 
    setIsVideoBackground: state.setIsVideoBackground, 
    isFullscreenViewport: state.isFullscreenViewport, 
    setIsFullscreenViewport: state.setIsFullscreenViewport,
    youtubePlaylistExpanded: state.youtubePlaylistExpanded,
    setYoutubePlaylistExpanded: state.setYoutubePlaylistExpanded
  }) },
  "quick-links": { component: QuickLinks, props: () => EMPTY_PROPS },
  "task-list": { component: TaskList, props: () => EMPTY_PROPS },
  "ai-news": { component: AiNewsSummary, props: () => EMPTY_PROPS },
}

export default function HomePage() {
  const { lang, t, setLang } = useLanguage()
  const coarseTime = useWallClock(60_000)
  const [pomodoroRefresh, setPomodoroRefresh] = useState(0)
  const [hourlyPulse, setHourlyPulse] = useState(false)
  const [layout, setLayout] = useState({ left: [], right: [] })
  const [draggingWidget, setDraggingWidget] = useState(null)
  const [mounted, setMounted] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isCustomizationMode, setIsCustomizationMode] = useState(false)
  const [showUI, setShowUI] = useState(false)
  const [hideSidebars, setHideSidebars] = useState(false)
  const [backgroundType, setBackgroundType] = useState('particles')
  const [customBgColor, setCustomBgColor] = useState('#1a1a1a')
  const [centralClockType, setCentralClockType] = useState('digital')
  const [isFocusMode, setIsFocusMode] = useState(false)
  const [showSeconds, setShowSeconds] = useState(true)
  const [widgetShowSeconds, setWidgetShowSeconds] = useState(true)
  const [widgetClockStyle, setWidgetClockStyle] = useState('analog')
  const [weatherShowLocation, setWeatherShowLocation] = useState(true)
  const [weatherShowStats, setWeatherShowStats] = useState(true)
  const [chimeEnabled, setChimeEnabled] = useState(true)
  const [chimeSilentFrom, setChimeSilentFrom] = useState(0)
  const [chimeSilentTo, setChimeSilentTo] = useState(7)
  const [chimeSoundType, setChimeSoundType] = useState('chime')
  const [alarmSoundType, setAlarmSoundType] = useState('beep')
  const [timerSoundType, setTimerSoundType] = useState('beep')
  const [particleColor, setParticleColor] = useState('80, 160, 255')
  const [particleBgColor, setParticleBgColor] = useState('#00050f')
  const [isAmbientActive, setIsAmbientActive] = useState(false)

  // Youtube State hoisted
  const [videoId, setVideoIdState] = useState("")
  const [isVideoBackground, setIsVideoBackground] = useState(false)
  const [isFullscreenViewport, setIsFullscreenViewport] = useState(false)
  const [youtubeFullscreen, setYoutubeFullscreen] = useState(false)
  const [youtubePlaylistExpanded, setYoutubePlaylistExpanded] = useState(false)

  const ambientRef = useRef(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event) => {
    setDraggingWidget(event.active.id);
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const activeContainer = layout.left.includes(activeId) ? "left" : "right";
    const overContainer = layout.left.includes(overId) ? "left" : layout.right.includes(overId) ? "right" : overId;

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return;
    }

    setLayout((prev) => {
      const activeItems = prev[activeContainer];
      const overItems = prev[overContainer];
      const activeIndex = activeItems.indexOf(activeId);
      const overIndex = overItems.indexOf(overId);

      let newIndex;
      if (overId in prev) { // dropped on empty column
        newIndex = overItems.length + 1;
      } else {
        const isBelowOverItem = over && active.rect.current.translated && active.rect.current.translated.top > over.rect.top + over.rect.height;
        const modifier = isBelowOverItem ? 1 : 0;
        newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
      }

      return {
        ...prev,
        [activeContainer]: activeItems.filter((item) => item !== activeId),
        [overContainer]: [
          ...overItems.slice(0, newIndex),
          activeItems[activeIndex],
          ...overItems.slice(newIndex, overItems.length),
        ],
      };
    });
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setDraggingWidget(null);
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const activeContainer = layout.left.includes(activeId) ? "left" : "right";
    const overContainer = layout.left.includes(overId) ? "left" : layout.right.includes(overId) ? "right" : overId;

    if (activeContainer && overContainer && activeContainer === overContainer) {
      const activeIndex = layout[activeContainer].indexOf(activeId);
      const overIndex = layout[overContainer].indexOf(overId);

      if (activeIndex !== overIndex) {
        const newLayout = {
          ...layout,
          [overContainer]: arrayMove(layout[overContainer], activeIndex, overIndex),
        };
        setLayout(newLayout);
        saveWidgetLayout(newLayout);
      } else {
        saveWidgetLayout(layout);
      }
    } else {
       saveWidgetLayout(layout);
    }
  };

  const setVideoId = useCallback((id) => {
    setVideoIdState(id)
    if (typeof window !== "undefined") {
      localStorage.setItem("idle-youtube", id)
    }
  }, [])

  const currentHour = coarseTime.getHours()
  const isNightMode = currentHour >= 0 && currentHour < 7

  useEffect(() => {
    setMounted(true)
    const savedLayout = getWidgetLayout()
    const migrateProgress = (col) => col.map(id => {
      if (id === "progress") return "progress-bars"
      if (id === "analog-clock" || id === "digital-clock") return "clock"
      return id
    })
    savedLayout.left = migrateProgress(savedLayout.left)
    savedLayout.right = migrateProgress(savedLayout.right)
    if (!savedLayout.left.includes("youtube") && !savedLayout.right.includes("youtube")) {
      savedLayout.left.push("youtube")
      saveWidgetLayout(savedLayout)
    }
    setLayout(savedLayout)

    const savedVideo = localStorage.getItem("idle-youtube")
    if (savedVideo) {
      setVideoIdState(savedVideo)
    }

    // Load visual settings
    const savedSettings = getSettings()
    setBackgroundType(savedSettings.backgroundType)
    setCustomBgColor(savedSettings.customBgColor)
    setCentralClockType(savedSettings.centralClockType || 'digital')
    setShowSeconds(savedSettings.showSeconds ?? true)
    setWidgetShowSeconds(savedSettings.widgetShowSeconds ?? true)
    setWidgetClockStyle(savedSettings.widgetClockStyle || 'analog')
    setWeatherShowLocation(savedSettings.weatherShowLocation ?? true)
    setWeatherShowStats(savedSettings.weatherShowStats ?? true)
    setChimeEnabled(savedSettings.chimeEnabled ?? true)
    setChimeSilentFrom(savedSettings.chimeSilentFrom ?? 0)
    setChimeSilentTo(savedSettings.chimeSilentTo ?? 7)
    setChimeSoundType(savedSettings.chimeSoundType || 'chime')
    setAlarmSoundType(savedSettings.alarmSoundType || 'beep')
    setTimerSoundType(savedSettings.timerSoundType || 'beep')

    // Apply saved theme
    const themes = THEME_CONFIG[savedSettings.backgroundType] || THEME_CONFIG['particles']
    const savedTheme = themes.find(t => t.name === savedSettings.themeName) || themes[0]
    if (savedTheme) {
      applyTheme(savedTheme, false) // false to avoid redundant save during load
    }
  }, [])

  const handlePomodoroComplete = useCallback(() => {
    setPomodoroRefresh((prev) => prev + 1)
  }, [])

  const handleHourlyChime = useCallback(() => {
    setHourlyPulse(true)
    setTimeout(() => setHourlyPulse(false), 2000)
  }, [])

  const handleFocusToggle = useCallback(() => {
    setIsFocusMode(prev => !prev)
  }, [])

  const handlePomodoroActive = useCallback((active) => {
    if (ambientRef.current) {
      if (active) {
        ambientRef.current.autoPlay()
        setIsAmbientActive(true)
      } else {
        ambientRef.current.autoPause()
        setIsAmbientActive(false)
      }
    }
  }, [])

 
  const handleRemoveWidget = useCallback((widgetId) => {
    const newLayout = {
      left: layout.left.filter(id => id !== widgetId),
      right: layout.right.filter(id => id !== widgetId)
    }
    setLayout(newLayout)
    saveWidgetLayout(newLayout)
  }, [layout])

  const handleAddWidget = useCallback((widgetId) => {
    const targetColumn = layout.left.length <= layout.right.length ? "left" : "right"
    const newLayout = { ...layout, [targetColumn]: [...layout[targetColumn], widgetId] }
    setLayout(newLayout)
    saveWidgetLayout(newLayout)
  }, [layout])

  const applyTheme = (theme, shouldSave = true) => {
    document.documentElement.style.setProperty('--primary', theme.primary)
    document.documentElement.style.setProperty('--accent', theme.accent)
    document.documentElement.style.setProperty('--ring', theme.primary)
    const isLight = theme.primary === '#ffffff' || theme.primary === 'white'
    document.documentElement.style.setProperty('--primary-foreground', isLight ? '#000000' : '')
    if (theme.bg) setCustomBgColor(theme.bg)
    if (theme.particleColor) setParticleColor(theme.particleColor)
    if (theme.particleBg) setParticleBgColor(theme.particleBg)

    if (shouldSave) {
      saveSettings({
        themeName: theme.name,
        backgroundType: backgroundType,
        customBgColor: theme.bg || customBgColor,
        centralClockType: centralClockType
      })
    }
  }



  const cardClass = isNightMode
    ? "p-4 bg-black/60 backdrop-blur-sm border-border/50 transition-colors duration-500"
    : "p-4 bg-card/80 backdrop-blur-sm border-border transition-colors duration-500"

  const state = {
    pomodoroRefresh,
    handlePomodoroComplete,
    isFocusMode,
    handleFocusToggle,
    handlePomodoroActive,
    ambientRef,
    videoId,
    setVideoId,
    isVideoBackground,
    setIsVideoBackground,
    showSeconds,
    widgetShowSeconds,
    widgetClockStyle,
    weatherShowLocation,
    weatherShowStats,
    alarmSoundType,
    timerSoundType,
    isFullscreenViewport,
    setIsFullscreenViewport,
    youtubePlaylistExpanded,
    setYoutubePlaylistExpanded
  }

  const renderWidget = (widgetId, index, column, isOverlay = false) => {
    const widgetConfig = widgetComponents[widgetId]
    if (!widgetConfig) return null

    const isHidden = !isOverlay && youtubePlaylistExpanded && widgetId !== 'youtube' && layout[column].includes('youtube');
    const finalCardClass = `${cardClass} ${isHidden ? "hidden" : ""}`;

    if (widgetId === 'pomodoro') {
      return (
        <DraggableWidget
          key={widgetId}
          id={widgetId}
          cardClass={finalCardClass}
          isDraggable={isCustomizationMode}
          animationDelay={100 + index * 50}
          isOverlay={isOverlay}
        >
          <FocusLauncherWidget onFocusToggle={state.handleFocusToggle} label={t.focus.enter} />
        </DraggableWidget>
      )
    }

    const Component = widgetConfig.component
    const props = widgetConfig.props(state)

    return (
      <DraggableWidget
        key={widgetId}
        id={widgetId}
        cardClass={finalCardClass}
        onRemove={isCustomizationMode ? handleRemoveWidget : undefined}
        isDraggable={isCustomizationMode}
        animationDelay={100 + index * 50}
        isOverlay={isOverlay}
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
      case 'solid': return null
      case 'particles':
      default: return <ParticlesBg particleColor={particleColor} />
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen animated-bg flex items-center justify-center">
        <div className="text-primary text-2xl font-mono animate-pulse">{t.loading}</div>
      </div>
    )
  }

  return (
    <div
      className={`h-screen overflow-hidden w-full flex flex-col items-center justify-center relative transition-colors duration-1000 ${isNightMode ? "bg-black" : "animated-bg"}`}
      style={backgroundType === 'solid' ? { backgroundColor: customBgColor } : backgroundType === 'particles' ? { backgroundColor: particleBgColor } : {}}
      onMouseMove={() => setShowUI(true)}
      onMouseLeave={() => setShowUI(false)}
    >
      {renderBackground()}
      <Toaster />
      <GlobalTimerIndicator />
      <div className="hidden"><AmbientSounds ref={ambientRef} /></div>
      <HourlyChimeBoundary enabled={chimeEnabled} silentFrom={chimeSilentFrom} silentTo={chimeSilentTo} soundType={chimeSoundType} onChime={handleHourlyChime} />

      {/* Buttons to toggle Drawer and Sidebars */}
      {!isCustomizationMode && !isFullscreenViewport && !isFocusMode && (
        <div className={`absolute top-6 right-6 flex items-center gap-4 transition-all duration-500 z-50 ${showUI ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"}`}>
          <button
            onClick={() => setHideSidebars(!hideSidebars)}
            className="px-4 py-2 bg-card/80 backdrop-blur-md border border-border rounded-full shadow-lg hover:scale-105 transition-transform group flex items-center justify-center"
            title={hideSidebars ? t.settings.showSidebars : t.settings.hideSidebars}
          >
            {hideSidebars ? <LayoutTemplate className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" /> : <EyeOff className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />}
          </button>
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="px-4 py-2 bg-card/80 backdrop-blur-md border border-border rounded-full shadow-lg hover:scale-105 transition-transform group flex items-center justify-center"
            title={t.settings.settingsTitle}
          >
            <Settings2 className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </button>
        </div>
      )}

      {/* Button to finish Customization Mode */}
      {isCustomizationMode && (
        <button
          onClick={() => setIsCustomizationMode(false)}
          className="absolute top-6 right-6 px-4 py-2 bg-primary text-primary-foreground backdrop-blur-md border border-border rounded-full shadow-lg hover:scale-105 transition-transform z-50 group flex items-center gap-2"
          title={t.settings.finishEditing}
        >
          <Check className="w-5 h-5" /> {t.settings.finishEditing}
        </button>
      )}

      <SettingsDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        backgroundType={backgroundType} setBackgroundType={setBackgroundType}
        customBgColor={customBgColor} setCustomBgColor={setCustomBgColor}
        particleColor={particleColor} setParticleColor={setParticleColor}
        particleBgColor={particleBgColor} setParticleBgColor={setParticleBgColor}
        centralClockType={centralClockType} setCentralClockType={setCentralClockType}
        widgetClockStyle={widgetClockStyle} setWidgetClockStyle={setWidgetClockStyle}
        showSeconds={showSeconds} setShowSeconds={setShowSeconds}
        widgetShowSeconds={widgetShowSeconds} setWidgetShowSeconds={setWidgetShowSeconds}
        weatherShowLocation={weatherShowLocation} setWeatherShowLocation={setWeatherShowLocation}
        weatherShowStats={weatherShowStats} setWeatherShowStats={setWeatherShowStats}
        chimeEnabled={chimeEnabled} setChimeEnabled={setChimeEnabled}
        chimeSoundType={chimeSoundType} setChimeSoundType={setChimeSoundType}
        chimeSilentFrom={chimeSilentFrom} setChimeSilentFrom={setChimeSilentFrom}
        chimeSilentTo={chimeSilentTo} setChimeSilentTo={setChimeSilentTo}
        alarmSoundType={alarmSoundType} setAlarmSoundType={setAlarmSoundType}
        timerSoundType={timerSoundType} setTimerSoundType={setTimerSoundType}
        layout={layout} setLayout={setLayout}
        setIsCustomizationMode={setIsCustomizationMode}
        applyTheme={applyTheme}
        handleAddWidget={handleAddWidget}
      />

      <div className={`w-full relative z-10 h-full flex transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${isCustomizationMode ? "scale-95" : ""}`}>
        {/* === MODO NORMAL === */}
        <div className={`absolute inset-0 w-full h-full flex flex-col items-center justify-center transition-all duration-700 ease-out ${isFocusMode ? "opacity-0 scale-[0.97] pointer-events-none" : "opacity-100 scale-100"}`}>
          {/* Main Content Area */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className={`relative z-10 w-full h-full flex items-center justify-center pointer-events-none p-8`}>
              <div className={`w-full flex gap-4 h-full pt-24 pb-8 transition-all duration-700 pointer-events-auto ${videoId && !isVideoBackground ? "max-w-[1800px] px-4" : "max-w-[1400px] px-8"}`}>

              {/* Columna izquierda */}
              <div className={`transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${hideSidebars ? "-translate-x-[150%] opacity-0 pointer-events-none" : "translate-x-0 opacity-100"}`}>
                <AutoFitColumn
                  id="left"
                  items={layout.left}
                  isCustomizationMode={isCustomizationMode}
                  position="left"
                >
                  {layout.left.map((widgetId, index) => renderWidget(widgetId, index, "left"))}
                </AutoFitColumn>
              </div>

              {/* Centro - Reloj principal / Youtube */}
              <div className="flex-1 flex flex-col items-center justify-center">

                {videoId && (
                  <div className={
                    isVideoBackground
                      ? "fixed w-0 h-0 opacity-0 pointer-events-none"
                      : isFullscreenViewport
                        ? "fixed inset-0 z-[100] w-full h-full bg-black flex items-center justify-center"
                        : "w-full max-w-6xl xl:max-w-7xl aspect-video rounded-3xl overflow-hidden shadow-2xl relative z-20 group"
                  }>
                    {!isVideoBackground && (
                      <div className={`absolute top-4 right-4 z-[110] flex items-center gap-2 transition-opacity ${isFullscreenViewport ? "opacity-100 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-2xl" : "opacity-0 group-hover:opacity-100"}`}>
                        {isFullscreenViewport && (
                           <div className="text-white/90 font-mono text-sm font-medium mr-2">
                             <CompactClock />
                           </div>
                        )}
                        <button onClick={() => setIsFullscreenViewport(!isFullscreenViewport)} className="bg-black/50 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-sm transition-colors" title="Pantalla completa en ventana">
                          {isFullscreenViewport ? <Minimize className="w-4 h-4" /> : <Maximize className="w-5 h-5" />}
                        </button>
                        <button onClick={() => { setVideoId(""); setIsVideoBackground(false); setIsFullscreenViewport(false); }} className="bg-black/50 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-sm transition-colors" title="Cerrar video">
                          <X className={isFullscreenViewport ? "w-4 h-4" : "w-5 h-5"} />
                        </button>
                      </div>
                    )}
                    <iframe
                      id="main-youtube-frame"
                      src={`https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1`}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                      allowFullScreen
                      className={isFullscreenViewport ? "w-full h-full" : "absolute inset-0 w-full h-full"}
                    ></iframe>
                  </div>
                )}

                {(!videoId || isVideoBackground) && centralClockType !== 'hidden' ? (
                  <CentralClock type={centralClockType} showSeconds={showSeconds} isFocusMode={isFocusMode} hourlyPulse={hourlyPulse} backgroundType={backgroundType} />
                ) : null}
              </div>

              {/* Columna derecha */}
              <div className={`transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${hideSidebars ? "translate-x-[150%] opacity-0 pointer-events-none" : "translate-x-0 opacity-100"} ${isCustomizationMode ? "min-w-[280px]" : ""}`}>
                <AutoFitColumn
                  id="right"
                  items={layout.right}
                  isCustomizationMode={isCustomizationMode}
                  position="right"
                >
                  {layout.right.map((widgetId, index) => renderWidget(widgetId, index, "right"))}
                </AutoFitColumn>
              </div>

            </div>
          </div>
            
          <DragOverlay dropAnimation={{
              duration: 250,
              easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
          }}>
            {draggingWidget ? renderWidget(draggingWidget, 0, layout.left.includes(draggingWidget) ? 'left' : 'right', true) : null}
          </DragOverlay>
            
          </DndContext>
        </div>

        {/* === ZEN FOCUS MODE === */}
        <div className={`absolute inset-0 w-full h-full flex flex-col items-center justify-center transition-opacity duration-500 ease-out ${isFocusMode ? "opacity-100 animate-slide-up" : "opacity-0 pointer-events-none"}`}>
          {/* Header — always slightly visible (opacity-20) to give a hint */}
          <div className={`absolute top-8 left-0 right-0 flex items-center justify-between px-8 transition-all duration-500 z-10 ${showUI ? "opacity-100" : "opacity-20"}`}>
            <span className="text-sm font-mono text-muted-foreground/40"><CompactClock /></span>
            <button
              onClick={() => setIsFocusMode(false)}
              className="text-xs text-muted-foreground/40 hover:text-foreground transition-colors"
            >
              {t.focus.exit}
            </button>
          </div>

          {/* Center: timer only — no cards, no chrome */}
          <div className="flex flex-col items-center justify-center">
            <PomodoroTimer onPomodoroComplete={handlePomodoroComplete} onPomodoroActive={handlePomodoroActive} isFocusMode={true} showControls={showUI} />
          </div>

          {/* Ambient toggle — visible on mouse move */}
          <div className={`absolute bottom-8 transition-all duration-500 z-10 ${showUI ? "opacity-100" : "opacity-0"}`}>
            <button
              onClick={() => {
                if (isAmbientActive) {
                  ambientRef.current?.autoPause()
                  setIsAmbientActive(false)
                } else {
                  ambientRef.current?.autoPlay()
                  setIsAmbientActive(true)
                }
              }}
              className="flex items-center gap-2 px-3 py-2 text-muted-foreground/30 hover:text-foreground transition-colors"
            >
              {isAmbientActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span className="text-xs">{t.ambient.title}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

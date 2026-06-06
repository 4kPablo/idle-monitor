"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { getSettings, saveSettings } from "@/lib/settings-store"

const translations = {
  es: {
    // Settings drawer
    settings: {
      title: "Personalización",
      description: "Configura el aspecto visual, añade widgets o reordénalos.",
      editWidgets: "Editar Widgets",
      finishEditing: "Terminar Edición",
      themes: "Temas (Ajustados al Fondo)",
      backgrounds: "Fondos",
      centralClockType: "Tipo de Reloj Central",
      widgetClockStyle: "Estilo de Widget Reloj",
      digital: "Digital",
      analog: "Analógico",
      hidden: "Oculto",
      hourlyChime: "Sonido por Hora",
      enabled: "Activado",
      sound: "Sonido",
      silenceFrom: "Silencio desde",
      silenceTo: "Silencio hasta",
      alarmAndTimer: "Sonidos de Alarma y Timer",
      alarm: "Alarma",
      timer: "Timer",
      widgetSettings: "Ajustes de Widgets",
      secondsCentralClock: "Segundos en Reloj Central",
      secondsWidgetClock: "Segundos en Widget Reloj",
      showLocation: "Mostrar Ubicación (Clima)",
      showDetails: "Mostrar Detalles (Clima)",
      addWidget: "Agregar Widget",
      allWidgetsUsed: "Todos los widgets en uso",
      data: "Datos",
      export: "Exportar",
      import: "Importar",
      language: "Idioma",
      showSidebars: "Mostrar paneles laterales",
      hideSidebars: "Ocultar paneles laterales",
      settingsTitle: "Ajustes y Personalización",
    },
    // Widget names
    widgets: {
      clock: "Reloj",
      calendar: "Calendario",
      ambient: "Ambiente",
      weather: "Clima",
      pomodoro: "Focus",
      "tech-news": "Noticias Tech",
      "progress-bars": "Progreso",
      youtube: "YouTube",
      "quick-links": "Links Rápidos",
      "task-list": "Tareas",
      "ai-news": "Resumen IA",
    },
    // Background options
    backgrounds: {
      particles: "Partículas",
      "gradient-aurora": "Aurora",
      "gradient-forest": "Bosque",
      grid: "Retro Grid",
      space: "Espacio",
      solid: "Sólido",
    },
    // Focus mode
    focus: {
      enter: "Entrar a Focus",
      exit: "Salir del Modo Focus",
      active: "Focus Activo",
    },
    // Loading
    loading: "Cargando...",
    // Toast messages
    toast: {
      importSuccess: "Configuración importada exitosamente. Recargando...",
      importError: "Error al importar: archivo inválido",
    },
    // Weather widget
    weather: {
      title: "Clima",
      search: "Buscar ciudad...",
      searchBtn: "Buscar",
      refresh: "Actualizar clima",
      hourlyForecast: "Ver pronóstico por horas",
      nextHours: "Próximas horas",
      max: "Máxima",
      min: "Mínima",
      humidity: "Humedad",
      wind: "Viento",
      noData: "No hay datos",
    },
    // Tech news widget
    techNews: {
      title: "Tech News",
      loading: "Cargando...",
      noNews: "Sin noticias",
      loadError: "Error al cargar noticias",
    },
    // Task list widget
    tasks: {
      title: "Tareas",
      placeholder: "Nueva tarea...",
      add: "Agregar",
      empty: "Sin tareas pendientes",
      delete: "Eliminar",
      reminderTitle: "Recordatorio de Tarea",
      addReminder: "Añadir recordatorio",
      selectDate: "Seleccionar fecha",
    },
    // Progress bars widget
    progress: {
      title: "Progreso",
      day: "Día",
      week: "Semana",
      month: "Mes",
      year: "Año",
    },
    // YouTube widget
    youtube: {
      title: "YouTube",
      placeholder: "Enlace de YouTube...",
      play: "Reproducir",
      save: "Guardar",
      pause: "Pausar",
      bgPlay: "Reproduciendo en segundo plano",
      fgPlay: "Reproduciendo en primer plano",
      noVideos: "No hay videos guardados",
      rename: "Renombrar Video",
      newTitle: "Nuevo título",
      cancel: "Cancelar",
      saveBtn: "Guardar",
      close: "Cerrar video",
      fullscreen: "Pantalla completa en ventana",
      background: "Reproducir en segundo plano",
      foreground: "Volver a primer plano",
      playlist: "Lista de reproducción",
      videosCount_one: "video guardado",
      videosCount_other: "videos guardados",
      fetchLoading: "Obteniendo información del video...",
      fetchSuccess: "Guardado:",
      fetchError: "Video guardado (sin título original)",
      deleteMsg: "Video eliminado",
      undoDelete: "Deshacer",
      renameSuccess: "Nombre actualizado",
      channel: "Canal:",
      addedOn: "Añadido el:",
      defaultTitle: "Video Guardado",
      delete: "Eliminar",
    },
    // Month calendar
    calendar: {
      title: "Calendario",
      today: "Hoy",
      pomodoros: "pomodoros",
      months: ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"],
      weekdays: ["Do","Lu","Ma","Mi","Ju","Vi","Sá"],
      manualEntry: "Registrar actividad manual",
      activity: "Actividad",
      minutes: "Minutos",
      saveLog: "Guardar Registro",
      deleteActivity: "Eliminar actividad",
    },
    // Ambient sounds
    ambient: {
      title: "Sonidos Ambiente",
      rain: "Lluvia",
      fire: "Fuego",
      coffee: "Café",
      waves: "Olas",
      wind: "Viento",
      forest: "Bosque",
      volume: "Volumen",
      theta: "Theta",
      thetaSub: "4–8 Hz · Meditación",
      alpha: "Alpha",
      alphaSub: "8–12 Hz · Enfoque",
      beta: "Beta",
      betaSub: "12–30 Hz · Alerta",
      brown: "Marrón",
      brownSub: "Ruido de fondo",
      forestSub: "Ambiente natural",
      headphones: "🎧 Mejor efecto con auriculares",
    },
    // Pomodoro
    pomodoro: {
      study: "Estudiar",
      exercise: "Ejercitar",
      draw: "Dibujar",
      manage: "Administrar actividades",
      newActivity: "Nueva actividad",
      name: "Nombre",
      mode: "Modo",
      color: "Color",
      icon: "Ícono",
      save: "Guardar",
      pomodoro: "Pomodoro",
      timerMode: "Timer",
      stopwatch: "Cronómetro",
      break: "Descanso",
      activityName: "Nombre de la actividad",
      pomodoroComplete: "Pomodoro completado",
      breakTime: "Tiempo de descanso.",
      breakDone: "Descanso terminado",
      backToWork: "Volver al trabajo.",
      timerDone: "Temporizador terminado",
      timeUp: "El tiempo ha finalizado.",
      skipBreak: "Saltear descanso",
      cancel: "Cancelar",
      icons: {
        BookOpen: "Libro",
        Dumbbell: "Pesas",
        Pencil: "Lápiz",
        Code: "Código",
        Music: "Música",
        Bike: "Bici",
        Coffee: "Café",
        Heart: "Salud",
        Star: "Meta",
        Zap: "Energía",
        Moon: "Descanso",
      },
    },
    // Digital clock
    clock: {
      alarm: "Alarma",
      timer: "Temporizador",
      alarmSet: "Alarma configurada",
      alarmCancelled: "Alarma cancelada",
      alarmRing: "¡La alarma ha sonado!",
      dismiss: "Cerrar",
      timerDone: "Temporizador finalizado",
      setTime: "Configurar hora",
      start: "Iniciar",
      stop: "Detener",
      reset: "Reiniciar",
      stopAlarm: "Apagar Alarma",
      deactivateAlarm: "Desactivar Alarma",
      activateAlarm: "Activar Alarma",
    },
    // Quick links
    quickLinks: {
      title: "Links Rápidos",
      add: "Agregar",
      placeholder: "URL...",
      namePlaceholder: "Nombre...",
      edit: "Editar",
      delete: "Eliminar",
      empty: "No hay accesos rápidos",
    },
    // AI News Summary
    aiNews: {
      title: "Resumen IA",
      refresh: "Actualizar resumen",
      generatedBy: "Generado por Gemini AI",
    },
    // General date formatting locale
    dateLocale: "es-ES",
  },
  en: {
    // Settings drawer
    settings: {
      title: "Customization",
      description: "Configure the visual appearance, add widgets or reorder them.",
      editWidgets: "Edit Widgets",
      finishEditing: "Done Editing",
      themes: "Themes (Adjusted to Background)",
      backgrounds: "Backgrounds",
      centralClockType: "Central Clock Type",
      widgetClockStyle: "Clock Widget Style",
      digital: "Digital",
      analog: "Analog",
      hidden: "Hidden",
      hourlyChime: "Hourly Chime",
      enabled: "Enabled",
      sound: "Sound",
      silenceFrom: "Silence from",
      silenceTo: "Silence until",
      alarmAndTimer: "Alarm & Timer Sounds",
      alarm: "Alarm",
      timer: "Timer",
      widgetSettings: "Widget Settings",
      secondsCentralClock: "Seconds on Central Clock",
      secondsWidgetClock: "Seconds on Clock Widget",
      showLocation: "Show Location (Weather)",
      showDetails: "Show Details (Weather)",
      addWidget: "Add Widget",
      allWidgetsUsed: "All widgets in use",
      data: "Data",
      export: "Export",
      import: "Import",
      language: "Language",
      showSidebars: "Show side panels",
      hideSidebars: "Hide side panels",
      settingsTitle: "Settings & Customization",
    },
    // Widget names
    widgets: {
      clock: "Clock",
      calendar: "Calendar",
      ambient: "Ambient",
      weather: "Weather",
      pomodoro: "Focus",
      "tech-news": "Tech News",
      "progress-bars": "Progress",
      youtube: "YouTube",
      "quick-links": "Quick Links",
      "task-list": "Tasks",
      "ai-news": "AI Summary",
    },
    // Background options
    backgrounds: {
      particles: "Particles",
      "gradient-aurora": "Aurora",
      "gradient-forest": "Forest",
      grid: "Retro Grid",
      space: "Space",
      solid: "Solid",
    },
    // Focus mode
    focus: {
      enter: "Enter Focus Mode",
      exit: "Exit Focus Mode",
      active: "Focus Active",
    },
    // Loading
    loading: "Loading...",
    // Toast messages
    toast: {
      importSuccess: "Settings imported successfully. Reloading...",
      importError: "Import error: invalid file",
    },
    // Weather widget
    weather: {
      title: "Weather",
      search: "Search city...",
      searchBtn: "Search",
      refresh: "Refresh weather",
      hourlyForecast: "See hourly forecast",
      nextHours: "Next hours",
      max: "High",
      min: "Low",
      humidity: "Humidity",
      wind: "Wind",
      noData: "No data",
    },
    // Tech news widget
    techNews: {
      title: "Tech News",
      loading: "Loading...",
      noNews: "No news",
      loadError: "Error loading news",
    },
    // Task list widget
    tasks: {
      title: "Tasks",
      placeholder: "New task...",
      add: "Add",
      empty: "No pending tasks",
      delete: "Delete",
      reminderTitle: "Task Reminder",
      addReminder: "Add reminder",
      selectDate: "Select date",
    },
    // Progress bars widget
    progress: {
      title: "Progress",
      day: "Day",
      week: "Week",
      month: "Month",
      year: "Year",
    },
    // YouTube widget
    youtube: {
      title: "YouTube",
      placeholder: "YouTube link...",
      play: "Play",
      save: "Save",
      pause: "Pause",
      bgPlay: "Playing in background",
      fgPlay: "Playing in foreground",
      noVideos: "No saved videos",
      rename: "Rename Video",
      newTitle: "New title",
      cancel: "Cancel",
      saveBtn: "Save",
      close: "Close video",
      fullscreen: "Window fullscreen",
      background: "Play in background",
      foreground: "Back to foreground",
      playlist: "Playlist",
      videosCount_one: "saved video",
      videosCount_other: "saved videos",
      fetchLoading: "Fetching video info...",
      fetchSuccess: "Saved:",
      fetchError: "Video saved (without original title)",
      deleteMsg: "Video deleted",
      undoDelete: "Undo",
      renameSuccess: "Name updated",
      channel: "Channel:",
      addedOn: "Added on:",
      defaultTitle: "Saved Video",
      delete: "Delete",
    },
    // Month calendar
    calendar: {
      title: "Calendar",
      today: "Today",
      pomodoros: "pomodoros",
      months: ["January","February","March","April","May","June","July","August","September","October","November","December"],
      weekdays: ["Su","Mo","Tu","We","Th","Fr","Sa"],
      manualEntry: "Log manual activity",
      activity: "Activity",
      minutes: "Minutes",
      saveLog: "Save Log",
      deleteActivity: "Delete activity",
    },
    // Ambient sounds
    ambient: {
      title: "Ambient Sounds",
      rain: "Rain",
      fire: "Fire",
      coffee: "Coffee",
      waves: "Waves",
      wind: "Wind",
      forest: "Forest",
      volume: "Volume",
      theta: "Theta",
      thetaSub: "4–8 Hz · Meditation",
      alpha: "Alpha",
      alphaSub: "8–12 Hz · Focus",
      beta: "Beta",
      betaSub: "12–30 Hz · Alert",
      brown: "Brown",
      brownSub: "Background noise",
      forestSub: "Natural environment",
      headphones: "🎧 Best effect with headphones",
    },
    // Pomodoro
    pomodoro: {
      study: "Study",
      exercise: "Exercise",
      draw: "Draw",
      manage: "Manage activities",
      newActivity: "New activity",
      name: "Name",
      mode: "Mode",
      color: "Color",
      icon: "Icon",
      save: "Save",
      pomodoro: "Pomodoro",
      timerMode: "Timer",
      stopwatch: "Stopwatch",
      break: "Break",
      activityName: "Activity name",
      pomodoroComplete: "Pomodoro complete",
      breakTime: "Time for a break.",
      breakDone: "Break is over",
      backToWork: "Back to work.",
      timerDone: "Timer finished",
      timeUp: "Time is up.",
      skipBreak: "Skip break",
      cancel: "Cancel",
      icons: {
        BookOpen: "Book",
        Dumbbell: "Weights",
        Pencil: "Pencil",
        Code: "Code",
        Music: "Music",
        Bike: "Bike",
        Coffee: "Coffee",
        Heart: "Health",
        Star: "Goal",
        Zap: "Energy",
        Moon: "Rest",
      },
    },
    // Digital clock
    clock: {
      alarm: "Alarm",
      timer: "Timer",
      alarmSet: "Alarm set",
      alarmCancelled: "Alarm cancelled",
      alarmRing: "Alarm is ringing!",
      dismiss: "Dismiss",
      timerDone: "Timer finished",
      setTime: "Set time",
      start: "Start",
      stop: "Stop",
      reset: "Reset",
      stopAlarm: "Stop Alarm",
      deactivateAlarm: "Deactivate Alarm",
      activateAlarm: "Activate Alarm",
    },
    // Quick links
    quickLinks: {
      title: "Quick Links",
      add: "Add",
      placeholder: "URL...",
      namePlaceholder: "Name...",
      edit: "Edit",
      delete: "Delete",
      empty: "No quick links",
    },
    // AI News Summary
    aiNews: {
      title: "AI Summary",
      refresh: "Update summary",
      generatedBy: "Generated by Gemini AI",
    },
    // General date formatting locale
    dateLocale: "en-US",
  },
}

const LanguageContext = createContext({
  lang: "es",
  t: translations.es,
  setLang: () => {},
})

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState("es")

  useEffect(() => {
    const saved = getSettings()
    if (saved.language) {
      setLangState(saved.language)
    } else {
      const browserLang = navigator.language?.startsWith("es") ? "es" : "en"
      setLangState(browserLang)
    }
  }, [])

  const setLang = (newLang) => {
    setLangState(newLang)
    saveSettings({ language: newLang })
  }

  return (
    <LanguageContext.Provider value={{ lang, t: translations[lang], setLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}

export { translations }

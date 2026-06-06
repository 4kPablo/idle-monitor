"use client"

import { toast } from "sonner"
import { Settings2, Palette, X, Image as ImageIcon, Clock, Monitor, EyeOff, Bell, Play, Plus, Download, Upload, LayoutTemplate, Music } from "lucide-react"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer"
import { Switch } from "@/components/ui/switch"
import TimePicker from "@/components/shadcn-studio/date-picker/date-picker-09"
import { useLanguage } from "@/lib/language-context"
import { saveSettings } from "@/lib/settings-store"
import { playChimeSound, playAlarmSound } from "@/components/hourly-chime"
import { THEME_CONFIG, backgroundOptions } from "@/lib/themes"

const widgetNames = {
  clock: "Clock", calendar: "Calendar", ambient: "Ambient",
  weather: "Weather", pomodoro: "Pomodoro", "tech-news": "Tech News",
  "progress-bars": "Progress", youtube: "YouTube", "quick-links": "Quick Links",
  "task-list": "Task List", "ai-news": "AI News",
}

function SectionCard({ icon, title, children }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        {icon}{title}
      </div>
      <div className="bg-secondary/30 p-3 rounded-lg border border-border space-y-3">
        {children}
      </div>
    </div>
  )
}

function ToggleRow({ label, checked, onCheckedChange }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs">{label}</span>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}

function OptionGrid({ options, value, onChange }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`flex items-center justify-center gap-1 text-xs p-2 rounded-md border transition-all ${
            value === opt.value
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-secondary text-secondary-foreground border-transparent hover:bg-secondary/80"
          }`}
        >
          {opt.icon}{opt.label}
        </button>
      ))}
    </div>
  )
}

function SoundSelector({ options, value, onChange, onPlay }) {
  return (
    <div className="flex gap-1">
      {options.map(([val, lbl]) => (
        <div key={val} className="flex-1 flex gap-0.5">
          <button
            onClick={() => onChange(val)}
            className={`flex-1 text-xs py-1.5 rounded-l-md border transition-colors ${
              value === val ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary border-transparent hover:bg-secondary/80'
            }`}
          >
            {lbl}
          </button>
          <button
            onClick={() => onPlay(val)}
            className="px-1.5 py-1.5 bg-secondary/70 hover:bg-secondary border border-transparent rounded-r-md transition-colors text-muted-foreground hover:text-foreground"
          >
            <Play className="w-2.5 h-2.5" />
          </button>
        </div>
      ))}
    </div>
  )
}

export default function SettingsDrawer({
  open, onOpenChange,
  backgroundType, setBackgroundType,
  customBgColor, setCustomBgColor,
  particleColor, setParticleColor,
  particleBgColor, setParticleBgColor,
  centralClockType, setCentralClockType,
  widgetClockStyle, setWidgetClockStyle,
  showSeconds, setShowSeconds,
  widgetShowSeconds, setWidgetShowSeconds,
  weatherShowLocation, setWeatherShowLocation,
  weatherShowStats, setWeatherShowStats,
  chimeEnabled, setChimeEnabled,
  chimeSoundType, setChimeSoundType,
  chimeSilentFrom, setChimeSilentFrom,
  chimeSilentTo, setChimeSilentTo,
  alarmSoundType, setAlarmSoundType,
  timerSoundType, setTimerSoundType,
  layout, setLayout,
  setIsCustomizationMode,
  applyTheme,
  handleAddWidget,
}) {
  const { lang, t, setLang } = useLanguage()
  const currentThemes = THEME_CONFIG[backgroundType] || THEME_CONFIG['particles']

  const availableWidgets = Object.keys(widgetNames).filter(
    id => !layout?.left?.includes(id) && !layout?.right?.includes(id)
  )

  const handleBackgroundChange = (type) => {
    setBackgroundType(type)
    const themes = THEME_CONFIG[type] || THEME_CONFIG['particles']
    if (themes.length > 0) {
      applyTheme(themes[0], false)
      saveSettings({ backgroundType: type, themeName: themes[0].name, customBgColor: themes[0].bg || customBgColor, centralClockType })
    }
  }

  const handleClockTypeChange = (type) => {
    setCentralClockType(type)
    saveSettings({ centralClockType: type })
  }

  const handleExportData = () => {
    const data = {
      settings: localStorage.getItem("comfy-homescreen-settings"),
      layout: localStorage.getItem("comfy-homescreen-widget-layout"),
      pomodoro: localStorage.getItem('homescreen_pomodoros'),
      pomodoroActivityModes: localStorage.getItem('pomodoroActivityModes'),
      pomodoroActivities: localStorage.getItem('pomodoroActivities'),
      youtube: localStorage.getItem('comfy-homescreen-youtube')
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url; a.download = "comfy-homescreen-backup.json"
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImportData = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result)
        if (data.settings) localStorage.setItem("comfy-homescreen-settings", data.settings)
        if (data.layout) localStorage.setItem("comfy-homescreen-widget-layout", data.layout)
        if (data.pomodoro) localStorage.setItem("homescreen_pomodoros", data.pomodoro)
        if (data.pomodoroActivityModes) localStorage.setItem("pomodoroActivityModes", data.pomodoroActivityModes)
        if (data.pomodoroActivities) localStorage.setItem("pomodoroActivities", data.pomodoroActivities)
        if (data.youtube) localStorage.setItem("comfy-homescreen-youtube", data.youtube)
        toast.success(t.toast?.importSuccess || "Datos importados")
        setTimeout(() => window.location.reload(), 1500)
      } catch { toast.error(t.toast?.importError || "Error al importar") }
    }
    reader.readAsText(file)
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="sm:max-w-md w-full h-full border-l">
        <div className="mx-auto w-full max-w-3xl p-6 flex flex-col h-full overflow-hidden">
          <DrawerHeader className="px-0 pt-0 pb-3 border-b border-border/50 flex flex-row items-center justify-between flex-shrink-0">
            <div>
              <DrawerTitle className="text-xl flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-primary" /> {t.settings?.title || "Settings"}
              </DrawerTitle>
              <DrawerDescription>{t.settings?.description || "Customize your dashboard"}</DrawerDescription>
            </div>
            <button onClick={() => onOpenChange(false)} className="p-2 hover:bg-secondary rounded-full transition-colors text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </DrawerHeader>

          <div className="flex flex-col gap-5 overflow-y-auto flex-1 pb-6 mt-5 pr-1">

            <SectionCard icon={<span className="text-sm">🌐</span>} title={t.settings?.language || "Idioma"}>
              <div className="flex gap-2">
                {[{ code: 'es', flag: '🇦🇷', label: 'Español' }, { code: 'en', flag: '🇺🇸', label: 'English' }].map(({ code, flag, label }) => (
                  <button key={code} onClick={() => setLang(code)}
                    className={`flex items-center gap-2 flex-1 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                      lang === code ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary text-secondary-foreground border-transparent hover:bg-secondary/80'
                    }`}
                  >
                    <span className="text-base">{flag}</span> {label}
                  </button>
                ))}
              </div>
            </SectionCard>

            <SectionCard icon={<Palette className="w-3.5 h-3.5" />} title={t.settings?.themes || "Temas"}>
              <div className="flex gap-2 flex-wrap">
                {currentThemes.map((theme) => (
                  <button key={theme.name} onClick={() => applyTheme(theme)}
                    className="w-8 h-8 rounded-full border-2 border-border hover:scale-110 transition-transform shadow-sm"
                    style={{ background: theme.primary }} title={theme.name}
                  />
                ))}
              </div>
            </SectionCard>

            <SectionCard icon={<ImageIcon className="w-3.5 h-3.5" />} title={t.settings?.backgrounds || "Fondos"}>
              <div className="grid grid-cols-3 gap-2">
                {backgroundOptions.map((bg) => (
                  <button key={bg.id} onClick={() => handleBackgroundChange(bg.id)}
                    className={`text-xs p-2 rounded-md border transition-all ${
                      backgroundType === bg.id ? "bg-primary text-primary-foreground border-primary" : "bg-secondary text-secondary-foreground border-transparent hover:bg-secondary/80"
                    }`}
                  >
                    {t.backgrounds?.[bg.id] || bg.name}
                  </button>
                ))}
              </div>
            </SectionCard>

            <SectionCard icon={<Clock className="w-3.5 h-3.5" />} title={t.settings?.centralClockType || "Reloj central"}>
              <OptionGrid
                options={[
                  { value: 'digital', icon: <Monitor className="w-3 h-3" />, label: t.settings?.digital || "Digital" },
                  { value: 'analog', icon: <Clock className="w-3 h-3" />, label: t.settings?.analog || "Analógico" },
                  { value: 'hidden', icon: <EyeOff className="w-3 h-3" />, label: t.settings?.hidden || "Oculto" },
                ]}
                value={centralClockType}
                onChange={handleClockTypeChange}
              />
            </SectionCard>

            <SectionCard icon={<Clock className="w-3.5 h-3.5" />} title={t.settings?.widgetClockStyle || "Reloj widget"}>
              <OptionGrid
                options={[
                  { value: 'digital', icon: <Monitor className="w-3 h-3" />, label: t.settings?.digital || "Digital" },
                  { value: 'analog', icon: <Clock className="w-3 h-3" />, label: t.settings?.analog || "Analógico" },
                ]}
                value={widgetClockStyle}
                onChange={(v) => { setWidgetClockStyle(v); saveSettings({ widgetClockStyle: v }) }}
              />
            </SectionCard>

            <SectionCard icon={<Bell className="w-3.5 h-3.5" />} title={t.settings?.hourlyChime || "Campanada"}>
              <ToggleRow label={t.settings?.enabled || "Activado"} checked={chimeEnabled}
                onCheckedChange={(v) => { setChimeEnabled(v); saveSettings({ chimeEnabled: v }) }}
              />
              {chimeEnabled && (
                <>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">{t.settings?.sound || "Sonido"}</span>
                    <SoundSelector
                      options={[['chime', 'Campana'], ['bell', 'Timbre'], ['digital', 'Digital']]}
                      value={chimeSoundType}
                      onChange={(v) => { setChimeSoundType(v); saveSettings({ chimeSoundType: v }) }}
                      onPlay={playChimeSound}
                    />
                  </div>
                  <div className="flex gap-3">
                    <TimePicker id="chime-silent-from" label={t.settings?.silenceFrom || "Silenciar desde"}
                      value={`${String(chimeSilentFrom).padStart(2,'0')}:00`}
                      onChange={v => { const h = parseInt(v.split(':')[0]); setChimeSilentFrom(h); saveSettings({ chimeSilentFrom: h }) }}
                    />
                    <TimePicker id="chime-silent-to" label={t.settings?.silenceTo || "Silenciar hasta"}
                      value={`${String(chimeSilentTo).padStart(2,'0')}:00`}
                      onChange={v => { const h = parseInt(v.split(':')[0]); setChimeSilentTo(h); saveSettings({ chimeSilentTo: h }) }}
                    />
                  </div>
                </>
              )}
            </SectionCard>

            <SectionCard icon={<Music className="w-3.5 h-3.5" />} title={t.settings?.alarmAndTimer || "Alarma y Timer"}>
              <div className="space-y-2">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">{t.settings?.alarm || "Alarma"}</span>
                  <SoundSelector options={[['beep', 'Beep'], ['siren', 'Sirena'], ['chime', 'Campana']]}
                    value={alarmSoundType} onChange={(v) => { setAlarmSoundType(v); saveSettings({ alarmSoundType: v }) }}
                    onPlay={playAlarmSound} />
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">{t.settings?.timer || "Timer"}</span>
                  <SoundSelector options={[['beep', 'Beep'], ['siren', 'Sirena'], ['chime', 'Campana']]}
                    value={timerSoundType} onChange={(v) => { setTimerSoundType(v); saveSettings({ timerSoundType: v }) }}
                    onPlay={playAlarmSound} />
                </div>
              </div>
            </SectionCard>

            <SectionCard icon={<Settings2 className="w-3.5 h-3.5" />} title={t.settings?.widgetSettings || "Widgets"}>
              <ToggleRow label={t.settings?.secondsCentralClock || "Segundos reloj central"}
                checked={showSeconds} onCheckedChange={(v) => { setShowSeconds(v); saveSettings({ showSeconds: v }) }} />
              <ToggleRow label={t.settings?.secondsWidgetClock || "Segundos reloj widget"}
                checked={widgetShowSeconds} onCheckedChange={(v) => { setWidgetShowSeconds(v); saveSettings({ widgetShowSeconds: v }) }} />
              <ToggleRow label={t.settings?.showLocation || "Mostrar ubicación"}
                checked={weatherShowLocation} onCheckedChange={(v) => { setWeatherShowLocation(v); saveSettings({ weatherShowLocation: v }) }} />
              <ToggleRow label={t.settings?.showDetails || "Mostrar detalles"}
                checked={weatherShowStats} onCheckedChange={(v) => { setWeatherShowStats(v); saveSettings({ weatherShowStats: v }) }} />
            </SectionCard>

            <SectionCard icon={<Plus className="w-3.5 h-3.5" />} title={t.settings?.addWidget || "Añadir widget"}>
              <button onClick={() => setIsCustomizationMode(true)}
                className="w-full text-xs py-2 rounded-lg border border-primary/30 bg-primary/10 hover:bg-primary hover:text-primary-foreground transition-all flex items-center justify-center gap-2 font-medium"
              >
                <LayoutTemplate className="w-3.5 h-3.5" /> {t.settings?.editWidgets || "Editar widgets"}
              </button>
              <div className="flex flex-wrap gap-2">
                {availableWidgets.length > 0 ? availableWidgets.map(widgetId => (
                  <button key={widgetId} onClick={() => handleAddWidget(widgetId)}
                    className="text-xs px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 hover:bg-primary hover:text-primary-foreground transition-colors capitalize flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> {t.widgets?.[widgetId] || widgetNames[widgetId] || widgetId.replace('-', ' ')}
                  </button>
                )) : (
                  <span className="text-xs text-muted-foreground italic">{t.settings?.allWidgetsUsed || "Todos en uso"}</span>
                )}
              </div>
            </SectionCard>

            <SectionCard icon={<Settings2 className="w-3.5 h-3.5" />} title={t.settings?.data || "Datos"}>
              <div className="flex gap-2">
                <button onClick={handleExportData}
                  className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/80 py-2 rounded-md flex items-center justify-center gap-2 transition-colors text-xs font-medium"
                >
                  <Download className="w-3 h-3" /> {t.settings?.export || "Exportar"}
                </button>
                <label className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/80 py-2 rounded-md flex items-center justify-center gap-2 transition-colors text-xs font-medium cursor-pointer mb-0">
                  <Upload className="w-3 h-3" /> {t.settings?.import || "Importar"}
                  <input type="file" accept=".json" className="hidden" onChange={handleImportData} />
                </label>
              </div>
            </SectionCard>

          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

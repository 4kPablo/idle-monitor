"use client"

import React, { useState, useEffect, useRef } from "react"
import { Clock, AlarmClock, Timer, TimerReset, Play, Pause, RotateCcw, Check } from "lucide-react"
import { toast } from "sonner"
import AnalogClock from "./analog-clock"
import { playAlarmSound } from "./hourly-chime"
import TimePicker from "./shadcn-studio/date-picker/date-picker-09"
import { useLanguage } from "@/lib/language-context"

export default function DigitalClockWidget({ time, showSeconds = true, clockStyle = "digital", alarmSoundType = "beep", timerSoundType = "beep" }) {
    const { lang, t } = useLanguage()
    const [mode, setMode] = useState("clock") // clock, alarm, timer, stopwatch

    const [alarmTime, setAlarmTime] = useState("00:00")
    const [alarmActive, setAlarmActive] = useState(false)

    const [timerSeconds, setTimerSeconds] = useState(5 * 60)
    const [timerActive, setTimerActive] = useState(false)
    const [inputMinutes, setInputMinutes] = useState(5)
    const [inputSeconds, setInputSeconds] = useState(0)

    const [stopwatchSeconds, setStopwatchSeconds] = useState(0)
    const [stopwatchActive, setStopwatchActive] = useState(false)

    const timerRef = useRef(null)
    const alarmIntervalRef = useRef(null)

    const triggerAlarm = (soundType) => {
        try {
            if (alarmIntervalRef.current) clearInterval(alarmIntervalRef.current)
            playAlarmSound(soundType)
            alarmIntervalRef.current = setInterval(() => playAlarmSound(soundType), 2000)

            const msg = mode === "alarm" ? t.clock.alarmRing : t.clock.timerDone
            toast(msg, {
                id: "alarm-toast",
                duration: Infinity,
                action: {
                    label: t.clock.stopAlarm || "Apagar Alarma",
                    onClick: () => {
                        if (alarmIntervalRef.current) {
                            clearInterval(alarmIntervalRef.current)
                            alarmIntervalRef.current = null
                        }
                        toast.dismiss("alarm-toast")
                    }
                }
            })
        } catch (e) { }
    }

    useEffect(() => {
        if (alarmActive && alarmTime) {
            const currentFormatted = `${time.getHours().toString().padStart(2, "0")}:${time.getMinutes().toString().padStart(2, "0")}`
            if (currentFormatted === alarmTime && time.getSeconds() === 0) {
                triggerAlarm(alarmSoundType)
                setAlarmActive(false)
            }
        }
    }, [time, alarmActive, alarmTime, alarmSoundType])

    useEffect(() => {
        if (timerActive) {
            timerRef.current = setInterval(() => {
                setTimerSeconds(prev => {
                    if (prev <= 1) {
                        triggerAlarm(timerSoundType)
                        setTimerActive(false)
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
        } else if (stopwatchActive) {
            timerRef.current = setInterval(() => setStopwatchSeconds(prev => prev + 1), 1000)
        }
        return () => clearInterval(timerRef.current)
    }, [timerActive, stopwatchActive, timerSoundType])

    const hours = time.getHours().toString().padStart(2, "0")
    const minutes = time.getMinutes().toString().padStart(2, "0")
    const seconds = time.getSeconds().toString().padStart(2, "0")

    const formatSecs = (s) => {
        const m = Math.floor(s / 60)
        const sec = s % 60
        return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
    }

    const updateTimerFromInputs = (mins, secs) => {
        setTimerSeconds((parseInt(mins || 0) * 60) + parseInt(secs || 0))
    }

    // Timer value as HH:MM:SS duration string
    const timerToValue = (mins, secs) => {
        const h = Math.floor(mins / 60)
        const m = mins % 60
        return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(secs).padStart(2,'0')}`
    }
    const valueToTimer = (v) => {
        const parts = (v || '00:00:00').split(':').map(Number)
        const totalMins = (parts[0] || 0) * 60 + (parts[1] || 0)
        const secs = parts[2] || 0
        setInputMinutes(totalMins)
        setInputSeconds(secs)
        updateTimerFromInputs(totalMins, secs)
    }

    // Alarm time stepper helpers
    const getAlarmParts = () => {
        const [h, m] = (alarmTime || "00:00").split(":").map(Number)
        return { h: isNaN(h) ? 0 : h, m: isNaN(m) ? 0 : m }
    }
    const setAlarmParts = (h, m) => {
        const hh = String(Math.max(0, Math.min(23, h))).padStart(2, '0')
        const mm = String(Math.max(0, Math.min(59, m))).padStart(2, '0')
        setAlarmTime(`${hh}:${mm}`)
    }

    const renderContent = () => {
        if (mode === "clock") {
            if (clockStyle === "analog") {
                return <AnalogClock time={time} hideSeconds={!showSeconds} className="w-full h-full" />
            }
            return (
                <div className="font-mono text-5xl font-bold tracking-tight text-primary drop-shadow-sm flex items-baseline">
                    {hours}:{minutes}
                    {showSeconds && <span className="text-2xl text-muted-foreground ml-1">:{seconds}</span>}
                </div>
            )
        } else if (mode === "alarm") {
            return (
                <div className="flex items-center gap-2">
                    <TimePicker
                        id="alarm-time-picker"
                        value={alarmTime}
                        onChange={(v) => setAlarmTime(v)}
                        className="flex-1"
                        label=""
                    />
                    <button
                        onClick={() => { if (alarmTime) setAlarmActive(!alarmActive) }}
                        className={`p-2 rounded-full transition-colors flex-shrink-0 ${alarmActive ? 'bg-destructive text-destructive-foreground' : 'bg-primary text-primary-foreground'}`}
                        title={alarmActive ? (t.clock.deactivateAlarm || 'Desactivar Alarma') : (t.clock.activateAlarm || 'Activar Alarma')}
                    >
                        {alarmActive ? <AlarmClock className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                    </button>
                </div>
            )
        } else if (mode === "timer") {
            const isInitial = !timerActive && timerSeconds === ((inputMinutes * 60) + parseInt(inputSeconds || 0))
            return (
                <div className="flex flex-col items-center gap-2 w-full">
                    {isInitial || (!timerActive && timerSeconds === 0) ? (
                        <div className="flex items-center justify-center gap-2">
                            <TimePicker
                                id="timer-duration-picker"
                                value={timerToValue(inputMinutes, inputSeconds)}
                                onChange={valueToTimer}
                                showSeconds={true}
                                label=""
                            />
                             <button
                                onClick={() => { updateTimerFromInputs(inputMinutes, inputSeconds); if (inputMinutes || inputSeconds) setTimerActive(true) }}
                                className="p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 flex-shrink-0"
                                title={t.clock.start}
                            >
                                <Play className="w-4 h-4 ml-0.5" />
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="font-mono text-3xl font-bold tracking-tight text-primary">{formatSecs(timerSeconds)}</div>
                            <div className="flex gap-2">
                                <button onClick={() => setTimerActive(!timerActive)} className="p-2 bg-primary/10 text-primary rounded-full hover:bg-primary/20" title={timerActive ? t.clock.stop : t.clock.start}>
                                    {timerActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                                </button>
                                <button onClick={() => { setTimerActive(false); updateTimerFromInputs(inputMinutes, inputSeconds) }} className="p-2 bg-secondary text-muted-foreground rounded-full hover:bg-secondary/80" title={t.clock.reset}>
                                    <RotateCcw className="w-4 h-4" />
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )
        } else if (mode === "stopwatch") {
            return (
                <div className="flex flex-col items-center gap-2 w-full px-4">
                    <div className="font-mono text-3xl font-bold tracking-tight text-primary">{formatSecs(stopwatchSeconds)}</div>
                    <div className="flex gap-2">
                        <button onClick={() => setStopwatchActive(!stopwatchActive)} className="p-2 bg-primary/10 text-primary rounded-full hover:bg-primary/20" title={stopwatchActive ? t.clock.stop : t.clock.start}>
                            {stopwatchActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                        </button>
                        <button onClick={() => { setStopwatchActive(false); setStopwatchSeconds(0) }} className="p-2 bg-secondary text-muted-foreground rounded-full hover:bg-secondary/80" title={t.clock.reset}>
                            <RotateCcw className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )
        }
    }

    return (
        <div className="space-y-2 h-full flex flex-col p-2 relative">
            <div className="flex items-center justify-between w-full">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    {mode === "clock" && <Clock className="w-4 h-4" />}
                    {mode === "alarm" && <AlarmClock className="w-4 h-4" />}
                    {mode === "timer" && <Timer className="w-4 h-4" />}
                    {mode === "stopwatch" && <TimerReset className="w-4 h-4" />}
                    <span className="capitalize hidden sm:inline">
                        {mode === 'clock' ? t.widgets.clock :
                         mode === 'alarm' ? t.clock.alarm :
                         mode === 'timer' ? t.clock.timer :
                         mode === 'stopwatch' ? t.pomodoro.stopwatch :
                         mode}
                    </span>
                </h3>
                <div className="flex gap-1 bg-secondary/30 rounded p-0.5 ml-auto">
                    <button onClick={() => setMode('clock')} className={`p-1 rounded transition-colors ${mode === 'clock' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}><Clock className="w-3 h-3" /></button>
                    <button onClick={() => setMode('alarm')} className={`p-1 rounded transition-colors ${mode === 'alarm' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}><AlarmClock className="w-3 h-3" /></button>
                    <button onClick={() => setMode('timer')} className={`p-1 rounded transition-colors ${mode === 'timer' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}><Timer className="w-3 h-3" /></button>
                    <button onClick={() => setMode('stopwatch')} className={`p-1 rounded transition-colors ${mode === 'stopwatch' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}><TimerReset className="w-3 h-3" /></button>
                </div>
            </div>
            <div className={`flex-grow flex items-center justify-center w-full transition-all duration-500 rounded-xl ${clockStyle === 'analog' ? 'aspect-square' : 'aspect-video h-22 bg-accent/5'}`}>
                {renderContent()}
            </div>
        </div>
    )
}

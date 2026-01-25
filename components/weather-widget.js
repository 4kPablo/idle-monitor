"use client"

import React from "react"
import { Cloud, CloudRain, Sun, Wind, Droplets, ThermometerSun, ThermometerSnowflake } from "lucide-react"

const WeatherWidget = () => {
  const weatherIcons = {
    sun: Sun,
    cloud: Cloud,
    rain: CloudRain,
    wind: Wind,
  }

  const WeatherIcon = weatherIcons.cloud

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground">Clima</h3>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-accent/20 rounded-xl">
            <WeatherIcon className="w-8 h-8 text-accent" />
          </div>
          <div>
            <div className="text-4xl font-bold">22°</div>
            <div className="text-sm text-muted-foreground">Parcialmente nublado</div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <ThermometerSun className="w-4 h-4 text-orange-400" />
          <div>
            <div className="text-xs text-muted-foreground">Máxima</div>
            <div className="text-lg font-semibold">26°</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThermometerSnowflake className="w-4 h-4 text-blue-400" />
          <div>
            <div className="text-xs text-muted-foreground">Mínima</div>
            <div className="text-lg font-semibold">14°</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Droplets className="w-4 h-4 text-cyan-400" />
          <div>
            <div className="text-xs text-muted-foreground">Lluvia</div>
            <div className="text-lg font-semibold">20%</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Wind className="w-4 h-4 text-slate-400" />
          <div>
            <div className="text-xs text-muted-foreground">Viento</div>
            <div className="text-lg font-semibold">12 km/h</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default React.memo(WeatherWidget)

"use client"

import React, { useState, useEffect, useCallback } from "react"
import {
  Cloud, CloudRain, Sun, Wind, Droplets, ThermometerSun, ThermometerSnowflake,
  CloudLightning, CloudSnow, CloudFog, MapPin, Search, RefreshCw, ChevronRight, ChevronLeft
} from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { createRequestGenerationGuard } from "@/lib/weather-request"

const OPENWEATHER_API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY

async function readJsonResponse(response) {
  const text = await response.text()
  const contentType = response.headers.get("content-type") || ""

  if (!contentType.includes("application/json")) {
    throw new Error("non-json-response")
  }

  return text ? JSON.parse(text) : {}
}

async function fetchOpenWeatherPayload(params, lang, signal) {
  if (!OPENWEATHER_API_KEY) {
    throw new Error("weather-key-missing")
  }

  const currentParams = new URLSearchParams({ appid: OPENWEATHER_API_KEY, units: "metric", lang, ...params })
  const currentResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?${currentParams}`, { signal })
  if (!currentResponse.ok) {
    throw new Error("weather-provider-error")
  }

  const current = await currentResponse.json()
  const forecastParams = new URLSearchParams({
    lat: String(current.coord.lat),
    lon: String(current.coord.lon),
    appid: OPENWEATHER_API_KEY,
    units: "metric",
    lang,
    cnt: "8",
  })
  const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?${forecastParams}`, { signal })
  const forecast = forecastResponse.ok ? await forecastResponse.json() : { list: [] }

  return { current, hourly: forecast.list || [] }
}

const WeatherWidget = ({ showLocation = true, showStats = true }) => {
  const { lang, t } = useLanguage()
  const [weatherData, setWeatherData] = useState(null)
  const [hourlyData, setHourlyData] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [isSearching, setIsSearching] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showHourly, setShowHourly] = useState(false)
  const [coords, setCoords] = useState(null)
  const requestRef = React.useRef(null)
  const mountedRef = React.useRef(true)
  const generationGuard = React.useRef(createRequestGenerationGuard())

  const fetchWeather = useCallback(async (params, generation) => {
    if (!mountedRef.current || !generationGuard.current.isCurrent(generation)) return
    requestRef.current?.abort()
    const controller = new AbortController()
    requestRef.current = controller
    try {
      setLoading(true)
      setError(null)
      const query = new URLSearchParams({ ...params, lang })
      const res = await fetch(`/api/weather?${query}`, { signal: controller.signal })
      let payload
      try {
        payload = await readJsonResponse(res)
      } catch (parseErr) {
        if (parseErr.message === "non-json-response") {
          payload = await fetchOpenWeatherPayload(params, lang, controller.signal)
        } else {
          throw parseErr
        }
      }

      if (!res.ok && !payload.current) {
        if (payload.error) throw new Error(payload.error)
        if (payload.current === undefined) {
          payload = await fetchOpenWeatherPayload(params, lang, controller.signal)
        }
      }
      if (!mountedRef.current || !generationGuard.current.isCurrent(generation)) return
      const data = payload.current
      setWeatherData(data)
      if (data.name) localStorage.setItem("idle-weather-loc", data.name)
      if (data.coord) setCoords(data.coord)

      setHourlyData(payload.hourly || [])
    } catch (err) {
      if (err.name === "AbortError") return
      if (err.message === "weather-key-missing") {
        setError(lang === "es" ? "Falta configurar NEXT_PUBLIC_WEATHER_API_KEY" : "NEXT_PUBLIC_WEATHER_API_KEY is not configured")
        return
      }
      if (err.message === "weather-provider-error") {
        setError(lang === "es" ? "No se pudo obtener el clima" : "Could not retrieve weather data")
        return
      }
      if (!mountedRef.current || !generationGuard.current.isCurrent(generation)) return
      setError(err.message)
    } finally {
      if (!mountedRef.current || requestRef.current !== controller || !generationGuard.current.isCurrent(generation)) return
      setLoading(false)
      setRefreshing(false)
    }
  }, [lang])

  const loadWeatherByLocation = useCallback(() => {
    const generation = generationGuard.current.next()
    const savedLoc = localStorage.getItem("idle-weather-loc")
    if (navigator.geolocation && !savedLoc) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude: lat, longitude: lon } = position.coords
          fetchWeather({ lat: String(lat), lon: String(lon) }, generation)
        },
        () => {
          fetchWeather({ q: "Buenos Aires" }, generation)
        }
      )
    } else {
      const query = savedLoc || "Buenos Aires"
      fetchWeather({ q: query }, generation)
    }
  }, [fetchWeather])

  useEffect(() => {
    const guard = generationGuard.current
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      guard.invalidate()
      requestRef.current?.abort()
    }
  }, [])
  useEffect(() => { loadWeatherByLocation() }, [loadWeatherByLocation])

  const handleRefresh = () => {
    const generation = generationGuard.current.next()
    setRefreshing(true)
    if (coords) {
      fetchWeather({ lat: String(coords.lat), lon: String(coords.lon) }, generation)
    } else {
      loadWeatherByLocation()
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    const generation = generationGuard.current.next()
    setIsSearching(false)
    fetchWeather({ q: searchQuery.trim() }, generation)
    setSearchQuery("")
  }

  const getWeatherIcon = (id) => {
    if (!id) return Cloud
    if (id >= 200 && id < 300) return CloudLightning
    if (id >= 300 && id < 600) return CloudRain
    if (id >= 600 && id < 700) return CloudSnow
    if (id >= 700 && id < 800) return CloudFog
    if (id === 800) return Sun
    return Cloud
  }

  const formatHour = (dtTxt) => {
    // dtTxt is "2024-01-01 15:00:00"
    const date = new Date(dtTxt)
    return date.toLocaleTimeString(t.dateLocale, { hour: "2-digit", minute: "2-digit", hour12: false })
  }

  if (loading && !weatherData) {
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground flex items-center justify-between">{t.weather.title} <MapPin className="w-4 h-4" /></h3>
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-secondary h-12 w-12"></div>
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-secondary rounded w-3/4"></div>
            <div className="h-4 bg-secondary rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  const WeatherIcon = weatherData ? getWeatherIcon(weatherData.weather[0].id) : Cloud

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3
          className="text-sm font-medium text-muted-foreground flex items-center gap-1 cursor-pointer hover:text-foreground transition-colors"
          onClick={() => setIsSearching(!isSearching)}
        >
          {t.weather.title} <Search className="w-3 h-3 ml-0.5" />
        </h3>
        <div className="flex items-center gap-2">
          {weatherData && showLocation && (
            <div className="text-xs text-muted-foreground truncate max-w-[100px] flex items-center gap-0.5" title={weatherData.name}>
              <MapPin className="w-3 h-3 flex-shrink-0" /> {weatherData.name}
            </div>
          )}
          <div className="flex gap-1">
            <button
              onClick={handleRefresh}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
              title={t.weather.refresh}
              disabled={refreshing}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setShowHourly(!showHourly)}
              className={`p-1 rounded-md transition-colors ${showHourly ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'}`}
              title={t.weather.hourlyForecast}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Search */}
      {isSearching && (
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder={t.weather.search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-sm rounded bg-background border border-border px-2 py-1 outline-none focus:border-primary"
            autoFocus
          />
          <button type="submit" className="text-xs bg-primary text-primary-foreground px-2 rounded">{t.weather.searchBtn}</button>
        </form>
      )}

      {error && !weatherData ? (
        <div className="text-sm text-destructive">{error}</div>
      ) : showHourly && hourlyData.length > 0 ? (
        /* Hourly forecast */
        <div className="space-y-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <button onClick={() => setShowHourly(false)} className="hover:text-foreground transition-colors">
              <ChevronLeft className="w-3 h-3" />
            </button>
            {t.weather.nextHours}
          </div>
          <div className="space-y-1.5">
            {hourlyData.slice(0, 8).map((item, i) => {
              const Icon = getWeatherIcon(item.weather[0]?.id)
              return (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground w-10 font-mono flex-shrink-0">{formatHour(item.dt_txt)}</span>
                  <Icon className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                  <span className="capitalize text-muted-foreground flex-1 truncate">{item.weather[0]?.description}</span>
                  <span className="font-semibold flex-shrink-0">{Math.round(item.main.temp)}°</span>
                  <span className="text-muted-foreground flex-shrink-0">{item.main.humidity}%</span>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        /* Current weather */
        <>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-accent/20 rounded-xl">
              <WeatherIcon className="w-8 h-8 text-accent" />
            </div>
            <div>
              <div className="text-4xl font-bold">{Math.round(weatherData?.main?.temp)}°</div>
              <div className="text-sm text-muted-foreground capitalize">{weatherData?.weather[0]?.description}</div>
            </div>
          </div>

          {showStats && (
             <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border">
              <div className="flex items-center gap-2">
                <ThermometerSun className="w-4 h-4 text-orange-400" />
                <div>
                  <div className="text-xs text-muted-foreground">{t.weather.max}</div>
                  <div className="text-lg font-semibold">{Math.round(weatherData?.main?.temp_max)}°</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ThermometerSnowflake className="w-4 h-4 text-blue-400" />
                <div>
                  <div className="text-xs text-muted-foreground">{t.weather.min}</div>
                  <div className="text-lg font-semibold">{Math.round(weatherData?.main?.temp_min)}°</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-cyan-400" />
                <div>
                  <div className="text-xs text-muted-foreground">{t.weather.humidity}</div>
                  <div className="text-lg font-semibold">{weatherData?.main?.humidity}%</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Wind className="w-4 h-4 text-slate-400" />
                <div>
                  <div className="text-xs text-muted-foreground">{t.weather.wind}</div>
                  <div className="text-lg font-semibold">{(weatherData?.wind?.speed * 3.6).toFixed(1)} km/h</div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default React.memo(WeatherWidget)

const JSON_HEADERS = { "Content-Type": "application/json; charset=utf-8" }

function json(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), { status, headers: { ...JSON_HEADERS, ...extraHeaders } })
}

export function parseWeatherQuery(url) {
  const lang = url.searchParams.get("lang") === "en" ? "en" : "es"
  const q = url.searchParams.get("q")?.trim()

  if (q) {
    if (q.length > 100) return { error: "Invalid location" }
    return { lang, q }
  }
  const latValue = url.searchParams.get("lat")
  const lonValue = url.searchParams.get("lon")
  if (latValue === null || latValue.trim() === "" || lonValue === null || lonValue.trim() === "") {
    return { error: "A valid location or coordinates are required" }
  }
  const lat = Number(latValue)
  const lon = Number(lonValue)
  if (Number.isFinite(lat) && lat >= -90 && lat <= 90 && Number.isFinite(lon) && lon >= -180 && lon <= 180) {
    return { lang, lat, lon }
  }
  return { error: "A valid location or coordinates are required" }
}

export async function onRequestGet({ request, env, waitUntil }) {
  const url = new URL(request.url)
  const input = parseWeatherQuery(url)
  if (input.error) return json({ success: false, error: input.error }, 400)

  const apiKey = env.WEATHER_API_KEY || env.NEXT_PUBLIC_WEATHER_API_KEY
  if (!apiKey) return json({ success: false, error: "Weather service is not configured" }, 500)

  const normalized = new URL(request.url)
  normalized.searchParams.sort()
  const cacheKey = new Request(normalized.toString(), { method: "GET" })
  const cache = caches.default
  const cached = await cache.match(cacheKey)
  if (cached) return cached

  const params = new URLSearchParams({ appid: apiKey, units: "metric", lang: input.lang })
  if (input.q) params.set("q", input.q)
  else {
    params.set("lat", String(input.lat))
    params.set("lon", String(input.lon))
  }

  try {
    const currentResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?${params}`)
    if (!currentResponse.ok) {
      const status = currentResponse.status === 404 ? 404 : 502
      return json({ success: false, error: status === 404 ? "Location not found" : "Weather provider error" }, status)
    }
    const current = await currentResponse.json()
    const forecastParams = new URLSearchParams({
      lat: String(current.coord.lat), lon: String(current.coord.lon), appid: apiKey,
      units: "metric", lang: input.lang, cnt: "8"
    })
    const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?${forecastParams}`)
    const forecast = forecastResponse.ok ? await forecastResponse.json() : { list: [] }
    const response = json({ success: true, current, hourly: forecast.list || [], updatedAt: Date.now() }, 200, {
      "Cache-Control": "public, max-age=300, s-maxage=900, stale-while-revalidate=3600"
    })
    waitUntil(cache.put(cacheKey, response.clone()))
    return response
  } catch {
    return json({ success: false, error: "Weather service unavailable" }, 502)
  }
}

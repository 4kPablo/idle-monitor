function getCurrentTimeWindow() {
  const now = new Date()
  const utcDate = new Date(now.getTime() + now.getTimezoneOffset() * 60000)
  const localDate = new Date(utcDate.getTime() - 3 * 3600000)

  const year = localDate.getFullYear()
  const month = localDate.getMonth() + 1
  const day = localDate.getDate()
  const hour = localDate.getHours()

  let windowIndex = 0
  let dateKey = `${year}-${month}-${day}`

  if (hour >= 23) {
    windowIndex = 4
  } else if (hour >= 18) {
    windowIndex = 3
  } else if (hour >= 12) {
    windowIndex = 2
  } else if (hour >= 6) {
    windowIndex = 1
  } else {
    const prevDate = new Date(localDate.getTime() - 24 * 3600000)
    dateKey = `${prevDate.getFullYear()}-${prevDate.getMonth() + 1}-${prevDate.getDate()}`
    windowIndex = 4
  }

  return `${dateKey}-window-${windowIndex}`
}

export async function onRequest(context) {
  const { request, env } = context
  const url = new URL(request.url)
  const lang = url.searchParams.get("lang") === "en" ? "en" : "es"

  const apiKey = env.GEMINI_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({
      success: false,
      error: lang === "en" ? "Gemini API key is not configured." : "La clave de API de Gemini no está configurada."
    }), { status: 500, headers: { "Content-Type": "application/json" } })
  }

  const windowKey = `${getCurrentTimeWindow()}-${lang}`
  const cacheUrl = new URL(request.url)
  cacheUrl.pathname = `/api/ai-news/${windowKey}`
  const cacheKey = new Request(cacheUrl.toString())
  const cache = caches.default

  const cachedResponse = await cache.match(cacheKey)
  if (cachedResponse) {
    return cachedResponse
  }

  const prompt = lang === "en"
    ? "Give me a brief summary of 3 or 4 bullet points of the most important world news from the last few hours. Be very concise and neutral. Write it in English. Use Markdown format with bullet points (-)."
    : "Dame un breve resumen de 3 o 4 viñetas de las noticias mundiales más importantes de las últimas horas. Sé muy conciso y neutral. Escríbelo en español. Usa formato Markdown con viñetas (-)."

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          tools: [{ google_search: {} }]
        })
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Gemini API Error [${response.status}]:`, errorText)
      return new Response(JSON.stringify({
        success: false,
        error: `Gemini API Error [${response.status}]`
      }), { status: 500, headers: { "Content-Type": "application/json" } })
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ||
      (lang === "en" ? "No news available at this time." : "No hay noticias disponibles en este momento.")

    const jsonResponse = new Response(JSON.stringify({
      success: true,
      data: text,
      window: windowKey
    }), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=86400, max-age=86400"
      }
    })

    context.waitUntil(cache.put(cacheKey, jsonResponse.clone()))
    return jsonResponse
  } catch (error) {
    console.error("Error en /api/ai-news:", error)
    return new Response(JSON.stringify({
      success: false,
      error: lang === "en" ? "Connection error. Try again later." : "Error de conexión. Inténtalo más tarde."
    }), { status: 500, headers: { "Content-Type": "application/json" } })
  }
}

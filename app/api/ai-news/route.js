import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";

// Determinamos la ventana de tiempo actual basándonos en la hora local (UTC-3)
function getCurrentTimeWindow() {
  const now = new Date();
  const utcDate = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
  const localDate = new Date(utcDate.getTime() - 3 * 3600000);

  const year = localDate.getFullYear();
  const month = localDate.getMonth() + 1;
  const day = localDate.getDate();
  const hour = localDate.getHours();

  let windowIndex = 0;
  let dateKey = `${year}-${month}-${day}`;

  if (hour >= 23) {
    windowIndex = 4;
  } else if (hour >= 18) {
    windowIndex = 3;
  } else if (hour >= 12) {
    windowIndex = 2;
  } else if (hour >= 6) {
    windowIndex = 1;
  } else {
    // Antes de las 6 AM, pertenece a la ventana de las 23:00 del día anterior
    const prevDate = new Date(localDate.getTime() - 24 * 3600000);
    dateKey = `${prevDate.getFullYear()}-${prevDate.getMonth() + 1}-${prevDate.getDate()}`;
    windowIndex = 4;
  }

  return `${dateKey}-window-${windowIndex}`;
}

async function fetchNewsFromGemini(lang) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(lang === "en" ? "Gemini API key is not configured." : "La clave de API de Gemini no está configurada.");
  }

  const prompt = lang === "en"
    ? "Give me a brief summary of 3 or 4 bullet points of the most important world news from the last few hours. Be very concise and neutral. Write it in English. Use Markdown format with bullet points (-)."
    : "Dame un breve resumen de 3 o 4 viñetas de las noticias mundiales más importantes de las últimas horas. Sé muy conciso y neutral. Escríbelo en español. Usa formato Markdown con viñetas (-).";

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      tools: [{ google_search: {} }]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Gemini API Error [${response.status} ${response.statusText}]:`, errorText);
    throw new Error(`Error de Gemini API [${response.status}]: ${errorText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  return text || (lang === "en" ? "No news available at this time." : "No hay noticias disponibles en este momento.");
}

const getCachedNews = unstable_cache(
  async (windowKey, lang) => {
    return await fetchNewsFromGemini(lang);
  },
  ['gemini-news-cache'],
  {
    revalidate: 3600 * 24 // La caché puede vivir 24 horas (el cambio de windowKey forzará un nuevo fetch)
  }
);

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const lang = searchParams.get("lang") === "en" ? "en" : "es";
    const windowKey = `${getCurrentTimeWindow()}-${lang}`;
    const newsSummary = await getCachedNews(windowKey, lang);
    
    return NextResponse.json({
      success: true,
      data: newsSummary,
      window: windowKey
    });
  } catch (error) {
    console.error("Error en /api/ai-news:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "No se pudieron obtener las noticias. Verifica la clave de API y la conexión."
    }, { status: 500 });
  }
}

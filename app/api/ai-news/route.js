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

async function fetchNewsFromGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("La clave de API de Gemini no está configurada.");
  }

  const prompt = "Dame un breve resumen de 3 o 4 viñetas de las noticias mundiales más importantes de las últimas horas. Sé muy conciso y neutral. Escríbelo en español. Usa formato Markdown con viñetas (-).";

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      tools: [{ googleSearch: {} }]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Gemini API Error:", errorText);
    throw new Error(`Error de Gemini API: ${response.statusText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  return text || "No hay noticias disponibles en este momento.";
}

const getCachedNews = unstable_cache(
  async (windowKey) => {
    return await fetchNewsFromGemini();
  },
  ['gemini-news-cache'],
  {
    revalidate: 3600 * 24 // La caché puede vivir 24 horas (el cambio de windowKey forzará un nuevo fetch)
  }
);

export async function GET() {
  try {
    const windowKey = getCurrentTimeWindow();
    const newsSummary = await getCachedNews(windowKey);
    
    return NextResponse.json({
      success: true,
      data: newsSummary,
      window: windowKey
    });
  } catch (error) {
    console.error("Error en /api/ai-news:", error);
    return NextResponse.json({
      success: false,
      error: "No se pudieron obtener las noticias. Verifica la clave de API y la conexión."
    }, { status: 500 });
  }
}

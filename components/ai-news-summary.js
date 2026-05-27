"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Sparkles, RefreshCw, AlertCircle } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

const AiNewsSummary = () => {
  const { lang, t } = useLanguage()
  const [news, setNews] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchNews = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/ai-news?lang=${lang}`)
      const json = await res.json()
      
      if (json.success) {
        setNews(json.data)
      } else {
        setError(json.error || (lang === 'en' ? "Error loading news summary." : "Error al cargar el resumen de noticias."))
      }
    } catch (err) {
      setError(lang === 'en' ? "Connection error. Try again later." : "Error de conexión. Inténtalo más tarde.")
    } finally {
      setLoading(false)
    }
  }, [lang])

  useEffect(() => {
    fetchNews()
  }, [fetchNews])

  // Parsear markdown simple (viñetas y negritas)
  const renderNewsContent = (text) => {
    if (!text) return null;
    
    // Separar por saltos de línea y filtrar líneas vacías
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    
    return (
      <ul className="space-y-2.5">
        {lines.map((line, idx) => {
          // Limpiar prefijos de viñeta markdown como "- ", "* ", "• "
          let cleanLine = line.replace(/^[\-\*\•]\s*/, '').trim();
          
          // Renderizar **negritas** (un regex básico para convertir **texto** en <strong>texto</strong>)
          const parts = cleanLine.split(/(\*\*.*?\*\*)/g);
          
          return (
            <li key={idx} className="text-sm text-foreground flex items-start gap-2">
              <span className="text-primary mt-1 text-[10px]">●</span>
              <span className="flex-1 leading-snug">
                {parts.map((part, i) => {
                  if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>
                  }
                  return <span key={i}>{part}</span>
                })}
              </span>
            </li>
          )
        })}
      </ul>
    )
  }

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          {t.aiNews.title}
        </h3>
        <button 
          onClick={fetchNews} 
          disabled={loading}
          className="text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
          title={t.aiNews.refresh}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full">
        {loading ? (
          <div className="space-y-3">
            <div className="h-4 bg-secondary/50 rounded-md animate-pulse w-3/4"></div>
            <div className="h-4 bg-secondary/50 rounded-md animate-pulse w-full"></div>
            <div className="h-4 bg-secondary/50 rounded-md animate-pulse w-5/6"></div>
            <div className="h-4 bg-secondary/50 rounded-md animate-pulse w-full"></div>
            <div className="h-4 bg-secondary/50 rounded-md animate-pulse w-4/5"></div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2 py-4">
            <AlertCircle className="w-6 h-6 opacity-50" />
            <p className="text-xs text-center">{error}</p>
          </div>
        ) : (
          <div className="py-1">
            {renderNewsContent(news)}
          </div>
        )}
      </div>
      
      {!loading && !error && (
         <p className="text-[10px] text-muted-foreground/60 text-center pt-2 mt-auto border-t border-border/50">
           {t.aiNews.generatedBy}
         </p>
      )}
    </div>
  )
}

export default React.memo(AiNewsSummary)

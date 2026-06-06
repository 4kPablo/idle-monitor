"use client"

export const THEME_CONFIG = {
  'particles': [
    { name: "Azul", primary: "oklch(0.65 0.18 220)", accent: "oklch(0.7 0.2 180)", particleColor: "80, 160, 255", particleBg: "#00050f" },
    { name: "Púrpura", primary: "oklch(0.65 0.25 300)", accent: "oklch(0.7 0.2 280)", particleColor: "160, 100, 255", particleBg: "#04010d" },
    { name: "Esmeralda", primary: "oklch(0.7 0.2 160)", accent: "oklch(0.75 0.22 150)", particleColor: "60, 210, 120", particleBg: "#010804" },
    { name: "Rosa", primary: "oklch(0.7 0.2 340)", accent: "oklch(0.75 0.22 330)", particleColor: "255, 100, 170", particleBg: "#0a0105" },
  ],
  'gradient-aurora': [
    { name: "Cyber", primary: "oklch(0.6 0.15 240)", accent: "oklch(0.7 0.25 160)" },
    { name: "Neon", primary: "oklch(0.65 0.25 310)", accent: "oklch(0.7 0.2 280)" },
    { name: "Glacier", primary: "oklch(0.75 0.1 200)", accent: "oklch(0.8 0.1 190)" },
    { name: "Fuego", primary: "oklch(0.65 0.22 30)", accent: "oklch(0.7 0.25 20)" },
  ],
  'gradient-forest': [
    { name: "Verde", primary: "oklch(0.8 0.15 145)", accent: "oklch(0.75 0.2 130)" },
    { name: "Coral", primary: "oklch(0.75 0.15 25)", accent: "oklch(0.8 0.2 15)" },
    { name: "Ámbar", primary: "oklch(0.8 0.18 70)", accent: "oklch(0.85 0.2 60)" },
    { name: "Lavanda", primary: "oklch(0.75 0.12 290)", accent: "oklch(0.8 0.15 280)" },
  ],
  'grid': [
    { name: "Vapor", primary: "oklch(0.65 0.25 300)", accent: "oklch(0.7 0.2 190)" },
    { name: "Retro", primary: "oklch(0.6 0.2 20)", accent: "oklch(0.8 0.3 350)" },
    { name: "Cyan", primary: "oklch(0.7 0.2 200)", accent: "oklch(0.75 0.22 190)" },
    { name: "Lime", primary: "oklch(0.75 0.2 130)", accent: "oklch(0.8 0.22 120)" },
  ],
  'space': [
    { name: "Sci-Fi", primary: "oklch(0.7 0.05 240)", accent: "oklch(0.8 0.1 200)" },
    { name: "Void", primary: "oklch(0.8 0 0)", accent: "oklch(0.6 0.2 260)" },
    { name: "Nebula", primary: "oklch(0.65 0.2 310)", accent: "oklch(0.7 0.22 300)" },
    { name: "Stellar", primary: "oklch(0.7 0.18 180)", accent: "oklch(0.75 0.2 170)" },
  ],
  'solid': [
    { name: "OLED", primary: "#ffffff", accent: "#888888", bg: "#000000" },
    { name: "Azul", primary: "#3b82f6", accent: "#60a5fa", bg: "#1e293b" },
    { name: "Verde", primary: "#10b981", accent: "#34d399", bg: "#064e3b" },
    { name: "Púrpura", primary: "#a855f7", accent: "#c084fc", bg: "#2e1065" },
    { name: "Rosa", primary: "#ec4899", accent: "#f472b6", bg: "#500724" },
    { name: "Naranja", primary: "#f97316", accent: "#fb923c", bg: "#431407" },
    { name: "Cyan", primary: "#06b6d4", accent: "#22d3ee", bg: "#083344" },
    { name: "Rojo", primary: "#ef4444", accent: "#f87171", bg: "#450a0a" },
  ]
}

export const backgroundOptions = [
  { id: 'particles', name: 'Partículas' },
  { id: 'gradient-aurora', name: 'Aurora' },
  { id: 'gradient-forest', name: 'Bosque' },
  { id: 'grid', name: 'Retro Grid' },
  { id: 'space', name: 'Espacio' },
  { id: 'solid', name: 'Sólido' },
]

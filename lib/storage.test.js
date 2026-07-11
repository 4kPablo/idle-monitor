import { describe, expect, it } from "vitest"
import { createBackup, restoreBackup } from "./storage"

describe("versioned backup", () => {
  it("round-trips all known stored data", () => {
    localStorage.setItem("idle-tasks", JSON.stringify([{ id: 1, text: "Ship" }]))
    const backup = createBackup()
    localStorage.clear()
    expect(restoreBackup(backup)).toBe(true)
    expect(JSON.parse(localStorage.getItem("idle-tasks"))).toEqual([{ id: 1, text: "Ship" }])
  })

  it("rejects incompatible backups without changing current data", () => {
    localStorage.setItem("idle-settings", "{}")
    expect(restoreBackup({ version: 99, data: {} })).toBe(false)
    expect(localStorage.getItem("idle-settings")).toBe("{}")
  })

  it("imports backups created before backup versioning", () => {
    localStorage.setItem("idle-youtube", "existing-video")
    expect(restoreBackup({ settings: JSON.stringify({ language: "en" }) })).toBe(true)
    expect(JSON.parse(localStorage.getItem("idle-settings"))).toEqual({ language: "en" })
    expect(localStorage.getItem("idle-youtube")).toBe("existing-video")
  })

  it("restores raw string values without parsing them as JSON", () => {
    localStorage.setItem("idle-youtube", "dQw4w9WgXcQ")
    localStorage.setItem("idle-weather-loc", "Buenos Aires")
    const backup = createBackup()
    localStorage.clear()
    expect(restoreBackup(backup)).toBe(true)
    expect(localStorage.getItem("idle-youtube")).toBe("dQw4w9WgXcQ")
    expect(localStorage.getItem("idle-weather-loc")).toBe("Buenos Aires")
  })
})

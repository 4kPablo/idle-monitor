"use client"

export default function ProgressRings({ currentTime }) {
  const hours = currentTime.getHours()
  const minutes = currentTime.getMinutes()

  const dayProgress = ((hours * 60 + minutes) / 1440) * 100

  const startOfYear = new Date(currentTime.getFullYear(), 0, 1)
  const endOfYear = new Date(currentTime.getFullYear() + 1, 0, 1)
  const yearProgress = ((currentTime - startOfYear) / (endOfYear - startOfYear)) * 100

  const startOfMonth = new Date(currentTime.getFullYear(), currentTime.getMonth(), 1)
  const endOfMonth = new Date(currentTime.getFullYear(), currentTime.getMonth() + 1, 1)
  const monthProgress = ((currentTime - startOfMonth) / (endOfMonth - startOfMonth)) * 100

  const ProgressBar = ({ progress, label, color, segments = 20 }) => {
    const filledSegments = Math.floor((progress / 100) * segments)

    return (
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">{label}</span>
          <span className="text-xs font-mono font-semibold">{Math.round(progress)}%</span>
        </div>
        <div className="h-2.5 bg-secondary/30 rounded-sm overflow-hidden flex gap-px p-px">
          {Array.from({ length: segments }).map((_, i) => (
            <div
              key={i}
              className="flex-1 rounded-[1px] transition-all duration-300"
              style={{
                backgroundColor: i < filledSegments ? color : "transparent",
                opacity: i < filledSegments ? 1 : 0.15,
                boxShadow: i < filledSegments ? `0 0 4px ${color}` : "none",
              }}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground">Progreso</h3>
      <div className="space-y-3">
        <ProgressBar progress={dayProgress} label="Día" color="var(--primary)" segments={24} />
        <ProgressBar progress={monthProgress} label="Mes" color="var(--accent)" segments={20} />
        <ProgressBar progress={yearProgress} label="Año" color="var(--ring)" segments={12} />
      </div>
    </div>
  )
}

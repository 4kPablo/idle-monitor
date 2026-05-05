"use client"

import { Clock8Icon } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { useRef } from 'react'

interface TimePickerProps {
  id?: string
  label?: string
  value: string          // "HH:MM" or "HH:MM:SS"
  onChange?: (value: string) => void
  className?: string
  showSeconds?: boolean
}

/**
 * Custom 24-hour time picker built from individual number segments.
 * Avoids browser locale issues with native <input type="time"> in 12h systems.
 */
const TimePicker = ({
  id = 'time-picker',
  label,
  value,
  onChange,
  className,
  showSeconds = false,
}: TimePickerProps) => {
  const parts = (value || (showSeconds ? '00:00:00' : '00:00')).split(':')
  const hh = parseInt(parts[0] || '0', 10)
  const mm = parseInt(parts[1] || '0', 10)
  const ss = parseInt(parts[2] || '0', 10)

  const hhRef = useRef<HTMLInputElement>(null)
  const mmRef = useRef<HTMLInputElement>(null)
  const ssRef = useRef<HTMLInputElement>(null)

  const emit = (h: number, m: number, s: number) => {
    const pad = (n: number) => String(n).padStart(2, '0')
    const v = showSeconds ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(h)}:${pad(m)}`
    onChange?.(v)
  }

  const handleH = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Math.min(23, Math.max(0, parseInt(e.target.value) || 0))
    emit(v, mm, ss)
    if (e.target.value.length >= 2) mmRef.current?.focus()
  }
  const handleM = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Math.min(59, Math.max(0, parseInt(e.target.value) || 0))
    emit(hh, v, ss)
    if (showSeconds && e.target.value.length >= 2) ssRef.current?.focus()
  }
  const handleS = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Math.min(59, Math.max(0, parseInt(e.target.value) || 0))
    emit(hh, mm, v)
  }

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    current: number,
    min: number,
    max: number,
    setter: (v: number) => void,
    prev?: React.RefObject<HTMLInputElement | null>,
    next?: React.RefObject<HTMLInputElement | null>
  ) => {
    if (e.key === 'ArrowUp') { e.preventDefault(); setter(current < max ? current + 1 : min) }
    if (e.key === 'ArrowDown') { e.preventDefault(); setter(current > min ? current - 1 : max) }
    if (e.key === 'ArrowLeft' || e.key === 'Backspace') prev?.current?.focus()
    if (e.key === 'ArrowRight' || e.key === 'Tab') next?.current?.focus()
  }

  const segClass = "w-8 bg-transparent text-center font-mono text-sm outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none focus:text-primary"

  return (
    <div className={`inline-flex flex-col space-y-1.5 ${className ?? ''}`}>
      {label && <Label htmlFor={id} className="text-xs text-muted-foreground">{label}</Label>}
      <div
        id={id}
        className="flex items-center gap-0 bg-background border border-input rounded-md px-3 h-9 shadow-xs focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px] transition-[color,box-shadow] cursor-text"
        onClick={() => hhRef.current?.focus()}
      >
        <Clock8Icon className="size-3.5 text-muted-foreground mr-2 flex-shrink-0" />
        <input
          ref={hhRef}
          type="number" min={0} max={23}
          value={String(hh).padStart(2, '0')}
          onChange={handleH}
          onKeyDown={(e) => handleKeyDown(e, hh, 0, 23, (v) => emit(v, mm, ss), undefined, mmRef)}
          onFocus={(e) => e.target.select()}
          className={segClass}
        />
        <span className="text-muted-foreground select-none">:</span>
        <input
          ref={mmRef}
          type="number" min={0} max={59}
          value={String(mm).padStart(2, '0')}
          onChange={handleM}
          onKeyDown={(e) => handleKeyDown(e, mm, 0, 59, (v) => emit(hh, v, ss), hhRef, ssRef)}
          onFocus={(e) => e.target.select()}
          className={segClass}
        />
        {showSeconds && (
          <>
            <span className="text-muted-foreground select-none">:</span>
            <input
              ref={ssRef}
              type="number" min={0} max={59}
              value={String(ss).padStart(2, '0')}
              onChange={handleS}
              onKeyDown={(e) => handleKeyDown(e, ss, 0, 59, (v) => emit(hh, mm, v), mmRef, undefined)}
              onFocus={(e) => e.target.select()}
              className={segClass}
            />
          </>
        )}
      </div>
    </div>
  )
}

export { TimePicker }
export default TimePicker

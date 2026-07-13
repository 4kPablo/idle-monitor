"use client"

import { Card } from "@/components/ui/card"
import { ArrowDown, ArrowLeftRight, ArrowUp, GripVertical, X } from "lucide-react"
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function DraggableWidget({
  id,
  children,
  cardClass,
  onRemove,
  onMove,
  widgetName,
  actionLabels,
  canMoveUp = true,
  canMoveDown = true,
  isDraggable,
  animationDelay,
  isOverlay = false
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: !isDraggable || isOverlay });

  const style = isOverlay ? {
    cursor: "grabbing",
    zIndex: 9999,
  } : {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
    opacity: isDragging ? 0.3 : 1,
    animationDelay: `${animationDelay}ms`
  };

  const activeDraggingStyle = isOverlay || isDragging;
  const label = (key) => actionLabels?.[key]?.replace("{widget}", widgetName) || widgetName

  return (
    <div
      ref={isOverlay ? null : setNodeRef}
      style={style}
    >
      <Card
        className={`
          ${cardClass} 
          relative group
          transition-all duration-300 ease-out
          ${activeDraggingStyle ? "ring-2 ring-primary scale-105 shadow-2xl bg-primary/10" : "scale-100"}
          animate-in fade-in slide-in-from-bottom-2
        `}
      >
        {isDraggable && (
          <>
            <button
              type="button"
              {...(isOverlay ? {} : attributes)}
              {...(isOverlay ? {} : listeners)}
              className={`absolute top-2 left-2 size-11 flex items-center justify-center duration-200 cursor-grab active:cursor-grabbing rounded-md hover:bg-secondary/80 bg-secondary/70 backdrop-blur-sm z-20 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${isOverlay ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 [@media(pointer:coarse)]:opacity-100 transition-opacity'}`}
              title={label("drag")}
              aria-label={label("drag")}
            >
              <GripVertical className="w-4 h-4 text-foreground" />
            </button>
            {onMove && !isOverlay && (
              <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 flex rounded-md bg-secondary/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 [@media(pointer:coarse)]:opacity-100 transition-opacity">
                {[["up", ArrowUp, "moveUp", canMoveUp], ["down", ArrowDown, "moveDown", canMoveDown], ["across", ArrowLeftRight, "moveAcross", true]].map(([direction, Icon, labelKey, enabled]) => (
                  <button
                    key={direction}
                    type="button"
                    onClick={() => onMove(id, direction)}
                    disabled={!enabled}
                    className="size-11 flex items-center justify-center rounded-md hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-30"
                    aria-label={label(labelKey)}
                  >
                    <Icon className="size-4" />
                  </button>
                ))}
              </div>
            )}
            {onRemove && (
              <button
                type="button"
                onClick={() => onRemove(id)}
                className="absolute top-2 right-2 size-11 flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 [@media(pointer:coarse)]:opacity-100 transition-opacity duration-200 cursor-pointer rounded-md hover:bg-destructive/90 bg-destructive/70 backdrop-blur-sm text-white z-20 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                title={label("remove")}
                aria-label={label("remove")}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </>
        )}
        {children}
      </Card>
    </div>
  )
}

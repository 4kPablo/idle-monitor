"use client"

export default function GridBg() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-black">
      {/* Dynamic Background Blurs */}
      <div className="absolute inset-0 bg-gradient-to-t from-purple-900/30 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-transparent to-pink-900/20 filter blur-[120px] opacity-50" />

      {/* The Moving Grid */}
      <div
        className="absolute top-0 left-0 right-0 bottom-[-40px] animate-[grid-move_6s_linear_infinite]"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
                              linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          maskImage: 'linear-gradient(to bottom, transparent, black 40%, black)'
        }}
      />

      <style jsx global>{`
        @keyframes grid-move {
            0% { transform: translateY(0) translateZ(0); }
            100% { transform: translateY(-40px) translateZ(0); }
        }
      `}</style>
    </div>
  )
}

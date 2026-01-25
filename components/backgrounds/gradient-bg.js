"use client"

export default function GradientBg({ type = "aurora" }) {
  if (type === "aurora") {
    return (
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-slate-950">
        <div className="absolute inset-0 opacity-60 filter blur-[80px] animate-[pulse_8s_ease-in-out_infinite]">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/30 rounded-full mix-blend-screen animate-[blob_7s_infinite]" />
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/30 rounded-full mix-blend-screen animate-[blob_7s_infinite_2s]" />
          <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[60%] bg-indigo-500/30 rounded-full mix-blend-screen animate-[blob_10s_infinite_4s]" />
          <div className="absolute bottom-[20%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/20 rounded-full mix-blend-screen animate-[blob_7s_infinite_1s]" />
        </div>

        <style jsx global>{`
          @keyframes blob {
            0% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
            100% { transform: translate(0px, 0px) scale(1); }
          }
        `}</style>
      </div>
    )
  }

  if (type === "forest") {
    return (
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-slate-950">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-teal-950 to-black/90" />
        {/* Subtle animated organic blobs */}
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-emerald-900/20 rounded-full mix-blend-screen filter blur-[100px] animate-[blob_15s_infinite]" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-teal-900/20 rounded-full mix-blend-screen filter blur-[100px] animate-[blob_20s_infinite_reverse]" />

        {/* Subtle vertical shadow animations - like moonlight through trees */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute h-full w-48 bg-gradient-to-r from-transparent via-black/20 to-transparent blur-sm animate-[shadow-slide-1_20s_ease-in-out_infinite]" />
          <div className="absolute h-full w-32 bg-gradient-to-r from-transparent via-black/15 to-transparent blur-sm animate-[shadow-slide-2_25s_ease-in-out_infinite]" />
          <div className="absolute h-full w-56 bg-gradient-to-r from-transparent via-black/18 to-transparent blur-sm animate-[shadow-slide-3_30s_ease-in-out_infinite]" />
        </div>

        {/* Fireflies effect simulation (simple specks) */}
        <div className="absolute inset-0 mask-image-gradient opacity-30 animate-pulse">
          <div className="absolute top-[20%] left-[30%] w-1 h-1 bg-yellow-100 rounded-full blur-[1px] opacity-60" />
          <div className="absolute top-[60%] right-[20%] w-1.5 h-1.5 bg-yellow-100 rounded-full blur-[1px] opacity-40 animate-ping" />
          <div className="absolute bottom-[30%] left-[10%] w-1 h-1 bg-green-200 rounded-full blur-[1px] opacity-50" />
        </div>

        <style jsx global>{`
          @keyframes shadow-slide-1 {
            0%, 100% { transform: translateX(-20%); }
            50% { transform: translateX(120%); }
          }
          @keyframes shadow-slide-2 {
            0%, 100% { transform: translateX(120%); }
            50% { transform: translateX(-20%); }
          }
          @keyframes shadow-slide-3 {
            0%, 100% { transform: translateX(40%); }
            50% { transform: translateX(-30%); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-0 bg-gradient-to-br from-primary/20 via-background to-background pointer-events-none" />
  )
}

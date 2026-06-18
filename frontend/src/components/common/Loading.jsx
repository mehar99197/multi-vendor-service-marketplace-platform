export default function Loading({ size = 'md', text }) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  }
  const ring = sizeClasses[size] || sizeClasses.md

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`relative ${ring}`}>
        {/* gradient conic spinner */}
        <div
          className="absolute inset-0 rounded-full animate-spin"
          style={{
            background: 'conic-gradient(from 0deg, transparent 0deg, #6366f1 120deg, #a855f7 240deg, #22d3ee 360deg)',
            WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))',
            mask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))',
          }}
        />
        <div className="absolute inset-0 rounded-full ring-glow opacity-60" />
      </div>
      {text && <p className="text-gray-400 text-sm">{text}</p>}
    </div>
  )
}

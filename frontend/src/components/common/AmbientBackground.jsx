// Fixed, animated gradient backdrop that sits behind the whole app.
// Pages should use transparent / translucent surfaces so this shows through.
export default function AmbientBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#06060d]">
      <div className="absolute -top-40 -left-32 h-[40rem] w-[40rem] rounded-full bg-indigo-600/25 blur-3xl animate-blob" />
      <div
        className="absolute top-1/3 -right-40 h-[36rem] w-[36rem] rounded-full bg-fuchsia-600/20 blur-3xl animate-blob"
        style={{ animationDelay: '-6s' }}
      />
      <div
        className="absolute -bottom-32 left-1/4 h-[34rem] w-[34rem] rounded-full bg-cyan-500/15 blur-3xl animate-blob"
        style={{ animationDelay: '-12s' }}
      />
      <div className="absolute inset-0 bg-grid opacity-40" />
      {/* Vignette so content stays readable over the glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_rgba(6,6,13,0.6)_100%)]" />
    </div>
  )
}

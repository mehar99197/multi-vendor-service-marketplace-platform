export default function Loading({ size = 'md', text }) {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizeClasses[size] || sizeClasses.md} border-4 border-gray-700 border-t-indigo-500 rounded-full animate-spin`}
      />
      {text && <p className="text-gray-400 text-sm">{text}</p>}
    </div>
  )
}

import { useState } from 'react'

export default function StarRating({ rating = 0, maxRating = 5, interactive = false, onRate }) {
  const [hovered, setHovered] = useState(null)

  const displayRating = hovered !== null ? hovered : rating

  const handleClick = (value) => {
    if (interactive && onRate) {
      onRate(value)
    }
  }

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: maxRating }, (_, i) => {
        const starValue = i + 1
        const filled = starValue <= displayRating

        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onMouseEnter={() => interactive && setHovered(starValue)}
            onMouseLeave={() => interactive && setHovered(null)}
            onClick={() => handleClick(starValue)}
            className={`text-lg ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} ${filled ? 'text-yellow-400' : 'text-gray-600'}`}
          >
            {filled ? '\u2605' : '\u2606'}
          </button>
        )
      })}
    </div>
  )
}

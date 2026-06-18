import { motion } from 'framer-motion'

// Reusable glassmorphism card with an optional hover-lift.
export default function GlassCard({ children, className = '', hover = true, ...props }) {
  return (
    <motion.div
      whileHover={hover ? { y: -4 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className={`glass rounded-2xl ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  )
}

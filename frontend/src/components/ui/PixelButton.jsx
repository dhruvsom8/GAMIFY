import { motion } from 'framer-motion'

/**
 * Retro pixel button — chunky, 8-bit style with press animation.
 */
export default function PixelButton({
  children,
  onClick,
  variant = 'green',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  type = 'button',
}) {
  const variants = {
    green:  'pixel-btn-green',
    blue:   'pixel-btn-blue',
    red:    'pixel-btn-red',
    yellow: 'pixel-btn-yellow',
    ghost:  'pixel-btn-ghost',
  }

  const sizes = {
    sm: 'text-[8px] px-3 py-2',
    md: 'text-[10px] px-4 py-3',
    lg: 'text-[11px] px-6 py-4',
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileTap={{ x: 2, y: 2 }}
      className={`pixel-btn ${variants[variant]} ${sizes[size]} ${className} ${
        disabled || loading ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {loading ? (
        <span className="animate-blink">...</span>
      ) : children}
    </motion.button>
  )
}

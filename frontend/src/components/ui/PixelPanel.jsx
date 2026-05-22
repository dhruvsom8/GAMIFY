import { motion } from 'framer-motion'

/**
 * Retro RPG panel — the base container for all UI sections.
 * Mimics old JRPG menu boxes with chunky pixel borders.
 */
export default function PixelPanel({ children, className = '', title, color = 'default', animate = false }) {
  const borderColors = {
    default: 'border-rpg-border',
    green:   'border-rpg-green',
    blue:    'border-rpg-blue',
    yellow:  'border-rpg-yellow',
    red:     'border-rpg-red',
    purple:  'border-rpg-purple',
  }

  const glowColors = {
    default: '',
    green:   'shadow-glow-green',
    blue:    'shadow-glow-blue',
    yellow:  'shadow-glow-yellow',
    red:     'shadow-glow-red',
  }

  const Wrapper = animate ? motion.div : 'div'
  const animProps = animate ? {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.2 },
  } : {}

  return (
    <Wrapper
      className={`pixel-panel ${borderColors[color]} ${glowColors[color]} ${className}`}
      {...animProps}
    >
      {title && (
        <div className={`px-4 py-2 border-b border-rpg-border bg-rpg-bg`}>
          <span className="font-pixel text-xs text-rpg-gray-light tracking-widest uppercase">
            {title}
          </span>
        </div>
      )}
      {children}
    </Wrapper>
  )
}

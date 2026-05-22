import { motion } from 'framer-motion'

/**
 * Animated pixel XP progress bar.
 * Shows current XP progress toward next level.
 */
export default function XPBar({ current, max, level, color = 'green', showLabel = true, height = 'md' }) {
  const percent = max > 0 ? Math.min(100, Math.round((current / max) * 100)) : 0

  const barColors = {
    green:  'from-rpg-green-dark to-rpg-green',
    blue:   'from-rpg-blue-dark to-rpg-blue',
    yellow: 'from-rpg-yellow-dark to-rpg-yellow',
    red:    'from-rpg-red-dark to-rpg-red',
    purple: 'from-rpg-purple-dark to-rpg-purple',
  }

  const heights = {
    sm: 'h-3',
    md: 'h-4',
    lg: 'h-5',
  }

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="font-pixel text-[8px] text-rpg-gray-light">
            LV.{level}
          </span>
          <span className="font-pixel text-[8px] text-rpg-gray-light">
            {current} / {max} XP
          </span>
        </div>
      )}
      <div className={`xp-bar-track ${heights[height]}`}>
        <motion.div
          className={`xp-bar-fill bg-gradient-to-r ${barColors[color]}`}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
        {/* Pixel tick marks */}
        <div className="absolute inset-0 flex">
          {[25, 50, 75].map((tick) => (
            <div
              key={tick}
              className="absolute top-0 bottom-0 w-px bg-black opacity-30"
              style={{ left: `${tick}%` }}
            />
          ))}
        </div>
      </div>
      {showLabel && (
        <div className="text-right mt-1">
          <span className="font-pixel text-[7px] text-rpg-gray">{percent}%</span>
        </div>
      )}
    </div>
  )
}

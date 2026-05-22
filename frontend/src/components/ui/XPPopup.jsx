import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

/**
 * Floating XP popup that appears after quest completion.
 * Floats upward and fades out — classic RPG damage number style.
 */
export default function XPPopup({ xp, show, onDone }) {
  useEffect(() => {
    if (show) {
      const t = setTimeout(onDone, 1200)
      return () => clearTimeout(t)
    }
  }, [show, onDone])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed top-1/3 left-1/2 z-50 pointer-events-none"
          initial={{ y: 0, x: '-50%', opacity: 1, scale: 1 }}
          animate={{ y: -80, opacity: 0, scale: 1.4 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.0, ease: 'easeOut' }}
        >
          <div className="font-pixel text-rpg-green text-glow-green text-2xl whitespace-nowrap">
            +{xp} XP
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * Level-up flash overlay — full screen flash + text.
 */
export function LevelUpOverlay({ show, level, onDone }) {
  useEffect(() => {
    if (show) {
      const t = setTimeout(onDone, 2500)
      return () => clearTimeout(t)
    }
  }, [show, onDone])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0] }}
          transition={{ duration: 2.5, times: [0, 0.1, 0.8, 1] }}
        >
          <div className="absolute inset-0 bg-rpg-green opacity-10" />
          <motion.div
            className="text-center"
            initial={{ scale: 0.5 }}
            animate={{ scale: [0.5, 1.3, 1.1] }}
            transition={{ duration: 0.6, times: [0, 0.4, 1] }}
          >
            <div className="font-pixel text-rpg-yellow text-glow-yellow text-4xl mb-4 animate-blink">
              ★ LEVEL UP! ★
            </div>
            <div className="font-pixel text-rpg-white text-xl">
              LEVEL {level}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * Achievement unlock popup.
 */
export function AchievementPopup({ achievement, show, onDone }) {
  useEffect(() => {
    if (show) {
      const t = setTimeout(onDone, 3000)
      return () => clearTimeout(t)
    }
  }, [show, onDone])

  return (
    <AnimatePresence>
      {show && achievement && (
        <motion.div
          className="fixed bottom-8 right-8 z-50 pixel-panel border-rpg-yellow max-w-xs"
          initial={{ x: 200, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 200, opacity: 0 }}
          transition={{ type: 'tween', duration: 0.3 }}
        >
          <div className="p-4">
            <div className="font-pixel text-[8px] text-rpg-yellow mb-2">
              🏆 ACHIEVEMENT UNLOCKED
            </div>
            <div className="font-pixel text-[10px] text-rpg-white mb-1">
              {achievement.name}
            </div>
            <div className="font-pixel text-[8px] text-rpg-gray-light">
              {achievement.description}
            </div>
            {achievement.xp_bonus > 0 && (
              <div className="font-pixel text-[8px] text-rpg-green mt-2">
                +{achievement.xp_bonus} BONUS XP
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

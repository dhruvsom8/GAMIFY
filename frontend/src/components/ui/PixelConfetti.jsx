import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Pixel confetti burst — spawns colored squares that fall and fade.
 * Triggered on quest completion.
 */
const COLORS = ['#4ade80', '#60a5fa', '#fbbf24', '#f87171', '#a78bfa', '#22d3ee']
const PIXEL_SIZE = 6

function randomBetween(a, b) {
  return a + Math.random() * (b - a)
}

export default function PixelConfetti({ trigger, count = 30 }) {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    color: COLORS[i % COLORS.length],
    x: randomBetween(20, 80),       // % from left
    delay: randomBetween(0, 0.4),
    duration: randomBetween(0.8, 1.4),
    rotation: randomBetween(-180, 180),
    size: Math.random() > 0.5 ? PIXEL_SIZE : PIXEL_SIZE * 2,
  }))

  return (
    <AnimatePresence>
      {trigger && (
        <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute top-0"
              style={{
                left: `${p.x}%`,
                width: p.size,
                height: p.size,
                background: p.color,
                imageRendering: 'pixelated',
              }}
              initial={{ y: -20, opacity: 1, rotate: 0 }}
              animate={{
                y: '110vh',
                opacity: [1, 1, 0],
                rotate: p.rotation,
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                ease: 'easeIn',
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  )
}

/**
 * Client-side XP engine — mirrors backend logic for UI calculations.
 */

export function xpRequiredForLevel(level) {
  return Math.floor(100 * Math.pow(level, 1.5))
}

export function xpForNextLevel(currentLevel) {
  return xpRequiredForLevel(currentLevel + 1) - xpRequiredForLevel(currentLevel)
}

export function calculateLevelFromTotalXP(totalXP) {
  let level = 1
  let remaining = totalXP
  while (true) {
    const needed = xpForNextLevel(level)
    if (remaining < needed) break
    remaining -= needed
    level++
  }
  return { level, xpInLevel: remaining }
}

export function getStreakMultiplier(streak) {
  return Math.round((1.0 + Math.min(streak * 0.033, 1.0)) * 100) / 100
}

export function getDifficultyMultiplier(difficulty) {
  const map = { easy: 0.75, normal: 1.0, hard: 1.5, boss: 2.5 }
  return map[difficulty] || 1.0
}

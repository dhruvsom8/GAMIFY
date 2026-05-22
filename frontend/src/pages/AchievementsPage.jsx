import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import api from '../lib/api'
import PixelPanel from '../components/ui/PixelPanel'

const RARITY_STYLES = {
  common:    { cls: 'rarity-common',    label: 'COMMON',    border: 'border-rpg-gray' },
  rare:      { cls: 'rarity-rare',      label: 'RARE',      border: 'border-rpg-blue' },
  epic:      { cls: 'rarity-epic',      label: 'EPIC',      border: 'border-rpg-purple' },
  legendary: { cls: 'rarity-legendary', label: 'LEGENDARY', border: 'border-rpg-gold' },
}

const ICON_MAP = { trophy:'🏆', sword:'⚔️', scroll:'📜', shield:'🛡️', crown:'👑', star:'⭐', fire:'🔥', gem:'💎', diamond:'🔷', skull:'💀', bag:'🎒', book:'📖' }

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/achievements/').then(({ data }) => {
      setAchievements(data.achievements)
      setLoading(false)
    })
  }, [])

  const earned = achievements.filter((a) => a.earned)
  const locked = achievements.filter((a) => !a.earned)

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="font-pixel text-rpg-green animate-blink">LOADING...</div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="font-pixel text-rpg-yellow text-glow-yellow text-sm">🏆 ACHIEVEMENTS</div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <PixelPanel className="p-4 text-center">
          <div className="font-pixel text-rpg-green text-xl mb-1">{earned.length}</div>
          <div className="font-pixel text-[7px] text-rpg-gray">EARNED</div>
        </PixelPanel>
        <PixelPanel className="p-4 text-center">
          <div className="font-pixel text-rpg-gray text-xl mb-1">{locked.length}</div>
          <div className="font-pixel text-[7px] text-rpg-gray">LOCKED</div>
        </PixelPanel>
        <PixelPanel className="p-4 text-center">
          <div className="font-pixel text-rpg-yellow text-xl mb-1">
            {achievements.length > 0 ? Math.round((earned.length / achievements.length) * 100) : 0}%
          </div>
          <div className="font-pixel text-[7px] text-rpg-gray">COMPLETE</div>
        </PixelPanel>
      </div>

      {/* Earned */}
      {earned.length > 0 && (
        <div>
          <div className="font-pixel text-[9px] text-rpg-green mb-3">★ UNLOCKED</div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {earned.map((ach, i) => (
              <AchievementCard key={ach.id} achievement={ach} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Locked */}
      {locked.length > 0 && (
        <div>
          <div className="font-pixel text-[9px] text-rpg-gray mb-3">🔒 LOCKED</div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {locked.map((ach, i) => (
              <AchievementCard key={ach.id} achievement={ach} index={i} locked />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function AchievementCard({ achievement, index, locked = false }) {
  const rarity = RARITY_STYLES[achievement.rarity] || RARITY_STYLES.common

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <PixelPanel className={`p-4 ${locked ? 'opacity-40' : ''} ${rarity.border}`}>
        <div className="flex items-start gap-3">
          <div className={`text-3xl ${locked ? 'grayscale' : ''}`}>
            {locked ? '🔒' : (ICON_MAP[achievement.icon] || '🏆')}
          </div>
          <div className="flex-1 min-w-0">
            <div className={`font-pixel text-[9px] mb-1 ${rarity.cls}`}>
              {achievement.name}
            </div>
            <div className="font-pixel text-[7px] text-rpg-gray mb-2 leading-relaxed">
              {achievement.description}
            </div>
            <div className="flex items-center gap-2">
              <span className={`font-pixel text-[6px] border px-1 ${rarity.cls} ${rarity.border}`}>
                {rarity.label}
              </span>
              {achievement.xp_bonus > 0 && (
                <span className="font-pixel text-[7px] text-rpg-green">
                  +{achievement.xp_bonus} XP
                </span>
              )}
            </div>
          </div>
        </div>
      </PixelPanel>
    </motion.div>
  )
}

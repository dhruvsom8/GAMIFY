import { useState } from 'react'
import { motion } from 'framer-motion'
import useAuthStore from '../store/authStore'
import api from '../lib/api'
import PixelPanel from '../components/ui/PixelPanel'
import PixelButton from '../components/ui/PixelButton'
import PixelInput from '../components/ui/PixelInput'
import XPBar from '../components/ui/XPBar'
import { xpForNextLevel, calculateLevelFromTotalXP } from '../lib/xpEngine'
import toast from 'react-hot-toast'

const AVATARS = ['warrior', 'mage', 'rogue', 'paladin']
const AVATAR_ICONS = { warrior: '🧙', mage: '🧝', rogue: '🥷', paladin: '⚔️' }
const THEMES = ['default', 'fire', 'ice', 'shadow', 'gold']

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore()
  const [form, setForm] = useState({
    username: user?.username || '',
    bio: user?.bio || '',
    avatar: user?.avatar || 'warrior',
    theme: user?.theme || 'default',
    streak_penalty_enabled: user?.streak_penalty_enabled || false,
  })
  const [loading, setLoading] = useState(false)

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target?.value ?? e }))

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.put('/auth/me', form)
      updateUser(data.user)
      toast.success('Profile saved!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error saving profile')
    } finally {
      setLoading(false)
    }
  }

  const nextXP = user ? xpForNextLevel(user.global_level) : 100
  const { xpInLevel } = user ? calculateLevelFromTotalXP(user.total_xp) : { xpInLevel: 0 }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="font-pixel text-rpg-blue text-glow-blue text-sm">👤 PLAYER PROFILE</div>

      {/* Character card */}
      <PixelPanel title="CHARACTER STATS" color="blue" animate>
        <div className="p-6">
          <div className="flex items-center gap-6 mb-6">
            <motion.div
              className="w-20 h-20 border-4 border-rpg-blue flex items-center justify-center text-5xl bg-rpg-bg"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              {AVATAR_ICONS[user?.avatar] || '🧙'}
            </motion.div>
            <div>
              <div className="font-pixel text-rpg-white text-sm mb-1">{user?.username}</div>
              <div className="font-pixel text-[8px] text-rpg-gray mb-2">{user?.title}</div>
              <div className="font-pixel text-[8px] text-rpg-yellow">
                GLOBAL LEVEL {user?.global_level}
              </div>
            </div>
          </div>

          <XPBar current={xpInLevel} max={nextXP} level={user?.global_level} color="blue" height="lg" />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            <StatBox label="TOTAL XP" value={user?.total_xp?.toLocaleString()} />
            <StatBox label="QUESTS" value={user?.total_quests_completed} />
            <StatBox label="STREAK" value={`${user?.current_streak}🔥`} />
            <StatBox label="BEST STREAK" value={`${user?.longest_streak}🔥`} />
          </div>
        </div>
      </PixelPanel>

      {/* Edit form */}
      <PixelPanel title="EDIT CHARACTER" animate>
        <form onSubmit={handleSave} className="p-4 space-y-4">
          <PixelInput label="USERNAME" value={form.username} onChange={set('username')} />
          <PixelInput label="BIO" as="textarea" value={form.bio} onChange={set('bio')} placeholder="Your adventure story..." rows={2} />

          {/* Avatar */}
          <div>
            <div className="font-pixel text-[9px] text-rpg-gray-light mb-2">CLASS</div>
            <div className="flex gap-3">
              {AVATARS.map((av) => (
                <button
                  key={av} type="button"
                  onClick={() => setForm((f) => ({ ...f, avatar: av }))}
                  className={`w-12 h-12 border-2 text-2xl flex items-center justify-center ${
                    form.avatar === av ? 'border-rpg-blue bg-rpg-blue bg-opacity-20' : 'border-rpg-border'
                  }`}
                >
                  {AVATAR_ICONS[av]}
                </button>
              ))}
            </div>
          </div>

          {/* Streak penalty */}
          <div className="flex items-center gap-3 p-3 border-2 border-rpg-border">
            <input
              type="checkbox"
              checked={form.streak_penalty_enabled}
              onChange={(e) => setForm((f) => ({ ...f, streak_penalty_enabled: e.target.checked }))}
              className="w-4 h-4"
            />
            <div>
              <div className="font-pixel text-[8px] text-rpg-red">STREAK PENALTY MODE</div>
              <div className="font-pixel text-[7px] text-rpg-gray mt-1">
                Failing quests breaks your streak
              </div>
            </div>
          </div>

          <PixelButton type="submit" variant="blue" loading={loading} className="w-full">
            SAVE CHANGES
          </PixelButton>
        </form>
      </PixelPanel>
    </div>
  )
}

function StatBox({ label, value }) {
  return (
    <div className="bg-rpg-bg border-2 border-rpg-border p-3 text-center">
      <div className="font-pixel text-[10px] text-rpg-white mb-1">{value}</div>
      <div className="font-pixel text-[6px] text-rpg-gray">{label}</div>
    </div>
  )
}

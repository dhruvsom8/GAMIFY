import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import useAuthStore from '../../store/authStore'
import PixelIcon from '../ui/PixelIcon'
import XPBar from '../ui/XPBar'
import { calculateLevelFromTotalXP, xpForNextLevel } from '../../lib/xpEngine'

const NAV_ITEMS = [
  { to: '/dashboard', icon: 'home',     label: 'DASHBOARD' },
  { to: '/skills',    icon: 'sword',    label: 'SKILLS' },
  { to: '/quests',    icon: 'scroll',   label: 'QUESTS' },
  { to: '/achievements', icon: 'trophy', label: 'BADGES' },
  { to: '/profile',   icon: 'user',     label: 'PROFILE' },
]

export default function Sidebar({ onCloseMobile }) {
  const { user, logout } = useAuthStore()

  const { xpInLevel } = user ? calculateLevelFromTotalXP(user.total_xp) : { xpInLevel: 0 }
  const nextLevelXP = user ? xpForNextLevel(user.global_level) : 100

  const handleNavClick = () => {
    if (onCloseMobile) onCloseMobile()
  }

  return (
    <aside className="w-56 min-h-screen bg-rpg-panel border-r-4 border-rpg-border flex flex-col shrink-0">
      {/* Logo */}
      <div className="p-4 border-b-4 border-rpg-border">
        <div className="font-pixel text-rpg-green text-glow-green text-sm text-center leading-relaxed">
          ★ GAMIFY ★
        </div>
        <div className="font-pixel text-[7px] text-rpg-gray text-center mt-1">
          XP LEVELING SYSTEM
        </div>
      </div>

      {/* Player card */}
      {user && (
        <div className="p-3 border-b-2 border-rpg-border">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 border-2 border-rpg-green flex items-center justify-center bg-rpg-bg text-lg">
              <PixelIcon icon={user.avatar || 'warrior'} size="sm" />
            </div>
            <div className="min-w-0">
              <div className="font-pixel text-[8px] text-rpg-white truncate">{user.username}</div>
              <div className="font-pixel text-[6px] text-rpg-gray truncate">{user.title}</div>
            </div>
          </div>
          <XPBar
            current={xpInLevel}
            max={nextLevelXP}
            level={user.global_level}
            showLabel={false}
            height="sm"
          />
          <div className="flex justify-between mt-1">
            <span className="font-pixel text-[6px] text-rpg-gray">LV.{user.global_level}</span>
            <span className="font-pixel text-[6px] text-rpg-yellow">🔥{user.current_streak}</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-2">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={handleNavClick}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 mb-1 font-pixel text-[8px] border-2 transition-none ${
                isActive
                  ? 'border-rpg-green text-rpg-green bg-rpg-green bg-opacity-10 text-glow-green'
                  : 'border-transparent text-rpg-gray hover:border-rpg-border hover:text-rpg-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <PixelIcon icon={item.icon} size="sm" />
                <span>{item.label}</span>
                {isActive && <span className="ml-auto animate-blink">◄</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t-2 border-rpg-border">
        <button
          onClick={() => {
            logout()
            if (onCloseMobile) onCloseMobile()
          }}
          className="w-full font-pixel text-[8px] text-rpg-gray hover:text-rpg-red px-3 py-2 border-2 border-transparent hover:border-rpg-red transition-none"
        >
          ⏻ LOGOUT
        </button>
      </div>
    </aside>
  )
}

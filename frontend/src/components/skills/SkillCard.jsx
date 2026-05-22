import { motion } from 'framer-motion'
import PixelPanel from '../ui/PixelPanel'
import XPBar from '../ui/XPBar'
import PixelIcon from '../ui/PixelIcon'
import PixelButton from '../ui/PixelButton'

/**
 * RPG-style skill card — looks like a Pokémon stat screen or JRPG inventory slot.
 */
export default function SkillCard({ skill, onEdit, onDelete, onClick }) {
  const streakColor = skill.current_streak >= 7 ? 'text-rpg-yellow' :
                      skill.current_streak >= 3 ? 'text-rpg-green' : 'text-rpg-gray'

  return (
    <motion.div
      whileHover={{ y: -2, transition: { duration: 0.1 } }}
      className="cursor-pointer"
      onClick={() => onClick?.(skill)}
    >
      <PixelPanel className="p-4 hover:border-rpg-green transition-colors duration-100">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 flex items-center justify-center border-2 border-rpg-border"
              style={{ background: skill.color + '22', borderColor: skill.color }}
            >
              <PixelIcon icon={skill.icon} size="md" />
            </div>
            <div>
              <div className="font-pixel text-[10px] text-rpg-white mb-1">{skill.name}</div>
              <div className="font-pixel text-[8px] text-rpg-gray-light">
                LV.{skill.current_level} ADVENTURER
              </div>
            </div>
          </div>
          {/* Level badge */}
          <div
            className="font-pixel text-[9px] px-2 py-1 border-2"
            style={{ color: skill.color, borderColor: skill.color, background: skill.color + '22' }}
          >
            LV {skill.current_level}
          </div>
        </div>

        {/* XP Bar */}
        <div className="mb-3">
          <XPBar
            current={skill.current_xp}
            max={skill.xp_for_next_level}
            level={skill.current_level}
            showLabel={true}
            height="md"
          />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <StatBox label="QUESTS" value={skill.total_quests_completed} color="text-rpg-blue" />
          <StatBox label="STREAK" value={`${skill.current_streak}🔥`} color={streakColor} />
          <StatBox label="TOTAL XP" value={skill.total_xp_earned} color="text-rpg-yellow" />
        </div>

        {/* Description */}
        {skill.description && (
          <div className="font-pixel text-[7px] text-rpg-gray border-t border-rpg-border pt-2 mb-3 leading-relaxed">
            {skill.description}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <PixelButton variant="ghost" size="sm" onClick={() => onEdit?.(skill)} className="flex-1">
            EDIT
          </PixelButton>
          <PixelButton variant="red" size="sm" onClick={() => onDelete?.(skill)}>
            DEL
          </PixelButton>
        </div>
      </PixelPanel>
    </motion.div>
  )
}

function StatBox({ label, value, color }) {
  return (
    <div className="bg-rpg-bg border border-rpg-border p-2 text-center">
      <div className={`font-pixel text-[9px] ${color} mb-1`}>{value}</div>
      <div className="font-pixel text-[6px] text-rpg-gray">{label}</div>
    </div>
  )
}

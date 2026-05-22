import { motion } from 'framer-motion'
import { useState } from 'react'
import PixelPanel from '../ui/PixelPanel'
import PixelButton from '../ui/PixelButton'
import XPPopup, { LevelUpOverlay, AchievementPopup } from '../ui/XPPopup'
import PixelConfetti from '../ui/PixelConfetti'
import useGameStore from '../../store/gameStore'
import toast from 'react-hot-toast'

const DIFFICULTY_STYLES = {
  easy:   { label: 'EASY',   cls: 'diff-easy',   xpColor: 'text-rpg-green' },
  normal: { label: 'NORMAL', cls: 'diff-normal',  xpColor: 'text-rpg-blue' },
  hard:   { label: 'HARD',   cls: 'diff-hard',    xpColor: 'text-rpg-yellow' },
  boss:   { label: '★ BOSS', cls: 'diff-boss',    xpColor: 'text-rpg-red' },
}

/**
 * Quest card — looks like an Undertale battle option or JRPG quest log entry.
 */
export default function QuestCard({ quest, onEdit, onDelete, skillName }) {
  const { completeQuest, failQuest } = useGameStore()
  const [loading, setLoading] = useState(false)
  const [showXP, setShowXP] = useState(false)
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showAchievement, setShowAchievement] = useState(false)
  const [xpResult, setXpResult] = useState(null)
  const [newAchievement, setNewAchievement] = useState(null)

  const diff = DIFFICULTY_STYLES[quest.difficulty] || DIFFICULTY_STYLES.normal
  const isCompleted = quest.status === 'completed'
  const isFailed = quest.status === 'failed'
  const isPending = quest.status === 'pending'

  const handleComplete = async () => {
    if (!isPending) return
    setLoading(true)
    try {
      const result = await completeQuest(quest.id)
      setXpResult(result.xp_result)
      setShowXP(true)
      setShowConfetti(true)

      if (result.xp_result?.skill_leveled_up || result.xp_result?.user_leveled_up) {
        setTimeout(() => setShowLevelUp(true), 800)
      }

      if (result.new_achievements?.length > 0) {
        setNewAchievement(result.new_achievements[0])
        setTimeout(() => setShowAchievement(true), 1500)
      }

      toast.success(`Quest complete! +${result.xp_result?.xp_awarded} XP`)
    } catch (e) {
      toast.error('Failed to complete quest')
    } finally {
      setLoading(false)
    }
  }

  const handleFail = async () => {
    if (!isPending) return
    setLoading(true)
    try {
      await failQuest(quest.id)
      toast.error('Quest failed...')
    } catch {
      toast.error('Error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <XPPopup xp={xpResult?.xp_awarded} show={showXP} onDone={() => setShowXP(false)} />
      <LevelUpOverlay
        show={showLevelUp}
        level={xpResult?.skill_level_after}
        onDone={() => setShowLevelUp(false)}
      />
      <PixelConfetti trigger={showConfetti} />
      <AchievementPopup
        achievement={newAchievement}
        show={showAchievement}
        onDone={() => setShowAchievement(false)}
      />

      <motion.div
        layout
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 8 }}
        className={`${isCompleted ? 'opacity-60' : ''} ${isFailed ? 'opacity-40' : ''}`}
      >
        <PixelPanel
          className={`p-4 ${
            quest.is_boss_battle ? 'border-rpg-red' :
            isCompleted ? 'border-rpg-green' :
            isFailed ? 'border-rpg-red' : ''
          }`}
        >
          {/* Boss battle banner */}
          {quest.is_boss_battle && (
            <div className="font-pixel text-[8px] text-rpg-red text-center mb-2 animate-blink">
              ⚠ BOSS BATTLE ⚠
            </div>
          )}

          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              {/* Title */}
              <div className="flex items-center gap-2 mb-1">
                {isCompleted && <span className="text-rpg-green text-sm">✓</span>}
                {isFailed && <span className="text-rpg-red text-sm">✗</span>}
                <span className={`font-pixel text-[10px] ${
                  isCompleted ? 'text-rpg-gray line-through' :
                  isFailed ? 'text-rpg-gray line-through' : 'text-rpg-white'
                }`}>
                  {quest.title}
                </span>
              </div>

              {/* Description */}
              {quest.description && (
                <div className="font-pixel text-[7px] text-rpg-gray mb-2 leading-relaxed">
                  {quest.description}
                </div>
              )}

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Difficulty */}
                <span className={`font-pixel text-[7px] border px-1 py-0.5 ${diff.cls}`}>
                  {diff.label}
                </span>

                {/* XP reward */}
                <span className={`font-pixel text-[8px] ${diff.xpColor}`}>
                  +{quest.final_xp} XP
                </span>

                {/* Duration */}
                {quest.estimated_duration && (
                  <span className="font-pixel text-[7px] text-rpg-gray">
                    ⏱ {quest.estimated_duration}m
                  </span>
                )}

                {/* Skill */}
                {skillName && (
                  <span className="font-pixel text-[7px] text-rpg-purple">
                    [{skillName}]
                  </span>
                )}

                {/* Recurring */}
                {quest.is_recurring && (
                  <span className="font-pixel text-[7px] text-rpg-cyan">↻ {quest.recurrence_type}</span>
                )}

                {/* Due date */}
                {quest.due_date && (
                  <span className="font-pixel text-[7px] text-rpg-gray">
                    📅 {quest.due_date}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            {isPending && (
              <div className="flex flex-col gap-1 shrink-0">
                <PixelButton variant="green" size="sm" onClick={handleComplete} loading={loading}>
                  ✓
                </PixelButton>
                <PixelButton variant="red" size="sm" onClick={handleFail} loading={loading}>
                  ✗
                </PixelButton>
              </div>
            )}
          </div>

          {/* Edit/Delete */}
          {isPending && (
            <div className="flex gap-2 mt-3 pt-2 border-t border-rpg-border">
              <PixelButton variant="ghost" size="sm" onClick={() => onEdit?.(quest)} className="flex-1">
                EDIT
              </PixelButton>
              <PixelButton variant="red" size="sm" onClick={() => onDelete?.(quest)}>
                DEL
              </PixelButton>
            </div>
          )}
        </PixelPanel>
      </motion.div>
    </>
  )
}

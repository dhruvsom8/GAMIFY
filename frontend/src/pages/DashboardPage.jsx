import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import useGameStore from '../store/gameStore'
import useAuthStore from '../store/authStore'
import PixelPanel from '../components/ui/PixelPanel'
import XPBar from '../components/ui/XPBar'
import QuestCard from '../components/quests/QuestCard'
import SkillCard from '../components/skills/SkillCard'
import { xpForNextLevel, calculateLevelFromTotalXP } from '../lib/xpEngine'

export default function DashboardPage() {
  const { dashboard, fetchDashboard, isLoading } = useGameStore()
  const { user } = useAuthStore()

  useEffect(() => { fetchDashboard() }, [])

  if (isLoading || !dashboard) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="font-pixel text-rpg-green text-sm animate-blink">LOADING...</div>
      </div>
    )
  }

  const { today, today_quests, skills, weekly_chart, heatmap } = dashboard
  const nextXP = user ? xpForNextLevel(user.global_level) : 100
  const { xpInLevel } = user ? calculateLevelFromTotalXP(user.total_xp) : { xpInLevel: 0 }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="font-pixel text-rpg-green text-glow-green text-sm">
        ★ ADVENTURE LOG
      </div>

      {/* Top stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="GLOBAL LV" value={user?.global_level} color="text-rpg-yellow" icon="⭐" />
        <StatCard label="TODAY XP" value={`+${today.xp_earned}`} color="text-rpg-green" icon="⚡" />
        <StatCard label="STREAK" value={`${user?.current_streak}🔥`} color="text-rpg-red" icon="🔥" />
        <StatCard label="QUESTS DONE" value={today.quests_completed} color="text-rpg-blue" icon="✓" />
      </div>

      {/* Player status panel */}
      <PixelPanel title="PLAYER STATUS" color="green" animate>
        <div className="p-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 border-4 border-rpg-green flex items-center justify-center text-4xl bg-rpg-bg">
              {user?.avatar === 'mage' ? '🧝' : user?.avatar === 'rogue' ? '🥷' : user?.avatar === 'paladin' ? '⚔️' : '🧙'}
            </div>
            <div>
              <div className="font-pixel text-rpg-white text-sm mb-1">{user?.username}</div>
              <div className="font-pixel text-[8px] text-rpg-gray mb-2">{user?.title}</div>
              <div className="font-pixel text-[8px] text-rpg-yellow">
                TOTAL XP: {user?.total_xp?.toLocaleString()}
              </div>
            </div>
          </div>
          <XPBar
            current={xpInLevel}
            max={nextXP}
            level={user?.global_level}
            color="green"
            height="lg"
          />
        </div>
      </PixelPanel>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's quests */}
        <PixelPanel title="TODAY'S SIDE QUESTS" animate>
          <div className="p-4 space-y-3">
            {today_quests.length === 0 ? (
              <div className="font-pixel text-[8px] text-rpg-gray text-center py-4">
                NO QUESTS TODAY.<br />
                <span className="text-rpg-green">ADD SOME QUESTS!</span>
              </div>
            ) : (
              today_quests.map((q) => (
                <QuestCard
                  key={q.id}
                  quest={q}
                  skillName={skills.find((s) => s.id === q.skill_id)?.name}
                />
              ))
            )}
          </div>
        </PixelPanel>

        {/* Weekly XP chart */}
        <PixelPanel title="WEEKLY XP CHART" animate>
          <div className="p-4 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekly_chart} barSize={20}>
                <XAxis
                  dataKey="date"
                  tick={{ fontFamily: '"Press Start 2P"', fontSize: 6, fill: '#6b7280' }}
                  tickFormatter={(d) => d.slice(5)}
                  axisLine={{ stroke: '#2a2a3a' }}
                  tickLine={false}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    background: '#12121a',
                    border: '2px solid #2a2a3a',
                    fontFamily: '"Press Start 2P"',
                    fontSize: 8,
                    color: '#e5e7eb',
                    borderRadius: 0,
                  }}
                  formatter={(v) => [`${v} XP`, 'XP']}
                />
                <Bar dataKey="xp_earned" radius={0}>
                  {weekly_chart.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.xp_earned > 0 ? '#4ade80' : '#2a2a3a'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </PixelPanel>
      </div>

      {/* Heatmap */}
      <PixelPanel title="ACTIVITY HEATMAP (90 DAYS)" animate>
        <div className="p-4">
          <HeatmapGrid heatmap={heatmap} />
        </div>
      </PixelPanel>

      {/* Skills overview */}
      {skills.length > 0 && (
        <PixelPanel title="ACTIVE SKILLS" animate>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {skills.slice(0, 6).map((skill) => (
              <MiniSkillCard key={skill.id} skill={skill} />
            ))}
          </div>
        </PixelPanel>
      )}
    </div>
  )
}

function StatCard({ label, value, color, icon }) {
  return (
    <motion.div
      className="pixel-panel p-4 text-center"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="text-2xl mb-2">{icon}</div>
      <div className={`font-pixel text-sm ${color} mb-1`}>{value}</div>
      <div className="font-pixel text-[7px] text-rpg-gray">{label}</div>
    </motion.div>
  )
}

function MiniSkillCard({ skill }) {
  return (
    <div className="bg-rpg-bg border-2 border-rpg-border p-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{skill.icon === 'sword' ? '⚔️' : '📖'}</span>
        <div>
          <div className="font-pixel text-[8px] text-rpg-white">{skill.name}</div>
          <div className="font-pixel text-[6px] text-rpg-gray">LV.{skill.current_level}</div>
        </div>
      </div>
      <XPBar
        current={skill.current_xp}
        max={skill.xp_for_next_level}
        level={skill.current_level}
        showLabel={false}
        height="sm"
      />
    </div>
  )
}

function HeatmapGrid({ heatmap }) {
  const today = new Date()
  const days = Array.from({ length: 90 }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (89 - i))
    const key = d.toISOString().slice(0, 10)
    return { key, count: heatmap[key] || 0 }
  })

  const getColor = (count) => {
    if (count === 0) return '#1a1a2a'
    if (count === 1) return '#16a34a'
    if (count <= 3) return '#22c55e'
    return '#4ade80'
  }

  return (
    <div className="flex flex-wrap gap-1">
      {days.map(({ key, count }) => (
        <div
          key={key}
          title={`${key}: ${count} quests`}
          className="w-3 h-3 border border-black"
          style={{ background: getColor(count), imageRendering: 'pixelated' }}
        />
      ))}
    </div>
  )
}

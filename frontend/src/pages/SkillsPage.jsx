import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useGameStore from '../store/gameStore'
import SkillCard from '../components/skills/SkillCard'
import PixelPanel from '../components/ui/PixelPanel'
import PixelButton from '../components/ui/PixelButton'
import PixelInput from '../components/ui/PixelInput'
import toast from 'react-hot-toast'

const ICONS = ['sword', 'book', 'music', 'code', 'fitness', 'writing', 'film', 'sales', 'art', 'science', 'lightning', 'gem']
const COLORS = ['#4ade80', '#60a5fa', '#fbbf24', '#f87171', '#a78bfa', '#22d3ee', '#fb923c', '#f472b6']
const ICON_EMOJIS = { sword:'⚔️', book:'📖', music:'🎵', code:'💻', fitness:'💪', writing:'✍️', film:'🎬', sales:'💰', art:'🎨', science:'🔬', lightning:'⚡', gem:'💎' }

const EMPTY_FORM = { name: '', description: '', icon: 'sword', color: '#4ade80', decay_enabled: false }

export default function SkillsPage() {
  const { skills, fetchSkills, createSkill, updateSkill, deleteSkill } = useGameStore()
  const [showForm, setShowForm] = useState(false)
  const [editingSkill, setEditingSkill] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(false)

  useEffect(() => { fetchSkills() }, [])

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target?.value ?? e }))

  const openCreate = () => { setForm(EMPTY_FORM); setEditingSkill(null); setShowForm(true) }
  const openEdit = (skill) => {
    setForm({ name: skill.name, description: skill.description, icon: skill.icon, color: skill.color, decay_enabled: skill.decay_enabled })
    setEditingSkill(skill)
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editingSkill) {
        await updateSkill(editingSkill.id, form)
        toast.success('Skill updated!')
      } else {
        await createSkill(form)
        toast.success('New skill created!')
      }
      setShowForm(false)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error saving skill')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (skill) => {
    if (!confirm(`Delete "${skill.name}"? This will remove all quests too.`)) return
    await deleteSkill(skill.id)
    toast.success('Skill deleted')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="font-pixel text-rpg-green text-glow-green text-sm">⚔ SKILL TREE</div>
        <PixelButton variant="green" onClick={openCreate}>+ NEW SKILL</PixelButton>
      </div>

      {/* Skill form modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-md my-4 mx-auto"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <PixelPanel title={editingSkill ? 'EDIT SKILL' : 'CREATE SKILL'} color="green">
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                  <PixelInput label="SKILL NAME" value={form.name} onChange={set('name')} placeholder="e.g. Copywriting" required />
                  <PixelInput label="DESCRIPTION" as="textarea" value={form.description} onChange={set('description')} placeholder="What will you master?" rows={2} />

                  {/* Icon picker */}
                  <div>
                    <div className="font-pixel text-[9px] text-rpg-gray-light mb-2">ICON</div>
                    <div className="flex flex-wrap gap-2">
                      {ICONS.map((ic) => (
                        <button
                          key={ic} type="button"
                          onClick={() => setForm((f) => ({ ...f, icon: ic }))}
                          className={`w-9 h-9 border-2 text-lg flex items-center justify-center ${form.icon === ic ? 'border-rpg-green bg-rpg-green bg-opacity-20' : 'border-rpg-border'}`}
                        >
                          {ICON_EMOJIS[ic]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color picker */}
                  <div>
                    <div className="font-pixel text-[9px] text-rpg-gray-light mb-2">COLOR</div>
                    <div className="flex flex-wrap gap-2">
                      {COLORS.map((c) => (
                        <button
                          key={c} type="button"
                          onClick={() => setForm((f) => ({ ...f, color: c }))}
                          className={`w-8 h-8 border-2 ${form.color === c ? 'border-white scale-110' : 'border-transparent'}`}
                          style={{ background: c }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Decay toggle */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, decay_enabled: !f.decay_enabled }))}
                      className={`w-10 h-5 border-2 relative ${form.decay_enabled ? 'border-rpg-yellow bg-rpg-yellow bg-opacity-20' : 'border-rpg-border'}`}
                    >
                      <span className={`absolute top-0 w-4 h-4 bg-current transition-none ${form.decay_enabled ? 'right-0 text-rpg-yellow' : 'left-0 text-rpg-gray'}`} style={{ background: form.decay_enabled ? '#fbbf24' : '#2a2a3a' }} />
                    </button>
                    <span className="font-pixel text-[8px] text-rpg-gray-light">SKILL DECAY</span>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <PixelButton type="submit" variant="green" loading={loading} className="flex-1">
                      {editingSkill ? 'SAVE' : 'CREATE'}
                    </PixelButton>
                    <PixelButton type="button" variant="ghost" onClick={() => setShowForm(false)}>
                      CANCEL
                    </PixelButton>
                  </div>
                </form>
              </PixelPanel>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skills grid */}
      {skills.length === 0 ? (
        <PixelPanel className="p-8 text-center">
          <div className="font-pixel text-[9px] text-rpg-gray mb-4">NO SKILLS YET</div>
          <div className="font-pixel text-[8px] text-rpg-gray-light mb-6">
            CREATE YOUR FIRST SKILL TO BEGIN YOUR ADVENTURE
          </div>
          <PixelButton variant="green" onClick={openCreate}>+ CREATE SKILL</PixelButton>
        </PixelPanel>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {skills.map((skill) => (
              <SkillCard
                key={skill.id}
                skill={skill}
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

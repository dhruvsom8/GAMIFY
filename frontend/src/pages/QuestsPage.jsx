import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors,
} from '@dnd-kit/core'
import {
  SortableContext, sortableKeyboardCoordinates,
  verticalListSortingStrategy, useSortable, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import useGameStore from '../store/gameStore'
import QuestCard from '../components/quests/QuestCard'
import PixelPanel from '../components/ui/PixelPanel'
import PixelButton from '../components/ui/PixelButton'
import PixelInput from '../components/ui/PixelInput'
import toast from 'react-hot-toast'

const EMPTY_FORM = {
  title: '', description: '', skill_id: '', xp_reward: 50,
  difficulty: 'normal', due_date: '', estimated_duration: 30,
  is_recurring: false, recurrence_type: 'daily', is_boss_battle: false,
}

export default function QuestsPage() {
  const { skills, quests, fetchSkills, fetchQuests, createQuest, updateQuest, deleteQuest, reorderQuests } = useGameStore()
  const [showForm, setShowForm] = useState(false)
  const [editingQuest, setEditingQuest] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [filterSkill, setFilterSkill] = useState('')
  const [filterStatus, setFilterStatus] = useState('pending')
  const [localQuests, setLocalQuests] = useState([])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  useEffect(() => {
    fetchSkills()
    fetchQuests({ status: filterStatus, skill_id: filterSkill || undefined })
  }, [filterStatus, filterSkill])

  useEffect(() => { setLocalQuests(quests) }, [quests])

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target?.value ?? e }))

  const openCreate = () => { setForm(EMPTY_FORM); setEditingQuest(null); setShowForm(true) }
  const openEdit = (quest) => {
    setForm({
      title: quest.title, description: quest.description,
      skill_id: quest.skill_id, xp_reward: quest.xp_reward,
      difficulty: quest.difficulty, due_date: quest.due_date || '',
      estimated_duration: quest.estimated_duration,
      is_recurring: quest.is_recurring, recurrence_type: quest.recurrence_type || 'daily',
      is_boss_battle: quest.is_boss_battle,
    })
    setEditingQuest(quest)
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = { ...form, skill_id: parseInt(form.skill_id), xp_reward: parseInt(form.xp_reward), estimated_duration: parseInt(form.estimated_duration) }
      if (editingQuest) {
        await updateQuest(editingQuest.id, payload)
        toast.success('Quest updated!')
      } else {
        await createQuest(payload)
        toast.success('Quest created!')
      }
      setShowForm(false)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error saving quest')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (quest) => {
    if (!confirm(`Delete "${quest.title}"?`)) return
    await deleteQuest(quest.id)
    toast.success('Quest deleted')
  }

  const handleDragEnd = async (event) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIdx = localQuests.findIndex((q) => q.id === active.id)
    const newIdx = localQuests.findIndex((q) => q.id === over.id)
    const reordered = arrayMove(localQuests, oldIdx, newIdx)
    setLocalQuests(reordered)
    await reorderQuests(reordered.map((q, i) => ({ id: q.id, sort_order: i })))
  }

  const skillMap = Object.fromEntries(skills.map((s) => [s.id, s]))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="font-pixel text-rpg-green text-glow-green text-sm">📜 SIDE QUESTS</div>
        <PixelButton variant="green" onClick={openCreate}>+ NEW QUEST</PixelButton>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {['pending', 'completed', 'failed'].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`font-pixel text-[8px] px-3 py-2 border-2 uppercase ${
              filterStatus === s ? 'border-rpg-green text-rpg-green' : 'border-rpg-border text-rpg-gray'
            }`}
          >
            {s}
          </button>
        ))}
        <select
          className="pixel-input text-[8px] w-auto"
          value={filterSkill}
          onChange={(e) => setFilterSkill(e.target.value)}
          style={{ background: '#0a0a0f' }}
        >
          <option value="">ALL SKILLS</option>
          {skills.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {/* Quest form modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4 overflow-y-auto"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div className="w-full max-w-md my-4 mx-auto" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
              <PixelPanel title={editingQuest ? 'EDIT QUEST' : 'NEW QUEST'} color="blue">
                <form onSubmit={handleSubmit} className="p-4 space-y-3">
                  <PixelInput label="QUEST TITLE" value={form.title} onChange={set('title')} placeholder="e.g. Write 3 headlines" required />
                  <PixelInput label="DESCRIPTION" as="textarea" value={form.description} onChange={set('description')} placeholder="Quest details..." rows={2} />

                  <PixelInput
                    label="SKILL" as="select" value={form.skill_id} onChange={set('skill_id')} required
                    options={[{ value: '', label: '-- SELECT SKILL --' }, ...skills.map((s) => ({ value: s.id, label: s.name }))]}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <PixelInput
                      label="DIFFICULTY" as="select" value={form.difficulty} onChange={set('difficulty')}
                      options={[
                        { value: 'easy', label: 'EASY (0.75x)' },
                        { value: 'normal', label: 'NORMAL (1x)' },
                        { value: 'hard', label: 'HARD (1.5x)' },
                        { value: 'boss', label: '★ BOSS (2.5x)' },
                      ]}
                    />
                    <PixelInput label="XP REWARD" type="number" value={form.xp_reward} onChange={set('xp_reward')} />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <PixelInput label="DUE DATE" type="date" value={form.due_date} onChange={set('due_date')} />
                    <PixelInput label="DURATION (MIN)" type="number" value={form.estimated_duration} onChange={set('estimated_duration')} />
                  </div>

                  {/* Recurring */}
                  <div className="flex items-center gap-3">
                    <input type="checkbox" checked={form.is_recurring} onChange={(e) => setForm((f) => ({ ...f, is_recurring: e.target.checked }))} className="w-4 h-4" />
                    <span className="font-pixel text-[8px] text-rpg-gray-light">RECURRING QUEST</span>
                  </div>
                  {form.is_recurring && (
                    <PixelInput
                      label="RECURRENCE" as="select" value={form.recurrence_type} onChange={set('recurrence_type')}
                      options={[
                        { value: 'daily', label: 'DAILY' },
                        { value: 'weekly', label: 'WEEKLY' },
                        { value: 'monthly', label: 'MONTHLY' },
                      ]}
                    />
                  )}

                  {/* Boss battle */}
                  <div className="flex items-center gap-3">
                    <input type="checkbox" checked={form.is_boss_battle} onChange={(e) => setForm((f) => ({ ...f, is_boss_battle: e.target.checked }))} className="w-4 h-4" />
                    <span className="font-pixel text-[8px] text-rpg-red">★ BOSS BATTLE</span>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <PixelButton type="submit" variant="blue" loading={loading} className="flex-1">
                      {editingQuest ? 'SAVE' : 'CREATE'}
                    </PixelButton>
                    <PixelButton type="button" variant="ghost" onClick={() => setShowForm(false)}>CANCEL</PixelButton>
                  </div>
                </form>
              </PixelPanel>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quest list with drag-and-drop */}
      {localQuests.length === 0 ? (
        <PixelPanel className="p-8 text-center">
          <div className="font-pixel text-[9px] text-rpg-gray mb-4">NO QUESTS FOUND</div>
          <PixelButton variant="green" onClick={openCreate}>+ CREATE QUEST</PixelButton>
        </PixelPanel>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={localQuests.map((q) => q.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {localQuests.map((quest) => (
                <SortableQuestItem
                  key={quest.id}
                  quest={quest}
                  skillName={skillMap[quest.skill_id]?.name}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}

function SortableQuestItem({ quest, skillName, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: quest.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }

  return (
    <div ref={setNodeRef} style={style}>
      <div className="flex items-start gap-2">
        {/* Drag handle */}
        <div
          {...attributes} {...listeners}
          className="mt-4 cursor-grab active:cursor-grabbing font-pixel text-[10px] text-rpg-gray hover:text-rpg-white select-none"
        >
          ⠿
        </div>
        <div className="flex-1">
          <QuestCard quest={quest} skillName={skillName} onEdit={onEdit} onDelete={onDelete} />
        </div>
      </div>
    </div>
  )
}

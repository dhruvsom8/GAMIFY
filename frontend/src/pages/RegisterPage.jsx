import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import useAuthStore from '../store/authStore'
import PixelButton from '../components/ui/PixelButton'
import PixelInput from '../components/ui/PixelInput'
import toast from 'react-hot-toast'

const AVATARS = ['warrior', 'mage', 'rogue', 'paladin']
const AVATAR_ICONS = { warrior: '🧙', mage: '🧝', rogue: '🥷', paladin: '⚔️' }

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '', avatar: 'warrior' })
  const { register, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await register(form.username, form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen bg-rpg-bg flex items-center justify-center crt-overlay p-4">
      <motion.div
        className="w-full max-w-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center mb-8">
          <div className="font-pixel text-rpg-green text-glow-green text-2xl mb-2">★ GAMIFY ★</div>
          <div className="font-pixel text-[8px] text-rpg-gray">CREATE YOUR CHARACTER</div>
        </div>

        <div className="pixel-panel p-6">
          <div className="font-pixel text-[9px] text-rpg-yellow mb-6 text-center">
            ▶ NEW GAME
          </div>

          {/* Avatar selector */}
          <div className="mb-4">
            <div className="font-pixel text-[9px] text-rpg-gray-light mb-2">CHOOSE CLASS</div>
            <div className="grid grid-cols-4 gap-2">
              {AVATARS.map((av) => (
                <button
                  key={av}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, avatar: av }))}
                  className={`p-2 border-2 text-xl text-center transition-none ${
                    form.avatar === av
                      ? 'border-rpg-green bg-rpg-green bg-opacity-20'
                      : 'border-rpg-border hover:border-rpg-gray'
                  }`}
                >
                  {AVATAR_ICONS[av]}
                </button>
              ))}
            </div>
            <div className="font-pixel text-[7px] text-rpg-gray text-center mt-1 capitalize">
              {form.avatar}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <PixelInput label="USERNAME" value={form.username} onChange={set('username')} placeholder="HeroName" required />
            <PixelInput label="EMAIL" type="email" value={form.email} onChange={set('email')} placeholder="hero@quest.com" required />
            <PixelInput label="PASSWORD" type="password" value={form.password} onChange={set('password')} placeholder="••••••••" required />
            <PixelButton type="submit" variant="green" size="lg" loading={isLoading} className="w-full mt-2">
              ▶ BEGIN ADVENTURE
            </PixelButton>
          </form>

          <div className="mt-4 text-center">
            <span className="font-pixel text-[7px] text-rpg-gray">HAVE ACCOUNT? </span>
            <Link to="/login" className="font-pixel text-[7px] text-rpg-green">LOGIN</Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import useAuthStore from '../store/authStore'
import PixelButton from '../components/ui/PixelButton'
import PixelInput from '../components/ui/PixelInput'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen bg-rpg-bg flex items-center justify-center crt-overlay p-4">
      <motion.div
        className="w-full max-w-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Title */}
        <div className="text-center mb-8">
          <div className="font-pixel text-rpg-green text-glow-green text-2xl mb-2 animate-pixel-bounce">
            ★ GAMIFY ★
          </div>
          <div className="font-pixel text-[8px] text-rpg-gray">XP LEVELING SYSTEM v1.0</div>
        </div>

        {/* Login panel */}
        <div className="pixel-panel p-6">
          <div className="font-pixel text-[9px] text-rpg-yellow mb-6 text-center">
            ▶ PLAYER LOGIN
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <PixelInput
              label="EMAIL"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="hero@quest.com"
              required
            />
            <PixelInput
              label="PASSWORD"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <PixelButton
              type="submit"
              variant="green"
              size="lg"
              loading={isLoading}
              className="w-full mt-2"
            >
              ▶ START GAME
            </PixelButton>
          </form>

          <div className="mt-4 text-center">
            <span className="font-pixel text-[7px] text-rpg-gray">NEW PLAYER? </span>
            <Link to="/register" className="font-pixel text-[7px] text-rpg-green hover:text-glow-green">
              CREATE ACCOUNT
            </Link>
          </div>
        </div>

        {/* Flavor text */}
        <div className="mt-4 text-center font-pixel text-[7px] text-rpg-gray animate-blink">
          INSERT COIN TO CONTINUE
        </div>
      </motion.div>
    </div>
  )
}

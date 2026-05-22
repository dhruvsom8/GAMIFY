/**
 * Pixel icon map — maps icon keys to emoji/unicode pixel-art equivalents.
 * In a real project, replace with actual pixel-art sprite sheets.
 */
const ICONS = {
  sword:    '⚔️',
  shield:   '🛡️',
  book:     '📖',
  scroll:   '📜',
  crown:    '👑',
  star:     '⭐',
  fire:     '🔥',
  gem:      '💎',
  diamond:  '🔷',
  trophy:   '🏆',
  skull:    '💀',
  bag:      '🎒',
  music:    '🎵',
  code:     '💻',
  fitness:  '💪',
  writing:  '✍️',
  film:     '🎬',
  sales:    '💰',
  art:      '🎨',
  science:  '🔬',
  heart:    '❤️',
  lightning:'⚡',
  map:      '🗺️',
  potion:   '🧪',
  key:      '🗝️',
  chest:    '📦',
  arrow:    '➡️',
  check:    '✅',
  cross:    '❌',
  clock:    '⏰',
  calendar: '📅',
  chart:    '📊',
  lock:     '🔒',
  unlock:   '🔓',
  user:     '👤',
  users:    '👥',
  settings: '⚙️',
  home:     '🏠',
  quest:    '❓',
  boss:     '👹',
  warrior:  '🧙',
  mage:     '🧝',
  rogue:    '🥷',
  paladin:  '⚔️',
}

export default function PixelIcon({ icon = 'sword', size = 'md', className = '' }) {
  const sizes = {
    xs: 'text-sm',
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-4xl',
  }

  return (
    <span
      className={`inline-block ${sizes[size]} ${className}`}
      role="img"
      aria-label={icon}
      style={{ imageRendering: 'pixelated' }}
    >
      {ICONS[icon] || '❓'}
    </span>
  )
}

export { ICONS }

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
        mono: ['"Courier New"', 'monospace'],
      },
      colors: {
        // Retro RPG palette
        rpg: {
          bg: '#0a0a0f',
          panel: '#12121a',
          border: '#2a2a3a',
          green: '#4ade80',
          'green-dark': '#16a34a',
          blue: '#60a5fa',
          'blue-dark': '#1d4ed8',
          yellow: '#fbbf24',
          'yellow-dark': '#d97706',
          red: '#f87171',
          'red-dark': '#dc2626',
          purple: '#a78bfa',
          'purple-dark': '#7c3aed',
          cyan: '#22d3ee',
          gray: '#6b7280',
          'gray-light': '#9ca3af',
          white: '#e5e7eb',
          gold: '#f59e0b',
        },
      },
      boxShadow: {
        'pixel': '4px 4px 0px #000',
        'pixel-sm': '2px 2px 0px #000',
        'pixel-lg': '6px 6px 0px #000',
        'glow-green': '0 0 10px #4ade80, 0 0 20px #4ade8044',
        'glow-blue': '0 0 10px #60a5fa, 0 0 20px #60a5fa44',
        'glow-yellow': '0 0 10px #fbbf24, 0 0 20px #fbbf2444',
        'glow-red': '0 0 10px #f87171, 0 0 20px #f8717144',
        'crt': 'inset 0 0 60px rgba(0,0,0,0.5)',
      },
      animation: {
        'pixel-bounce': 'pixelBounce 0.5s steps(4) infinite',
        'level-up': 'levelUp 0.8s steps(8) forwards',
        'xp-pop': 'xpPop 0.6s steps(6) forwards',
        'blink': 'blink 1s steps(1) infinite',
        'scanline': 'scanline 8s linear infinite',
        'shake': 'shake 0.3s steps(4)',
        'float': 'float 3s steps(6) infinite',
      },
      keyframes: {
        pixelBounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        levelUp: {
          '0%': { transform: 'scale(1)', opacity: '0' },
          '20%': { transform: 'scale(1.3)', opacity: '1' },
          '80%': { transform: 'scale(1.1)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '0' },
        },
        xpPop: {
          '0%': { transform: 'translateY(0) scale(1)', opacity: '1' },
          '100%': { transform: 'translateY(-40px) scale(0.8)', opacity: '0' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-4px)' },
          '75%': { transform: 'translateX(4px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [],
}

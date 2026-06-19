"use client"
import { useTheme } from './ThemeProvider'
import { Sun, ScrollText, Moon } from 'lucide-react'

const themes = [
  { key: 'light', label: 'Light', icon: <Sun size={18} /> },
  { key: 'sepia', label: 'Sepia', icon: <ScrollText size={18} /> },
  { key: 'dark',  label: 'Dark',  icon: <Moon size={18} /> },
]

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const next = () => {
    const idx = themes.findIndex(t => t.key === theme)
    setTheme(themes[(idx + 1) % themes.length].key)
  }

  const current = themes.find(t => t.key === theme) ?? themes[0]

  return (
    <button
      onClick={next}
      title={`Switch theme (current: ${current.label})`}
      style={{
        background: 'none',
        border: '1.5px solid var(--clr-border)',
        borderRadius: '8px',
        padding: '6px 10px',
        cursor: 'pointer',
        fontSize: '1rem',
        lineHeight: 1,
        color: 'var(--clr-text-muted)',
        transition: 'border-color 0.2s',
      }}
    >
      {current.icon}
    </button>
  )
}

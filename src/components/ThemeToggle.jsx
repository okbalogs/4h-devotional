"use client"
import { useTheme } from './ThemeProvider'

const themes = [
  { key: 'light', label: 'Light', icon: '☀️' },
  { key: 'sepia', label: 'Sepia', icon: '📜' },
  { key: 'dark',  label: 'Dark',  icon: '🌙' },
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

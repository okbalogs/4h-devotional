"use client"
import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const ThemeContext = createContext({ theme: 'light', setTheme: () => {} })

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState('light')

  useEffect(() => {
    const saved = localStorage.getItem('theme') || 'light'
    setThemeState(saved)
    document.documentElement.setAttribute('data-theme', saved)
    // Also toggle the 'dark' class so Tailwind's dark: prefix works
    if (saved === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  const setTheme = (t) => {
    setThemeState(t)
    localStorage.setItem('theme', t)
    document.documentElement.setAttribute('data-theme', t)
    // Also toggle the 'dark' class so Tailwind's dark: prefix works
    if (t === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)

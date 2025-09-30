'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import { useTheme } from 'next-themes'

export type CodeTheme = {
  id: string
  name: string
  monaco: string
  shiki: {
    light: string
    dark: string
  }
  prism: {
    light: string
    dark: string
  }
}

export const CODE_THEMES: CodeTheme[] = [
  {
    id: 'vitesse',
    name: 'Vitesse',
    monaco: 'vs-dark',
    shiki: {
      light: 'vitesse-light',
      dark: 'vitesse-dark',
    },
    prism: {
      light: 'oneLight',
      dark: 'oneDark',
    },
  },
  {
    id: 'github',
    name: 'GitHub',
    monaco: 'vs-dark',
    shiki: {
      light: 'github-light',
      dark: 'github-dark',
    },
    prism: {
      light: 'oneLight',
      dark: 'oneDark',
    },
  },
  {
    id: 'monokai',
    name: 'Monokai',
    monaco: 'vs-dark',
    shiki: {
      light: 'monokai-light',
      dark: 'monokai',
    },
    prism: {
      light: 'oneLight',
      dark: 'oneDark',
    },
  },
  {
    id: 'dracula',
    name: 'Dracula',
    monaco: 'vs-dark',
    shiki: {
      light: 'dracula-light',
      dark: 'dracula',
    },
    prism: {
      light: 'oneLight',
      dark: 'oneDark',
    },
  },
  {
    id: 'nord',
    name: 'Nord',
    monaco: 'vs-dark',
    shiki: {
      light: 'nord',
      dark: 'nord',
    },
    prism: {
      light: 'oneLight',
      dark: 'oneDark',
    },
  },
  {
    id: 'solarized',
    name: 'Solarized',
    monaco: 'vs-dark',
    shiki: {
      light: 'solarized-light',
      dark: 'solarized-dark',
    },
    prism: {
      light: 'oneLight',
      dark: 'oneDark',
    },
  },
]

type CodeThemeContextType = {
  currentTheme: CodeTheme
  setCurrentTheme: (theme: CodeTheme) => void
  themes: CodeTheme[]
}

const CodeThemeContext = createContext<CodeThemeContextType | undefined>(
  undefined
)

export const CodeThemeProvider = ({ children }: { children: ReactNode }) => {
  const { theme: systemTheme } = useTheme()
  const [currentTheme, setCurrentTheme] = useState<CodeTheme>(CODE_THEMES[0])

  // Сохраняем выбранную тему в localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('code-theme')
    if (savedTheme) {
      const theme = CODE_THEMES.find((t) => t.id === savedTheme)
      if (theme) {
        setCurrentTheme(theme)
      }
    }
  }, [])

  const handleSetCurrentTheme = (theme: CodeTheme) => {
    setCurrentTheme(theme)
    localStorage.setItem('code-theme', theme.id)
  }

  return (
    <CodeThemeContext.Provider
      value={{
        currentTheme,
        setCurrentTheme: handleSetCurrentTheme,
        themes: CODE_THEMES,
      }}
    >
      {children}
    </CodeThemeContext.Provider>
  )
}

export const useCodeTheme = () => {
  const context = useContext(CodeThemeContext)
  if (context === undefined) {
    throw new Error('useCodeTheme must be used within a CodeThemeProvider')
  }
  return context
}

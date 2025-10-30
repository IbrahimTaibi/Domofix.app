/**
 * Centralized theme configuration for Tawa
 * Use these constants throughout the app for consistent styling
 */

export const theme = {
  colors: {
    primary: {
      light: 'primary-50',
      main: 'primary-600',
      dark: 'primary-800',
      hover: 'primary-700',
    },
    background: {
      white: 'bg-white',
      gray: 'bg-gray-50',
      dark: 'bg-gray-900',
    },
    text: {
      primary: 'text-gray-900',
      secondary: 'text-gray-600',
      muted: 'text-gray-500',
    },
    border: {
      default: 'border-gray-200',
      hover: 'border-gray-300',
    },
  },
  
  spacing: {
    section: 'py-20',
    container: 'max-w-6xl mx-auto',
  },
  
  typography: {
    h1: 'text-5xl md:text-6xl font-light',
    h2: 'text-3xl font-light',
    h3: 'text-xl font-light',
    body: 'text-base',
    small: 'text-sm',
  },
} as const

/**
 * Helper function to get color classes
 */
export const getThemeColor = (color: keyof typeof theme.colors) => {
  return theme.colors[color]
}


// Theme constants converted from SCSS
export const theme = {
  // Colors
  colors: {
    black: '#000000',
    martinique: '#333350',
    white: '#ffffff',
    mercury: '#e3e3e3',
    monza: '#d8000c',
    pink: '#ffbaba',
    yellow: '#ffff00',
  },

  // Color modification percentages (for manual calculations)
  contrast: {
    verySoft: 0.01,
    soft: 0.05,
    light: 0.1,
    medium: 0.2,
    hard: 0.3,
  },

  // Transition times
  transitions: {
    fast: '0.25s',
    regular: '0.4s',
    slow: '0.6s',
  },

  // Spacing
  spacing: {
    s: '10px',
    m: '20px',
    l: '30px',
  },

  // Layout dimensions
  layout: {
    pageWidthMin: '600px',
    pageWidthMax: '800px',
    sidebarWidth: '350px',
  },

  // Typography
  fonts: {
    openSans: "'Open Sans', sans-serif",
    roboto: "'Roboto', sans-serif",
  },
}

// Helper function to darken colors (replaces SCSS darken())
export const darken = (color: string, amount: number): string => {
  const hex = color.replace('#', '')
  const r = Math.max(0, parseInt(hex.substring(0, 2), 16) - Math.floor(255 * amount))
  const g = Math.max(0, parseInt(hex.substring(2, 4), 16) - Math.floor(255 * amount))
  const b = Math.max(0, parseInt(hex.substring(4, 6), 16) - Math.floor(255 * amount))
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

// Helper function to lighten colors (replaces SCSS lighten())
export const lighten = (color: string, amount: number): string => {
  const hex = color.replace('#', '')
  const r = Math.min(255, parseInt(hex.substring(0, 2), 16) + Math.floor(255 * amount))
  const g = Math.min(255, parseInt(hex.substring(2, 4), 16) + Math.floor(255 * amount))
  const b = Math.min(255, parseInt(hex.substring(4, 6), 16) + Math.floor(255 * amount))
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

// Helper function to make colors transparent, simply appends to hex color two digits for alpha
export const transparentify = (color: string, amount: number): string => {
  const hex = color.replace('#', '')
  const a = Math.floor(255 * amount)
  return `#${hex}${a.toString(16).padStart(2, '0')}`
}

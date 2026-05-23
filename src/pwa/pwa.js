export const PWA_THEME = {
  primary: '#f25d0d',
  secondary: '#ff9100',
  accent: '#ffd900',
}

export function isStandaloneDisplay() {
  if (typeof window === 'undefined') {
    return false
  }

  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  )
}

export function canPromptForInstall() {
  if (typeof window === 'undefined') {
    return false
  }

  return 'BeforeInstallPromptEvent' in window || 'beforeinstallprompt' in window
}

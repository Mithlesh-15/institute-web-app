export const PWA_THEME = {
  primary: '#2563eb',
  secondary: '#1d4ed8',
  accent: '#f59e0b',
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

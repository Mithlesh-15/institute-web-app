import { useEffect, useState } from 'react'
import { Download } from 'lucide-react'
import { canPromptForInstall, isStandaloneDisplay } from '../../pwa/pwa'

function InstallAppButton({
  label = 'Install Student App',
  className = '',
  onInstalled,
  compact = false,
  showHelperText = true,
}) {
  const [installPrompt, setInstallPrompt] = useState(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [status, setStatus] = useState('idle')
  const [supportHint, setSupportHint] = useState('')

  useEffect(() => {
    const syncInstalledState = () => {
      const installed = isStandaloneDisplay()
      setIsInstalled(installed)

      if (installed) {
        setInstallPrompt(null)
        setStatus('installed')
        setSupportHint('')
      }
    }

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault()
      setInstallPrompt(event)
      setStatus('ready')
      setSupportHint('')
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setInstallPrompt(null)
      setStatus('installed')
      setSupportHint('')

      if (typeof onInstalled === 'function') {
        onInstalled()
      }
    }

    syncInstalledState()

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [onInstalled])

  const handleInstall = async () => {
    if (!installPrompt) {
      setStatus('unavailable')
      setSupportHint(
        canPromptForInstall()
          ? 'Install is preparing in your browser. Try again in a moment.'
          : 'Use your browser menu to install this app.',
      )
      return
    }

    setStatus('prompting')
    installPrompt.prompt()

    const choice = await installPrompt.userChoice
    if (choice?.outcome === 'accepted') {
      setIsInstalled(true)
      setInstallPrompt(null)
      setStatus('installed')
      setSupportHint('')

      if (typeof onInstalled === 'function') {
        onInstalled()
      }
      return
    }

    setStatus('ready')
  }

  if (isInstalled || !installPrompt) {
    if (isInstalled) {
      return (
        <div className={`inline-flex items-center rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 ${className}`}>
          App installed
        </div>
      )
    }
  }

  const isBusy = status === 'prompting'
  const helperTextClass = compact ? 'text-xs' : 'text-xs'
  const buttonTone =
    status === 'unavailable'
      ? 'opacity-90 ring-1 ring-[#f25d0d]/20'
      : ''

  return (
    <div className={`inline-flex flex-col gap-2 ${className}`}>
      <button
        type="button"
        onClick={handleInstall}
        disabled={isBusy}
        className={[
          'group inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#f25d0d] via-[#ff9100] to-[#ffd900] font-semibold text-white shadow-[0_18px_40px_rgba(242,93,13,0.24)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_48px_rgba(242,93,13,0.3)] focus:outline-none focus:ring-2 focus:ring-[#f25d0d]/40 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70',
          buttonTone,
          compact ? 'px-4 py-2.5 text-sm' : 'px-6 py-3 text-sm',
        ].join(' ')}
        aria-label={status === 'installed' ? 'App installed' : label}
        title={
          status === 'unavailable'
            ? supportHint || 'Install option will appear when your browser allows it.'
            : undefined
        }
      >
        <Download className="h-4 w-4 shrink-0" />
        <span className="transition-transform duration-300 group-hover:scale-[1.01]">
          {isBusy ? 'Preparing install...' : label}
        </span>
      </button>

      {showHelperText ? (
        status === 'installed' ? (
          <p className={`font-medium text-emerald-600 ${helperTextClass}`}>Installed successfully.</p>
        ) : status === 'unavailable' ? (
          <p className={`font-medium text-slate-500 ${helperTextClass}`}>{supportHint}</p>
        ) : (
          <p className={`font-medium text-slate-500 ${helperTextClass}`}>
            Install for faster access, offline-ready browsing, and app-like use.
          </p>
        )
      ) : null}
    </div>
  )
}

export default InstallAppButton

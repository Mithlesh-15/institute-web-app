import { useEffect, useState } from 'react'
import { isStandaloneDisplay } from '../../pwa/pwa'

function InstallAppButton({
  label = 'Install Student App',
  className = '',
  onInstalled,
}) {
  const [installPrompt, setInstallPrompt] = useState(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [status, setStatus] = useState('idle')

  useEffect(() => {
    const syncInstalledState = () => {
      const installed = isStandaloneDisplay()
      setIsInstalled(installed)

      if (installed) {
        setInstallPrompt(null)
        setStatus('installed')
      }
    }

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault()
      setInstallPrompt(event)
      setStatus('ready')
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setInstallPrompt(null)
      setStatus('installed')

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
      return
    }

    setStatus('prompting')
    installPrompt.prompt()

    const choice = await installPrompt.userChoice
    if (choice?.outcome === 'accepted') {
      setIsInstalled(true)
      setInstallPrompt(null)
      setStatus('installed')

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

    return null
  }

  const isBusy = status === 'prompting'

  return (
    <div className={`inline-flex flex-col gap-2 ${className}`}>
      <button
        type="button"
        onClick={handleInstall}
        disabled={isBusy}
        className="group inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-[#f25d0d] via-[#ff9100] to-[#ffd900] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(242,93,13,0.24)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_48px_rgba(242,93,13,0.3)] focus:outline-none focus:ring-2 focus:ring-[#f25d0d]/40 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
      >
        <span className="transition-transform duration-300 group-hover:scale-[1.01]">
          {isBusy ? 'Preparing install...' : label}
        </span>
      </button>

      {status === 'installed' ? (
        <p className="text-xs font-medium text-emerald-600">Installed successfully.</p>
      ) : (
        <p className="text-xs font-medium text-slate-500">
          Install for faster access, offline-ready browsing, and app-like use.
        </p>
      )}
    </div>
  )
}

export default InstallAppButton

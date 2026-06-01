import { useEffect, useState } from 'react'
import { Download } from 'lucide-react'
import {  isStandaloneDisplay } from '../../pwa/pwa'

function InstallAppButton({
  onInstalled,
  inline = false,
  label = 'Install App',
  className = '',
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
        return
      }

      // Check if global prompt was already captured before this component mounted
      if (window.deferredPrompt) {
        setInstallPrompt(window.deferredPrompt)
        setStatus('ready')
      }
    }

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault()
      setInstallPrompt(event)
      setStatus('ready')
    }

    const handlePromptReadyCustomEvent = () => {
      if (window.deferredPrompt) {
        setInstallPrompt(window.deferredPrompt)
        setStatus('ready')
      }
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
    window.addEventListener('pwa-prompt-ready', handlePromptReadyCustomEvent)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('pwa-prompt-ready', handlePromptReadyCustomEvent)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [onInstalled])

  const handleInstall = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
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

  // If already installed or browser hasn't fired beforeinstallprompt, return null
  if (isInstalled || !installPrompt) {
    return null
  }

  const isBusy = status === 'prompting'

  // Inline mode: standard button inside layout flow (e.g. landing page)
  if (inline) {
    return (
      <button
        type="button"
        onClick={handleInstall}
        disabled={isBusy}
        aria-label={label}
        className={`group inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-brand-strong hover:-translate-y-0.5 active:scale-95 disabled:opacity-75 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-brand/40 focus:ring-offset-2 ${className}`}
      >
        <Download className="h-4 w-4 shrink-0" />
        <span>{isBusy ? 'Installing...' : label}</span>
      </button>
    )
  }

  // Global Floating / Sticky mode (responsive layout)
  return (
    <>
      {/* 1. Mobile Design: Sticky Bottom Bar (Small screens) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 border-t border-slate-100 shadow-[0_-8px_30px_rgb(0,0,0,0.06)] z-50 flex flex-col gap-1 md:hidden">
        <button
          type="button"
          onClick={handleInstall}
          disabled={isBusy}
          aria-label="Install Raj Tuition Classes App"
          className="w-full group inline-flex items-center justify-center gap-2 rounded-xl bg-brand text-white py-3.5 px-4 font-semibold shadow-md transition-all duration-200 hover:bg-brand-strong active:scale-[0.97] disabled:opacity-75 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-brand/40 focus:ring-offset-2"
        >
          <Download className="h-4 w-4 shrink-0" />
          <span>
            {isBusy ? 'Installing...' : 'Install Raj Tuition Classes App'}
          </span>
        </button>
      </div>

      {/* 2. Desktop Design: Floating Action Button (FAB) (Large screens) */}
      <div className="hidden md:block fixed bottom-6 right-6 z-50">
        <button
          type="button"
          onClick={handleInstall}
          disabled={isBusy}
          aria-label="Install App"
          className="group inline-flex items-center justify-center gap-2.5 rounded-xl bg-brand text-white py-3 px-5 font-semibold shadow-md transition-all duration-300 hover:bg-brand-strong hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-95 disabled:opacity-75 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-brand/40 focus:ring-offset-2"
        >
          <Download className="h-4.5 w-4.5 shrink-0" />
          <span className="text-sm">
            {isBusy ? 'Installing...' : 'Install App'}
          </span>
        </button>
      </div>
    </>
  )
}

export default InstallAppButton

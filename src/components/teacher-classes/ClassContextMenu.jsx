import { useEffect, useRef } from 'react'

function ClassContextMenu({ classItem, x, y, onClose, onComplete }) {
  const menuRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [onClose])

  const screenW = window.innerWidth
  const screenH = window.innerHeight
  // Ensure the menu does not overflow the right or bottom edges of the screen
  const posX = x + 224 > screenW ? screenW - 240 : x
  const posY = y + 80 > screenH ? screenH - 100 : y

  return (
    <>
      {/* Mobile Backdrop & Bottom Sheet */}
      <div 
        className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-4 backdrop-blur-xs sm:hidden"
        onClick={onClose}
      >
        <div 
          ref={menuRef}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md rounded-t-[2rem] border border-slate-200 bg-white p-6 shadow-xl animate-slide-up pb-8"
        >
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-300" />
          <h3 className="text-center text-lg font-bold text-slate-900 mb-5">{classItem.className}</h3>
          
          <button
            type="button"
            onClick={() => {
              onComplete(classItem)
              onClose()
            }}
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-blue-50 py-4 text-sm font-bold text-blue-700 hover:bg-blue-100/80 transition active:scale-95 border border-blue-100"
          >
            <span>📦</span>
            Complete Class
          </button>
          
          <button
            type="button"
            onClick={onClose}
            className="mt-3 flex w-full items-center justify-center gap-3 rounded-2xl bg-slate-50 py-4 text-sm font-bold text-slate-600 hover:bg-slate-100 transition active:scale-95 border border-slate-150"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Desktop Context Menu */}
      <div
        ref={menuRef}
        className="fixed z-50 hidden sm:block w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl backdrop-blur-md bg-white/95"
        style={{
          top: `${posY}px`,
          left: `${posX}px`,
        }}
      >
        <button
          type="button"
          onClick={() => {
            onComplete(classItem)
            onClose()
          }}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition"
        >
          <span className="text-base">📦</span>
          Complete Class
        </button>
      </div>
    </>
  )
}

export default ClassContextMenu

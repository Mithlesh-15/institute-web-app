import { useEffect, useRef, useState } from 'react'

function PhotoUpload({ file, onChange, preview, onClear }) {
  const inputRef = useRef(null)
  const [localPreview, setLocalPreview] = useState(preview || '')

  useEffect(() => {
    setLocalPreview(preview || '')
  }, [preview])

  useEffect(() => {
    return () => {
      if (localPreview?.startsWith('blob:')) {
        URL.revokeObjectURL(localPreview)
      }
    }
  }, [localPreview])

  const handleSelect = (event) => {
    const selectedFile = event.target.files?.[0] || null

    if (selectedFile) {
      const nextPreview = URL.createObjectURL(selectedFile)
      setLocalPreview(nextPreview)
      onChange(selectedFile, nextPreview)
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-4">
        <div className="h-20 w-20 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {localPreview ? (
            <img src={localPreview} alt="Profile preview" className="h-full w-full object-cover" />
          ) : (
          <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,rgba(37,99,235,0.1),rgba(219,234,254,0.28))] text-xs font-semibold text-[#2563eb]">
            Preview
          </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900">Profile photo</p>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Upload a clear photo for the student profile.
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-2xl bg-[linear-gradient(135deg,rgba(37,99,235,0.95),rgba(29,78,216,0.92))] px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(37,99,235,0.16)]"
            >
              {file ? 'Change photo' : 'Upload photo'}
            </button>
            {file || localPreview ? (
              <button
                type="button"
                onClick={() => {
                  setLocalPreview('')
                  onClear?.()
                  if (inputRef.current) {
                    inputRef.current.value = ''
                  }
                }}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
              >
                Remove
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleSelect}
      />
    </div>
  )
}

export default PhotoUpload

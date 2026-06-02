import { useEffect, useRef, useState } from 'react'

function PhotoUpload({ file, onChange, preview, onClear }) {
  const inputRef = useRef(null)
  const [localPreview, setLocalPreview] = useState(preview || '')
  const [converting, setConverting] = useState(false)
  const [conversionError, setConversionError] = useState('')

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

  const handleSelect = async (event) => {
    const selectedFile = event.target.files?.[0] || null

    if (selectedFile) {
      setConversionError('')
      const nameLower = selectedFile.name.toLowerCase()
      const isHeic = nameLower.endsWith('.heic') || nameLower.endsWith('.heif') || selectedFile.type === 'image/heic' || selectedFile.type === 'image/heif'

      if (isHeic) {
        try {
          setConverting(true)
          const { convertHeicToJpeg } = await import('../../utils/studentAuth')
          const convertedFile = await convertHeicToJpeg(selectedFile)
          const nextPreview = URL.createObjectURL(convertedFile)
          setLocalPreview(nextPreview)
          onChange(convertedFile, nextPreview)
        } catch (err) {
          console.error(err)
          setConversionError('Conversion failed: Unable to process HEIC image.')
          alert('Conversion failed: Unable to process HEIC image.')
        } finally {
          setConverting(false)
        }
      } else {
        const nextPreview = URL.createObjectURL(selectedFile)
        setLocalPreview(nextPreview)
        onChange(selectedFile, nextPreview)
      }
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-4">
        <div className="h-20 w-20 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm relative flex items-center justify-center shrink-0">
          {converting ? (
            <div className="flex h-full w-full flex-col items-center justify-center bg-blue-50 text-[10px] font-bold text-blue-600 p-1 text-center leading-tight">
              <span className="animate-spin text-base mb-1">⏳</span>
              Converting...
            </div>
          ) : localPreview ? (
            <img src={localPreview} alt="Profile preview" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,rgba(37,99,235,0.1),rgba(219,234,254,0.28))] text-xs font-semibold text-brand">
              Preview
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900">Profile photo</p>
          {conversionError ? (
            <p className="mt-1 text-xs font-semibold text-red-600">{conversionError}</p>
          ) : (
            <p className="mt-1 text-xs leading-normal text-slate-500">
              Upload a clear profile photo (supports JPG, PNG, WEBP, and iPhone HEIC).
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={converting}
              className="rounded-2xl bg-[linear-gradient(135deg,rgba(37,99,235,0.95),rgba(29,78,216,0.92))] px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(37,99,235,0.16)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {file ? 'Change photo' : 'Upload photo'}
            </button>
            {file || localPreview ? (
              <button
                type="button"
                disabled={converting}
                onClick={() => {
                  setLocalPreview('')
                  setConversionError('')
                  onClear?.()
                  if (inputRef.current) {
                    inputRef.current.value = ''
                  }
                }}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50"
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

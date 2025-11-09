"use client"

import React, { useCallback, useMemo, useRef, useState } from 'react'

export interface PhotoUploaderProps {
  label?: string
  value: File[]
  onChange: (files: File[]) => void
  disabled?: boolean
  maxFiles?: number
  helperText?: string
}

export default function PhotoUploader({ label = 'Photos', value, onChange, disabled, maxFiles = 5, helperText }: PhotoUploaderProps) {
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const remaining = Math.max(0, maxFiles - (value?.length || 0))

  const handleFiles = useCallback((filesList: FileList | File[]) => {
    const incoming = Array.from(filesList || [])
    const imagesOnly = incoming.filter((f) => /^image\//.test(f.type))
    if (imagesOnly.length !== incoming.length) {
      setError('Seules les images sont acceptées')
    } else {
      setError(null)
    }
    const next = [...(value || [])]
    for (const f of imagesOnly.slice(0, remaining)) {
      next.push(f)
    }
    onChange(next.slice(0, maxFiles))
  }, [remaining, value, onChange])

  const onInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files || [])
  }, [handleFiles])

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (disabled) return
    handleFiles(e.dataTransfer.files)
  }, [handleFiles, disabled])

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }, [])

  const previews = useMemo(() => value.map((f) => ({ file: f, url: URL.createObjectURL(f) })), [value])

  const removeAt = (idx: number) => {
    const next = [...value]
    next.splice(idx, 1)
    onChange(next)
  }

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      )}
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        aria-disabled={disabled}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && inputRef.current && !disabled) {
            inputRef.current.click()
          }
        }}
        className={`
          w-full rounded-xl border-2 border-dashed p-4 transition-colors
          ${disabled ? 'border-gray-200 bg-gray-100 cursor-not-allowed' : 'border-gray-300 hover:border-primary-400 bg-white'}
        `}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-700">Glissez-déposez des images ici</p>
            <p className="text-xs text-gray-500">ou cliquez pour sélectionner (max {maxFiles})</p>
          </div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={disabled}
            className="inline-flex items-center justify-center rounded-lg bg-primary-600 text-white px-3 py-1.5 text-sm hover:bg-primary-700 disabled:opacity-50"
          >
            Choisir des photos
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={onInputChange}
          disabled={disabled}
          className="hidden"
        />
      </div>

      {helperText && <p className="mt-1 text-sm text-gray-500">{helperText}</p>}
      {error && <p className="mt-1 text-sm text-red-600" role="alert">{error}</p>}

      {previews.length > 0 && (
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {previews.map((p, idx) => (
            <div key={idx} className="group relative rounded-lg border border-gray-200 p-2 bg-white">
              <img src={p.url} alt={`photo-${idx + 1}`} className="h-24 w-full object-cover rounded" />
              <button
                type="button"
                aria-label="Supprimer la photo"
                onClick={() => removeAt(idx)}
                className="absolute top-2 right-2 hidden group-hover:block bg-red-600 text-white rounded-full px-2 py-1 text-xs"
              >
                Supprimer
              </button>
              <p className="mt-1 text-xs text-gray-600 truncate">{p.file.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
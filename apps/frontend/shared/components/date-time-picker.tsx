"use client"

import React, { useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { registerLocale } from 'react-datepicker'
import { fr } from 'date-fns/locale'
import { isSameDay } from 'date-fns'
import 'react-datepicker/dist/react-datepicker.css'

const ReactDatePicker = dynamic(() => import('react-datepicker'), { ssr: false }) as any

export interface DateTimePickerProps {
  label?: string
  value?: Date | null
  onChange: (date: Date | null) => void
  disabled?: boolean
  helperText?: string
  required?: boolean
}

export default function DateTimePicker({ label, value, onChange, disabled, helperText, required }: DateTimePickerProps) {
  const [ready, setReady] = useState(false)
  useEffect(() => { setReady(true); registerLocale('fr', fr) }, [])

  const selected = useMemo(() => (value ? new Date(value) : null), [value])

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="w-full">
        {ready ? (
          <ReactDatePicker
            selected={selected}
            onChange={(d: Date | null) => onChange(d as Date | null)}
            showTimeSelect
            timeIntervals={15}
            timeCaption="Heure"
            dateFormat="Pp" // localized date+time
            locale="fr"
            className="w-full block px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            wrapperClassName="w-full"
            disabled={disabled}
            placeholderText="Sélectionnez la date et l’heure"
            // Désactiver les dates passées
            minDate={new Date()}
            // Désactiver les heures passées lorsque le jour sélectionné est aujourd’hui
            filterTime={(time: Date) => {
              if (!selected) return true
              const now = new Date()
              if (isSameDay(selected, now)) {
                return time.getTime() >= now.getTime()
              }
              return true
            }}
          />
        ) : (
          // Fallback skeleton to avoid hydration mismatch
          <div className="h-10 w-full rounded-lg border border-gray-300 bg-gray-100 animate-pulse" />
        )}
      </div>
      {helperText && <p className="mt-1 text-sm text-gray-500">{helperText}</p>}
    </div>
  )}
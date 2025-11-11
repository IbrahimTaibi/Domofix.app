import React from "react"

interface TitleProps {
  title: string
  subtitle?: string
}

export function DashboardTitle({ title, subtitle }: TitleProps) {
  return (
    <div className="min-w-0">
      <div className="flex flex-col">
        <h1 className={`font-medium text-gray-600 text-2xl md:text-3xl leading-tight tracking-tight truncate`}>{title}</h1>
        {subtitle && (
          <p className="text-xs md:text-sm text-gray-500 font-extralight">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  )
}
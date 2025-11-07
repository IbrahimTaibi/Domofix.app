import React from 'react'
import Button from '@/shared/components/button'
import { AlertTriangle, Ban, Server } from 'lucide-react'

type IconType = React.ComponentType<{ className?: string }>

type ErrorAction = {
  label: string
  href: string
}

interface ErrorViewProps {
  code?: number
  title: string
  description: string
  actions?: ErrorAction[]
  Icon?: IconType
}

export default function ErrorView({ code, title, description, actions = [], Icon }: ErrorViewProps) {
  const ResolvedIcon = Icon || (code === 403 ? Ban : code === 500 ? Server : AlertTriangle)

  return (
    <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="flex justify-center">
          <ResolvedIcon className="h-12 w-12 text-gray-900" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          {code ? `${code} — ${title}` : title}
        </h1>
        <p className="text-sm text-gray-600">{description}</p>
        {actions.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {actions.map((action) => (
              <a key={action.href} href={action.href}>
                <Button type="button" variant="outline">
                  {action.label}
                </Button>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
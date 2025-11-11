import React from "react"
import { Search } from "lucide-react"

interface HeaderSearchProps {
  placeholder?: string
}

export function HeaderSearch({ placeholder = "Search" }: HeaderSearchProps) {
  return (
    <div className="relative hidden md:block w-full max-w-[360px] ml-3">
      <input
        type="search"
        placeholder={placeholder}
        className="flex w-full items-center gap-3.5 rounded-full border border-gray-200 bg-gray-50 py-3.5 pl-12 pr-6 outline-none transition-colors focus-visible:border-primary"
      />
      <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
    </div>
  )
}
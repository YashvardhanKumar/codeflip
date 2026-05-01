// components/problem/EditorToolbar.tsx
'use client'

import IconButton from '@/components/icon-button'
import { Language, LanguageDisplayNames } from '@/lib/models'
import { useState, useRef, useEffect } from 'react'

interface Props {
  onReset?: () => void
  language: Language
  setLanguage: (lang: Language) => void
  availableLanguages: Language[]
}

export default function EditorToolbar({
  onReset,
  language,
  setLanguage,
  availableLanguages,
}: Props) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="h-10 bg-surface-dark flex items-center justify-between px-2 border-b border-surface-border shrink-0">
      <div className="flex items-center gap-2">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 text-green-400 text-xs font-medium hover:bg-surface-border px-2 py-1 rounded transition-colors"
          >
            <span>{LanguageDisplayNames[language]}</span>
            <span className="material-symbols-outlined text-base">
              keyboard_arrow_down
            </span>
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-40 bg-surface-dark border border-surface-border rounded shadow-lg z-50 py-1">
              {availableLanguages.map((lang) => (
                <button
                  key={lang}
                  className={`w-full text-left px-3 py-1.5 text-xs transition-colors hover:bg-surface-border ${
                    lang === language
                      ? 'text-green-400 font-bold'
                      : 'text-gray-300'
                  }`}
                  onClick={() => {
                    setLanguage(lang)
                    setIsDropdownOpen(false)
                  }}
                >
                  {LanguageDisplayNames[lang]}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="h-4 w-px bg-gray-700" />

        <button className="flex items-center gap-2 text-gray-400 text-xs font-medium hover:bg-surface-border hover:text-white px-2 py-1 rounded transition-colors">
          Auto
        </button>
      </div>

      <div className="flex items-center gap-1">
        <IconButton icon="settings" title="Settings" variant="toolbar" />
        <IconButton icon="keyboard" title="Shortcut keys" variant="toolbar" />
        <IconButton
          icon="history"
          title="Restore default code"
          variant="toolbar"
          onClick={onReset}
        />
        <IconButton icon="fullscreen" title="Expand" variant="toolbar" />
      </div>
    </div>
  )
}

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
  maximizedSide?: 'left' | 'right' | null
  onMaximize?: () => void
  onRestore?: () => void
}

export default function EditorToolbar({
  onReset,
  language,
  setLanguage,
  availableLanguages,
  maximizedSide,
  onMaximize,
  onRestore,
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
        {maximizedSide === 'right' ? (
          <div data-state="closed">
            <button
              onClick={onRestore}
              title="Restore Panel"
              className="relative text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sd-ring disabled:pointer-events-none disabled:opacity-50 text-sd-foreground hover:text-sd-accent-foreground rounded-sd-md hover:bg-fill-secondary dark:hover:bg-fill-secondary flex h-6 w-6 cursor-pointer items-center justify-center !rounded p-[5px] fold text-gray-400 hover:text-white"
            >
              <div className="relative text-[14px] leading-[normal] p-[1px] before:block before:h-3.5 before:w-3.5 h-[14px] w-[14px] text-text-secondary dark:text-text-secondary">
                <svg
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="far"
                  data-icon="chevron-left"
                  className="svg-inline--fa fa-chevron-left absolute h-[1em] -translate-x-1/2 -translate-y-1/2 align-[-0.125em] left-1/2 top-1/2"
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 320 512"
                >
                  <path
                    fill="currentColor"
                    d="M15 239c-9.4 9.4-9.4 24.6 0 33.9L207 465c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9L65.9 256 241 81c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0L15 239z"
                  ></path>
                </svg>
              </div>
            </button>
          </div>
        ) : (
          <div data-state="closed">
            <button
              onClick={onMaximize}
              title="Maximize Panel"
              className="relative text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sd-ring disabled:pointer-events-none disabled:opacity-50 text-sd-foreground hover:text-sd-accent-foreground rounded-sd-md hover:bg-fill-secondary dark:hover:bg-fill-secondary flex h-6 w-6 cursor-pointer items-center justify-center !rounded p-[5px] maximize text-gray-400 hover:text-white"
            >
              <div className="relative text-[14px] leading-[normal] p-[1px] before:block before:h-3.5 before:w-3.5 h-[14px] w-[14px] text-text-secondary dark:text-text-secondary">
                <svg
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="far"
                  data-icon="expand"
                  className="svg-inline--fa fa-expand absolute h-[1em] -translate-x-1/2 -translate-y-1/2 align-[-0.125em] left-1/2 top-1/2"
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 448 512"
                >
                  <path
                    fill="currentColor"
                    d="M136 32c13.3 0 24 10.7 24 24s-10.7 24-24 24H48v88c0 13.3-10.7 24-24 24s-24-10.7-24-24V56C0 42.7 10.7 32 24 32H136zM0 344c0-13.3 10.7-24 24-24s24 10.7 24 24v88h88c13.3 0 24 10.7 24 24s-10.7 24-24 24H24c-13.3 0-24-10.7-24-24V344zM424 32c13.3 0 24 10.7 24 24V168c0 13.3-10.7 24-24 24s-24-10.7-24-24V80H312c-13.3 0-24-10.7-24-24s10.7-24 24-24H424zM400 344c0-13.3 10.7-24 24-24s24 10.7 24 24V456c0 13.3-10.7 24-24 24H312c-13.3 0-24-10.7-24-24s10.7-24 24-24h88V344z"
                  ></path>
                </svg>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

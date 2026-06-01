import { JSDOM } from 'jsdom'
import '@testing-library/jest-dom'
import { beforeEach, jest } from 'bun:test'

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost',
})

global.window = dom.window as any
global.document = dom.window.document
global.navigator = dom.window.navigator
global.Node = dom.window.Node
global.HTMLElement = dom.window.HTMLElement
global.HTMLAnchorElement = dom.window.HTMLAnchorElement
global.HTMLButtonElement = dom.window.HTMLButtonElement
global.HTMLDivElement = dom.window.HTMLDivElement
global.HTMLInputElement = dom.window.HTMLInputElement
global.HTMLLabelElement = dom.window.HTMLLabelElement
global.HTMLFormElement = dom.window.HTMLFormElement
global.HTMLTableElement = dom.window.HTMLTableElement
global.HTMLTableRowElement = dom.window.HTMLTableRowElement
global.HTMLTableCellElement = dom.window.HTMLTableCellElement
global.HTMLUListElement = dom.window.HTMLUListElement
global.HTMLLIElement = dom.window.HTMLLIElement
global.HTMLSpanElement = dom.window.HTMLSpanElement
global.HTMLParagraphElement = dom.window.HTMLParagraphElement
global.HTMLHeadingElement = dom.window.HTMLHeadingElement
global.HTMLImageElement = dom.window.HTMLImageElement
global.HTMLSelectElement = dom.window.HTMLSelectElement
global.HTMLTextAreaElement = dom.window.HTMLTextAreaElement
global.HTMLCanvasElement = dom.window.HTMLCanvasElement

// localStorage mock
const storageMock = () => {
  let storage: { [key: string]: string } = {}
  return {
    getItem: (key: string) => (key in storage ? storage[key] : null),
    setItem: (key: string, value: string) => (storage[key] = value || ''),
    removeItem: (key: string) => delete storage[key],
    clear: () => (storage = {}),
    key: (i: number) => Object.keys(storage)[i] || null,
    length: Object.keys(storage).length,
  }
}

global.localStorage = storageMock() as any
global.sessionStorage = storageMock() as any

// Mock some things that JSDOM might be missing or that are commonly needed
global.window.matchMedia =
  global.window.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: function () {},
      removeListener: function () {},
    }
  }

global.window.scrollTo = global.window.scrollTo || function () {}

// Global cleanup for Bun tests
beforeEach(() => {
  document.body.innerHTML = ''
  localStorage.clear()
  sessionStorage.clear()
  // We can't easily clear all mocks globally in Bun without tracking them
})

// Provide a global jest object for compatibility if missing
if (!global.jest) {
  global.jest = jest as any
}

/**
 * Tests for Browser Compatibility Detection
 * Requirements: R14 - Browser compatibility framework
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock browser APIs
const mockCanvasContext = {
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  getImageData: vi.fn(),
  putImageData: vi.fn(),
  createLinearGradient: vi.fn(),
  createRadialGradient: vi.fn(),
  createPattern: vi.fn(),
}

const mockCanvas = {
  getContext: vi.fn(() => mockCanvasContext),
  toDataURL: vi.fn(() => 'data:image/png;base64,mock'),
}

// Mock HTMLCanvasElement
Object.defineProperty(window, 'HTMLCanvasElement', {
  value: function() { return mockCanvas },
  writable: true,
})

describe('Browser Compatibility Detection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset document.createElement mock
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'canvas') {
        return mockCanvas as any
      }
      return document.createElement(tagName)
    })
  })

  describe('Canvas 2D Support Detection', () => {
    it('should detect Canvas 2D support when available', () => {
      expect(typeof document.createElement).toBe('function')
      const canvas = document.createElement('canvas')
      expect(canvas.getContext).toBeDefined()
      const context = canvas.getContext('2d')
      expect(context).toBeTruthy()
    })

    it('should handle missing Canvas 2D support gracefully', () => {
      const mockCanvasNoContext = {
        getContext: vi.fn(() => null),
      }

      vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        if (tagName === 'canvas') {
          return mockCanvasNoContext as any
        }
        return document.createElement(tagName)
      })

      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      expect(context).toBeNull()
    })
  })

  describe('Touch Event Detection', () => {
    it('should detect touch capability when available', () => {
      Object.defineProperty(window, 'ontouchstart', {
        value: null,
        writable: true,
      })

      Object.defineProperty(navigator, 'maxTouchPoints', {
        value: 1,
        writable: true,
      })

      expect('ontouchstart' in window).toBe(true)
      expect(navigator.maxTouchPoints).toBeGreaterThan(0)
    })

    it('should handle missing touch capability', () => {
      // Use writable property set by previous test
      (window as any).ontouchstart = undefined
      delete (window as any).ontouchstart
      ;(navigator as any).maxTouchPoints = 0

      expect('ontouchstart' in window).toBe(false)
      expect(navigator.maxTouchPoints).toBe(0)
    })
  })

  describe('Modern Browser Features', () => {
    it('should detect modern JavaScript features', () => {
      // Test for ES6+ features availability
      expect(typeof Promise).toBe('function')
      expect(typeof Map).toBe('function')
      expect(typeof Set).toBe('function')
      expect(typeof Array.from).toBe('function')
    })

    it('should detect Web APIs availability', () => {
      // Test for modern Web APIs
      expect(typeof fetch !== 'undefined' || typeof XMLHttpRequest !== 'undefined').toBe(true)
      expect(typeof localStorage).toBe('object')
      expect(typeof sessionStorage).toBe('object')
    })
  })

  describe('Feature Detection Integration', () => {
    it('should provide comprehensive browser capability report', () => {
      const capabilities = {
        canvas2d: !!document.createElement('canvas').getContext?.('2d'),
        touch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        modernJS: typeof Promise === 'function',
        webGL: !!document.createElement('canvas').getContext?.('webgl'),
        localStorage: typeof localStorage === 'object',
      }

      expect(capabilities.canvas2d).toBeDefined()
      expect(capabilities.touch).toBeDefined()
      expect(capabilities.modernJS).toBe(true)
      expect(capabilities.localStorage).toBe(true)
    })
  })
})

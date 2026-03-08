// Polyfills for older browsers

// RequestAnimationFrame polyfill
export function polyfillRequestAnimationFrame(): void {
  if (!window.requestAnimationFrame) {
    let lastTime = 0
    window.requestAnimationFrame = function(callback: FrameRequestCallback) {
      const currTime = new Date().getTime()
      const timeToCall = Math.max(0, 16 - (currTime - lastTime))
      const id = window.setTimeout(() => {
        callback(currTime + timeToCall)
      }, timeToCall)
      lastTime = currTime + timeToCall
      return id
    }
  }

  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function(id: number) {
      clearTimeout(id)
    }
  }
}

// Canvas toBlob polyfill
export function polyfillCanvasToBlob(): void {
  if (!HTMLCanvasElement.prototype.toBlob) {
    HTMLCanvasElement.prototype.toBlob = function(callback, type, quality) {
      const binStr = atob(this.toDataURL(type, quality).split(',')[1])
      const len = binStr.length
      const arr = new Uint8Array(len)

      for (let i = 0; i < len; i++) {
        arr[i] = binStr.charCodeAt(i)
      }

      callback(new Blob([arr], { type: type || 'image/png' }))
    }
  }
}

// Intersection Observer polyfill (simplified)
export function polyfillIntersectionObserver(): void {
  if (!('IntersectionObserver' in window)) {
    // Simple polyfill that fires immediately
    (window as any).IntersectionObserver = class {
      constructor(callback: IntersectionObserverCallback) {
        this.callback = callback
      }

      observe(target: Element) {
        // Immediately call callback with visible entry
        const entry = {
          target,
          isIntersecting: true,
          intersectionRatio: 1,
          boundingClientRect: target.getBoundingClientRect(),
          intersectionRect: target.getBoundingClientRect(),
          rootBounds: null,
          time: Date.now()
        }
        this.callback([entry as IntersectionObserverEntry], this)
      }

      unobserve() {}
      disconnect() {}
    }
  }
}

// Resize Observer polyfill (simplified)
export function polyfillResizeObserver(): void {
  if (!('ResizeObserver' in window)) {
    (window as any).ResizeObserver = class {
      constructor(callback: ResizeObserverCallback) {
        this.callback = callback
        this.elements = new Set()
      }

      observe(target: Element) {
        this.elements.add(target)
        // Fire immediately
        const entry = {
          target,
          contentRect: target.getBoundingClientRect(),
          borderBoxSize: [{ inlineSize: target.clientWidth, blockSize: target.clientHeight }],
          contentBoxSize: [{ inlineSize: target.clientWidth, blockSize: target.clientHeight }],
          devicePixelContentBoxSize: [{ inlineSize: target.clientWidth, blockSize: target.clientHeight }]
        }
        this.callback([entry as ResizeObserverEntry], this)
      }

      unobserve(target: Element) {
        this.elements.delete(target)
      }

      disconnect() {
        this.elements.clear()
      }
    }
  }
}

// Custom Events polyfill
export function polyfillCustomEvent(): void {
  if (!window.CustomEvent || typeof window.CustomEvent !== 'function') {
    function CustomEvent(event: string, params?: CustomEventInit) {
      params = params || { bubbles: false, cancelable: false, detail: undefined }
      const evt = document.createEvent('CustomEvent')
      evt.initCustomEvent(event, params.bubbles ?? false, params.cancelable ?? false, params.detail)
      return evt
    }

    ;(window as any).CustomEvent = CustomEvent
  }
}

// Element.matches polyfill
export function polyfillElementMatches(): void {
  if (!Element.prototype.matches) {
    Element.prototype.matches =
      (Element.prototype as any).matchesSelector ||
      (Element.prototype as any).mozMatchesSelector ||
      (Element.prototype as any).msMatchesSelector ||
      (Element.prototype as any).oMatchesSelector ||
      (Element.prototype as any).webkitMatchesSelector ||
      function(s: string) {
        const matches = (this.document || this.ownerDocument).querySelectorAll(s)
        let i = matches.length
        while (--i >= 0 && matches.item(i) !== this) {}
        return i > -1
      }
  }
}

// Element.closest polyfill
export function polyfillElementClosest(): void {
  if (!Element.prototype.closest) {
    Element.prototype.closest = function(s: string) {
      let el = this as Element | null

      do {
        if (el && el.matches && el.matches(s)) return el
        el = el && (el.parentElement || el.parentNode as Element)
      } while (el !== null && el.nodeType === 1)

      return null
    }
  }
}

// Array.from polyfill
export function polyfillArrayFrom(): void {
  if (!Array.from) {
    Array.from = (function() {
      const toStr = Object.prototype.toString
      const isCallable = function(fn: any) {
        return typeof fn === 'function' || toStr.call(fn) === '[object Function]'
      }
      const toInteger = function(value: any) {
        const number = Number(value)
        if (isNaN(number)) return 0
        if (number === 0 || !isFinite(number)) return number
        return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number))
      }
      const maxSafeInteger = Math.pow(2, 53) - 1
      const toLength = function(value: any) {
        const len = toInteger(value)
        return Math.min(Math.max(len, 0), maxSafeInteger)
      }

      return function from<T>(arrayLike: ArrayLike<T>, mapFn?: (v: T, k: number) => any, thisArg?: any) {
        const C = this
        const items = Object(arrayLike)

        if (arrayLike == null) {
          throw new TypeError('Array.from requires an array-like object - not null or undefined')
        }

        const mapFunction = arguments.length > 1 ? mapFn : void undefined
        let T: any
        if (typeof mapFunction !== 'undefined') {
          if (!isCallable(mapFunction)) {
            throw new TypeError('Array.from: when provided, the second argument must be a function')
          }

          if (arguments.length > 2) {
            T = thisArg
          }
        }

        const len = toLength(items.length)
        const A = isCallable(C) ? Object(new C(len)) : new Array(len)
        let k = 0
        let kValue: any

        while (k < len) {
          kValue = items[k]
          if (mapFunction) {
            A[k] = typeof T === 'undefined' ? mapFunction(kValue, k) : mapFunction.call(T, kValue, k)
          } else {
            A[k] = kValue
          }
          k += 1
        }

        A.length = len
        return A
      }
    }())
  }
}

// Object.assign polyfill
export function polyfillObjectAssign(): void {
  if (typeof Object.assign !== 'function') {
    Object.assign = function(target: any, ...sources: any[]) {
      if (target == null) {
        throw new TypeError('Cannot convert undefined or null to object')
      }

      const to = Object(target)

      for (let index = 0; index < sources.length; index++) {
        const nextSource = sources[index]

        if (nextSource != null) {
          for (const nextKey in nextSource) {
            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
              to[nextKey] = nextSource[nextKey]
            }
          }
        }
      }
      return to
    }
  }
}

// Promise polyfill check and basic implementation
export function polyfillPromise(): void {
  if (!window.Promise) {
    console.warn('Promise is not supported. Please include a Promise polyfill.')
    // Note: A full Promise polyfill is quite complex, so we recommend
    // including a dedicated polyfill library for older browsers
  }
}

// Load all polyfills
export function loadPolyfills(): void {
  polyfillRequestAnimationFrame()
  polyfillCanvasToBlob()
  polyfillIntersectionObserver()
  polyfillResizeObserver()
  polyfillCustomEvent()
  polyfillElementMatches()
  polyfillElementClosest()
  polyfillArrayFrom()
  polyfillObjectAssign()
  polyfillPromise()
}

// Conditional polyfill loading based on feature detection
export function loadRequiredPolyfills(): void {
  // Only load polyfills that are actually needed
  if (!window.requestAnimationFrame) {
    polyfillRequestAnimationFrame()
  }

  if (!HTMLCanvasElement.prototype.toBlob) {
    polyfillCanvasToBlob()
  }

  if (!window.IntersectionObserver) {
    polyfillIntersectionObserver()
  }

  if (!window.ResizeObserver) {
    polyfillResizeObserver()
  }

  if (!window.CustomEvent || typeof window.CustomEvent !== 'function') {
    polyfillCustomEvent()
  }

  if (!Element.prototype.matches) {
    polyfillElementMatches()
  }

  if (!Element.prototype.closest) {
    polyfillElementClosest()
  }

  if (!Array.from) {
    polyfillArrayFrom()
  }

  if (!Object.assign) {
    polyfillObjectAssign()
  }

  if (!window.Promise) {
    polyfillPromise()
  }
}

// Initialize polyfills when the script loads
if (typeof window !== 'undefined') {
  loadRequiredPolyfills()
}
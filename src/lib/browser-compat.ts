// Browser compatibility detection and feature support

export interface BrowserFeatures {
  canvas2d: boolean
  webgl: boolean
  touchEvents: boolean
  deviceMotion: boolean
  webWorkers: boolean
  localStorage: boolean
  sessionStorage: boolean
  historyAPI: boolean
  requestAnimationFrame: boolean
  webAudio: boolean
  fullscreen: boolean
  pointer: boolean
  intersection: boolean
  resizeObserver: boolean
  mutationObserver: boolean
}

export interface BrowserInfo {
  name: string
  version: string
  engine: string
  os: string
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isSupported: boolean
  features: BrowserFeatures
}

// Detect Canvas 2D API support
export function hasCanvas2DSupport(): boolean {
  try {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    return !!(ctx && typeof ctx.fillRect === 'function')
  } catch {
    return false
  }
}

// Detect WebGL support
export function hasWebGLSupport(): boolean {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    return !!(gl && gl instanceof WebGLRenderingContext)
  } catch {
    return false
  }
}

// Detect touch events support
export function hasTouchSupport(): boolean {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0
  )
}

// Detect device motion support
export function hasDeviceMotionSupport(): boolean {
  return 'DeviceMotionEvent' in window
}

// Detect Web Workers support
export function hasWebWorkersSupport(): boolean {
  return typeof Worker !== 'undefined'
}

// Detect localStorage support
export function hasLocalStorageSupport(): boolean {
  try {
    const test = '__localStorage_test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch {
    return false
  }
}

// Detect sessionStorage support
export function hasSessionStorageSupport(): boolean {
  try {
    const test = '__sessionStorage_test__'
    sessionStorage.setItem(test, test)
    sessionStorage.removeItem(test)
    return true
  } catch {
    return false
  }
}

// Detect History API support
export function hasHistoryAPISupport(): boolean {
  return !!(window.history && window.history.pushState)
}

// Detect requestAnimationFrame support
export function hasRequestAnimationFrameSupport(): boolean {
  return !!(
    window.requestAnimationFrame ||
    (window as any).webkitRequestAnimationFrame ||
    (window as any).mozRequestAnimationFrame ||
    (window as any).msRequestAnimationFrame
  )
}

// Detect Web Audio API support
export function hasWebAudioSupport(): boolean {
  return !!(
    window.AudioContext ||
    (window as any).webkitAudioContext ||
    (window as any).mozAudioContext
  )
}

// Detect Fullscreen API support
export function hasFullscreenSupport(): boolean {
  const docElement = document.documentElement as any
  return !!(
    docElement.requestFullscreen ||
    docElement.webkitRequestFullscreen ||
    docElement.mozRequestFullScreen ||
    docElement.msRequestFullscreen
  )
}

// Detect Pointer Events support
export function hasPointerSupport(): boolean {
  return 'PointerEvent' in window
}

// Detect Intersection Observer support
export function hasIntersectionObserverSupport(): boolean {
  return 'IntersectionObserver' in window
}

// Detect Resize Observer support
export function hasResizeObserverSupport(): boolean {
  return 'ResizeObserver' in window
}

// Detect Mutation Observer support
export function hasMutationObserverSupport(): boolean {
  return 'MutationObserver' in window
}

// Get all browser features
export function getBrowserFeatures(): BrowserFeatures {
  return {
    canvas2d: hasCanvas2DSupport(),
    webgl: hasWebGLSupport(),
    touchEvents: hasTouchSupport(),
    deviceMotion: hasDeviceMotionSupport(),
    webWorkers: hasWebWorkersSupport(),
    localStorage: hasLocalStorageSupport(),
    sessionStorage: hasSessionStorageSupport(),
    historyAPI: hasHistoryAPISupport(),
    requestAnimationFrame: hasRequestAnimationFrameSupport(),
    webAudio: hasWebAudioSupport(),
    fullscreen: hasFullscreenSupport(),
    pointer: hasPointerSupport(),
    intersection: hasIntersectionObserverSupport(),
    resizeObserver: hasResizeObserverSupport(),
    mutationObserver: hasMutationObserverSupport()
  }
}

// Parse user agent to get browser info
export function parseBrowserInfo(): Omit<BrowserInfo, 'features' | 'isSupported'> {
  const ua = navigator.userAgent
  const platform = navigator.platform

  // Detect browser name and version
  let name = 'Unknown'
  let version = '0'
  let engine = 'Unknown'

  if (ua.includes('Chrome') && !ua.includes('Edg')) {
    name = 'Chrome'
    const match = ua.match(/Chrome\/(\d+)/)
    version = match ? match[1] : '0'
    engine = 'Blink'
  } else if (ua.includes('Edg')) {
    name = 'Edge'
    const match = ua.match(/Edg\/(\d+)/)
    version = match ? match[1] : '0'
    engine = 'Blink'
  } else if (ua.includes('Firefox')) {
    name = 'Firefox'
    const match = ua.match(/Firefox\/(\d+)/)
    version = match ? match[1] : '0'
    engine = 'Gecko'
  } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
    name = 'Safari'
    const match = ua.match(/Version\/(\d+)/)
    version = match ? match[1] : '0'
    engine = 'WebKit'
  }

  // Detect OS
  let os = 'Unknown'
  if (platform.includes('Win')) os = 'Windows'
  else if (platform.includes('Mac')) os = 'macOS'
  else if (platform.includes('Linux')) os = 'Linux'
  else if (/Android/.test(ua)) os = 'Android'
  else if (/iPhone|iPad/.test(ua)) os = 'iOS'

  // Detect device type
  const isMobile = /iPhone|Android.*Mobile/.test(ua)
  const isTablet = /iPad|Android(?!.*Mobile)/.test(ua)
  const isDesktop = !isMobile && !isTablet

  return {
    name,
    version,
    engine,
    os,
    isMobile,
    isTablet,
    isDesktop
  }
}

// Check if browser is supported based on minimum requirements
export function isBrowserSupported(features: BrowserFeatures): boolean {
  // Minimum requirements for GitHub Wrapped
  const requiredFeatures = [
    'canvas2d',
    'localStorage',
    'historyAPI',
    'requestAnimationFrame'
  ] as const

  return requiredFeatures.every(feature => features[feature])
}

// Get complete browser information
export function getBrowserInfo(): BrowserInfo {
  const features = getBrowserFeatures()
  const browserInfo = parseBrowserInfo()
  const isSupported = isBrowserSupported(features)

  return {
    ...browserInfo,
    features,
    isSupported
  }
}

// Check specific browser version requirements
export function meetsVersionRequirements(browserInfo: BrowserInfo): boolean {
  const { name, version } = browserInfo
  const versionNumber = parseInt(version, 10)

  switch (name) {
    case 'Chrome':
      return versionNumber >= 90
    case 'Firefox':
      return versionNumber >= 88
    case 'Safari':
      return versionNumber >= 14
    case 'Edge':
      return versionNumber >= 90
    default:
      return false
  }
}

// Get compatibility warnings for partially supported browsers
export function getCompatibilityWarnings(features: BrowserFeatures): string[] {
  const warnings: string[] = []

  if (!features.webgl) {
    warnings.push('WebGL is not supported. Some visual effects may be limited.')
  }

  if (!features.touchEvents) {
    warnings.push('Touch events are not supported. Mobile experience may be limited.')
  }

  if (!features.webWorkers) {
    warnings.push('Web Workers are not supported. Performance may be reduced.')
  }

  if (!features.fullscreen) {
    warnings.push('Fullscreen API is not supported. Fullscreen mode unavailable.')
  }

  if (!features.webAudio) {
    warnings.push('Web Audio API is not supported. Audio features disabled.')
  }

  return warnings
}

// Initialize browser compatibility check
export function initBrowserCompatibility(): {
  info: BrowserInfo
  warnings: string[]
  isFullyCompatible: boolean
} {
  const info = getBrowserInfo()
  const warnings = getCompatibilityWarnings(info.features)
  const meetsVersion = meetsVersionRequirements(info)
  const isFullyCompatible = info.isSupported && meetsVersion && warnings.length === 0

  return {
    info,
    warnings,
    isFullyCompatible
  }
}
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const [username, setUsername] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim()) return

    setIsLoading(true)
    // Navigate to the wrapped view with the username
    router.push(`/wrapped/${encodeURIComponent(username.trim())}`)
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            GitHub
            <span className="text-primary"> Wrapped</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience your GitHub activity like never before.
            Explore your coding journey through an interactive physics-based universe.
          </p>
        </div>

        <div className="space-y-4">
          <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
            <div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter GitHub username"
                className="w-full px-4 py-3 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-lg"
                disabled={isLoading}
                autoComplete="username"
              />
            </div>
            <button
              type="submit"
              disabled={!username.trim() || isLoading}
              className="w-full inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            >
              {isLoading ? 'Generating...' : 'Generate Wrapped'}
            </button>
          </form>

          <p className="text-sm text-muted-foreground">
            We only access public repositories and profile information.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-16">
          <div className="space-y-2 text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <span className="text-2xl">🌌</span>
            </div>
            <h3 className="font-semibold">Physics Universe</h3>
            <p className="text-sm text-muted-foreground">
              Your repositories become celestial bodies in a realistic physics simulation
            </p>
          </div>

          <div className="space-y-2 text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="font-semibold">Interactive Exploration</h3>
            <p className="text-sm text-muted-foreground">
              Pan, zoom, and interact with your coding activity in real-time
            </p>
          </div>

          <div className="space-y-2 text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <span className="text-2xl">🎨</span>
            </div>
            <h3 className="font-semibold">Beautiful Visualization</h3>
            <p className="text-sm text-muted-foreground">
              Modern design with smooth animations and responsive layout
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
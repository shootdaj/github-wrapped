/**
 * Top Repositories Component
 * Requirements: R5 - Top repositories display with star sorting
 */

import type { TopRepository } from '../../types/github-api'

interface TopRepositoriesProps {
  repositories: TopRepository[]
  className?: string
}

export function TopRepositories({ repositories, className = '' }: TopRepositoriesProps) {
  if (repositories.length === 0) {
    return (
      <div className={`top-repositories ${className}`}>
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📚</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Repositories Found</h3>
          <p className="text-gray-600">We couldn't find any public repositories to display.</p>
        </div>
      </div>
    )
  }

  const topRepo = repositories[0]

  const getLanguageColor = (language: string | null) => {
    const colors: { [key: string]: string } = {
      JavaScript: '#f1e05a',
      TypeScript: '#2b7489',
      Python: '#3572A5',
      Java: '#b07219',
      'C++': '#f34b7d',
      C: '#555555',
      'C#': '#239120',
      PHP: '#4F5D95',
      Ruby: '#701516',
      Go: '#00ADD8',
      Rust: '#dea584',
      Swift: '#ffac45',
      Kotlin: '#F18E33',
      Scala: '#c22d40',
      Shell: '#89e051',
      HTML: '#e34c26',
      CSS: '#1572B6',
      SCSS: '#c6538c',
      Vue: '#2c3e50',
    }
    return colors[language || ''] || '#858585'
  }

  return (
    <div className={`top-repositories ${className}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Top Repositories</h2>
        <p className="text-gray-600">Your most popular repositories by star count</p>
      </div>

      {/* Top repository highlight */}
      {topRepo.stars > 0 && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6 mb-6 border border-yellow-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-2xl">🏆</span>
                <h3 className="text-lg font-semibold text-gray-800">Most Starred Repository</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <a
                    href={topRepo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xl font-bold text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    {topRepo.name}
                  </a>
                  {topRepo.isForked && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      Forked
                    </span>
                  )}
                </div>
                {topRepo.description && (
                  <p className="text-gray-600 text-sm">{topRepo.description}</p>
                )}
                <div className="flex items-center space-x-4 text-sm">
                  {topRepo.language && (
                    <div className="flex items-center space-x-1">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getLanguageColor(topRepo.language) }}
                      />
                      <span className="text-gray-600">{topRepo.language}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1">
                    <span>⭐</span>
                    <span className="font-medium">{topRepo.stars}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span>🍴</span>
                    <span className="font-medium">{topRepo.forks}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Repository grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {repositories.map((repo, index) => (
          <div
            key={repo.name}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold text-gray-500">
                  #{index + 1}
                </span>
                {repo.isForked && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    Fork
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <span>⭐</span>
                <span className="font-medium">{repo.stars}</span>
              </div>
            </div>

            <div className="space-y-2">
              <a
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-gray-800 hover:text-blue-600 transition-colors group-hover:text-blue-600 block"
              >
                {repo.name}
              </a>

              {repo.description ? (
                <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                  {repo.description}
                </p>
              ) : (
                <p className="text-sm text-gray-400 italic">No description</p>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                {repo.language ? (
                  <div className="flex items-center space-x-1">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getLanguageColor(repo.language) }}
                    />
                    <span className="text-sm text-gray-600">{repo.language}</span>
                  </div>
                ) : (
                  <div />
                )}

                {repo.forks > 0 && (
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <span>🍴</span>
                    <span>{repo.forks}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary stats */}
      <div className="mt-8 bg-blue-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-800 mb-2">📊 Repository Stats</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p>
            • Total stars across all repositories: <strong>
              {repositories.reduce((sum, repo) => sum + repo.stars, 0).toLocaleString()}
            </strong>
          </p>
          <p>
            • Total forks: <strong>
              {repositories.reduce((sum, repo) => sum + repo.forks, 0).toLocaleString()}
            </strong>
          </p>
          <p>
            • Forked repositories: <strong>
              {repositories.filter(repo => repo.isForked).length}
            </strong> out of {repositories.length}
          </p>
        </div>
      </div>
    </div>
  )
}

export default TopRepositories

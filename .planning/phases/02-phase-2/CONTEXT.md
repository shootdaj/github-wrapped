# Phase 2: Data Integration Layer - Context

**Gathered:** 2026-03-06
**Status:** Ready for planning

<domain>
## Phase Boundary
This phase builds the GitHub API integration layer that fetches, processes, and caches user data for the physics universe:

**INCLUDED:**
- Complete GitHub API integration (repos, commits, PRs, collaborators)
- localStorage caching system with expiration and data versioning
- Progressive loading with detailed progress indicators (4 stages)
- Comprehensive error handling with retry logic and graceful degradation
- Data transformation pipeline (GitHub API → Universe data model)
- Rate limiting awareness and API quota management
- Data validation and integrity checks
- Resume capability for interrupted fetches

**NOT INCLUDED:**
- Canvas rendering or physics engine (Phase 3)
- Universe visualization or any UI beyond loading states (Phase 3)
- Interactive controls, search, or filtering (Phase 4)
- Time scrubbing or historical data manipulation (Phase 4)
- Wrapped statistics or analytics (Phase 6)
</domain>

<decisions>
## Implementation Decisions

### 1. GitHub API Strategy
**Decision:** GitHub REST API v3 with GraphQL v4 for complex queries
**Rationale:** REST for simple endpoints, GraphQL for efficient batch operations
- Use REST API for repositories, user profile, and rate limit status
- Use GraphQL for commits, PRs, and collaborator data (more efficient)
- Implement API client abstraction layer for future flexibility
- Parse Link headers for pagination (REST) and cursor pagination (GraphQL)

### 2. Caching Architecture
**Decision:** Multi-layer localStorage caching with versioned schemas
**Rationale:** Fast offline access, version migration support, granular invalidation
- **Layer 1:** Raw API responses with ETags for conditional requests
- **Layer 2:** Processed universe data model ready for physics engine
- **Layer 3:** User preferences and app state (camera position, filters)
- Cache keys: `github-wrapped:v1:user:{login}:repos`, `github-wrapped:v1:user:{login}:commits:2026`
- 7-day expiration for repos/users, 24-hour for commits/PRs, immediate for collaborators

### 3. Progressive Loading Strategy
**Decision:** 4-stage pipeline with granular progress tracking
**Rationale:** Clear user feedback, cancellation points, graceful failure recovery
1. **Stage 1:** User profile + repository list (20% progress)
2. **Stage 2:** Commits for each repository (20-70% progress)
3. **Stage 3:** Pull requests + reviews (70-90% progress)
4. **Stage 4:** Collaborator identification + avatars (90-100% progress)
- Each stage independently resumable and cancellable
- Progress stored in sessionStorage for browser refresh recovery

### 4. Error Handling Strategy
**Decision:** Exponential backoff with circuit breaker pattern
**Rationale:** Respect GitHub API limits, provide clear user guidance
- **Network errors:** Retry with 1s, 2s, 4s, 8s delays (max 4 retries)
- **Rate limits:** Show countdown timer, queue requests for reset window
- **Auth failures:** Clear tokens, redirect to re-authentication
- **Partial failures:** Continue with available data, show warning
- Circuit breaker: Stop API calls after 10 consecutive failures (5-minute reset)

### 5. Data Model Schema
**Decision:** Immutable data structures with TypeScript strict validation
**Rationale:** Type safety, performance, easy debugging
- All timestamps stored as ISO 8601 strings for consistency
- Computed fields (commitCount, languages, etc.) stored separately from raw API data
- Node IDs using UUID v4 to avoid GitHub ID collisions
- Repository languages computed from commit file extensions (not GitHub's language detection)

### 6. Rate Limit Management
**Decision:** Proactive quota monitoring with adaptive request throttling
**Rationale:** Prevent hitting limits, optimize for large repositories
- Check rate limit status before each major operation
- Throttle requests when remaining quota < 100 calls
- Priority queue: user profile → repositories → commits → PRs → collaborators
- Skip optional data (collaborators) if quota is low
- Show quota status in loading UI for transparency

### 7. Data Privacy Implementation
**Decision:** Client-side only processing with opt-in data retention
**Rationale:** Comply with R15 privacy requirements, minimize server dependencies
- All GitHub data processing happens in browser
- No data sent to backend servers (except for authentication)
- Clear consent UI before data fetching begins
- "Delete all data" button clears localStorage and forces re-authentication
</decisions>

<specifics>
## Specific Ideas

### API Client Architecture
```typescript
// lib/github/api.ts
interface GitHubAPIClient {
  getRateLimit(): Promise<RateLimitResponse>
  getUser(): Promise<UserProfile>
  getRepositories(cursor?: string): Promise<RepositoryPage>
  getCommits(repo: string, since: Date): Promise<CommitPage>
  getPullRequests(repo: string): Promise<PullRequestPage>
  getCollaborators(repos: string[]): Promise<CollaboratorMap>
}

// Implementations: RestApiClient, GraphQLApiClient
// Factory pattern chooses optimal client per request type
```

### Progressive Loading Flow
```typescript
interface LoadingState {
  stage: 'profile' | 'repos' | 'commits' | 'prs' | 'collaborators' | 'complete'
  progress: number // 0-100
  currentItem: string // "Loading commits for repo-name"
  itemsProcessed: number
  itemsTotal: number
  canCancel: boolean
  errors: LoadingError[]
}
```

### Cache Schema Design
```typescript
interface CacheEntry<T> {
  data: T
  version: string // "v1"
  etag?: string // For conditional requests
  expires: number // Unix timestamp
  lastModified: string // ISO 8601
}

// Cache organization
const cacheKeys = {
  user: (login: string) => `github-wrapped:v1:user:${login}`,
  repos: (login: string) => `github-wrapped:v1:user:${login}:repos`,
  commits: (login: string, year: number, repo: string) =>
    `github-wrapped:v1:user:${login}:commits:${year}:${repo}`,
  // etc.
}
```

### Error Recovery Patterns
- **Network timeouts:** Show "slow connection" warning after 10 seconds
- **Large repositories:** Implement commit pagination with 1000-commit chunks
- **Private repo access:** Skip with clear message, don't fail entire fetch
- **Corrupted cache:** Automatic invalidation and refetch
- **Browser storage quota:** Graceful degradation, clear oldest cache entries

### Data Processing Pipeline
1. **Fetch:** Raw GitHub API responses → cache raw data
2. **Transform:** API data → Universe data model
3. **Validate:** Type checking and data integrity verification
4. **Compute:** Derived values (languages, collaborators, statistics)
5. **Store:** Processed data → secondary cache layer
6. **Emit:** Ready event for physics engine initialization
</specifics>

<deferred>
## Deferred Ideas

### Phase 3+ Features
- Universe data model consumption by physics engine
- Canvas rendering of fetched repository/commit data
- Real-time data visualization during loading (defer until basic viz works)

### Phase 4+ Features
- Advanced filtering during data fetch (date ranges, specific repos)
- Search-driven data loading (load only relevant repositories)
- Historical time scrubbing requiring different data fetch strategies

### Phase 5+ Features
- Mobile-optimized data fetching (smaller batch sizes, fewer requests)
- Offline-first architecture with service workers
- Background sync for stale data updates

### Phase 6+ Features
- Analytics tracking for data fetch success rates
- Export capabilities for fetched data
- Advanced caching strategies (compression, indexedDB migration)

### Future Considerations
- GitHub Enterprise Server support (different API endpoints)
- Multiple GitHub account support (organization vs personal)
- Real-time updates via GitHub webhooks
- Performance budgets and data size limits
- GraphQL subscription support for live updates
</deferred>

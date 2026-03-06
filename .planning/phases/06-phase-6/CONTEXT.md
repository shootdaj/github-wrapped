# Phase 6: Wrapped Features & Analytics - Context

**Gathered:** 2026-03-06
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase transforms the accessible universe from Phase 5 into a complete social experience with comprehensive analytics, sharing capabilities, and offline functionality.

**Includes:**
- Wrapped summary statistics with shareable cards (R10)
- Privacy-conscious analytics and user behavior tracking (R19)
- Complete offline functionality with service worker (R21)
- Social media sharing with image generation
- Performance analytics dashboard
- Data synchronization and conflict resolution
- PWA capabilities for mobile installation
- Export functionality (PDF, PNG, JSON)

**Excludes:**
- Advanced analytics machine learning insights (Future)
- Multi-user collaboration features (Future)
- API for third-party integrations (Future)
- Advanced sharing customization (Future)
- Enterprise analytics reporting (Future)
</domain>

<decisions>
## Implementation Decisions

**1. Analytics Strategy**
- Self-hosted analytics using lightweight custom implementation
- No third-party trackers to ensure privacy compliance
- Event-based tracking with user consent mechanism
- Data stored in IndexedDB with 30-day retention policy
- GDPR-compliant with explicit opt-in and easy opt-out
- Anonymous session IDs, no cross-session tracking without consent

**2. Wrapped Statistics Calculation**
- Real-time computation from cached GitHub data (no server needed)
- Statistics: Total commits, languages breakdown, activity patterns, collaboration metrics
- Personality algorithm based on coding patterns (timing, languages, collaboration frequency)
- Historical comparison (this year vs previous year where available)
- Achievements/badges system for milestones (100 commits, polyglot, etc.)

**3. Sharing Implementation**
- Primary: Canvas-to-image generation for visual sharing cards
- Secondary: Shareable links with summary data
- Export formats: PNG (social), PDF (professional), JSON (developer)
- Social platforms: Twitter/X, LinkedIn, GitHub (via gist), direct image download
- Pre-built card templates: Galaxy view, stats summary, personality card
- Custom branding option for personal/professional use

**4. Offline Strategy**
- Service worker with aggressive caching for app shell
- GitHub data cached in IndexedDB (unlimited storage)
- Offline-first approach: app fully functional without network
- Background sync for analytics when connection restored
- Cache management: LRU eviction, manual cache clearing option
- Version management for app updates with smooth migration

**5. PWA Configuration**
- Full PWA with web app manifest
- Installable on mobile and desktop platforms
- Offline-ready with custom offline page
- Push notifications for data sync completion (optional)
- App shortcuts for quick access to universe and wrapped views
- Icon generation for various platform requirements

**6. Data Synchronization**
- Queue-based sync for analytics events during offline periods
- Conflict resolution: Last-write-wins for user preferences
- GitHub data refresh with delta sync when possible
- Manual refresh option with progress indication
- Sync status indicator in HUD
- Failure handling with retry mechanisms and user feedback

**7. Performance Analytics**
- Client-side performance monitoring with user consent
- Metrics: FPS, load times, interaction latency, memory usage
- Device classification: mobile/tablet/desktop performance tiers
- Anonymous aggregation for performance optimization insights
- User-facing performance dashboard with recommendations
- Automatic quality adjustment based on device capabilities
</decisions>

<specifics>
## Specific Ideas

**Wrapped Statistics Content:**
```typescript
interface WrappedStats {
  overview: {
    totalCommits: number;
    repositoriesContributed: number;
    pullRequestsMerged: number;
    issuesOpened: number;
    linesOfCode: { added: number; deleted: number; };
  };
  languages: {
    primary: string;
    breakdown: Record<string, number>;
    diversity: number; // 0-1 score
  };
  patterns: {
    mostActiveDay: string;
    mostActiveHour: number;
    longestStreak: number;
    busiestMonth: string;
    weekendVsWeekday: number; // ratio
  };
  collaboration: {
    topCollaborators: Array<{ login: string; repos: number; }>;
    reviewsGiven: number;
    reviewsReceived: number;
    forksCreated: number;
  };
  personality: {
    type: string; // "Night Owl", "Language Explorer", etc.
    traits: string[];
    badge: string;
  };
  achievements: string[];
}
```

**Analytics Event Schema:**
```typescript
interface AnalyticsEvent {
  type: string; // 'page_view', 'interaction', 'feature_usage'
  timestamp: number;
  sessionId: string;
  properties: {
    duration?: number;
    nodeCount?: number;
    device?: 'mobile' | 'tablet' | 'desktop';
    feature?: string;
    performance?: {
      fps: number;
      loadTime: number;
      memoryUsage: number;
    };
  };
}
```

**Service Worker Caching Strategy:**
- App Shell: Cache-first with fallback
- GitHub API responses: Network-first with cache fallback
- Static assets: Cache-first with version management
- Analytics: Background sync when online
- User preferences: Immediate sync with conflict resolution

**Sharing Card Templates:**
1. **Galaxy View Card**: Screenshot of full universe with stats overlay
2. **Stats Summary Card**: Clean design with key metrics and personality
3. **Language Breakdown Card**: Pie chart with coding language distribution
4. **Timeline Card**: Activity heatmap showing year progression
5. **Achievement Card**: Badges and milestones with visual elements

**PWA Features:**
```json
{
  "name": "GitHub Wrapped - Spatial Edition",
  "short_name": "GitHub Wrapped",
  "description": "Your GitHub year as an interactive physics universe",
  "start_url": "/universe",
  "display": "standalone",
  "theme_color": "#0366d6",
  "background_color": "#0d1117",
  "categories": ["productivity", "developer", "social"],
  "shortcuts": [
    {
      "name": "Universe",
      "url": "/universe",
      "description": "Explore your GitHub universe"
    },
    {
      "name": "Wrapped Summary",
      "url": "/wrapped",
      "description": "View your year in review"
    }
  ]
}
```

**Offline Functionality:**
- Complete universe exploration with cached data
- Wrapped summary generation works offline
- Settings and preferences persist offline
- Queue analytics events for later sync
- Offline indicator in HUD with last sync timestamp
- Manual refresh button with progress indication

**Export Options:**
- PNG: High-resolution sharing cards (1200x630 for social media)
- PDF: Professional report with full statistics and universe snapshot
- JSON: Raw data export for developers and integrations
- CSV: Statistics export for data analysis
- Universe state: Save/restore complete universe state with positions
</specifics>

<deferred>
## Deferred Ideas

**Advanced Analytics:**
- Machine learning insights for coding pattern analysis (Future)
- Predictive analytics for repository health and activity (Future)
- Cross-platform correlation with other development tools (Future)
- Team analytics for organization-wide insights (Future)

**Enhanced Sharing:**
- Video generation of universe evolution over time (Future)
- Interactive embedded widgets for websites/blogs (Future)
- Custom sharing card design editor (Future)
- Social media scheduling integration (Future)
- Bulk sharing for teams and organizations (Future)

**Enterprise Features:**
- Analytics API for organizations (Future)
- White-label branding options (Future)
- Advanced privacy controls for enterprise users (Future)
- Integration with enterprise analytics platforms (Future)
- Multi-tenant offline data management (Future)

**Advanced Offline:**
- Peer-to-peer sync between devices (Future)
- Advanced conflict resolution with manual merge options (Future)
- Partial sync for large datasets (Future)
- Compression and deduplication for storage optimization (Future)

**Extended Export:**
- Integration with portfolio websites (Future)
- Automated report generation and scheduling (Future)
- Template marketplace for custom designs (Future)
- Integration with presentation tools (PowerPoint, Google Slides) (Future)

**Performance & Optimization:**
- Edge caching for global performance (Future)
- Intelligent preloading based on usage patterns (Future)
- Advanced memory management for large datasets (Future)
- WebGL acceleration for high-end devices (Future)

**Social Features:**
- Public universe galleries (Future)
- Comparison and ranking systems (Future)
- Community challenges and achievements (Future)
- Social networking features for developers (Future)
</deferred>
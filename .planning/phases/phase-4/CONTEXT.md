# Phase 4: Interactive Universe Controls - Context

**Gathered:** 2026-03-06
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase transforms the static physics-based visualization from Phase 3 into an interactive universe that users can explore and control.

**Includes:**
- Pan, zoom, and drag interactions with the repository universe
- Real-time search functionality with visual highlighting
- Time-based evolution controls (timeline scrubber, play/pause)
- Smooth viewport transitions and camera controls
- Touch/gesture support for mobile devices
- Performance optimization during interactions

**Excludes:**
- Advanced search filters and sorting (Phase 6)
- Sharing specific views or timestamps (Phase 6)
- Analytics tracking of user interactions (Phase 6)
- Accessibility features and mobile responsive design (Phase 5)
</domain>

<decisions>
## Implementation Decisions

**1. Interaction Coordinate System**
- Use a camera/viewport system that translates between screen coordinates and world coordinates
- Implement smooth interpolation for zoom and pan transitions
- Maintain consistent interaction feel across different zoom levels

**2. Physics Integration**
- Dragging nodes temporarily overrides physics forces for that node
- Physics simulation continues running during pan/zoom for smooth experience
- Implement interaction zones that pause physics for performance during heavy manipulation

**3. Search Implementation**
- Real-time fuzzy search across repository names, descriptions, and languages
- Visual highlighting using glow effects, size scaling, or color changes
- Search results limit of 50 items max to prevent performance issues
- Search state persists during other interactions

**4. Time Evolution Approach**
- Timeline represents commit history progression over actual calendar time
- Granularity: daily snapshots for repos with high activity, weekly for lower activity
- Animation speed: 1 second = 1 month of real time (configurable)
- Nodes fade in/out based on repository creation/activity dates

**5. Input Handling Strategy**
- Event-driven system with debouncing for performance
- Unified gesture handling for mouse, touch, and keyboard
- Prevent default browser behaviors (pinch-zoom, scroll) on canvas area
</decisions>

<specifics>
## Specific Ideas

**Viewport Management:**
- Implement camera bounds to prevent infinite panning
- Add "fit to view" button that shows all repositories
- Smooth easing functions for zoom transitions (ease-out cubic)
- Mini-map in corner showing current viewport position

**Search Interface:**
- Floating search bar that appears on key press (/)
- Auto-complete suggestions based on repository metadata
- Clear visual feedback for "no results found"
- Keyboard navigation through search results (arrow keys, enter to focus)

**Timeline Controls:**
- Horizontal timeline scrubber at bottom of screen
- Play/pause/step controls with keyboard shortcuts (spacebar, arrow keys)
- Speed controls: 0.5x, 1x, 2x, 4x playback speeds
- Visual indicators showing "birth" and "activity peaks" of repositories

**Performance Optimizations:**
- Level-of-detail rendering: reduce node complexity when zoomed out
- Interaction priority queue: prioritize user interactions over background physics
- Throttled search updates (max 10 queries per second)
- Canvas dirty-region tracking for efficient redraws

**Visual Feedback:**
- Hover states with node information tooltips
- Visual connection lines when dragging nodes
- Smooth color transitions for search highlighting
- Breadcrumb trail showing navigation history
</specifics>

<deferred>
## Deferred Ideas

**Advanced Search Features:**
- Search filters by language, stars, forks, date ranges (Phase 6)
- Saved search queries and bookmarks (Phase 6)
- Search result clustering and categorization (Phase 6)

**Sharing & Collaboration:**
- Shareable URLs for specific viewport/time combinations (Phase 6)
- Collaborative viewing sessions (Phase 6)
- Export functionality for screenshots/videos (Phase 6)

**Analytics & Insights:**
- Heat maps of user interaction patterns (Phase 6)
- Most viewed repositories tracking (Phase 6)
- User journey analytics through the visualization (Phase 6)

**Advanced Interactions:**
- Multi-node selection with lasso tool (Phase 6)
- Repository comparison mode (Phase 6)
- Custom physics parameter controls for power users (Phase 6)
</deferred>

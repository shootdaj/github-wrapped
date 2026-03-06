# GitHub Wrapped — Spatial Edition

Your GitHub year visualized as an interactive physics universe. Repos are planets, commits are particles, PRs are connections — all floating in a 2D canvas with real physics. Drag, zoom, explore your code life.

## Overview

Connect your GitHub account. The app fetches your activity and renders it as a living, breathing physics simulation on a 2D canvas. Related items cluster together organically via spring forces. Everything is draggable. Zoom from the galaxy view (all repos) down to individual commits.

## The Universe

### Nodes (Physics Bodies)

- **Repos** — Large circles, sized by commit count, colored by primary language. Label shows repo name.
- **Commits** — Small particles orbiting their parent repo. Color intensity = lines changed. Hover shows message + diff stats.
- **PRs** — Diamond shapes connected to their repo. Green = merged, red = closed, yellow = open. Size = number of review comments.
- **Languages** — Faint gravity wells that attract repos using that language. Creates organic language clusters (all your Python repos drift together).
- **Collaborators** — Small avatar circles. Spring-connected to repos they contributed to. Frequent collaborators cluster near you.

### Physics

- Spring forces between connected nodes (repo↔commit, repo↔PR, repo↔collaborator)
- Gravitational attraction between repos sharing a language
- Repulsion between unrelated nodes (prevent overlap)
- Damping so the system settles into stable clusters
- Drag any node — connected nodes follow with spring lag
- Velocity persistence in localStorage (resume where you left off, mid-drift)

### Interactions

- **Pan** — Click and drag background
- **Zoom** — Scroll wheel, pinch on mobile. Semantic zoom: galaxy view shows only repos, zoom in to see commits/PRs appear
- **Drag** — Grab any node, fling it, watch physics react
- **Hover** — Tooltip with details (commit message, PR title, repo description)
- **Click** — Opens detail panel (side drawer) with full info + link to GitHub
- **Search** — Filter/highlight nodes by text. Non-matching nodes fade out.
- **Time scrubber** — Slider across bottom. Scrub through the year month-by-month. Nodes appear/disappear as you move through time. Watch your universe grow.

## Pages

### Connect (/)
- "Connect GitHub" button → OAuth flow (GitHub App)
- Shows what data will be fetched
- Loading screen with progress bar while fetching (repos → commits → PRs → collaborators)

### Universe (/universe)
- Full-viewport canvas (no scrolling — pan/zoom instead)
- Floating HUD overlay:
  - Top-left: your avatar + name + year
  - Top-right: search bar + filters (by language, by repo)
  - Bottom: time scrubber
  - Bottom-right: zoom controls + minimap
- Side drawer (slides in on node click): full details + GitHub links

### Wrapped Summary (/wrapped)
- Shareable stats cards (screenshot-friendly):
  - Total commits, PRs merged, repos contributed to
  - Top language + hours coded (estimated from commit timestamps)
  - Longest streak
  - Most active day of week / time of day (heatmap)
  - Top collaborator
  - "Your GitHub personality" (fun label based on patterns: "Night Owl", "Polyglot", "Review Machine", etc.)
- "Share" button → generates an image or shareable link

## Tech Stack

- Next.js 15 (App Router)
- TypeScript (strict)
- Canvas 2D API for rendering (not DOM nodes — needs to handle 1000+ objects)
- Custom physics engine (Verlet integration, spatial hashing for collision)
- GitHub REST API v3 (or GraphQL v4) for data fetching
- OAuth via GitHub App (NextAuth.js or custom)
- localStorage for caching fetched data + node positions/velocities
- Tailwind CSS for UI chrome (HUD, panels, connect page)
- Vitest for tests

## Data Model (localStorage)

```
{
  user: { login, avatarUrl, name },
  repos: [{ id, name, language, stars, commitCount, description }],
  commits: [{ sha, repoId, message, date, additions, deletions }],
  prs: [{ id, repoId, title, state, mergedAt, reviewComments }],
  collaborators: [{ login, avatarUrl, repoIds }],
  universe: {
    positions: { [nodeId]: { x, y } },
    velocities: { [nodeId]: { vx, vy } },
    camera: { x, y, zoom }
  }
}
```

## Physics Config

- Spring stiffness: 0.005 (repo↔child connections)
- Spring rest length: proportional to parent node size
- Gravity between same-language repos: 0.001
- Node repulsion: 0.1 (inverse square)
- Damping: 0.98 per frame
- Spatial hash cell size: 100px (for broad-phase collision)
- Target: 60fps with up to 2000 nodes

## Quality

- TypeScript strict mode
- Unit tests for physics engine (spring forces, integration, spatial hash)
- Unit tests for data transforms (GitHub API → universe nodes)
- Component tests for HUD interactions
- Canvas rendering tested via snapshot of node positions after N simulation steps
- Responsive: desktop (primary) + tablet. Mobile gets simplified view (fewer particles).

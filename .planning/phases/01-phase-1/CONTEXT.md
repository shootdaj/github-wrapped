# Phase 1: Foundation & Authentication - Context

**Gathered:** 2026-03-06
**Status:** Ready for planning

<domain>
## Phase Boundary
This phase establishes the foundational infrastructure for the GitHub Wrapped application:

**INCLUDED:**
- Complete Next.js 15 project scaffolding with TypeScript strict mode
- GitHub OAuth authentication flow with secure token management
- Basic project structure (pages, components, utilities)
- CI/CD pipeline setup with GitHub Actions
- Browser compatibility framework with feature detection
- Privacy policy and GDPR compliance foundation
- Environment configuration (staging/production)
- Basic error handling and user feedback systems

**NOT INCLUDED:**
- GitHub API data fetching (Phase 2)
- Canvas rendering or physics engine (Phase 3)
- Interactive controls or search (Phase 4)
- Mobile responsiveness optimization (Phase 5)
- Analytics or wrapped features (Phase 6)
</domain>

<decisions>
## Implementation Decisions

### 1. OAuth Strategy
**Decision:** GitHub App with NextAuth.js
**Rationale:** More secure than OAuth Apps, better token management, established Next.js integration
- Use NextAuth.js v5 (latest) for OAuth handling
- GitHub App provides granular permissions and better rate limits
- HTTP-only secure cookies for token storage (not localStorage)
- State parameter included automatically for CSRF protection

### 2. Tech Stack Foundation
**Decision:** Next.js 15 App Router, TypeScript strict, Tailwind CSS
**Rationale:** Specified in SPEC.md, optimal for modern React development
- Next.js 15 with App Router (confirmed in spec)
- TypeScript strict mode for type safety
- Tailwind CSS for utility-first styling
- Vitest for testing framework

### 3. Deployment Platform
**Decision:** Vercel with GitHub Actions CI/CD
**Rationale:** Seamless Next.js integration, zero-config deployment
- Vercel for hosting (staging + production)
- GitHub Actions for CI/CD pipeline
- Automatic deployments on merge to main
- Preview deployments for PRs

### 4. Browser Support Matrix
**Decision:** ES2022 target with Canvas 2D API detection
**Rationale:** Modern browsers per R14, focus on Canvas capabilities
- Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- Canvas 2D API feature detection with graceful fallbacks
- No polyfills for core features (keep bundle small)
- Clear messaging for unsupported browsers

### 5. Privacy Implementation
**Decision:** GDPR-first design with minimal data collection
**Rationale:** Compliance requirements in R15, user trust priority
- Privacy policy page explaining GitHub data usage
- "Delete my data" functionality from day one
- No third-party analytics in Phase 1 (defer to Phase 6)
- Explicit consent flow for data processing
</decisions>

<specifics>
## Specific Ideas

### Project Structure
```
src/
  app/                 # Next.js App Router
    auth/             # OAuth callback handling
    universe/         # Main app (placeholder for Phase 2)
    wrapped/          # Summary page (placeholder for Phase 6)
    privacy/          # Privacy policy
  components/
    ui/               # Reusable UI components
    auth/             # Authentication components
  lib/
    auth.ts           # NextAuth configuration
    env.ts            # Environment validation
  types/
    github.ts         # GitHub API types
    auth.ts           # Authentication types
```

### Authentication Flow
1. Landing page with "Connect GitHub" button
2. NextAuth GitHub provider redirects to GitHub OAuth
3. GitHub App requests read-only repository permissions
4. Success redirects to /universe (Phase 2 placeholder)
5. Error states with clear retry options

### CI/CD Pipeline
- **GitHub Actions workflow:**
  - TypeScript type checking
  - Vitest test execution
  - Build verification
  - Vercel deployment
- **Environment management:**
  - GITHUB_ID and GITHUB_SECRET in Vercel env vars
  - NEXTAUTH_SECRET generation
  - Staging environment for testing

### Privacy Features
- Privacy policy explaining minimal GitHub data collection
- Clear data usage statements (repositories, commits, public profile)
- "Delete Account" button that clears localStorage and logs out
- No tracking or analytics in Phase 1

### Browser Compatibility
- Canvas 2D API feature detection on app load
- Fallback message for incompatible browsers
- Progressive enhancement approach
- Touch event detection for mobile preparation
</specifics>

<deferred>
## Deferred Ideas

### Phase 2+ Features
- GitHub API integration and data fetching logic
- Data caching strategies and localStorage schemas
- Rate limiting and error handling for API calls
- Progressive loading indicators

### Phase 3+ Features
- Canvas rendering setup and physics engine initialization
- Performance monitoring and FPS tracking
- Spatial hashing for collision detection

### Phase 4+ Features
- Pan/zoom controls and interaction handlers
- Search functionality and filtering systems
- Time scrubber implementation

### Phase 5+ Features
- Mobile-specific optimizations and responsive design
- Touch gesture handling
- Accessibility features (ARIA labels, keyboard navigation)

### Phase 6+ Features
- Analytics integration and user behavior tracking
- Sharing functionality and social media integration
- Wrapped summary statistics and personality labeling

### Nice-to-Have (Later)
- Dark mode toggle (can use Tailwind's dark: utilities)
- Internationalization framework setup
- Service worker for offline capabilities
- Performance budgets and monitoring
</deferred>

# Phase 3: Physics Engine & Canvas Rendering - Context

**Gathered:** 2026-03-06
**Status:** Ready for planning

<domain>
## Phase Boundary
This phase implements the core visualization and physics simulation engine that brings the GitHub universe to life:

**INCLUDED:**
- Canvas-based 2D rendering system for GitHub data visualization
- Custom physics engine with spring forces, gravity, and damping
- Node positioning and layout algorithms for initial universe state
- Real-time physics simulation at 60fps target
- Performance monitoring infrastructure (FPS, memory, render times)
- Canvas viewport management (coordinate system, transforms)
- Node interaction system (hover detection, click handling)
- Memory management for large datasets (2000+ nodes)
- Canvas resize handling and responsive canvas behavior

**NOT INCLUDED:**
- User interaction controls (pan/zoom/drag) - Phase 4
- Search and filtering functionality - Phase 4
- Time scrubber and temporal evolution - Phase 4
- Mobile responsiveness optimizations - Phase 5
- Accessibility features - Phase 5
- Analytics and sharing features - Phase 6
</domain>

<decisions>
## Implementation Decisions

### 1. Physics Engine Architecture
**Decision:** Custom physics engine with Verlet integration
**Rationale:** Specific requirements for spring forces between GitHub entities, performance control
- Custom implementation using Verlet integration for stability
- Spatial hashing for broad-phase collision detection (100px cell size as per spec)
- Force-based simulation: springs, gravity, repulsion, damping
- Object pooling for physics bodies to minimize garbage collection
- Separate update loop from render loop for better performance control

### 2. Canvas Rendering Strategy
**Decision:** Single canvas with layered rendering order
**Rationale:** Simpler coordinate management, better performance than multiple canvas elements
- Single full-viewport canvas element
- Render in layers: background → connections → nodes → hover effects
- Canvas 2D API with manual dirty rectangle optimization for static elements
- Offscreen canvas for pre-rendered node sprites (language colors, shapes)
- requestAnimationFrame for smooth 60fps rendering loop

### 3. Node Positioning Algorithm
**Decision:** Force-directed layout with language clustering
**Rationale:** Matches spec requirements for organic clustering behavior
- Initial layout using circle packing algorithm for repositories
- Language-based gravity wells create natural clustering zones
- Spring forces determine parent-child relationships (repo↔commits, repo↔PRs)
- Repulsion forces prevent overlap using inverse square law
- Damping coefficient of 0.98 per frame for settling behavior

### 4. Performance Monitoring Implementation
**Decision:** Custom performance tracker with visual FPS indicator
**Rationale:** Need real-time feedback for performance-critical physics simulation
- FPS counter with rolling 60-frame average
- Memory usage tracking via performance.memory API
- Canvas render time tracking per frame
- Physics computation time measurement
- Visual indicator in top-left corner (color-coded: green>55fps, yellow>45fps, red<45fps)
- Performance degradation alerts when metrics drop below thresholds

### 5. Coordinate System and Viewport
**Decision:** World coordinates with camera transform matrix
**Rationale:** Clean separation between universe data and screen rendering
- Universe uses world coordinates (potentially infinite space)
- Camera system with position (x, y) and zoom level
- Canvas transform matrix handles world→screen coordinate conversion
- Viewport culling: only render nodes visible on screen
- Coordinate system: origin at universe center, Y-axis up (mathematical convention)

### 6. Memory Management Strategy
**Decision:** Object pooling with periodic garbage collection hints
**Rationale:** Handle large datasets without performance degradation
- Object pools for physics bodies, force calculations, and render commands
- Node limit enforcement: warn at 1500 nodes, degrade gracefully at 2000+
- Lazy loading for node details (commit messages, PR info) on first hover
- Periodic cleanup of offscreen cached sprites
- Manual garbage collection hints during idle periods
</decisions>

<specifics>
## Specific Ideas

### Physics Engine Structure
```typescript
interface PhysicsEngine {
  bodies: PhysicsBody[]
  spatialHash: SpatialHash
  forces: ForceRegistry

  update(deltaTime: number): void
  addBody(body: PhysicsBody): void
  removeBody(body: PhysicsBody): void
  applyForces(): void
  integrate(): void
}

interface PhysicsBody {
  id: string
  type: 'repo' | 'commit' | 'pr' | 'collaborator'
  position: Vector2
  velocity: Vector2
  mass: number
  radius: number
  connections: string[] // Connected body IDs
}
```

### Canvas Architecture
```typescript
interface UniverseCanvas {
  canvas: HTMLCanvasElement
  context: CanvasRenderingContext2D
  camera: Camera
  renderLayers: RenderLayer[]

  render(): void
  worldToScreen(worldPos: Vector2): Vector2
  screenToWorld(screenPos: Vector2): Vector2
  getNodeAt(screenPos: Vector2): Node | null
}

// Render layers (back to front)
const renderOrder = [
  'background',      // Grid lines, background effects
  'connections',     // Spring connections between nodes
  'gravity-wells',   // Language gravity visualization (subtle)
  'nodes',          // Repository, commit, PR, collaborator nodes
  'labels',         // Text labels and node information
  'effects',        // Hover effects, selection highlights
  'debug'          // Performance overlay, debug information
]
```

### Performance Monitoring
```typescript
interface PerformanceTracker {
  fps: RollingAverage
  frameTime: RollingAverage
  physicsTime: RollingAverage
  renderTime: RollingAverage
  memoryUsage: number
  nodeCount: number

  startFrame(): void
  endPhysics(): void
  endRender(): void
  getMetrics(): PerformanceMetrics
}

// Performance thresholds
const PERFORMANCE_TARGETS = {
  targetFPS: 60,
  warningFPS: 45,
  criticalFPS: 30,
  maxMemoryMB: 512,
  maxPhysicsTimeMs: 8,
  maxRenderTimeMs: 8
}
```

### Node Rendering Specifications
- **Repositories:** Circles, radius = sqrt(commitCount) * 2, color by language, label with name
- **Commits:** Small circles (2-4px), orbit parent repo, color intensity = lines changed
- **Pull Requests:** Diamond shapes, color by state (green/red/yellow), size by review comments
- **Collaborators:** Avatar circles with GitHub profile images, size by contribution frequency

### Force Configuration
```typescript
const PHYSICS_CONFIG = {
  springStiffness: 0.005,
  springDamping: 0.1,
  gravityStrength: 0.001,
  repulsionStrength: 0.1,
  globalDamping: 0.98,
  spatialHashSize: 100,
  maxVelocity: 50,
  minDistance: 10 // Minimum separation between nodes
}
```

### Canvas Event Handling
- Mouse move: Hit testing for hover effects
- Mouse down: Prepare for potential drag operation
- Canvas resize: Maintain aspect ratio, recompute viewport bounds
- Visibility change: Pause physics/rendering when tab inactive
</specifics>

<deferred>
## Deferred Ideas

### Phase 4+ Features
- Pan/zoom controls requiring camera manipulation
- Drag and drop interactions affecting physics bodies
- Search highlighting requiring visual state changes
- Time scrubber affecting node visibility and physics state

### Phase 5+ Features
- Mobile touch interaction handling
- Responsive canvas sizing and mobile performance optimizations
- Accessibility features (keyboard navigation, screen reader support)
- High contrast mode and accessibility-friendly rendering

### Phase 6+ Features
- Canvas export for sharing (PNG/SVG generation)
- Animation recording and playback capabilities
- Advanced analytics integration for interaction tracking

### Performance Optimizations (Future)
- WebGL rendering fallback for high node counts
- Web Workers for physics calculations
- Level-of-detail rendering (fewer details at distance)
- Instanced rendering for repeated node types
- Quadtree optimization for spatial queries

### Advanced Features (Later)
- Particle systems for visual effects
- Smooth camera transitions and cinematic effects
- Custom shaders for advanced visual effects
- Real-time shadows and lighting
- Animated connections showing data flow
</deferred>

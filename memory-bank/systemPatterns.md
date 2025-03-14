# System Patterns

## System Architecture

"Border Collie and Me" follows a component-based architecture organized into several key systems that interact to create the complete game experience. The architecture is designed to be modular, allowing for independent development and testing of different game aspects.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Game Core                            │
├─────────┬─────────┬─────────┬─────────┬─────────┬──────────┤
│  Time   │ Player  │ Ranch   │ Animal  │ Economy │  Event   │
│ System  │ System  │ System  │ System  │ System  │  System  │
└─────────┴─────────┴─────────┴─────────┴─────────┴──────────┘
       │         │         │         │         │         │
       ▼         ▼         ▼         ▼         ▼         ▼
┌─────────────────────────────────────────────────────────────┐
│                     Rendering Layer                         │
├─────────┬─────────┬─────────┬─────────┬─────────┬──────────┤
│  World  │ Entity  │   UI    │ Effects │ Sound   │ Animation│
│ Renderer│ Renderer│ Renderer│ System  │ System  │  System  │
└─────────┴─────────┴─────────┴─────────┴─────────┴──────────┘
       │         │         │         │         │         │
       ▼         ▼         ▼         ▼         ▼         ▼
┌─────────────────────────────────────────────────────────────┐
│                      Input Layer                            │
├─────────┬─────────┬─────────┬─────────┬─────────┬──────────┤
│ Keyboard│  Mouse  │  Touch  │ Command │ Control │  Input   │
│ Handler │ Handler │ Handler │ Parser  │ Mapper  │ Validator│
└─────────┴─────────┴─────────┴─────────┴─────────┴──────────┘
       │         │         │         │         │         │
       ▼         ▼         ▼         ▼         ▼         ▼
┌─────────────────────────────────────────────────────────────┐
│                     Data Layer                              │
├─────────┬─────────┬─────────┬─────────┬─────────┬──────────┤
│  Game   │  Save   │ Config  │ Asset   │ State   │ Analytics│
│  State  │ Manager │ Manager │ Manager │ History │ Tracker  │
└─────────┴─────────┴─────────┴─────────┴─────────┴──────────┘
```

## Key Technical Decisions

### 1. Browser-Based Implementation

- **Technology Stack**: HTML5, CSS3, JavaScript/TypeScript
- **Rendering**: Canvas-based rendering for performance and pixel-perfect control
- **Compatibility**: Designed for modern browsers with fallbacks for wider compatibility
- **Offline Capability**: Service workers for offline play and caching assets

### 2. State Management

- **Central State Store**: Single source of truth for game state
- **Immutable State Updates**: Predictable state transitions
- **State History**: Time-travel debugging and undo functionality
- **Serialization**: Efficient state serialization for save/load functionality

### 3. Asset Management

- **Sprite Atlases**: Optimized sprite sheets to minimize draw calls
- **Asset Preloading**: Progressive loading with prioritization
- **Texture Packing**: Efficient memory usage for pixel art assets
- **Audio Pooling**: Reuse audio resources for performance

### 4. Performance Optimization

- **Object Pooling**: Reuse game objects to reduce garbage collection
- **Spatial Partitioning**: Grid-based collision detection for large numbers of entities
- **Render Culling**: Only render entities visible in the viewport
- **Lazy Loading**: Load assets and systems as needed

## Design Patterns in Use

### Core Patterns

1. **Entity-Component System (ECS)**

   - Entities (sheep, Border Collie, player) composed of reusable components
   - Systems process entities with specific component combinations
   - Allows for flexible entity composition and behavior

2. **Observer Pattern**

   - Event-driven communication between systems
   - Reduces tight coupling between components
   - Enables reactive UI updates and game state changes

3. **State Pattern**

   - Entities have distinct states with specific behaviors
   - Examples: Sheep states (grazing, following, fleeing), Border Collie states (idle, herding, guarding)
   - Clean transitions between different behaviors

4. **Command Pattern**
   - Player inputs translated to commands
   - Enables input remapping, replay functionality, and undo operations
   - Simplifies AI implementation by using the same command interface

### Additional Patterns

5. **Factory Pattern**

   - Centralized creation of complex game entities
   - Ensures consistent initialization and configuration
   - Simplifies entity spawning and recycling

6. **Strategy Pattern**

   - Interchangeable algorithms for AI behaviors
   - Different herding strategies for the Border Collie
   - Various sheep personality types

7. **Singleton Pattern (Limited Use)**

   - Used sparingly for truly global systems (game clock, asset manager)
   - Implemented as services with dependency injection where possible

8. **Decorator Pattern**
   - Add capabilities to entities dynamically
   - Example: Sheep traits, Border Collie skills

## Component Relationships

### Key Components and Their Interactions

#### Time System

- Controls game clock, day/night cycle, and seasonal progression
- Broadcasts time events that other systems react to
- Manages scheduling of time-dependent events

#### Player System

- Handles player input and character movement
- Manages player inventory and statistics
- Coordinates player interactions with other entities

#### Ranch System

- Manages ranch facilities and their states
- Handles facility upgrades and maintenance
- Controls pasture conditions and environmental factors

#### Animal System

- Governs sheep and Border Collie behavior
- Manages animal stats, health, and needs
- Handles breeding, growth, and lifecycle events

#### Economy System

- Tracks player finances and resource values
- Manages market prices and economic events
- Handles transactions and economic progression

#### Event System

- Schedules and triggers random and scripted events
- Manages event conditions and outcomes
- Coordinates multi-stage events and quests

### Data Flow

1. **Input → Command → Entity Update**

   - Player input translated to commands
   - Commands validated and executed
   - Entity state updated based on commands

2. **Entity Update → System Processing → State Change**

   - Entity changes trigger system processing
   - Systems apply game logic and rules
   - Game state updated based on processing results

3. **State Change → Rendering → Player Feedback**

   - State changes reflected in rendering
   - Visual and audio feedback provided
   - UI updated to show new state

4. **Time Progression → Scheduled Events → World Changes**
   - Game clock advances
   - Scheduled events triggered
   - World state updated based on time and events

## Technical Constraints and Considerations

1. **Browser Limitations**

   - Memory management crucial for long play sessions
   - Performance optimization for various devices
   - Handling browser-specific quirks and limitations

2. **Save Data Management**

   - LocalStorage size limitations
   - Data integrity and corruption prevention
   - Versioning for save compatibility across updates

3. **Asset Loading and Management**

   - Balancing initial load time vs. on-demand loading
   - Handling connection interruptions
   - Efficient caching strategies

4. **Accessibility Considerations**
   - Keyboard navigation alternatives
   - Color blindness accommodations
   - Text scaling and readability

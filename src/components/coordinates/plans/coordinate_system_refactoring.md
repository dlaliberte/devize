# Coordinate System Refactoring Plan

## Overview

This plan outlines the refactoring of the coordinate system components to make them more generalizable, with a specific focus on supporting 3D visualizations. The current implementation is primarily focused on 2D cartesian and spherical coordinates, and we need to extend this to support 3D space while maintaining a clear separation between coordinate transformations and rendering technologies.

## Goals

1. Create a more abstract base coordinate system interface
2. Refactor the existing coordinate systems to implement this interface
3. Implement a 3D cartesian coordinate system
4. Ensure all coordinate systems can be used interchangeably where appropriate
5. Separate coordinate systems from rendering contexts

## Implementation Strategy

### 1. Abstract Coordinate System Interface

Enhance the existing `CoordinateSystem` interface to be more generic:

```typescript
export interface CoordinateSystem {
  // Convert from data coordinates to container coordinates
  toContainerCoords(point: any): any;

  // Convert from container coordinates to data coordinates
  fromContainerCoords(point: any): any;

  // Get the dimensions of the coordinate system
  getDimensions(): { width: number, height: number };

  // Get the origin point
  getOrigin(): any;

  // Set the origin point
  setOrigin(origin: any): void;

  // Get the dimensionality of the coordinate system (2 for 2D, 3 for 3D)
  getDimensionality?(): number;

  // Get all scales used by this coordinate system
  getScales?(): Record<string, any>;
}
```

### 2. Rendering Context Abstraction

Create a separate abstraction for rendering contexts:

```typescript
export interface RenderingContext {
  // Initialize the rendering context
  initialize(container: HTMLElement): void;

  // Render a scene
  render(): void;

  // Add an object to the scene
  addObject(object: any): void;

  // Remove an object from the scene
  removeObject(object: any): void;

  // Get the native rendering context (e.g., WebGLRenderingContext, CanvasRenderingContext2D)
  getNativeContext(): any;

  // Clean up resources
  dispose(): void;
}
```

Implement specific rendering contexts:
- SVGRenderingContext
- CanvasRenderingContext
- WebGLRenderingContext
- ThreeJSRenderingContext
- HTMLRenderingContext

### 3. Refactor Existing Coordinate Systems

- Update the existing `CartesianCoordinateSystem` and `SphericalCoordinateSystem` to implement the enhanced interface
- Ensure backward compatibility with existing visualizations
- Add the `getDimensionality()` method that returns the appropriate dimensionality
- Implement the `getScales()` method to return all scales

### 4. Implement 3D Cartesian Coordinate System

- Create a new `Cartesian3DCoordinateSystem` class
- Implement the coordinate system interface with 3D support
- Add z-axis scale and transformations
- Support projection from 3D to 2D for display purposes
- Keep it independent of any specific rendering technology

### 5. Implement Projection Utilities

Create utilities for projecting 3D coordinates to 2D:

```typescript
export interface ProjectionOptions {
  type: 'orthographic' | 'perspective' | 'isometric';
  viewPoint?: Point3D;
  distance?: number;
  fov?: number;
}

export function project3Dto2D(point: Point3D, options: ProjectionOptions): Point {
  // Implementation of various projection methods
}
```

### 6. Component Registration

- Register all coordinate systems as Devize components
- Create factory functions for easy instantiation
- Provide examples and documentation

## Timeline

- Week 1: Enhance the coordinate system interface and refactor existing systems
- Week 2: Implement the 3D cartesian coordinate system and projection utilities
- Week 3: Create rendering context abstractions
- Week 4: Documentation and examples

## Dependencies

- Existing scale implementations
- Devize component registration system

## References

- **Documentation**: /src/components/coordinates/docs/coordinate_systems.md
- **Design**: /src/components/coordinates/designs/3d_coordinate_system.md
- **Tests**: /src/components/coordinates/tests/3d_coordinate_system_tests.md
- **Related Code**: /src/components/coordinates/cartesianCoordinateSystem.ts, /src/components/coordinates/sphericalCoordinateSystem.ts
```

Now, let's create a revised design document for the 3D coordinate system:

```markdown:src/components/coordinates/designs/3d_coordinate_system.md
# 3D Cartesian Coordinate System Design

## Overview

This document outlines the design for a 3D Cartesian coordinate system component in Devize. This component will extend the existing coordinate system architecture to support 3D visualizations while maintaining a clear separation from rendering technologies.

## Architecture

### Class Structure

```
CoordinateSystem (Interface)
  ↑
  ├── CartesianCoordinateSystem (2D Implementation)
  ├── SphericalCoordinateSystem (2D/3D Implementation)
  └── Cartesian3DCoordinateSystem (3D Implementation)
```

### Cartesian3DCoordinateSystem

```typescript
export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface Cartesian3DCoordinateSystemOptions extends CoordinateSystemOptions {
  width: number;
  height: number;
  depth: number;
  xScale: Scale | string;
  yScale: Scale | string;
  zScale: Scale | string;
  xDomain?: [number, number];
  yDomain?: [number, number];
  zDomain?: [number, number];
  origin?: Point3D;
  flipY?: boolean;
}
```

### Coordinate Transformations

The 3D coordinate system will handle these transformations:

1. **Data to 3D Space**: Convert data values to 3D coordinates
2. **3D to 2D Projection**: Project 3D coordinates to 2D space using configurable projection methods
3. **2D to 3D**: Convert 2D coordinates to 3D coordinates (with assumptions about depth)

### Projection Methods

The coordinate system will support multiple projection methods:

1. **Orthographic**: Parallel projection without perspective
2. **Perspective**: Realistic projection with distance effects
3. **Isometric**: Equal scale along each axis
4. **Custom**: User-defined projection matrices

## Component Definition

The Cartesian3DCoordinateSystem will be defined as a Devize component:

```javascript
{
  type: "define",
  name: "cartesian3DCoordinateSystem",
  properties: {
    width: { required: true },
    height: { required: true },
    depth: { required: true },
    xScale: { required: true },
    yScale: { required: true },
    zScale: { required: true },
    xDomain: { default: [0, 1] },
    yDomain: { default: [0, 1] },
    zDomain: { default: [0, 1] },
    origin: { default: null },
    flipY: { default: true }
  },
  implementation: function(props) {
    // Implementation details
  }
}
```

## Integration with Rendering Contexts

The coordinate system will be designed to work with various rendering contexts:

1. **SVG**: For basic 2D projections of 3D data
2. **Canvas**: For more complex 2D projections with better performance
3. **WebGL/Three.js**: For full 3D rendering
4. **HTML**: For DOM-based visualizations

The separation between coordinate systems and rendering contexts allows:
- Using the same coordinate system with different rendering technologies
- Switching rendering contexts without changing the coordinate system
- Testing coordinate transformations independently of rendering

## Performance Considerations

1. **Cached Transformations**: Cache frequently used transformations
2. **Batch Processing**: Transform multiple points at once
3. **Lazy Evaluation**: Only compute transformations when needed

## References

- **Plans**: /src/components/coordinates/plans/coordinate_system_refactoring.md
- **Documentation**: /src/components/coordinates/docs/3d_coordinate_system.md
- **Tests**: /src/components/coordinates/tests/3d_coordinate_system_tests.md
- **Related Code**: /src/components/coordinates/cartesianCoordinateSystem.ts, /src/components/coordinates/sphericalCoordinateSystem.ts
```

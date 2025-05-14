# Devize Testing Strategy

## Overview

This document outlines a testing strategy for the Devize visualization library, focusing on addressing the challenges of circular dependencies, bootstrapping the core components, and testing individual parts without excessive mocking or duplicate code.

## Challenges

### 1. Circular Dependencies

The core components of Devize have interdependencies:
- The "define" visualization type needs the registry to register itself
- The builder needs the registry to look up types
- The registry needs the "define" type to bootstrap itself
- The renderer needs the builder to process specifications

### 2. Testing Individual Components

When testing individual components, we face several issues:
- Components may not function correctly in isolation
- Mocking dependencies can lead to tests that don't reflect real usage
- Manual registration of types creates duplicate code
- The bootstrapping process is complex and difficult to replicate in tests

### 3. Bootstrapping in Tests

The bootstrapping process that works in the browser (where all components are loaded together) is difficult to replicate in unit tests where we want to isolate components.

## Proposed Solution

### Core Testing Module

Create a dedicated testing module that initializes the core Devize system for tests:

```typescript
/**
 * Core testing module that initializes the Devize system for tests
 */
import { initializeLibrary } from '../core/devize';
import { TypeRegistry } from '../core/registry';
import { buildViz } from '../core/builder';
import { renderViz } from '../core/renderer';

// Initialize the library once for all tests
initializeLibrary();

// Export initialized components for tests
export {
  TypeRegistry,
  buildViz,
  renderViz
};

// Export test utilities
export function createTestContainer(): HTMLElement {
  const container = document.createElement('div');
  document.body.appendChild(container);
  return container;
}

export function cleanupTestContainer(container: HTMLElement): void {
  if (container && container.parentNode) {
    container.parentNode.removeChild(container);
  }
}
```

### Interface-Based Decoupling

Use TypeScript interfaces to decouple components:

```typescript
/**
 * Core type definitions that allow components to reference each other
 * without direct dependencies
 */

// Visualization specification interface
export interface VisualizationSpec {
  type: string;
  [key: string]: any;
}

// Renderable visualization interface
export interface RenderableVisualization {
  spec: VisualizationSpec;
  type: string;
  render: (container: HTMLElement) => RenderedResult;
  renderToSvg: (svg: SVGElement) => SVGElement;
  renderToCanvas: (ctx: CanvasRenderingContext2D) => void;
  update: (newSpec: VisualizationSpec) => RenderableVisualization;
  getProperty: (name: string) => any;
}

// Type definition interface
export interface TypeDefinition {
  name: string;
  properties: Record<string, PropertyDefinition>;
  implementation: any;
  extend?: string;
}

// Property definition interface
export interface PropertyDefinition {
  required?: boolean;
  default?: any;
  type?: string;
  validate?: (value: any) => boolean;
}

// Registry interface
export interface Registry {
  registerType(type: TypeDefinition): void;
  hasType(name: string): boolean;
  getType(name: string): TypeDefinition | undefined;
}

// Builder interface
export interface Builder {
  buildViz(spec: VisualizationSpec): RenderableVisualization;
}

// Renderer interface
export interface Renderer {
  renderViz(viz: VisualizationSpec | RenderableVisualization, container: HTMLElement): RenderedResult;
}
```

### Lazy Loading and Initialization

Implement lazy loading and initialization to handle circular dependencies:

```typescript
// Track initialization state
let initialized = false;

// Initialize the library
export function initializeLibrary() {
  if (initialized) return;

  // Import core components
  const registry = require('./registry').registry;
  const { buildViz } = require('./builder');

  // Bootstrap the define type
  const defineTypeSpec = {
    type: "define",
    name: "define",
    properties: {
      name: { required: true },
      properties: { required: true },
      implementation: { required: true },
      extend: { required: false }
    },
    implementation: /* implementation details */
  };

  // Register the define type directly first
  registry.registerTypeDirectly(defineTypeSpec);

  // Now use buildViz to process the define type properly
  buildViz(defineTypeSpec);

  // Load primitive types
  require('../primitives/shapes');
  require('../primitives/text');
  require('../primitives/containers');

  initialized = true;
  console.log('Library initialization complete');
}

// Auto-initialize when imported in browser context
if (typeof window !== 'undefined') {
  initializeLibrary();
}
```

### Testing Approach

#### 1. Integration Tests for Core System

Create integration tests that verify the core system works together:

```typescript
import { buildViz, renderViz, createTestContainer, cleanupTestContainer } from '../../src/testing/core';

describe('Core System Integration', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = createTestContainer();
  });

  afterEach(() => {
    cleanupTestContainer(container);
  });

  test('can define and use a custom visualization type', () => {
    // Define a custom type
    buildViz({
      type: "define",
      name: "testCircle",
      properties: {
        cx: { required: true },
        cy: { required: true },
        r: { default: 10 },
        fill: { default: "red" }
      },
      implementation: props => ({
        type: "circle",
        cx: props.cx,
        cy: props.cy,
        r: props.r,
        fill: props.fill
      })
    });

    // Use the custom type
    const viz = buildViz({
      type: "testCircle",
      cx: 50,
      cy: 50
    });

    // Render it
    renderViz(viz, container);

    // Verify rendering
    const circle = container.querySelector('circle');
    expect(circle).not.toBeNull();
    expect(circle?.getAttribute('cx')).toBe('50');
    expect(circle?.getAttribute('cy')).toBe('50');
    expect(circle?.getAttribute('r')).toBe('10');
    expect(circle?.getAttribute('fill')).toBe('red');
  });
});
```

#### 2. Component Tests with Initialized System

Test individual components with the initialized system:

```typescript
import { buildViz } from '../../src/testing/core';

describe('Builder', () => {
  test('processes a simple visualization', () => {
    const viz = buildViz({
      type: "rectangle",
      x: 10,
      y: 20,
      width: 100,
      height: 50,
      fill: "blue"
    });

    expect(viz.type).toBe('rectangle');
    expect(viz.spec.x).toBe(10);
    expect(viz.spec.y).toBe(20);
    expect(viz.spec.width).toBe(100);
    expect(viz.spec.height).toBe(50);
    expect(viz.spec.fill).toBe('blue');
    expect(typeof viz.render).toBe('function');
    expect(typeof viz.renderToSvg).toBe('function');
    expect(typeof viz.renderToCanvas).toBe('function');
  });

  test('applies default values', () => {
    const viz = buildViz({
      type: "circle",
      cx: 50,
      cy: 50
      // r and fill should get defaults
    });

    expect(viz.spec.cx).toBe(50);
    expect(viz.spec.cy).toBe(50);
    expect(viz.spec.r).toBeDefined(); // Default value applied
    expect(viz.spec.fill).toBeDefined(); // Default value applied
  });
});
```

#### 3. Mocking External Dependencies Only

Only mock external dependencies, not core components:

```typescript
import { buildViz, renderViz, createTestContainer, cleanupTestContainer } from '../../src/testing/core';

describe('Renderer', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = createTestContainer();
  });

  afterEach(() => {
    cleanupTestContainer(container);
  });

  test('renders a visualization to a container', () => {
    const viz = buildViz({
      type: "circle",
      cx: 50,
      cy: 50,
      r: 30,
      fill: "red"
    });

    renderViz(viz, container);

    const circle = container.querySelector('circle');
    expect(circle).not.toBeNull();
    expect(circle?.getAttribute('cx')).toBe('50');
    expect(circle?.getAttribute('cy')).toBe('50');
    expect(circle?.getAttribute('r')).toBe('30');
    expect(circle?.getAttribute('fill')).toBe('red');
  });

  test('renders a specification directly', () => {
    renderViz({
      type: "rectangle",
      x: 10,
      y: 20,
      width: 100,
      height: 50,
      fill: "blue"
    }, container);

    const rect = container.querySelector('rect');
    expect(rect).not.toBeNull();
    expect(rect?.getAttribute('x')).toBe('10');
    expect(rect?.getAttribute('y')).toBe('20');
    expect(rect?.getAttribute('width')).toBe('100');
    expect(rect?.getAttribute('height')).toBe('50');
    expect(rect?.getAttribute('fill')).toBe('blue');
  });
});
```

## Implementation Strategy

### 1. Unified Initialization

Ensure that all tests use the same initialized system:

```javascript
// Jest setup file
import { initializeLibrary } from './src/core/devize';

// Initialize the library once before all tests
beforeAll(() => {
  // Set up JSDOM for SVG support
  document.createElementNS = (namespaceURI, qualifiedName) => {
    return document.createElement(qualifiedName);
  };

  // Initialize the library
  initializeLibrary();
});
```

### 2. Registry with Direct Registration Method

Enhance the registry to support direct registration for bootstrapping:

```typescript
export class TypeRegistry {
  private types: Map<string, TypeDefinition> = new Map();

  // Normal registration through define
  registerType(type: TypeDefinition): void {
    this.types.set(type.name, type);
  }

  // Direct registration for bootstrapping
  registerTypeDirectly(spec: any): void {
    const type: TypeDefinition = {
      name: spec.name,
      properties: spec.properties,
      implementation: spec.implementation,
      extend: spec.extend
    };
    this.types.set(type.name, type);
  }

  hasType(name: string): boolean {
    return this.types.has(name);
  }

  getType(name: string): TypeDefinition | undefined {
    return this.types.get(name);
  }
}

// Singleton instance
export const registry = new TypeRegistry();
```

### 3. Builder with Special Case for Define

Handle the "define" type specially in the builder:

```typescript
import { VisualizationSpec, RenderableVisualization, TypeDefinition } from './types';
import { registry } from './registry';

export function buildViz(spec: VisualizationSpec): RenderableVisualization {
  // If already a RenderableVisualization, return it
  if (isRenderableVisualization(spec)) {
    return spec as RenderableVisualization;
  }

  // Special case for "define" type during bootstrapping
  if (spec.type === "define" && !registry.hasType("define")) {
    // Handle bootstrapping case
    const typeDefinition: TypeDefinition = {
      name: spec.name,
      properties: spec.properties,
      implementation: spec.implementation,
      extend: spec.extend
    };

    // Register the type
    registry.registerType(typeDefinition);

    // Create and return a renderable visualization
    return createRenderableVisualization(spec);
  }

  // Normal case - look up the type
  const typeDefinition = registry.getType(spec.type);
  if (!typeDefinition) {
    throw new Error(`Unknown visualization type: ${spec.type}`);
  }

  // Process the specification
  const processedSpec = processSpecification(spec, typeDefinition);

  // Create and return a renderable visualization
  return createRenderableVisualization(processedSpec);
}

// Helper functions...
```

## Testing Best Practices

### 1. Use the Core Testing Module

Always import from the testing module to ensure consistent initialization:

```typescript
// Good
import { buildViz, renderViz } from '../../src/testing/core';

// Avoid
import { buildViz } from '../../src/core/builder';
import { renderViz } from '../../src/core/renderer';
```

### 2. Test Real Behavior, Not Mocks

Focus on testing real behavior rather than implementation details:

```typescript
// Good - tests actual behavior
test('renders a circle with the correct attributes', () => {
  renderViz({
    type: "circle",
    cx: 50,
    cy: 50,
    r: 30,
    fill: "red"
  }, container);

  const circle = container.querySelector('circle');
  expect(circle?.getAttribute('cx')).toBe('50');
});

// Avoid - tests implementation details
test('calls the circle implementation function', () => {
  const mockImplementation = jest.fn();
  registry.getType('circle').implementation = mockImplementation;

  buildViz({
    type: "circle",
    cx: 50,
    cy: 50
  });

  expect(mockImplementation).toHaveBeenCalled();
});
```

### 3. Use Integration Tests for Complex Interactions

Use integration tests to verify that components work together correctly:

```typescript
test('can define and use a custom visualization in the same group', () => {
  renderViz({
    type: "group",
    children: [
      {
        type: "define",
        name: "customRect",
        properties: {
          x: { required: true },
          y: { required: true },
          color: { default: "blue" }
        },
        implementation: props => ({
          type: "rectangle",
          x: props.x,
          y: props.y,
          width: 50,
          height: 30,
          fill: props.color
        })
      },
      {
        type: "customRect",
        x: 10,
        y: 20,
        color: "green"
      }
    ]
  }, container);

  const rect = container.querySelector('rect');
  expect(rect?.getAttribute('x')).toBe('10');
  expect(rect?.getAttribute('y')).toBe('20');
  expect(rect?.getAttribute('fill')).toBe('green');
});
```

### 5. Avoid Mocking Libraries and Browser APIs

When testing components that rely on browser APIs or third-party libraries:

- **Use real libraries instead of mocks**: For libraries like Three.js, D3, etc., use the actual libraries in tests rather than creating complex mocks. This ensures your tests validate real behavior.

- **Use browser-like environments**: Tools like JSDOM provide a browser-like environment for testing DOM interactions without a real browser.

- **Consider headless browsers for complex rendering**: For tests that require full rendering capabilities, consider using headless browsers like Puppeteer or Playwright.

- **Only mock what you can't control**: External services, network requests, or time-dependent operations are appropriate to mock. Core libraries and APIs that your code directly depends on should be used directly.

- **Use test doubles for integration points**: When you need to isolate a component from its dependencies, prefer spies or stubs over full mocks to verify interactions without replacing behavior.

### 6. Testing 3D Visualizations

For testing 3D visualizations with Three.js:

- **Test the component configuration**: Verify that the component is configured correctly with the right properties.

- **Test the scene setup**: Verify that objects are added to the scene with the correct properties.

- **Test interactions**: Verify that user interactions produce the expected changes.

- **Visual regression testing**: For critical 3D components, consider visual regression testing with screenshot comparisons.

- **Avoid testing WebGL directly**: Focus on testing your component's logic rather than WebGL rendering, which is handled by Three.js.

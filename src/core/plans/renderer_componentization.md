# Renderer Componentization Plan

## Overview

This plan outlines a strategy for refactoring our rendering system into a component-based architecture. By treating renderers as components, we can achieve greater consistency, flexibility, and reusability throughout the visualization library.

## Current Architecture

Currently, our rendering system is structured as follows:

1. **Core Renderer** (`src/core/renderer.ts`): Provides top-level rendering functions like `renderViz` and `ensureSvg`.
2. **Builder** (`src/core/builder.ts`): Processes visualization specifications into renderable visualizations.
3. **Define** (`src/core/define.ts`): Handles type definitions and registration.

This architecture works but has several limitations:

1. Renderers are not first-class citizens like other components.
2. Rendering logic is scattered across multiple files.
3. Adding new rendering backends requires modifying core files.
4. Renderer configuration is not as flexible as component configuration.

## Proposed Architecture

We propose refactoring our rendering system to treat renderers as components:

### 1. Renderer Components

Create a set of renderer components that can be instantiated, configured, and composed like other components:

- `SVGRenderer`
- `CanvasRenderer`
- `ThreeJSRenderer`
- `WebGLRenderer`

### 2. Renderer Interface

Define a common interface for all renderers:

```typescript
interface Renderer {
  // Core rendering methods
  render(visualization: RenderableVisualization): RenderedResult;
  clear(): void;
  resize(width: number, height: number): void;

  // Configuration
  getContainer(): HTMLElement;
  setContainer(container: HTMLElement): void;
  getSize(): { width: number, height: number };
  setSize(width: number, height: number): void;

  // Lifecycle
  initialize(): void;
  dispose(): void;

  // Event handling
  addEventListener(event: string, handler: Function): void;
  removeEventListener(event: string, handler: Function): void;
}
```

### 3. Renderer Factory

Create a factory function to instantiate renderers based on type:

```typescript
function createRenderer(
  type: 'svg' | 'canvas' | 'webgl' | 'threejs',
  options: RendererOptions
): Renderer {
  switch (type) {
    case 'svg':
      return new SVGRenderer(options);
    case 'canvas':
      return new CanvasRenderer(options);
    case 'webgl':
      return new WebGLRenderer(options);
    case 'threejs':
      return new ThreeJSRenderer(options);
    default:
      throw new Error(`Unknown renderer type: ${type}`);
  }
}
```

### 4. Component Definition

Define renderer components using our component system:

```typescript
// SVG Renderer Component
const svgRendererDefinition = {
  type: "define",
  name: "svgRenderer",
  properties: {
    width: { required: true },
    height: { required: true },
    container: { required: false },
    background: { default: "transparent" },
    viewBox: { default: null },
    preserveAspectRatio: { default: "xMidYMid meet" }
  },
  implementation: function(props) {
    // Implementation details
  }
};
```

## Implementation Plan

### Phase 1: Design and Interface Definition

1. Define the `Renderer` interface
2. Create skeleton implementations for each renderer type
3. Update the core rendering system to support the new approach

### Phase 2: SVG Renderer Implementation

1. Implement the `SVGRenderer` component
2. Refactor existing SVG rendering code to use the new component
3. Create examples demonstrating the new SVG renderer

### Phase 3: Canvas Renderer Implementation

1. Implement the `CanvasRenderer` component
2. Refactor existing Canvas rendering code to use the new component
3. Create examples demonstrating the new Canvas renderer

### Phase 4: Three.js Renderer Implementation

1. Implement the `ThreeJSRenderer` component
2. Refactor existing Three.js rendering code to use the new component
3. Create examples demonstrating the new Three.js renderer

### Phase 5: Integration and Testing

1. Update all existing visualizations to use the new renderer components
2. Ensure backward compatibility
3. Comprehensive testing across different rendering backends

## Detailed Component Design

### SVGRenderer

```typescript
interface SVGRendererOptions {
  width: number;
  height: number;
  container?: HTMLElement;
  background?: string;
  viewBox?: string;
  preserveAspectRatio?: string;
}

class SVGRenderer implements Renderer {
  private svg: SVGElement;
  private container: HTMLElement | null;
  private width: number;
  private height: number;

  constructor(options: SVGRendererOptions) {
    this.width = options.width;
    this.height = options.height;
    this.container = options.container || null;

    // Create SVG element
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('width', this.width.toString());
    this.svg.setAttribute('height', this.height.toString());

    if (options.background) {
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('width', '100%');
      rect.setAttribute('height', '100%');
      rect.setAttribute('fill', options.background);
      this.svg.appendChild(rect);
    }

    if (options.viewBox) {
      this.svg.setAttribute('viewBox', options.viewBox);
    }

    this.svg.setAttribute('preserveAspectRatio', options.preserveAspectRatio || 'xMidYMid meet');

    // Attach to container if provided
    if (this.container) {
      this.container.appendChild(this.svg);
    }
  }

  // Implement Renderer interface methods
  // ...
}
```

### CanvasRenderer

```typescript
interface CanvasRendererOptions {
  width: number;
  height: number;
  container?: HTMLElement;
  background?: string;
  pixelRatio?: number;
}

class CanvasRenderer implements Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private container: HTMLElement | null;
  private width: number;
  private height: number;

  constructor(options: CanvasRendererOptions) {
    this.width = options.width;
    this.height = options.height;
    this.container = options.container || null;

    // Create canvas element
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.width * (options.pixelRatio || 1);
    this.canvas.height = this.height * (options.pixelRatio || 1);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    // Get context
    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get 2D context from canvas element');
    }
    this.ctx = ctx;

    // Apply pixel ratio
    if (options.pixelRatio) {
      this.ctx.scale(options.pixelRatio, options.pixelRatio);
    }

    // Apply background
    if (options.background) {
      this.ctx.fillStyle = options.background;
      this.ctx.fillRect(0, 0, this.width, this.height);
    }

    // Attach to container if provided
    if (this.container) {
      this.container.appendChild(this.canvas);
    }
  }

  // Implement Renderer interface methods
  // ...
}
```

### ThreeJSRenderer

```typescript
interface ThreeJSRendererOptions {
  width: number;
  height: number;
  container?: HTMLElement;
  background?: number | string;
  pixelRatio?: number;
  antialias?: boolean;
  cameraOptions?: {
    type: 'perspective' | 'orthographic';
    position?: { x: number, y: number, z: number };
    fov?: number;
    near?: number;
    far?: number;
  };
  controlsOptions?: {
    enableRotate?: boolean;
    enableZoom?: boolean;
    enablePan?: boolean;
    dampingFactor?: number;
  };
}

class ThreeJSRenderer implements Renderer {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  private controls: any; // OrbitControls
  private container: HTMLElement | null;
  private width: number;
  private height: number;

  constructor(options: ThreeJSRendererOptions) {
    this.width = options.width;
    this.height = options.height;
    this.container = options.container || null;

    // Create Three.js renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: options.antialias !== false,
      alpha: true
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(options.pixelRatio || window.devicePixelRatio);

    // Create scene
    this.scene = new THREE.Scene();
    if (options.background !== undefined) {
      this.scene.background = new THREE.Color(options.background);
    }

    // Create camera
    const aspectRatio = this.width / this.height;
    const cameraOpts = options.cameraOptions || { type: 'perspective' };

    if (cameraOpts.type === 'orthographic') {
      const frustumSize = this.height;
      this.camera = new THREE.OrthographicCamera(
        frustumSize * aspectRatio / -2,
        frustumSize * aspectRatio / 2,
        frustumSize / 2,
        frustumSize / -2,
        cameraOpts.near || 0.1,
        cameraOpts.far || 2000
      );
    } else {
      this.camera = new THREE.PerspectiveCamera(
        cameraOpts.fov || 75,
        aspectRatio,
        cameraOpts.near || 0.1,
        cameraOpts.far || 2000
      );
    }

    // Set camera position
    const position = cameraOpts.position || { x: 0, y: 0, z: 100 };
    this.camera.position.set(position.x, position.y, position.z);

    // Attach to container if provided
    if (this.container) {
      this.container.appendChild(this.renderer.domElement);

      // Add controls if in browser environment
      if (typeof window !== 'undefined') {
        import('three/examples/jsm/controls/OrbitControls').then(({ OrbitControls }) => {
          this.controls = new OrbitControls(this.camera, this.renderer.domElement);

          const controlsOpts = options.controlsOptions || {};
          this.controls.enableRotate = controlsOpts.enableRotate !== false;
          this.controls.enableZoom = controlsOpts.enableZoom !== false;
          this.controls.enablePan = controlsOpts.enablePan !== false;
          this.controls.dampingFactor = controlsOpts.dampingFactor || 0.25;
          this.controls.update();

          // Start animation loop
          this.animate();
        });
      }
    }
  }

  // Animation loop
  private animate = () => {
    requestAnimationFrame(this.animate);

    if (this.controls) {
      this.controls.update();
    }

    this.renderer.render(this.scene, this.camera);
  };

  // Implement Renderer interface methods
  // ...
}
```

## Benefits

1. **Consistency**: Renderers follow the same component-based pattern as other parts of the library.
2. **Flexibility**: Renderers can be configured and customized like other components.
3. **Extensibility**: New rendering backends can be added without modifying core files.
4. **Reusability**: Renderer components can be reused across different visualizations.
5. **Testability**: Renderer components can be tested in isolation.

## Challenges and Considerations

1. **Backward Compatibility**: Ensure existing code continues to work.
2. **Performance**: Ensure the new architecture doesn't introduce performance overhead.
3. **Integration**: Ensure smooth integration with existing components.
4. **Documentation**: Provide clear documentation on how to use the new renderer components.

## Timeline

- Phase 1: 2 weeks
- Phase 2: 2 weeks
- Phase 3: 2 weeks
- Phase 4: 3 weeks
- Phase 5: 1 week

Total: 10 weeks

## Conclusion

By componentizing our rendering system, we'll achieve greater consistency, flexibility, and reusability throughout our visualization library. This approach aligns with our overall component-based architecture and will make it easier to add new rendering backends in the future.

## References

- **Related Code**: src/core/renderer.ts
- **Related Code**: src/core/builder.ts
- **Related Code**: src/core/define.ts
- **Related Code**: src/utils/threeJsRenderer.ts

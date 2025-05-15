# Renderer Architecture Implementation Plan

## Overview

This plan outlines a comprehensive approach to supporting mixed rendering technologies within the visualization framework. Rather than limiting mixed rendering to layers, we'll design a system that allows any visualization component to be rendered with different technologies, supporting use cases like:

1. Dashboards with charts using different renderers
2. Taking screenshots of visualizations to use as images in other visualizations
3. Mixing HTML, SVG, and Canvas elements
4. Allowing renderers themselves to be first-class visualization objects

## Design Principles

1. **Separation of Concerns**: Keep visualization logic separate from rendering logic
2. **Renderer Independence**: Visualizations should not need to know how they're rendered
3. **Composability**: Allow mixing different renderers at any level of the visualization tree
4. **First-Class Renderers**: Treat renderers as first-class objects in the system

## Architecture Components

### 1. Renderer Registry

A central registry for different rendering technologies:

```typescript
// src/renderers/registry.ts
export type RendererType = 'svg' | 'canvas' | 'html' | 'webgl' | 'image';

export interface Renderer {
  id: string;
  type: RendererType;
  render: (viz: RenderableVisualization, container: HTMLElement, options?: any) => RenderResult;
  update: (result: RenderResult, viz: RenderableVisualization, newProps: any) => RenderResult;
  cleanup: (result: RenderResult) => void;
  takeScreenshot?: (result: RenderResult) => Promise<string>; // Returns data URL
}

export interface RenderResult {
  element: HTMLElement | SVGElement | HTMLCanvasElement;
  renderer: Renderer;
  update: (newProps: any) => RenderResult;
  cleanup: () => void;
  takeScreenshot?: () => Promise<string>;
}

class RendererRegistry {
  private renderers: Map<string, Renderer> = new Map();

  register(renderer: Renderer): void {
    this.renderers.set(renderer.id, renderer);
  }

  get(id: string): Renderer | undefined {
    return this.renderers.get(id);
  }

  getByType(type: RendererType): Renderer | undefined {
    return Array.from(this.renderers.values())
      .find(renderer => renderer.type === type);
  }
}

export const rendererRegistry = new RendererRegistry();
```


2. Rendering Context
A context object that manages rendering state and options:

// src/renderers/context.ts
export interface RenderingContext {
  container: HTMLElement;
  parent?: RenderingContext;
  renderer?: Renderer;
  options: RenderOptions;
  results: Map<string, RenderResult>;
}

export interface RenderOptions {
  renderer?: string; // Renderer ID
  width?: number;
  height?: number;
  pixelRatio?: number;
  background?: string;
  screenshot?: boolean;
  preserveAspectRatio?: string;
}

export function createRenderingContext(
  container: HTMLElement,
  options: RenderOptions = {},
  parent?: RenderingContext
): RenderingContext {
  return {
    container,
    parent,
    renderer: options.renderer ? rendererRegistry.get(options.renderer) : undefined,
    options,
    results: new Map()
  };
}

Copy


3. Enhanced Render Function
A render function that supports renderer selection:

// src/renderers/render.ts
export function renderViz(
  viz: RenderableVisualization,
  container: HTMLElement,
  options: RenderOptions = {}
): RenderResult {
  // Create rendering context
  const context = createRenderingContext(container, options);

  // Determine which renderer to use
  const renderer = determineRenderer(viz, context);
  context.renderer = renderer;

  // Render using the selected renderer
  const result = renderer.render(viz, container, options);

  // Store the result in the context
  const id = viz.id || generateId();
  context.results.set(id, result);

  return result;
}

function determineRenderer(
  viz: RenderableVisualization,
  context: RenderingContext
): Renderer {
  // If options specify a renderer, use that
  if (context.options.renderer) {
    const renderer = rendererRegistry.get(context.options.renderer);
    if (renderer) return renderer;
  }

  // If parent context has a renderer, use that
  if (context.parent?.renderer) {
    return context.parent.renderer;
  }

  // Default to SVG renderer
  const svgRenderer = rendererRegistry.getByType('svg');
  if (svgRenderer) return svgRenderer;

  throw new Error('No renderer available');
}

Copy


4. Renderer Implementations
Example implementation of SVG and Canvas renderers:

// src/renderers/svg.ts
export const svgRenderer: Renderer = {
  id: 'svg',
  type: 'svg',

  render(viz, container, options = {}) {
    // Create SVG element if needed
    let svg = container.querySelector('svg');
    if (!svg) {
      svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', options.width?.toString() || '100%');
      svg.setAttribute('height', options.height?.toString() || '100%');
      container.appendChild(svg);
    }

    // Render visualization to SVG
    const element = viz.renderToSvg(svg);

    return {
      element,
      renderer: this,
      update: (newProps) => {
        const updatedViz = viz.update(newProps);
        return this.render(updatedViz, container, options);
      },
      cleanup: () => {
        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }
      },
      takeScreenshot: async () => {
        // Convert SVG to data URL
        const svgData = new XMLSerializer().serializeToString(svg);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        return URL.createObjectURL(svgBlob);
      }
    };
  },

  update(result, viz, newProps) {
    const updatedViz = viz.update(newProps);
    result.cleanup();
    return this.render(updatedViz, result.element.parentElement, {});
  },

  cleanup(result) {
    result.cleanup();
  }
};

// src/renderers/canvas.ts
export const canvasRenderer: Renderer = {
  id: 'canvas',
  type: 'canvas',

  render(viz, container, options = {}) {
    // Create canvas element if needed
    let canvas = container.querySelector('canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.width = options.width || container.clientWidth;
      canvas.height = options.height || container.clientHeight;
      container.appendChild(canvas);
    }

    // Get context and clear canvas
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Render visualization to canvas
    viz.renderToCanvas(ctx);

    return {
      element: canvas,
      renderer: this,
      update: (newProps) => {
        const updatedViz = viz.update(newProps);
        return this.render(updatedViz, container, options);
      },
      cleanup: () => {
        if (canvas.parentNode) {
          canvas.parentNode.removeChild(canvas);
        }
      },
      takeScreenshot: async () => {
        return canvas.toDataURL('image/png');
      }
    };
  },

  update(result, viz, newProps) {
    const canvas = result.element as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const updatedViz = viz.update(newProps);
    updatedViz.renderToCanvas(ctx);

    return {
      ...result,
      update: (newerProps) => this.update(result, updatedViz, newerProps)
    };
  },

  cleanup(result) {
    result.cleanup();
  }
};

Copy


5. Renderer as First-Class Visualization Object
Define renderers as visualization objects:

// src/primitives/renderer.ts
export const rendererTypeDefinition = {
  type: "define",
  name: "renderer",
  properties: {
    type: { default: 'svg' },
    width: { default: '100%' },
    height: { default: '100%' },
    background: { default: 'transparent' },
    children: { default: [] }
  },
  implementation: props => {
    // Process children
    const processedChildren = Array.isArray(props.children)
      ? props.children.map(child => buildViz(child))
      : [];

    return {
      renderableType: "renderer",

      render: (container) => {
        // Create a container for this renderer
        const rendererContainer = document.createElement('div');
        rendererContainer.style.position = 'relative';
        rendererContainer.style.width = props.width;
        rendererContainer.style.height = props.height;
        rendererContainer.style.background = props.background;
        container.appendChild(rendererContainer);

        // Render each child with the specified renderer
        const results = processedChildren.map(child =>
          renderViz(child, rendererContainer, { renderer: props.type })
        );

        return {
          element: rendererContainer,
          update: (newProps) => {
            // Clean up existing results
            results.forEach(result => result.cleanup());

            // Create a new spec by merging the original with the updates
            const updatedSpec = {
              type: 'renderer',
              ...props,
              ...newProps
            };

            // Build and render the updated visualization
            const updatedViz = buildViz(updatedSpec);
            return updatedViz.render(container);
          },
          cleanup: () => {
            // Clean up all child results
            results.forEach(result => result.cleanup());

            // Remove the container
            if (rendererContainer.parentNode) {
              rendererContainer.parentNode.removeChild(rendererContainer);
            }
          },
          takeScreenshot: async () => {
            // If only one child, use its screenshot
            if (results.length === 1 && results[0].takeScreenshot) {
              return results[0].takeScreenshot();
            }

            // Otherwise, use html2canvas or similar to capture the entire container
            // This is a placeholder - actual implementation would depend on html2canvas or similar
            return Promise.resolve('');
          }
        };
      },

      renderToSvg: (svg) => {
        // Create a foreign object to contain the renderer
        const foreignObject = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
        foreignObject.setAttribute('width', props.width);
        foreignObject.setAttribute('height', props.height);

        // Create a div inside the foreign object
        const div = document.createElement('div');
        div.style.width = '100%';
        div.style.height = '100%';
        foreignObject.appendChild(div);

        // Render children to the div with the specified renderer
        processedChildren.forEach(child =>
          renderViz(child, div, { renderer: props.type })
        );

        svg.appendChild(foreignObject);
        return foreignObject;
      },

      renderToCanvas: (ctx) => {
        // Canvas rendering of other renderers is complex
        // This would typically involve rendering to an offscreen canvas or image
        // and then drawing that to the main canvas
        console.warn('Canvas rendering of renderer objects is not fully supported');
        return true;
      },

      update: (newProps) => {
        const mergedProps = { ...props, ...newProps };
        return buildViz({
          type: 'renderer',
          ...mergedProps
        });
      },

      getProperty: (name) => {
        if (name === 'children') return processedChildren;
        if (name === 'type') return 'renderer';
        return props[name];
      }
    };
  }
};

Copy


Example Usage
1. Dashboard with Mixed Renderers
const dashboard = buildViz({
  type: 'group',
  children: [
    {
      type: 'renderer',
      type: 'canvas',
      x: 0,
      y: 0,
      width: '50%',
      height: '50%',
      children: [
        // A complex scatter plot with thousands of points
        // Better with Canvas for performance
        scatterPlotSpec
      ]
    },
    {
      type: 'renderer',
      type: 'svg',
      x: '50%',
      y: 0,
      width: '50%',
      height: '50%',
      children: [
        // An interactive network diagram
        // Better with SVG for interactivity
        networkDiagramSpec
      ]
    },
    {
      type: 'renderer',
      type: 'html',
      x: 0,
      y: '50%',
      width: '100%',
      height: '50%',
      children: [
        // A data table with HTML controls
        dataTableSpec
      ]
    }
  ]
});

renderViz(dashboard, document.getElementById('dashboard-container'));

Copy


2. Taking Screenshots
async function createThumbnail(vizSpec) {
  // Create a temporary container
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.width = '800px';
  container.style.height = '600px';
  document.body.appendChild(container);

  // Render the visualization
  const viz = buildViz(vizSpec);
  const result = renderViz(viz, container);

  // Take a screenshot
  const screenshot = await result.takeScreenshot();

  // Clean up
  result.cleanup();
  document.body.removeChild(container);

  return screenshot;
}

// Usage
const thumbnail = await createThumbnail(chartSpec);

// Use the thumbnail in another visualization
const galleryViz = buildViz({
  type: 'group',
  children: [
    {
      type: 'image',
      src: thumbnail,
      x: 10,
      y: 10,
      width: 200,
      height: 150
    },
    // More thumbnails...
  ]
});

Copy


3. Mixing HTML, SVG, and Canvas
const mixedViz = buildViz({
  type: 'group',
  children: [
    // SVG chart
    chartSpec,

    // HTML controls in an SVG foreignObject
    {
      type: 'renderer',
      type: 'html',
      x: 10,
      y: 400,
      width: 580,
      height: 100,
      children: [
        {
          type: 'html',
          tag: 'div',
          children: [

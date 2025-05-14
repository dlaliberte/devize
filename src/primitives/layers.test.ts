/**
 * Layer Primitive Tests
 *
 * Purpose: Tests the layer container primitive
 * Author: [Author Name]
 * Creation Date: [Date]
 * Last Modified: [Date]
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { hasType, getType } from '../core/registry';
import { buildViz } from '../core/builder';
import { registerLayerType, layerTypeDefinition } from './layers';
import {
  createTestContainer,
  cleanupTestContainer,
  testVisualizationRendering,
  testVisualizationUpdate,
  testCanvasRendering
} from '../test/testUtils';
import { initializeTestEnvironment, ensurePrimitivesRegistered } from '../test/testSetup';

describe('Layer Primitive', () => {
  let container: HTMLElement;

  // Reset registry before each test
  beforeEach(() => {
    // Reset the registry and initialize test environment
    initializeTestEnvironment();

    // Ensure layer type is registered
    registerLayerType();

    // Create a test container
    container = createTestContainer();
  });

  // Clean up after each test
  afterEach(() => {
    cleanupTestContainer(container);
  });

  test('should register the layer type', () => {
    expect(hasType('layer')).toBe(true);

    const layerType = getType('layer');
    expect(layerType).toBeDefined();
    expect(layerType?.name).toBe('layer');
  });

  test('should create a layer element with default properties', () => {
    const result = buildViz({
      type: "layer"
    });

    expect(result).toBeDefined();
    expect(result.renderableType).toBe('layer');
    expect(result.getProperty('x')).toBe(0);
    expect(result.getProperty('y')).toBe(0);
    expect(Array.isArray(result.getProperty('children'))).toBe(true);
    expect(result.getProperty('children').length).toBe(0);
  });

  test('should apply x and y as a transform', () => {
    testVisualizationRendering(
      {
        type: "layer",
        x: 100,
        y: 50
      },
      container,
      {
        'transform': 'translate(100, 50)'
      },
      'g'
    );
  });

  test('should apply opacity', () => {
    testVisualizationRendering(
      {
        type: "layer",
        opacity: 0.5
      },
      container,
      {
        'opacity': '0.5'
      },
      'g'
    );
  });

  test('should apply z-index', () => {
    testVisualizationRendering(
      {
        type: "layer",
        zIndex: 10
      },
      container,
      {
        'style': 'z-index: 10'
      },
      'g'
    );
  });

  test('should process and store children', () => {
    // Ensure required primitives are registered
    ensurePrimitivesRegistered(['rectangle', 'circle']);

    const result = buildViz({
      type: "layer",
      children: [
        { type: 'rectangle', width: 100, height: 50 },
        { type: 'circle', cx: 150, cy: 75, r: 25 }
      ]
    });

    const children = result.getProperty('children');
    expect(children).toHaveLength(2);

    // Check that children are processed correctly
    expect(children[0].renderableType).toBe('rectangle');
    expect(children[1].renderableType).toBe('circle');
  });

  test('should render layer with children to SVG', () => {
    // Ensure required primitives are registered
    ensurePrimitivesRegistered(['rectangle', 'circle']);

    testVisualizationRendering(
      {
        type: "layer",
        x: 10,
        y: 20,
        zIndex: 5,
        opacity: 0.8,
        children: [
          { type: 'rectangle', width: 100, height: 50 },
          { type: 'circle', cx: 150, cy: 75, r: 25 }
        ]
      },
      container,
      {
        'transform': 'translate(10, 20)',
        'opacity': '0.8',
        'style': 'z-index: 5'
      },
      'g'
    );

    // Also check that children were rendered
    const rect = container.querySelector('rect');
    expect(rect).not.toBeNull();
    expect(rect?.getAttribute('width')).toBe('100');
    expect(rect?.getAttribute('height')).toBe('50');

    const circle = container.querySelector('circle');
    expect(circle).not.toBeNull();
    expect(circle?.getAttribute('cx')).toBe('150');
    expect(circle?.getAttribute('cy')).toBe('75');
    expect(circle?.getAttribute('r')).toBe('25');
  });

  test('should render layer with children to Canvas', () => {
    // Ensure required primitives are registered
    ensurePrimitivesRegistered(['rectangle', 'circle']);

    const result = buildViz({
      type: "layer",
      x: 10,
      y: 20,
      opacity: 0.5,
      zIndex: 3,
      children: [
        { type: 'rectangle', width: 100, height: 50 },
        { type: 'circle', cx: 150, cy: 75, r: 25 }
      ]
    });

    // Create a mock canvas context with all necessary methods
    const ctx = {
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      globalAlpha: 1,
      fillRect: vi.fn(),
      rect: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      closePath: vi.fn()
    };

    // Render to canvas
    result.renderToCanvas(ctx);

    // Should have saved and restored context
    expect(ctx.save).toHaveBeenCalled();
    expect(ctx.restore).toHaveBeenCalled();

    // Should have applied transform
    expect(ctx.translate).toHaveBeenCalledWith(10, 20);

    // Should have applied opacity
    expect(ctx.globalAlpha).toBe(0.5);
  });

  test('should handle nested layers', () => {
    // Ensure required primitives are registered
    ensurePrimitivesRegistered(['rectangle']);

    const result = buildViz({
      type: "layer",
      x: 10,
      y: 20,
      children: [
        {
          type: "layer",
          x: 30,
          y: 40,
          children: [
            { type: 'rectangle', width: 100, height: 50 }
          ]
        }
      ]
    });

    const children = result.getProperty('children');
    expect(children).toHaveLength(1);

    // Check that nested layer is processed correctly
    expect(children[0].renderableType).toBe('layer');
    expect(children[0].getProperty('x')).toBe(30);
    expect(children[0].getProperty('y')).toBe(40);

    // Check that the nested layer has children
    const nestedChildren = children[0].getProperty('children');
    expect(nestedChildren).toHaveLength(1);
    expect(nestedChildren[0].renderableType).toBe('rectangle');
  });

  test('should update layer properties', () => {
    testVisualizationUpdate(
      {
        type: "layer",
        x: 10,
        y: 20,
        opacity: 0.8,
        zIndex: 5
      },
      {
        x: 30,
        y: 40,
        opacity: 0.5,
        zIndex: 10
      },
      container,
      {
        'transform': 'translate(10, 20)',
        'opacity': '0.8',
        'style': 'z-index: 5'
      },
      {
        'transform': 'translate(30, 40)',
        'opacity': '0.5',
        'style': 'z-index: 10'
      },
      'g'
    );
  });

  test('should match the exported type definition', () => {
    // Verify that the exported type definition matches what's registered
    expect(layerTypeDefinition.type).toBe('define');
    expect(layerTypeDefinition.name).toBe('layer');
    expect(layerTypeDefinition.properties).toBeDefined();
    expect(layerTypeDefinition.implementation).toBeDefined();

    // Compare with the registered type
    const registeredType = getType('layer');
    expect(registeredType?.properties).toEqual(layerTypeDefinition.properties);
  });
});

describe('Nested Layers', () => {
  let container: HTMLElement;

  beforeEach(() => {
    // Reset the registry and initialize test environment
    initializeTestEnvironment();

    // Ensure layer type is registered
    registerLayerType();

    // Create a test container
    container = createTestContainer();
  });

  afterEach(() => {
    cleanupTestContainer(container);
  });

  test('should handle nested visualizations', () => {
    // Ensure required primitives are registered
    ensurePrimitivesRegistered(['layer', 'rectangle', 'circle']);

    // Create a layer with nested visualizations
    const spec = {
      type: 'layer',
      children: [
        {
          type: 'rectangle',
          width: 100,
          height: 50,
          fill: 'blue'
        },
        {
          type: 'circle',
          cx: 150,
          cy: 75,
          r: 25
        }
      ]
    };

    // Build the visualization
    const result = buildViz(spec);
    expect(result).toBeDefined();
    expect(result.renderableType).toBe('layer');

    // Check that children were processed
    const children = result.getProperty('children');
    expect(Array.isArray(children)).toBe(true);
    expect(children.length).toBe(2);

    // Check first child
    const rectangle = children[0];
    expect(rectangle.renderableType).toBe('rectangle');
    expect(rectangle.getProperty('width')).toBe(100);
    expect(rectangle.getProperty('height')).toBe(50);
    expect(rectangle.getProperty('fill')).toBe('blue');

    // Check second child
    const circle = children[1];
    expect(circle.renderableType).toBe('circle');
    expect(circle.getProperty('cx')).toBe(150);
    expect(circle.getProperty('cy')).toBe(75);
    expect(circle.getProperty('r')).toBe(25);

    // Render to the container and check the output
    result.render(container);

    // Check that the SVG structure is correct
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();

    const group = svg?.querySelector('g');
    expect(group).not.toBeNull();

    const rect = svg?.querySelector('rect');
    expect(rect).not.toBeNull();
    expect(rect?.getAttribute('width')).toBe('100');
    expect(rect?.getAttribute('height')).toBe('50');
    expect(rect?.getAttribute('fill')).toBe('blue');

    const circleEl = svg?.querySelector('circle');
    expect(circleEl).not.toBeNull();
    expect(circleEl?.getAttribute('cx')).toBe('150');
    expect(circleEl?.getAttribute('cy')).toBe('75');
    expect(circleEl?.getAttribute('r')).toBe('25');
  });
});

/**
 * References:
 * - Related File: src/primitives/layers.ts
 * - Related File: src/primitives/circle.ts
 * - Related File: src/primitives/rectangle.ts
 * - Related File: src/core/define.ts
 * - Related File: src/core/registry.ts
 * - Related File: src/core/builder.ts
 * - Related File: src/core/devize.ts
 * - Related File: src/renderers/svgUtils.ts
 * - Design Document: design/define.md
 * - Design Document: design/primitives.md
 * - Design Document: design/rendering.md
 * - User Documentation: docs/primitives/layer.md
 */

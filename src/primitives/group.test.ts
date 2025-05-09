/**
 * Group Primitive Tests
 *
 * Purpose: Tests the group container primitive
 * Author: [Author Name]
 * Creation Date: [Date]
 * Last Modified: [Date]
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { registry, hasType, getType } from '../core/registry';
import { groupTypeDefinition, registerGroupPrimitive } from './group';
import { buildViz } from '../core/builder';
import { registerCirclePrimitive } from './circle';
import { registerRectanglePrimitive } from './rectangle';
import { registerTextPrimitive } from './text';
import {
  resetRegistry,
  createTestContainer,
  cleanupTestContainer,
  testVisualizationRendering,
  testVisualizationUpdate,
  testCanvasRendering
} from '../test/testUtils';
import { initializeTestEnvironment, ensurePrimitivesRegistered } from '../test/testSetup';

describe('Group Primitive', () => {
  let container: HTMLElement;

  // Reset registry before each test
  beforeEach(() => {
    // Reset the registry and initialize test environment
    initializeTestEnvironment();

    // Create a test container
    container = createTestContainer();
  });

  // Clean up after each test
  afterEach(() => {
    cleanupTestContainer(container);
  });

  test('should register the group type', () => {
    expect(hasType('group')).toBe(true);

    const groupType = getType('group');
    expect(groupType).toBeDefined();
    expect(groupType?.properties.x.default).toBe(0);
    expect(groupType?.properties.y.default).toBe(0);
    expect(Array.isArray(groupType?.properties.children.default)).toBe(true);
    expect(groupType?.properties.transform.default).toBe(null);
    expect(groupType?.properties.opacity.default).toBe(1);
  });

  test('should create a group element with default properties', () => {
    const result = buildViz({
      type: "group"
    });

    expect(result).toBeDefined();
    expect(result.renderableType).toBe('group');
    expect(result.getProperty('x')).toBe(0);
    expect(result.getProperty('y')).toBe(0);
    expect(Array.isArray(result.getProperty('children'))).toBe(true);
    expect(result.getProperty('children').length).toBe(0);
  });

  test('should apply x and y as a transform', () => {
    testVisualizationRendering(
      {
        type: "group",
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

  test('should combine position with additional transform', () => {
    testVisualizationRendering(
      {
        type: "group",
        x: 100,
        y: 50,
        transform: 'rotate(45)'
      },
      container,
      {
        'transform': 'translate(100, 50) rotate(45)'
      },
      'g'
    );
  });

  test('should process and store children', () => {
    // Ensure required primitives are registered
    ensurePrimitivesRegistered(['rectangle', 'circle']);

    const result = buildViz({
      type: "group",
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

  test('should convert string children to text nodes', () => {
    // Ensure text primitive is registered
    ensurePrimitivesRegistered(['text']);

    const result = buildViz({
      type: "group",
      children: [
        'Hello World',
        123
      ]
    });

    const children = result.getProperty('children');
    expect(children).toHaveLength(2);

    // Check that string children are converted to text nodes
    expect(children[0].renderableType).toBe('text');
    expect(children[1].renderableType).toBe('text');
  });

  test('should render group with children to SVG', () => {
    // Ensure required primitives are registered
    ensurePrimitivesRegistered(['rectangle', 'circle']);

    testVisualizationRendering(
      {
        type: "group",
        x: 10,
        y: 20,
        children: [
          { type: 'rectangle', width: 100, height: 50 },
          { type: 'circle', cx: 150, cy: 75, r: 25 }
        ]
      },
      container,
      {
        'transform': 'translate(10, 20)'
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

  test('should render group with children to Canvas', () => {
    // Ensure required primitives are registered
    ensurePrimitivesRegistered(['rectangle', 'circle']);

    const result = buildViz({
      type: "group",
      x: 10,
      y: 20,
      opacity: 0.5,
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
      rect: vi.fn(),  // Add this method
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      moveTo: vi.fn(),  // Add these common canvas methods
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

  test('should handle nested groups', () => {
    // Ensure required primitives are registered
    ensurePrimitivesRegistered(['rectangle']);

    const result = buildViz({
      type: "group",
      x: 10,
      y: 20,
      children: [
        {
          type: "group",
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

    // Check that nested group is processed correctly
    expect(children[0].renderableType).toBe('group');
    expect(children[0].getProperty('x')).toBe(30);
    expect(children[0].getProperty('y')).toBe(40);

    // Check that the nested group has children
    const nestedChildren = children[0].getProperty('children');
    expect(nestedChildren).toHaveLength(1);
    expect(nestedChildren[0].renderableType).toBe('rectangle');
  });

  test('should update group properties', () => {
    testVisualizationUpdate(
      {
        type: "group",
        x: 10,
        y: 20,
        opacity: 0.8
      },
      {
        x: 30,
        y: 40,
        opacity: 0.5
      },
      container,
      {
        'transform': 'translate(10, 20)',
        'opacity': '0.8'
      },
      {
        'transform': 'translate(30, 40)',
        'opacity': '0.5'
      },
      'g'
    );
  });

  test('should match the exported type definition', () => {
    // Verify that the exported type definition matches what's registered
    expect(groupTypeDefinition.type).toBe('define');
    expect(groupTypeDefinition.name).toBe('group');
    expect(groupTypeDefinition.properties).toBeDefined();
    expect(groupTypeDefinition.implementation).toBeDefined();

    // Compare with the registered type
    const registeredType = getType('group');
    expect(registeredType?.properties).toEqual(groupTypeDefinition.properties);
  });
});

describe('Recursive Building', () => {
  let container: HTMLElement;

  beforeEach(() => {
    // Reset the registry and initialize test environment
    initializeTestEnvironment();

    // Create a test container
    container = createTestContainer();
  });

  afterEach(() => {
    cleanupTestContainer(container);
  });

  test('should handle nested visualizations', () => {
    // Ensure required primitives are registered
    ensurePrimitivesRegistered(['group', 'rectangle', 'circle']);

    // Create a group with nested visualizations
    const spec = {
      type: 'group',
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
    expect(result.renderableType).toBe('group');

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
 * - Related File: src/primitives/group.ts
 * - Related File: src/primitives/circle.ts
 * - Related File: src/primitives/rectangle.ts
 * - Related File: src/primitives/text.ts
 * - Related File: src/core/define.ts
 * - Related File: src/core/registry.ts
 * - Related File: src/core/builder.ts
 * - Related File: src/core/devize.ts
 * - Related File: src/renderers/svgUtils.ts
 * - Design Document: design/define.md
 * - Design Document: design/primitives.md
 * - Design Document: design/rendering.md
 * - User Documentation: docs/primitives/group.md
 */

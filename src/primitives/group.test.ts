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

// Create a mock document object for SVG creation
global.document = {
  createElementNS: vi.fn((namespace, tagName) => {
    if (tagName === 'g') {
      return {
        tagName: 'G',
        setAttribute: vi.fn(),
        appendChild: vi.fn()
      };
    }
    return {
      tagName: tagName.toUpperCase(),
      setAttribute: vi.fn(),
      appendChild: vi.fn()
    };
  })
} as any;

describe('Group Primitive', () => {
  // Reset registry before each test
  beforeEach(() => {
    // Reset the registry for clean tests
    (registry as any).types = new Map();

    // Register the required primitives
    registerGroupPrimitive();
    registerCirclePrimitive();
    registerRectanglePrimitive();
    registerTextPrimitive();
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
    expect(result.type).toBe('group');
    expect(result.spec.x).toBe(0);
    expect(result.spec.y).toBe(0);
    expect(Array.isArray(result.spec.children)).toBe(true);
    expect(result.spec.children.length).toBe(0);
  });

  test('should apply x and y as a transform', () => {
    const result = buildViz({
      type: "group",
      x: 100,
      y: 50
    });

    // Get the implementation result
    const impl = groupTypeDefinition.implementation(result.spec);

    expect(impl.attributes.transform).toBe('translate(100, 50)');
  });

  test('should combine position with additional transform', () => {
    const result = buildViz({
      type: "group",
      x: 100,
      y: 50,
      transform: 'rotate(45)'
    });

    // Get the implementation result
    const impl = groupTypeDefinition.implementation(result.spec);

    expect(impl.attributes.transform).toBe('translate(100, 50) rotate(45)');
  });

  test('should process and store children', () => {
    const result = buildViz({
      type: "group",
      children: [
        { type: 'rectangle', width: 100, height: 50 },
        { type: 'circle', cx: 150, cy: 75, r: 25 }
      ]
    });

    // Get the implementation result
    const impl = groupTypeDefinition.implementation(result.spec);

    expect(impl.children).toHaveLength(2);
    // Check that children are processed correctly
    expect(impl.children[0].type).toBe('rectangle');
    expect(impl.children[1].type).toBe('circle');
  });

  test('should convert string children to text nodes', () => {
    const result = buildViz({
      type: "group",
      children: [
        'Hello World',
        123
      ]
    });

    // Get the implementation result
    const impl = groupTypeDefinition.implementation(result.spec);

    expect(impl.children).toHaveLength(2);
    // Check that string children are converted to text nodes
    expect(impl.children[0].type).toBe('text');
    expect(impl.children[1].type).toBe('text');
  });

  test('should render group with children to SVG', () => {
    const result = buildViz({
      type: "group",
      x: 10,
      y: 20,
      children: [
        { type: 'rectangle', width: 100, height: 50 },
        { type: 'circle', cx: 150, cy: 75, r: 25 }
      ]
    });

    // Create a mock container
    const container = document.createElementNS('', 'svg');

    // Mock SVG element creation
    const mockGroupElement = {
      setAttribute: vi.fn(),
      appendChild: vi.fn()
    };

    document.createElementNS = vi.fn(() => mockGroupElement) as any;

    // Get the implementation result
    const impl = groupTypeDefinition.implementation(result.spec);

    // Call the SVG rendering function directly
    impl.renderToSvg(container);

    // Should have set transform attribute
    expect(mockGroupElement.setAttribute).toHaveBeenCalledWith('transform', 'translate(10, 20)');

    // Should have appended to container
    expect(container.appendChild).toHaveBeenCalledWith(mockGroupElement);
  });

  test('should render group with children to Canvas', () => {
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

    // Create a mock canvas context
    const ctx = {
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      globalAlpha: 1,
      fillRect: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn()
    };

    // Get the implementation result
    const impl = groupTypeDefinition.implementation(result.spec);

    // Call the Canvas rendering function
    impl.renderCanvas(ctx);

    // Should have saved and restored context
    expect(ctx.save).toHaveBeenCalled();
    expect(ctx.restore).toHaveBeenCalled();

    // Should have applied transform
    expect(ctx.translate).toHaveBeenCalledWith(10, 20);

    // Should have applied opacity
    expect(ctx.globalAlpha).toBe(0.5);
  });

  test('should handle nested groups', () => {
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

    // Get the implementation result
    const impl = groupTypeDefinition.implementation(result.spec);

    expect(impl.children).toHaveLength(1);
    // Check that nested group is processed correctly
    expect(impl.children[0].type).toBe('group');

    // Instead of directly accessing attributes, check the child's spec
    expect(impl.children[0].spec.x).toBe(30);
    expect(impl.children[0].spec.y).toBe(40);

    // Check that the nested group has children in its spec
    expect(impl.children[0].spec.children).toHaveLength(1);
    expect(impl.children[0].spec.children[0].type).toBe('rectangle');
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
  test('should handle nested visualizations', () => {
    // Register necessary types
    registerTestType('group', [], { children: [] });
    registerTestType('rectangle', ['width', 'height'], { fill: 'black' });
    registerTestType('circle', ['cx', 'cy', 'r'], { fill: 'red' });

    // Create a group with nested visualizations
    const spec: VisualizationSpec = {
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

    // This is mostly a smoke test to ensure it doesn't throw
    const result = buildViz(spec);
    expect(result).toBeDefined();
    expect(result.type).toBe('group');

    // Check that children were processed
    const children = result.getProperty('children');
    expect(Array.isArray(children)).toBe(true);
    expect(children.length).toBe(2);

    // Check first child
    const rectangle = children[0];
    expect(rectangle.type).toBe('rectangle');
    expect(rectangle.getProperty('width')).toBe(100);
    expect(rectangle.getProperty('height')).toBe(50);
    expect(rectangle.getProperty('fill')).toBe('blue');

    // Check second child
    const circle = children[1];
    expect(circle.type).toBe('circle');
    expect(circle.getProperty('cx')).toBe(150);
    expect(circle.getProperty('cy')).toBe(75);
    expect(circle.getProperty('r')).toBe(25);
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

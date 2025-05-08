/**
 * Text Primitive Tests
 *
 * Purpose: Tests the text primitive visualization
 * Author: [Author Name]
 * Creation Date: [Date]
 * Last Modified: [Date]
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { registry, hasType, getType } from '../core/registry';
import { textTypeDefinition, registerTextPrimitive } from './text';
import { buildViz } from '../core/builder';

// Mock the svgUtils module
vi.mock('../renderers/svgUtils', () => ({
  createSVGElement: vi.fn((tagName) => ({
    tagName: tagName.toUpperCase(),
    setAttribute: vi.fn(),
    appendChild: vi.fn(),
    textContent: ''
  })),
  applyAttributes: vi.fn()
}));

// Import the mocked functions
import { createSVGElement, applyAttributes } from '../renderers/svgUtils';

describe('Text Primitive', () => {
  // Reset registry before each test
  beforeEach(() => {
    // Reset the registry for clean tests
    (registry as any).types = new Map();

    // Register the text primitive
    registerTextPrimitive();

    // Reset mocks
    vi.clearAllMocks();
  });

  test('should register the text type', () => {
    expect(hasType('text')).toBe(true);

    const textType = getType('text');
    expect(textType).toBeDefined();
    expect(textType?.properties.text.required).toBe(true);
    expect(textType?.properties.x.default).toBe(0);
    expect(textType?.properties.y.default).toBe(0);
    expect(textType?.properties.fontSize.default).toBe(12);
    expect(textType?.properties.fontFamily.default).toBe('sans-serif');
    expect(textType?.properties.fontWeight.default).toBe('normal');
    expect(textType?.properties.fill.default).toBe('black');
    expect(textType?.properties.textAnchor.default).toBe('start');
    expect(textType?.properties.dominantBaseline.default).toBe('auto');
    expect(textType?.properties.opacity.default).toBe(1);
    expect(textType?.properties.transform.default).toBe('');
  });

  test('should create a renderable object with correct attributes', () => {
    const result = buildViz({
      type: "text",
      x: 100,
      y: 150,
      text: "Hello World",
      fontSize: 16,
      fontFamily: 'Arial',
      fill: 'blue'
    });

    expect(result).toBeDefined();
    expect(result.type).toBe('text');
    expect(result.spec.text).toBe('Hello World');
    expect(result.spec.fontSize).toBe(16);
    expect(result.spec.fontFamily).toBe('Arial');
    expect(result.spec.fill).toBe('blue');
  });

  test('should provide SVG rendering function', () => {
    const result = buildViz({
      type: "text",
      x: 100,
      y: 150,
      text: "Hello World"
    });

    // Create a mock container
    const container = { appendChild: vi.fn() };

    // Get the implementation result
    const impl = textTypeDefinition.implementation(result.spec);

    // Call the SVG rendering function directly
    impl.renderToSvg(container);

    // Should have created a text element
    expect(createSVGElement).toHaveBeenCalledWith('text');

    // Should have applied attributes
    expect(applyAttributes).toHaveBeenCalled();

    // Should have appended to container
    expect(container.appendChild).toHaveBeenCalled();
  });

  test('should provide Canvas rendering function', () => {
    // Create a mock canvas context
    const ctx = {
      save: vi.fn(),
      restore: vi.fn(),
      fillText: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      font: '',
      fillStyle: '',
      textAlign: '',
      textBaseline: '',
      globalAlpha: 1
    };

    // Call the implementation function directly with the props
    const impl = textTypeDefinition.implementation({
      x: 100,
      y: 150,
      text: "Hello World",
      fontSize: 16,
      fontFamily: 'Arial',
      fontWeight: 'normal',
      fill: 'blue',
      textAnchor: 'middle',
      dominantBaseline: 'auto',
      opacity: 1,
      transform: ''
    });

    // Call the Canvas rendering function
    impl.renderCanvas(ctx);

    // Should have saved and restored context
    expect(ctx.save).toHaveBeenCalled();
    expect(ctx.restore).toHaveBeenCalled();

    // Should have set font properties
    expect(ctx.font).toBe('normal 16px Arial');
    expect(ctx.fillStyle).toBe('blue');
    expect(ctx.textAlign).toBe('center'); // middle -> center

    // Should have drawn text
    expect(ctx.fillText).toHaveBeenCalledWith('Hello World', 100, 150);
  });

  test('should apply default values for optional properties', () => {
    const result = buildViz({
      type: "text",
      text: "Hello World"
      // No optional properties specified
    });

    expect(result.spec.x).toBe(0);
    expect(result.spec.y).toBe(0);
    expect(result.spec.fontSize).toBe(12);
    expect(result.spec.fontFamily).toBe('sans-serif');
    expect(result.spec.fontWeight).toBe('normal');
    expect(result.spec.fill).toBe('black');
    expect(result.spec.textAnchor).toBe('start');
    expect(result.spec.dominantBaseline).toBe('auto');
    expect(result.spec.opacity).toBe(1);
    expect(result.spec.transform).toBe('');
  });

  test('should handle transform property', () => {
    const result = buildViz({
      type: "text",
      text: "Hello World",
      transform: 'rotate(45)'
    });

    // Get the implementation result
    const impl = textTypeDefinition.implementation(result.spec);

    expect(impl.attributes.transform).toBe('rotate(45)');

    // Create a mock canvas context
    const ctx = {
      save: vi.fn(),
      restore: vi.fn(),
      fillText: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      font: '',
      fillStyle: '',
      textAlign: '',
      textBaseline: '',
      globalAlpha: 1
    };

    // Call the Canvas rendering function
    impl.renderCanvas(ctx);

    // Should have applied rotation (45 degrees = π/4 radians)
    expect(ctx.rotate).toHaveBeenCalledWith(Math.PI / 4);
  });

  test('should match the exported type definition', () => {
    // Verify that the exported type definition matches what's registered
    expect(textTypeDefinition.type).toBe('define');
    expect(textTypeDefinition.name).toBe('text');
    expect(textTypeDefinition.properties).toBeDefined();
    expect(textTypeDefinition.implementation).toBeDefined();

    // Compare with the registered type
    const registeredType = getType('text');
    expect(registeredType?.properties).toEqual(textTypeDefinition.properties);
  });
});

/**
 * References:
 * - Related File: src/primitives/text.ts
 * - Related File: src/core/define.ts
 * - Related File: src/core/registry.ts
 * - Related File: src/core/builder.ts
 * - Related File: src/core/devize.ts
 * - Related File: src/renderers/svgUtils.ts
 * - Design Document: design/define.md
 * - Design Document: design/primitives.md
 * - Design Document: design/rendering.md
 * - User Documentation: docs/primitives/text.md
 */

/**
 * Text Primitive Tests
 *
 * Purpose: Tests the text primitive visualization
 * Author: [Author Name]
 * Creation Date: [Date]
 * Last Modified: [Date]
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { registry, hasType, getType } from '../core/registry';
import { textTypeDefinition, registerTextPrimitive } from './text';
import { buildViz } from '../core/builder';
import {
  resetRegistry,
  createTestContainer,
  cleanupTestContainer,
  testVisualizationRendering
} from '../test/testUtils';
import { initializeTestEnvironment } from '../test/testSetup';
import { getByText, queryByText } from '@testing-library/dom';

describe('Text Primitive', () => {
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
    expect(result.renderableType).toBe('text');
    expect(result.getProperty('text')).toBe('Hello World');
    expect(result.getProperty('fontSize')).toBe(16);
    expect(result.getProperty('fontFamily')).toBe('Arial');
    expect(result.getProperty('fill')).toBe('blue');
  });

  test('should render text to DOM and be findable by content', () => {
    // Create a visualization
    const viz = buildViz({
      type: "text",
      x: 100,
      y: 150,
      text: "Hello World",
      fontSize: 16,
      fontFamily: 'Arial',
      fill: 'blue'
    });

    // Render it to the container
    viz.render(container);

    // Use Testing Library to find the text by its content
    const textElement = getByText(container, "Hello World");
    expect(textElement).toBeTruthy();

    // Log the actual HTML for debugging
    console.log('Container HTML:', container.innerHTML);

    // Check the text content
    expect(textElement.textContent).toBe('Hello World');

    // Since we're not mocking, we'll check the rendered output
    // by examining the SVG element that was created
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();

    // Find the text element within the SVG
    const svgTextElement = svg?.querySelector('text');
    expect(svgTextElement).not.toBeNull();
    expect(svgTextElement?.textContent).toBe('Hello World');
  });

  test('should provide SVG rendering function', () => {
    // Create a visualization
    const viz = buildViz({
      type: "text",
      x: 100,
      y: 150,
      text: "Hello World"
    });

    // Create an SVG element
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

    // Render to SVG
    const element = viz.renderToSvg(svg);

    // Check the element type
    expect(element.tagName.toLowerCase()).toBe('text');

    // Check the text content
    expect(element.textContent).toBe('Hello World');
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

    const result = buildViz({
      type: "text",
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
    result.renderToCanvas(ctx);

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

    expect(result.getProperty('x')).toBe(0);
    expect(result.getProperty('y')).toBe(0);
    expect(result.getProperty('fontSize')).toBe(12);
    expect(result.getProperty('fontFamily')).toBe('sans-serif');
    expect(result.getProperty('fontWeight')).toBe('normal');
    expect(result.getProperty('fill')).toBe('black');
    expect(result.getProperty('textAnchor')).toBe('start');
    expect(result.getProperty('dominantBaseline')).toBe('auto');
    expect(result.getProperty('opacity')).toBe(1);
    expect(result.getProperty('transform')).toBe('');
  });

  test('should update text properties', () => {
    // Use the testVisualizationRendering utility from testUtils
    // This avoids direct DOM manipulation that might cause issues in JSDOM

    // Initial visualization
    const initialSpec = {
      type: "text",
      x: 100,
      y: 150,
      text: "Hello World",
      fontSize: 16,
      fill: 'blue'
    };

    // Create and render the visualization
    const viz = buildViz(initialSpec);
    const renderResult = viz.render(container);

    // Verify initial text is present
    expect(getByText(container, "Hello World")).toBeTruthy();

    // Update with new properties
    const updatedSpec = {
      x: 200,
      y: 250,
      text: "Updated Text",
      fill: 'red'
    };

    renderResult.update(updatedSpec);

    // Verify updated text is present and old text is gone
    expect(getByText(container, "Updated Text")).toBeTruthy();
    expect(queryByText(container, "Hello World")).toBeNull();
  });

  test('should update text properties without getAttributeNames', () => {
    // Initial visualization
    const initialSpec = {
      type: "text",
      x: 100,
      y: 150,
      text: "Hello World",
      fontSize: 16,
      fill: 'blue'
    };

    // Create and render the visualization
    const viz = buildViz(initialSpec);
    const renderResult = viz.render(container);

    // Verify initial text is present
    expect(getByText(container, "Hello World")).toBeTruthy();

    // Get the initial text element
    const initialTextElement = getByText(container, "Hello World");
    expect(initialTextElement.getAttribute('x')).toBe('100');
    expect(initialTextElement.getAttribute('y')).toBe('150');
    expect(initialTextElement.getAttribute('fill')).toBe('blue');

    // Update with new properties
    const updatedSpec = {
      x: 200,
      y: 250,
      text: "Updated Text",
      fill: 'red'
    };

    renderResult.update(updatedSpec);

    // Verify updated text is present and old text is gone
    const updatedTextElement = getByText(container, "Updated Text");
    expect(updatedTextElement).toBeTruthy();
    expect(queryByText(container, "Hello World")).toBeNull();

    // Check updated attributes
    expect(updatedTextElement.getAttribute('x')).toBe('200');
    expect(updatedTextElement.getAttribute('y')).toBe('250');
    expect(updatedTextElement.getAttribute('fill')).toBe('red');
  });

  test('should handle transform property', () => {
    // Create a visualization with transform
    const viz = buildViz({
      type: "text",
      text: "Hello World",
      transform: 'rotate(45)'
    });

    // Render it to the container
    viz.render(container);

    // Find the text element
    const textElement = getByText(container, "Hello World");
    expect(textElement).toBeTruthy();

    // Test canvas transform
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

    viz.renderToCanvas(ctx);

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
 * - Related File: src/core/registry.ts
 * - Related File: src/core/builder.ts
 * - Related File: src/core/devize.ts
 * - Related File: src/renderers/svgUtils.ts
 * - Design Document: design/define.md
 * - Design Document: design/primitives.md
 * - Design Document: design/rendering.md
 * - User Documentation: docs/primitives/text.md
 */

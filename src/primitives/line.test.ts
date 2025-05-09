/**
 * Line Primitive Tests
 *
 * Purpose: Tests the line primitive visualization
 * Author: [Author Name]
 * Creation Date: [Date]
 * Last Modified: [Date]
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { registry, hasType, getType } from '../core/registry';
import { lineTypeDefinition, registerLinePrimitive } from './line';
import { buildViz } from '../core/builder';
import { registerDefineType } from '../core/define';
import {
  resetRegistry,
  createTestContainer,
  cleanupTestContainer,
  testVisualizationRendering
} from '../test/testUtils';

describe('Line Primitive', () => {
  let container: HTMLElement;

  // Reset registry before each test
  beforeEach(() => {
    // Reset the registry for clean tests
    resetRegistry();

    // Register the required primitives
    registerDefineType();
    registerLinePrimitive();

    // Create a test container
    container = createTestContainer();
  });

  // Clean up after each test
  afterEach(() => {
    cleanupTestContainer(container);
  });

  test('should register the line type', () => {
    expect(hasType('line')).toBe(true);

    const lineType = getType('line');
    expect(lineType).toBeDefined();
    expect(lineType?.properties.x1.required).toBe(true);
    expect(lineType?.properties.y1.required).toBe(true);
    expect(lineType?.properties.x2.required).toBe(true);
    expect(lineType?.properties.y2.required).toBe(true);
    expect(lineType?.properties.stroke.default).toBe('black');
    expect(lineType?.properties.strokeWidth.default).toBe(1);
    expect(lineType?.properties.strokeDasharray.default).toBe('none');
  });

  test('should create a renderable object with correct attributes', () => {
    const result = buildViz({
      type: "line",
      x1: 10,
      y1: 20,
      x2: 100,
      y2: 200,
      stroke: 'red',
      strokeWidth: 2,
      strokeDasharray: '5,5'
    });

    expect(result).toBeDefined();
    expect(result.renderableType).toBe('line');
    expect(result.getProperty('x1')).toBe(10);
    expect(result.getProperty('y1')).toBe(20);
    expect(result.getProperty('x2')).toBe(100);
    expect(result.getProperty('y2')).toBe(200);
    expect(result.getProperty('stroke')).toBe('red');
    expect(result.getProperty('strokeWidth')).toBe(2);
    expect(result.getProperty('strokeDasharray')).toBe('5,5');
  });

  test('should render line to SVG with correct attributes', () => {
    // Build and render the visualization
    const viz = buildViz({
      type: 'line',
      x1: 10,
      y1: 20,
      x2: 100,
      y2: 200,
      stroke: 'red',
      strokeWidth: 2,
      strokeDasharray: '5,5'
    });

    // Render to container
    viz.render(container);

    // Get the HTML
    const html = container.innerHTML;
    console.log('Rendered HTML:', html);

    // Check for expected attributes
    expect(html).toContain('<line');
    expect(html).toContain('x1="10"');
    expect(html).toContain('y1="20"');
    expect(html).toContain('x2="100"');
    expect(html).toContain('y2="200"');
    expect(html).toContain('stroke="red"');
    expect(html).toContain('stroke-width="2"');
    expect(html).toContain('stroke-dasharray="5,5"');
  });
  test('should handle null stroke-dasharray when none is specified', () => {
    const result = buildViz({
      type: "line",
      x1: 10,
      y1: 20,
      x2: 100,
      y2: 200,
      strokeDasharray: 'none'
    });

    // Render to SVG
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const element = result.renderToSvg(svg);

    // Check that stroke-dasharray attribute is not set
    expect(element.hasAttribute('stroke-dasharray')).toBe(false);
  });

  test('should provide SVG rendering function', () => {
    const result = buildViz({
      type: "line",
      x1: 10,
      y1: 20,
      x2: 100,
      y2: 200
    });

    expect(result.renderToSvg).toBeTypeOf('function');

    // Create a mock container
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

    // Call the SVG rendering function
    const svgElement = result.renderToSvg(svg);

    // Verify the SVG element was created correctly
    expect(svgElement).toBeDefined();
    expect(svgElement.tagName.toLowerCase()).toBe('line');
    expect(svg.contains(svgElement)).toBe(true);
  });

  test('should provide Canvas rendering function for solid line', () => {
    const result = buildViz({
      type: "line",
      x1: 10,
      y1: 20,
      x2: 100,
      y2: 200,
      stroke: 'blue',
      strokeWidth: 2
      // No strokeDasharray specified (should default to 'none')
    });

    expect(result.renderToCanvas).toBeTypeOf('function');

    // Create a mock canvas context
    const ctx = {
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      setLineDash: vi.fn(),
      strokeStyle: '',
      lineWidth: 0
    };

    // Call the Canvas rendering function
    const canvasResult = result.renderToCanvas(ctx as any);

    // Verify the canvas operations were performed correctly
    expect(canvasResult).toBe(true);
    expect(ctx.beginPath).toHaveBeenCalled();
    expect(ctx.moveTo).toHaveBeenCalledWith(10, 20);
    expect(ctx.lineTo).toHaveBeenCalledWith(100, 200);
    expect(ctx.setLineDash).toHaveBeenCalledWith([]);
    expect(ctx.stroke).toHaveBeenCalled();
    expect(ctx.strokeStyle).toBe('blue');
    expect(ctx.lineWidth).toBe(2);

    // Should reset line dash
    expect(ctx.setLineDash).toHaveBeenCalledTimes(2);
  });

  test('should provide Canvas rendering function for dashed line', () => {
    const result = buildViz({
      type: "line",
      x1: 10,
      y1: 20,
      x2: 100,
      y2: 200,
      strokeDasharray: '5,10'
    });

    expect(result.renderToCanvas).toBeTypeOf('function');

    // Create a mock canvas context
    const ctx = {
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      setLineDash: vi.fn(),
      strokeStyle: '',
      lineWidth: 0
    };

    // Call the Canvas rendering function
    const canvasResult = result.renderToCanvas(ctx as any);

    // Verify the canvas operations were performed correctly
    expect(canvasResult).toBe(true);
    expect(ctx.beginPath).toHaveBeenCalled();
    expect(ctx.moveTo).toHaveBeenCalledWith(10, 20);
    expect(ctx.lineTo).toHaveBeenCalledWith(100, 200);

    // Should set line dash with parsed values
    expect(ctx.setLineDash).toHaveBeenCalledWith([5, 10]);
    expect(ctx.stroke).toHaveBeenCalled();

    // Should reset line dash
    expect(ctx.setLineDash).toHaveBeenCalledTimes(2);
    expect(ctx.setLineDash).toHaveBeenLastCalledWith([]);
  });

  test('should apply default values for optional properties', () => {
    const result = buildViz({
      type: "line",
      x1: 10,
      y1: 20,
      x2: 100,
      y2: 200
      // No optional properties specified
    });

    expect(result.getProperty('stroke')).toBe('black');
    expect(result.getProperty('strokeWidth')).toBe(1);
    expect(result.getProperty('strokeDasharray')).toBe('none');
  });

  test('should update line attributes', () => {
    // Create initial line
    const viz = buildViz({
      type: "line",
      x1: 10,
      y1: 20,
      x2: 100,
      y2: 200,
      stroke: 'black'
    });

    // Render it to the container
    const renderResult = viz.render(container);

    // Get the initial HTML
    const initialHTML = container.innerHTML;
    expect(initialHTML).toContain('<line');
    expect(initialHTML).toContain('x1="10"');
    expect(initialHTML).toContain('y1="20"');
    expect(initialHTML).toContain('stroke="black"');

    // Update with new properties
    const updatedResult = renderResult.update({
      x1: 50,
      y1: 60,
      stroke: 'red',
      strokeDasharray: '5,5'
    });

    // Get the updated HTML
    const updatedHTML = container.innerHTML;
    expect(updatedHTML).toContain('x1="50"');
    expect(updatedHTML).toContain('y1="60"');
    expect(updatedHTML).toContain('stroke="red"');
    expect(updatedHTML).toContain('stroke-dasharray="5,5"');
  });

  test('should match the exported type definition', () => {
    // Verify that the exported type definition matches what's registered
    expect(lineTypeDefinition.type).toBe('define');
    expect(lineTypeDefinition.name).toBe('line');
    expect(lineTypeDefinition.properties).toBeDefined();
    expect(lineTypeDefinition.implementation).toBeDefined();

    // Compare with the registered type
    const registeredType = getType('line');
    expect(registeredType?.properties).toEqual(lineTypeDefinition.properties);
  });
});

/**
 * References:
 * - Related File: src/primitives/line.ts
 * - Related File: src/core/define.ts
 * - Related File: src/core/registry.ts
 * - Related File: src/core/builder.ts
 * - Related File: src/test/testUtils.ts
 */

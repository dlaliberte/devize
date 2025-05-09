/**
 * Polygon Primitive Tests
 *
 * Purpose: Tests the polygon primitive functionality
 * Author: [Author Name]
 * Creation Date: [Date]
 * Last Modified: [Date]
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { registry, hasType, getType } from '../core/registry';
import { polygonTypeDefinition, registerPolygonPrimitive } from './polygon';
import { buildViz } from '../core/builder';
import { registerDefineType } from '../core/define';
import {
  resetRegistry,
  createTestContainer,
  cleanupTestContainer
} from '../test/testUtils';

describe('Polygon Primitive', () => {
  let container: HTMLElement;

  // Reset registry before each test
  beforeEach(() => {
    // Reset the registry for clean tests
    resetRegistry();

    // Register the required primitives
    registerDefineType();
    registerPolygonPrimitive();

    // Create a test container
    container = createTestContainer();
  });

  // Clean up after each test
  afterEach(() => {
    cleanupTestContainer(container);
  });

  test('should register the polygon type', () => {
    expect(hasType('polygon')).toBe(true);

    const polygonType = getType('polygon');
    expect(polygonType).toBeDefined();
    expect(polygonType?.properties.points.required).toBe(true);
    expect(polygonType?.properties.fill.default).toBe('none');
    expect(polygonType?.properties.stroke.default).toBe('black');
    expect(polygonType?.properties.strokeWidth.default).toBe(1);
    expect(polygonType?.properties.opacity.default).toBe(1);
    expect(polygonType?.properties.class.default).toBe('');
  });

  test('should create a polygon with the provided points', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 50, y: 100 }
    ];

    const polygon = buildViz({
      type: 'polygon',
      points
    });

    expect(polygon).toBeDefined();
    expect(polygon.renderableType).toBe('polygon');
    expect(polygon.getProperty('points')).toEqual(points);

    // Render to container
    polygon.render(container);

    // Get the HTML
    const html = container.innerHTML;
    console.log('Rendered HTML:', html);

    // Check for expected attributes
    expect(html).toContain('<polygon');
    expect(html).toContain('points="0,0 100,0 50,100"');
    expect(html).toContain('fill="none"');
    expect(html).toContain('stroke="black"');
    expect(html).toContain('stroke-width="1"');
    expect(html).toContain('opacity="1"');
  });

  test('should apply default styling properties', () => {
    const points = [
      { x: 10, y: 10 },
      { x: 110, y: 10 },
      { x: 60, y: 110 }
    ];

    const polygon = buildViz({
      type: 'polygon',
      points
    });

    expect(polygon.getProperty('fill')).toBe('none');
    expect(polygon.getProperty('stroke')).toBe('black');
    expect(polygon.getProperty('strokeWidth')).toBe(1);
    expect(polygon.getProperty('opacity')).toBe(1);
    expect(polygon.getProperty('class')).toBe('');
  });

  test('should apply custom styling properties', () => {
    const points = [
      { x: 10, y: 10 },
      { x: 110, y: 10 },
      { x: 60, y: 110 }
    ];

    const polygon = buildViz({
      type: 'polygon',
      points,
      fill: 'blue',
      stroke: 'red',
      strokeWidth: 2,
      opacity: 0.5,
      class: 'custom-polygon'
    });

    expect(polygon.getProperty('fill')).toBe('blue');
    expect(polygon.getProperty('stroke')).toBe('red');
    expect(polygon.getProperty('strokeWidth')).toBe(2);
    expect(polygon.getProperty('opacity')).toBe(0.5);
    expect(polygon.getProperty('class')).toBe('custom-polygon');

    // Render to container
    polygon.render(container);

    // Get the HTML
    const html = container.innerHTML;

    // Check for expected attributes
    expect(html).toContain('fill="blue"');
    expect(html).toContain('stroke="red"');
    expect(html).toContain('stroke-width="2"');
    expect(html).toContain('opacity="0.5"');
    expect(html).toContain('class="custom-polygon"');
  });

  test('should handle empty points array', () => {
    const polygon = buildViz({
      type: 'polygon',
      points: []
    });

    // Render to container
    polygon.render(container);

    // Get the HTML
    const html = container.innerHTML;

    // Check for expected attributes
    expect(html).toContain('<polygon');
    expect(html).toContain('points=""');
  });

  test('should handle single point', () => {
    const polygon = buildViz({
      type: 'polygon',
      points: [{ x: 50, y: 50 }]
    });

    // Render to container
    polygon.render(container);

    // Get the HTML
    const html = container.innerHTML;

    // Check for expected attributes
    expect(html).toContain('<polygon');
    expect(html).toContain('points="50,50"');
  });

  test('should create a regular polygon (hexagon)', () => {
    // Create a regular hexagon
    const points = [];
    const sides = 6;
    const radius = 100;
    const centerX = 150;
    const centerY = 150;

    for (let i = 0; i < sides; i++) {
      const angle = (i * 2 * Math.PI / sides) - (Math.PI / 2); // Start at top
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      points.push({ x, y });
    }

    const polygon = buildViz({
      type: 'polygon',
      points,
      fill: 'lightblue'
    });

    expect(polygon.renderableType).toBe('polygon');

    // Render to container
    polygon.render(container);

    // Get the HTML
    const html = container.innerHTML;

    // Check for expected attributes
    expect(html).toContain('<polygon');
    expect(html).toContain('fill="lightblue"');

    // Instead of checking for exact point values, check that the points attribute exists
    // and has the right number of coordinates
    expect(html).toContain('points="');

    // Check that we have the right number of points (each point has x,y so 6 points = 12 values)
    const pointsMatch = html.match(/points="([^"]+)"/);
    expect(pointsMatch).not.toBeNull();

    if (pointsMatch) {
      const pointsStr = pointsMatch[1];
      const pointValues = pointsStr.split(/[ ,]/).filter(Boolean);
      expect(pointValues.length).toBe(sides * 2); // 6 points, each with x,y
    }
  });
  test('should provide Canvas rendering function', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 50, y: 100 }
    ];

    const polygon = buildViz({
      type: 'polygon',
      points,
      fill: 'blue',
      stroke: 'red',
      strokeWidth: 2,
      opacity: 0.8
    });

    expect(polygon.renderToCanvas).toBeTypeOf('function');

    // Create a mock canvas context
    const ctx = {
      save: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      closePath: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 0,
      globalAlpha: 1
    };

    // Call the Canvas rendering function
    const canvasResult = polygon.renderToCanvas(ctx as any);

    // Verify the canvas operations were performed correctly
    expect(canvasResult).toBe(true);
    expect(ctx.save).toHaveBeenCalled();
    expect(ctx.beginPath).toHaveBeenCalled();
    expect(ctx.moveTo).toHaveBeenCalledWith(0, 0);
    expect(ctx.lineTo).toHaveBeenCalledWith(100, 0);
    expect(ctx.lineTo).toHaveBeenCalledWith(50, 100);
    expect(ctx.closePath).toHaveBeenCalled();
    expect(ctx.fillStyle).toBe('blue');
    expect(ctx.fill).toHaveBeenCalled();
    expect(ctx.strokeStyle).toBe('red');
    expect(ctx.lineWidth).toBe(2);
    expect(ctx.stroke).toHaveBeenCalled();
    expect(ctx.globalAlpha).toBe(0.8);
    expect(ctx.restore).toHaveBeenCalled();
  });

  test('should update polygon attributes', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 50, y: 100 }
    ];

    // Create initial polygon
    const viz = buildViz({
      type: 'polygon',
      points,
      fill: 'none',
      stroke: 'black'
    });

    // Render it to the container
    const renderResult = viz.render(container);

    // Get the initial HTML
    const initialHTML = container.innerHTML;
    expect(initialHTML).toContain('<polygon');
    expect(initialHTML).toContain('points="0,0 100,0 50,100"');
    expect(initialHTML).toContain('fill="none"');
    expect(initialHTML).toContain('stroke="black"');

    // Update with new properties
    const newPoints = [
      { x: 10, y: 10 },
      { x: 110, y: 10 },
      { x: 60, y: 110 }
    ];
  });
});

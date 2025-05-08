/**
 * Polygon Primitive Tests
 *
 * Purpose: Tests the polygon primitive functionality
 * Author: [Author Name]
 * Creation Date: [Date]
 * Last Modified: [Date]
 */

import { describe, test, expect, beforeEach } from 'vitest';
import { buildViz } from '../core/builder';
import { registerDefineType } from '../core/define';

// Reset registry and register define type before each test
beforeEach(() => {
  registerDefineType();
});

// Import the polygon primitive
import './polygon';

describe('Polygon Primitive', () => {
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

    // Get the implementation result
    const implementation = polygon.spec;
    expect(implementation._renderType).toBe('polygon');
    expect(implementation.attributes).toBeDefined();
    expect(implementation.attributes.points).toBe('0,0 100,0 50,100');
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

    const implementation = polygon.spec;
    expect(implementation.attributes.fill).toBe('none');
    expect(implementation.attributes.stroke).toBe('black');
    expect(implementation.attributes['stroke-width']).toBe(1);
    expect(implementation.attributes.opacity).toBe(1);
    expect(implementation.attributes.class).toBe('');
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

    const implementation = polygon.spec;
    expect(implementation.attributes.fill).toBe('blue');
    expect(implementation.attributes.stroke).toBe('red');
    expect(implementation.attributes['stroke-width']).toBe(2);
    expect(implementation.attributes.opacity).toBe(0.5);
    expect(implementation.attributes.class).toBe('custom-polygon');
  });

  test('should handle empty points array', () => {
    const polygon = buildViz({
      type: 'polygon',
      points: []
    });

    const implementation = polygon.spec;
    expect(implementation.attributes.points).toBe('');
  });

  test('should handle single point', () => {
    const polygon = buildViz({
      type: 'polygon',
      points: [{ x: 50, y: 50 }]
    });

    const implementation = polygon.spec;
    expect(implementation.attributes.points).toBe('50,50');
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

    const implementation = polygon.spec;
    expect(implementation._renderType).toBe('polygon');
    expect(implementation.attributes).toBeDefined();
    expect(implementation.attributes.points).toBeDefined();
    expect(implementation.attributes.fill).toBe('lightblue');
  });

  test('should have rendering functions', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 50, y: 100 }
    ];

    const polygon = buildViz({
      type: 'polygon',
      points
    });

    const implementation = polygon.spec;
    expect(typeof implementation.renderToSvg).toBe('function');
    expect(typeof implementation.renderCanvas).toBe('function');
  });
});

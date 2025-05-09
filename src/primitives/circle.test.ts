/**
 * Circle Primitive Tests
 *
 * Purpose: Tests the circle primitive visualization
 * Author: [Author Name]
 * Creation Date: [Date]
 * Last Modified: [Date]
 */

import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { registry } from '../core/registry';
import { circleTypeDefinition, registerCirclePrimitive } from './circle';
import { buildViz } from '../core/builder';
import {
  resetRegistry,
  createTestContainer,
  cleanupTestContainer,
  testVisualizationRendering,
  testVisualizationUpdate,
  testVisualizationProperties,
  testCanvasRendering
} from '../test/testUtils';

describe('Circle Primitive', () => {
  let container: HTMLElement;

  // Set up and tear down for rendering tests
  beforeEach(() => {
    // Reset the registry for clean tests
    resetRegistry();

    // Register the circle primitive
    registerCirclePrimitive();

    // Create a fresh container for rendering tests
    container = createTestContainer();
  });

  afterEach(() => {
    // Clean up after each test
    cleanupTestContainer(container);
  });

  test('should register the circle type', () => {
    // Check if the circle type is registered
    const circleType = registry.getType('circle');

    expect(circleType).toBeDefined();
    expect(circleType?.properties.cx.required).toBe(true);
    expect(circleType?.properties.cy.required).toBe(true);
    expect(circleType?.properties.r.required).toBe(true);
    expect(circleType?.properties.fill.default).toBe('none');
    expect(circleType?.properties.stroke.default).toBe('black');
    expect(circleType?.properties.strokeWidth.default).toBe(1);
  });

  test('should validate radius is positive', () => {
    // Should throw for non-positive radius
    expect(() => {
      buildViz({
        type: "circle",
        cx: 100,
        cy: 100,
        r: 0
      });
    }).toThrow('Circle radius must be positive');

    expect(() => {
      buildViz({
        type: "circle",
        cx: 100,
        cy: 100,
        r: -10
      });
    }).toThrow('Circle radius must be positive');

    // Should not throw for positive radius
    expect(() => {
      buildViz({
        type: "circle",
        cx: 100,
        cy: 100,
        r: 50
      });
    }).not.toThrow();
  });

  test('should create a renderable object with correct attributes', () => {
    testVisualizationProperties(
      {
        type: "circle",
        cx: 100,
        cy: 150,
        r: 50,
        fill: 'red',
        stroke: 'blue',
        strokeWidth: 2
      },
      {
        cx: 100,
        cy: 150,
        r: 50,
        fill: 'red',
        stroke: 'blue',
        strokeWidth: 2
      }
    );
  });

  test('should render a circle to SVG with correct attributes', () => {
    testVisualizationRendering(
      {
        type: "circle",
        cx: 100,
        cy: 150,
        r: 50,
        fill: "coral",
        stroke: "navy",
        strokeWidth: 2
      },
      container,
      {
        'cx': '100',
        'cy': '150',
        'r': '50',
        'fill': 'coral',
        'stroke': 'navy',
        'stroke-width': '2'
      },
      'circle'
    );
  });

  test('should apply default values for optional properties', () => {
    testVisualizationRendering(
      {
        type: "circle",
        cx: 100,
        cy: 150,
        r: 50
      },
      container,
      {
        'cx': '100',
        'cy': '150',
        'r': '50',
        'fill': 'none',
        'stroke': 'black',
        'stroke-width': '1'
      },
      'circle'
    );
  });

  test('should update circle attributes', () => {
    testVisualizationUpdate(
      // Initial spec
      {
        type: "circle",
        cx: 100,
        cy: 150,
        r: 50,
        fill: "blue",
        stroke: "black",
        strokeWidth: 2
      },
      // Update spec
      {
        type: "circle",
        cx: 200,
        cy: 250,
        r: 75,
        fill: "red",
        stroke: "green",
        strokeWidth: 3
      },
      // Container
      container,
      // Initial attributes
      {
        'cx': '100',
        'cy': '150',
        'r': '50',
        'fill': 'blue',
        'stroke': 'black',
        'stroke-width': '2'
      },
      // Updated attributes
      {
        'cx': '200',
        'cy': '250',
        'r': '75',
        'fill': 'red',
        'stroke': 'green',
        'stroke-width': '3'
      },
      'circle'
    );
  });

  // Add a test for canvas rendering
  test('should render circle to canvas', () => {
    testCanvasRendering(
      {
        type: "circle",
        cx: 100,
        cy: 150,
        r: 50,
        fill: "blue",
        stroke: "black",
        strokeWidth: 2
      },
      {
        beginPath: true,
        arc: [100, 150, 50, 0, Math.PI * 2],
        fillStyle: 'blue',
        strokeStyle: 'black',
        lineWidth: 2,
        fill: true,
        stroke: true
      }
    );
  });

  test('should match the exported type definition', () => {
    // Verify that the exported type definition matches what's registered
    expect(circleTypeDefinition.type).toBe('define');
    expect(circleTypeDefinition.name).toBe('circle');
    expect(circleTypeDefinition.properties).toBeDefined();
    expect(circleTypeDefinition.implementation).toBeDefined();

    // Compare with the registered type
    const registeredType = registry.getType('circle');
    expect(registeredType?.properties).toEqual(circleTypeDefinition.properties);
  });
});

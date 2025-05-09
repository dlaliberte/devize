/**
 * Rectangle Primitive Tests
 *
 * Purpose: Tests the rectangle primitive visualization
 * Author: [Author Name]
 * Creation Date: [Date]
 * Last Modified: [Date]
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { registry } from '../core/registry';
import { rectangleTypeDefinition, registerRectanglePrimitive } from './rectangle';
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

describe('Rectangle Primitive', () => {
  let container: HTMLElement;

  // Set up and tear down for rendering tests
  beforeEach(() => {
    // Reset the registry for clean tests
    resetRegistry();

    // Register the rectangle primitive
    registerRectanglePrimitive();

    // Create a fresh container for rendering tests
    container = createTestContainer();
  });

  afterEach(() => {
    // Clean up after each test
    cleanupTestContainer(container);
  });

  test('should register the rectangle type', () => {
    const rectType = registry.getType('rectangle');
    expect(rectType).toBeDefined();
    expect(rectType?.properties.width.required).toBe(true);
    expect(rectType?.properties.height.required).toBe(true);
    expect(rectType?.properties.x.default).toBe(0);
    expect(rectType?.properties.y.default).toBe(0);
    expect(rectType?.properties.fill.default).toBe('none');
    expect(rectType?.properties.stroke.default).toBe('black');
    expect(rectType?.properties.strokeWidth.default).toBe(1);
    expect(rectType?.properties.cornerRadius.default).toBe(0);
  });

  test('should validate width and height are positive', () => {
    // Should throw for non-positive width
    expect(() => {
      buildViz({
        type: "rectangle",
        width: 0,
        height: 100
      });
    }).toThrow('Rectangle width and height must be positive');

    // Should throw for non-positive height
    expect(() => {
      buildViz({
        type: "rectangle",
        width: 100,
        height: -10
      });
    }).toThrow('Rectangle width and height must be positive');

    // Should not throw for positive dimensions
    expect(() => {
      buildViz({
        type: "rectangle",
        width: 100,
        height: 50
      });
    }).not.toThrow();
  });

  test('should create a renderable object with correct attributes', () => {
    testVisualizationProperties(
      {
        type: "rectangle",
        x: 10,
        y: 20,
        width: 100,
        height: 50,
        fill: 'red',
        stroke: 'blue',
        strokeWidth: 2,
        cornerRadius: 5
      },
      {
        x: 10,
        y: 20,
        width: 100,
        height: 50,
        fill: 'red',
        stroke: 'blue',
        strokeWidth: 2,
        cornerRadius: 5
      }
    );
  });

  test('should render a rectangle to SVG with correct attributes', () => {
    testVisualizationRendering(
      {
        type: "rectangle",
        x: 10,
        y: 20,
        width: 100,
        height: 50,
        fill: 'red',
        stroke: 'blue',
        strokeWidth: 2,
        cornerRadius: 5
      },
      container,
      {
        'x': '10',
        'y': '20',
        'width': '100',
        'height': '50',
        'fill': 'red',
        'stroke': 'blue',
        'stroke-width': '2',
        'rx': '5',
        'ry': '5'
      },
      'rect'
    );
  });

  test('should apply default values for optional properties', () => {
    testVisualizationRendering(
      {
        type: "rectangle",
        width: 100,
        height: 50
      },
      container,
      {
        'x': '0',
        'y': '0',
        'width': '100',
        'height': '50',
        'fill': 'none',
        'stroke': 'black',
        'stroke-width': '1',
        'rx': '0',
        'ry': '0'
      },
      'rect'
    );
  });

  test('should update rectangle attributes', () => {
    // Create a rectangle visualization
    const rectangle = buildViz({
      type: "rectangle",
      x: 10,
      y: 20,
      width: 100,
      height: 50,
      fill: 'red',
      stroke: 'blue',
      strokeWidth: 2,
      cornerRadius: 0
    });

    // Render the rectangle to the container
    const result = rectangle.render(container);

    // Verify initial state
    const initialHTML = container.innerHTML;
    console.log('Initial rectangle HTML:', initialHTML);

    expect(initialHTML).toContain('<rect');
    expect(initialHTML).toContain('x="10"');
    expect(initialHTML).toContain('y="20"');
    expect(initialHTML).toContain('width="100"');
    expect(initialHTML).toContain('height="50"');
    expect(initialHTML).toContain('fill="red"');
    expect(initialHTML).toContain('stroke="blue"');
    expect(initialHTML).toContain('stroke-width="2"');
    expect(initialHTML).toContain('rx="0"');
    expect(initialHTML).toContain('ry="0"');

    // Update the rectangle using the result's update method
    result.update({
      x: 30,
      y: 40,
      width: 200,
      height: 100,
      fill: 'green',
      stroke: 'purple',
      strokeWidth: 3,
      cornerRadius: 10
    });

    // Verify updated state
    const updatedHTML = container.innerHTML;
    console.log('Updated rectangle HTML:', updatedHTML);

    expect(updatedHTML).toContain('<rect');
    expect(updatedHTML).toContain('x="30"');
    expect(updatedHTML).toContain('y="40"');
    expect(updatedHTML).toContain('width="200"');
    expect(updatedHTML).toContain('height="100"');
    expect(updatedHTML).toContain('fill="green"');
    expect(updatedHTML).toContain('stroke="purple"');
    expect(updatedHTML).toContain('stroke-width="3"');
    expect(updatedHTML).toContain('rx="10"');
    expect(updatedHTML).toContain('ry="10"');
  });

  test('should render a rounded rectangle', () => {
    testVisualizationRendering(
      {
        type: "rectangle",
        x: 10,
        y: 20,
        width: 100,
        height: 50,
        cornerRadius: 15,
        fill: 'orange'
      },
      container,
      {
        'x': '10',
        'y': '20',
        'width': '100',
        'height': '50',
        'fill': 'orange',
        'rx': '15',
        'ry': '15'
      },
      'rect'
    );
  });

  test('should provide Canvas rendering function', () => {
    testCanvasRendering(
      {
        type: "rectangle",
        x: 10,
        y: 20,
        width: 100,
        height: 50,
        fill: 'green',
        stroke: 'black',
        strokeWidth: 2
      },
      {
        beginPath: true,
        rect: [10, 20, 100, 50],
        fillStyle: 'green',
        strokeStyle: 'black',
        lineWidth: 2,
        fill: true,
        stroke: true
      }
    );
  });

  test('should render rounded rectangle to canvas', () => {
    testCanvasRendering(
      {
        type: "rectangle",
        x: 10,
        y: 20,
        width: 100,
        height: 50,
        cornerRadius: 15,
        fill: 'orange',
        stroke: 'brown',
        strokeWidth: 3
      },
      {
        beginPath: true,
        moveTo: true,
        lineTo: true,
        arcTo: true,
        fillStyle: 'orange',
        strokeStyle: 'brown',
        lineWidth: 3,
        fill: true,
        stroke: true,
        // Should not use regular rectangle method
        rect: false
      }
    );
  });

  test('should match the exported type definition', () => {
    // Verify that the exported type definition matches what's registered
    expect(rectangleTypeDefinition.type).toBe('define');
    expect(rectangleTypeDefinition.name).toBe('rectangle');
    expect(rectangleTypeDefinition.properties).toBeDefined();
    expect(rectangleTypeDefinition.implementation).toBeDefined();

    // Compare with the registered type
    const registeredType = registry.getType('rectangle');
    expect(registeredType?.properties).toEqual(rectangleTypeDefinition.properties);
  });
});

/**
 * References:
 * - Related File: src/primitives/rectangle.ts
 * - Related File: src/core/define.ts
 * - Related File: src/core/registry.ts
 * - Related File: src/core/builder.ts
 * - Related File: src/core/devize.ts
 * - Related File: src/renderers/svgUtils.ts
 * - Related File: src/primitives/circle.ts
 * - Design Document: design/define.md
 * - Design Document: design/primitives.md
 * - Design Document: design/rendering.md
 * - User Documentation: docs/primitives/shapes.md
 */

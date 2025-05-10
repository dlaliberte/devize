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
  testVisualizationRendering,
  testVisualizationUpdate,
  testVisualizationProperties,
  testCanvasRendering
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
    testVisualizationProperties(
      {
        type: "line",
        x1: 10,
        y1: 20,
        x2: 100,
        y2: 200,
        stroke: 'red',
        strokeWidth: 2,
        strokeDasharray: '5,5'
      },
      {
        x1: 10,
        y1: 20,
        x2: 100,
        y2: 200,
        stroke: 'red',
        strokeWidth: 2,
        strokeDasharray: '5,5'
      }
    );
  });

  test('should render line to SVG with correct attributes', () => {
    testVisualizationRendering(
      {
        type: 'line',
        x1: 10,
        y1: 20,
        x2: 100,
        y2: 200,
        stroke: 'red',
        strokeWidth: 2,
        strokeDasharray: '5,5'
      },
      container,
      {
        'x1': '10',
        'y1': '20',
        'x2': '100',
        'y2': '200',
        'stroke': 'red',
        'stroke-width': '2',
        'stroke-dasharray': '5,5'
      },
      'line'
    );
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

  test('should apply default values for optional properties', () => {
    testVisualizationRendering(
      {
        type: "line",
        x1: 10,
        y1: 20,
        x2: 100,
        y2: 200
      },
      container,
      {
        'x1': '10',
        'y1': '20',
        'x2': '100',
        'y2': '200',
        'stroke': 'black',
        'stroke-width': '1'
      },
      'line'
    );
  });

  test('should update line attributes', () => {
    testVisualizationUpdate(
      // Initial spec
      {
        type: "line",
        x1: 10,
        y1: 20,
        x2: 100,
        y2: 200,
        stroke: 'black'
      },
      // Update spec
      {
        type: "line",
        x1: 50,
        y1: 60,
        x2: 150,
        y2: 250,
        stroke: 'red',
        strokeDasharray: '5,5'
      },
      // Container
      container,
      // Initial attributes
      {
        'x1': '10',
        'y1': '20',
        'x2': '100',
        'y2': '200',
        'stroke': 'black',
        'stroke-width': '1'
      },
      // Updated attributes
      {
        'x1': '50',
        'y1': '60',
        'x2': '150',
        'y2': '250',
        'stroke': 'red',
        'stroke-width': '1',
        'stroke-dasharray': '5,5'
      },
      'line'
    );
  });

  test('should render to canvas with solid line', () => {
    testCanvasRendering(
      {
        type: "line",
        x1: 10,
        y1: 20,
        x2: 100,
        y2: 200,
        stroke: 'blue',
        strokeWidth: 2
      },
      {
        beginPath: true,
        moveTo: [10, 20],
        lineTo: [100, 200],
        strokeStyle: 'blue',
        lineWidth: 2,
        setLineDash: [[]], // Updated to match the expected call
        stroke: true
      }
    );
  });

  test('should render to canvas with dashed line', () => {
    testCanvasRendering(
      {
        type: "line",
        x1: 10,
        y1: 20,
        x2: 100,
        y2: 200,
        stroke: 'blue',
        strokeWidth: 2,
        strokeDasharray: '5,10'
      },
      {
        beginPath: true,
        moveTo: [10, 20],
        lineTo: [100, 200],
        strokeStyle: 'blue',
        lineWidth: 2,
        setLineDash: [[5, 10]], // Updated to match the expected call
        stroke: true
      }
    );
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

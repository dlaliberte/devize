/**
 * Path Primitive Tests
 *
 * Purpose: Tests the path primitive visualization
 * Author: [Author Name]
 * Creation Date: [Date]
 * Last Modified: [Date]
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { registry, hasType, getType } from '../core/registry';
import { pathTypeDefinition, registerPathPrimitive } from './path';
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

// Mock Path2D for canvas tests
global.Path2D = vi.fn(function(path) {
  this.path = path;
}) as any;

describe('Path Primitive', () => {
  let container: HTMLElement;

  // Reset registry before each test
  beforeEach(() => {
    // Reset the registry for clean tests
    resetRegistry();

    // Register the required primitives
    registerDefineType();
    registerPathPrimitive();

    // Create a test container
    container = createTestContainer();
  });

  // Clean up after each test
  afterEach(() => {
    cleanupTestContainer(container);
  });

  test('should register the path type', () => {
    expect(hasType('path')).toBe(true);

    const pathType = getType('path');
    expect(pathType).toBeDefined();
    expect(pathType?.properties.d.required).toBe(true);
    expect(pathType?.properties.fill.default).toBe('none');
    expect(pathType?.properties.stroke.default).toBe('black');
    expect(pathType?.properties.strokeWidth.default).toBe(1);
    expect(pathType?.properties.strokeDasharray.default).toBe('none');
    expect(pathType?.properties.opacity.default).toBe(1);
  });

  test('should create a renderable object with correct attributes', () => {
    testVisualizationProperties(
      {
        type: "path",
        d: "M10,10 L90,90",
        fill: "red",
        stroke: "blue",
        strokeWidth: 2,
        strokeDasharray: "5,5",
        opacity: 0.5
      },
      {
        d: "M10,10 L90,90",
        fill: "red",
        stroke: "blue",
        strokeWidth: 2,
        strokeDasharray: "5,5",
        opacity: 0.5
      }
    );
  });

  test('should render path to SVG with correct attributes', () => {
    testVisualizationRendering(
      {
        type: 'path',
        d: 'M10,10 L90,90',
        fill: 'red',
        stroke: 'blue',
        strokeWidth: 2,
        strokeDasharray: '5,5',
        opacity: 0.5
      },
      container,
      {
        'd': 'M10,10 L90,90',
        'fill': 'red',
        'stroke': 'blue',
        'stroke-width': '2',
        'stroke-dasharray': '5,5',
        'opacity': '0.5'
      },
      'path'
    );
  });

  test('should handle null stroke-dasharray when none is specified', () => {
    const result = buildViz({
      type: "path",
      d: "M10,10 L90,90",
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
        type: "path",
        d: "M10,10 L90,90"
      },
      container,
      {
        'd': 'M10,10 L90,90',
        'fill': 'none',
        'stroke': 'black',
        'stroke-width': '1',
        'opacity': '1'
      },
      '.path'
    );
  });

  test('should update path attributes', () => {
    testVisualizationUpdate(
      // Initial spec
      {
        type: "path",
        d: "M10,10 L90,90",
        fill: 'none',
        stroke: 'black'
      },
      // Update spec
      {
        type: "path",
        d: "M20,20 L80,80",
        fill: 'red',
        stroke: 'blue',
        strokeDasharray: '5,5'
      },
      // Container
      container,
      // Initial attributes
      {
        'd': 'M10,10 L90,90',
        'fill': 'none',
        'stroke': 'black',
        'stroke-width': '1'
      },
      // Updated attributes
      {
        'd': 'M20,20 L80,80',
        'fill': 'red',
        'stroke': 'blue',
        'stroke-width': '1',
        'stroke-dasharray': '5,5'
      },
      '.path'
    );
  });

  test('should render to canvas with fill and stroke', () => {
    // Create a mock context with proper property getters/setters
    const ctx = {
      save: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      setLineDash: vi.fn(),
      _fillStyle: '',
      get fillStyle() { return this._fillStyle; },
      set fillStyle(value) { this._fillStyle = value; },
      _strokeStyle: '',
      get strokeStyle() { return this._strokeStyle; },
      set strokeStyle(value) { this._strokeStyle = value; },
      _lineWidth: 1,
      get lineWidth() { return this._lineWidth; },
      set lineWidth(value) { this._lineWidth = value; },
      _globalAlpha: 1,
      get globalAlpha() { return this._globalAlpha; },
      set globalAlpha(value) { this._globalAlpha = value; }
    };

    const viz = buildViz({
      type: "path",
      d: "M10,10 L90,90",
      fill: 'blue',
      stroke: 'red',
      strokeWidth: 2
    });

    // Render to canvas
    viz.renderToCanvas(ctx);

    // Verify the canvas operations
    expect(ctx.save).toHaveBeenCalled();
    expect(ctx.beginPath).toHaveBeenCalled();
    expect(ctx.fillStyle).toBe('blue');
    expect(ctx.fill).toHaveBeenCalled();
    expect(ctx.strokeStyle).toBe('red');
    expect(ctx.lineWidth).toBe(2);
    expect(ctx.setLineDash).toHaveBeenCalledWith([]);
    expect(ctx.stroke).toHaveBeenCalled();
    expect(ctx.restore).toHaveBeenCalled();
  });

  test('should render to canvas with stroke only', () => {
    // Create a mock context with proper property getters/setters
    const ctx = {
      save: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      setLineDash: vi.fn(),
      _fillStyle: '',
      get fillStyle() { return this._fillStyle; },
      set fillStyle(value) { this._fillStyle = value; },
      _strokeStyle: '',
      get strokeStyle() { return this._strokeStyle; },
      set strokeStyle(value) { this._strokeStyle = value; },
      _lineWidth: 1,
      get lineWidth() { return this._lineWidth; },
      set lineWidth(value) { this._lineWidth = value; },
      _globalAlpha: 1,
      get globalAlpha() { return this._globalAlpha; },
      set globalAlpha(value) { this._globalAlpha = value; }
    };

    const viz = buildViz({
      type: "path",
      d: "M10,10 L90,90",
      fill: 'none',
      stroke: 'red',
      strokeWidth: 2
    });

    // Render to canvas
    viz.renderToCanvas(ctx);

    // Verify the canvas operations
    expect(ctx.save).toHaveBeenCalled();
    expect(ctx.beginPath).toHaveBeenCalled();
    expect(ctx.fill).not.toHaveBeenCalled();
    expect(ctx.strokeStyle).toBe('red');
    expect(ctx.lineWidth).toBe(2);
    expect(ctx.setLineDash).toHaveBeenCalledWith([]);
    expect(ctx.stroke).toHaveBeenCalled();
    expect(ctx.restore).toHaveBeenCalled();
  });

  test('should match the exported type definition', () => {
    // Verify that the exported type definition matches what's registered
    expect(pathTypeDefinition.type).toBe('define');
    expect(pathTypeDefinition.name).toBe('path');
    expect(pathTypeDefinition.properties).toBeDefined();
    expect(pathTypeDefinition.implementation).toBeDefined();

    // Compare with the registered type
    const registeredType = getType('path');
    expect(registeredType?.properties).toEqual(pathTypeDefinition.properties);
  });
});

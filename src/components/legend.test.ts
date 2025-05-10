/**
   * Legend Component Tests
   *
   * Purpose: Tests the legend component
   * Author: [Author Name]
   * Creation Date: [Date]
   * Last Modified: [Date]
   */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { registry, hasType, getType } from '../core/registry';
import { buildViz } from '../core/builder';
import { registerDefineType } from '../core/define';

// Import the legend definition
import { legendDefinition, createLegend } from './legend';

// Import primitive registration functions
import { registerRectanglePrimitive } from '../primitives/rectangle';
import { registerCirclePrimitive } from '../primitives/circle';
import { registerPolygonPrimitive } from '../primitives/polygon';
import { registerTextPrimitive } from '../primitives/text';
import { registerGroupPrimitive } from '../primitives/group';

import {
  resetRegistry,
  createTestContainer,
  cleanupTestContainer,
  testVisualizationRendering,
  testVisualizationUpdate,
  testVisualizationProperties
} from '../test/testUtils';

describe('Legend Component', () => {
  let container: HTMLElement;

  // Reset registry before each test
  beforeEach(() => {
    // Reset the registry
    resetRegistry();

    // Register the define type first
    registerDefineType();

    // Register primitives
    registerRectanglePrimitive();
    registerCirclePrimitive();
    registerPolygonPrimitive();
    registerTextPrimitive();
    registerGroupPrimitive();

    // Register the legend component
    buildViz(legendDefinition);

    // Create a test container
    container = createTestContainer();
  });

  // Clean up after each test
  afterEach(() => {
    cleanupTestContainer(container);
  });

  test('should register the legend type', () => {
    // Check if the legend type is registered
    expect(hasType('legend')).toBe(true);

    // Get the legend type definition
    const legendType = getType('legend');
    expect(legendType).toBeDefined();

    // Check properties
    expect(legendType?.properties.legendType.required).toBe(true);
    expect(legendType?.properties.items.required).toBe(true);
    expect(legendType?.properties.orientation.default).toBe('vertical');
  });

  test('should create a color legend with provided items', () => {
    // Create a color legend
    const result = buildViz({
      type: 'legend',
      legendType: 'color',
      title: 'Color Legend',
      items: [
        { value: 'A', label: 'Category A', color: 'red' },
        { value: 'B', label: 'Category B', color: 'blue' },
        { value: 'C', label: 'Category C', color: 'green' }
      ],
      orientation: 'vertical',
      position: { x: 10, y: 10 }
    });

    // Check basic properties
    expect(result).toBeDefined();
    expect(result.renderableType).toBe('legend');
    expect(result.getProperty('legendType')).toBe('color');
    expect(result.getProperty('title')).toBe('Color Legend');
    expect(result.getProperty('items').length).toBe(3);
  });

  test('should create a size legend with provided items', () => {
    // Create a size legend
    const result = buildViz({
      type: 'legend',
      legendType: 'size',
      title: 'Size Legend',
      items: [
        { value: 'Small', size: 5 },
        { value: 'Medium', size: 10 },
        { value: 'Large', size: 15 }
      ],
      orientation: 'horizontal',
      position: { x: 10, y: 10 }
    });

    // Check basic properties
    expect(result).toBeDefined();
    expect(result.renderableType).toBe('legend');
    expect(result.getProperty('legendType')).toBe('size');
    expect(result.getProperty('title')).toBe('Size Legend');
    expect(result.getProperty('items').length).toBe(3);
    expect(result.getProperty('orientation')).toBe('horizontal');
  });

  test('should create a symbol legend with provided items', () => {
    // Create a symbol legend
    const result = buildViz({
      type: 'legend',
      legendType: 'symbol',
      title: 'Symbol Legend',
      items: [
        { value: 'Circle', symbol: 'circle', color: 'red' },
        { value: 'Square', symbol: 'square', color: 'blue' },
        { value: 'Triangle', symbol: 'triangle', color: 'green' }
      ],
      orientation: 'vertical',
      position: { x: 10, y: 10 }
    });

    // Check basic properties
    expect(result).toBeDefined();
    expect(result.renderableType).toBe('legend');
    expect(result.getProperty('legendType')).toBe('symbol');
    expect(result.getProperty('title')).toBe('Symbol Legend');
    expect(result.getProperty('items').length).toBe(3);
  });

  test('should handle legend without title', () => {
    // Create a legend without title
    const result = buildViz({
      type: 'legend',
      legendType: 'color',
      items: [
        { value: 'A', color: 'red' },
        { value: 'B', color: 'blue' }
      ],
      position: { x: 10, y: 10 }
    });

    // Check basic properties
    expect(result).toBeDefined();
    expect(result.renderableType).toBe('legend');
    expect(result.getProperty('title')).toBe('');
    expect(result.getProperty('items').length).toBe(2);
  });

  test('should apply custom formatting to labels', () => {
    // Create a legend with custom formatting
    const formatFunc = (value: any) => `${value}`;

    const result = buildViz({
      type: 'legend',
      legendType: 'color',
      items: [
        { value: 10, color: 'red' },
        { value: 20, color: 'blue' }
      ],
      format: formatFunc,
      position: { x: 10, y: 10 }
    });

    // Check format function
    expect(result).toBeDefined();
    expect(result.renderableType).toBe('legend');
    expect(result.getProperty('format')).toBe(formatFunc);
  });

  test('should handle horizontal orientation', () => {
    // Create a legend with horizontal orientation
    const result = buildViz({
      type: 'legend',
      legendType: 'color',
      items: [
        { value: 'A', color: 'red' },
        { value: 'B', color: 'blue' }
      ],
      orientation: 'horizontal',
      position: { x: 10, y: 10 }
    });

    // Check basic properties
    expect(result).toBeDefined();
    expect(result.renderableType).toBe('legend');
    expect(result.getProperty('orientation')).toBe('horizontal');
    expect(result.getProperty('items').length).toBe(2);
  });
});

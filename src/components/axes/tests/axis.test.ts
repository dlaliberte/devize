/**
 * Axis Component Tests
 *
 * Purpose: Tests the axis component
 * Author: [Author Name]
 * Creation Date: [Date]
 * Last Modified: [Date]
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { registry, hasType, getType } from '../../../core/registry';
import { buildViz } from '../../../core/builder';
import { registerDefineType } from '../../../core/define';

// Import the axis definition
import { axisDefinition } from '../axis';

// Import primitive registration functions
import { registerLinePrimitive } from '../../../primitives/line';
import { registerTextPrimitive } from '../../../primitives/text';
import { registerGroupPrimitive } from '../../../primitives/group';

// Import scale definitions
import { linearScaleDefinition } from '../../scales/linearScale';
import { bandScaleDefinition } from '../../scales/bandScale';

import { initializeTestEnvironment, ensurePrimitivesRegistered } from '../../../test/testSetup';
import { createScale } from '../../scales/scale';
import { testVisualizationRendering, createTestContainer } from '../../../test/testUtils';

describe('Axis Component', () => {
  let container: HTMLElement;

  // Reset registry before each test
  beforeEach(() => {
    // Reset the registry
    (registry as any).types = new Map();

    // Register the define type first
    registerDefineType();

    // Register primitives
    registerLinePrimitive();
    registerTextPrimitive();
    registerGroupPrimitive();

    // Register scales
    buildViz(linearScaleDefinition);
    buildViz(bandScaleDefinition);

    // Register the axis component
    buildViz(axisDefinition);

    // Create a fresh container for rendering tests
    container = createTestContainer();
  });

  test('should register the axis type', () => {

    // Check if the axis type is registered
    expect(hasType('axis')).toBe(true);

    // Get the axis type definition
    const axisType = getType('axis');
    expect(axisType).toBeDefined();

    // Check properties
    expect(axisType?.properties.orientation.default).toBe('bottom');
    expect(axisType?.properties.length.required).toBe(true);
    expect(axisType?.properties.values.required).toBe(true);
  });

  test('should create a horizontal axis with provided values', () => {
    // Register the axis component
    buildViz(axisDefinition);

    // Create a simple axis
    const result = buildViz({
      type: 'axis',
      orientation: 'bottom',
      length: 500,
      values: [0, 25, 50, 75, 100]
    });

    // Check basic properties without rendering
    expect(result).toBeDefined();
    expect(result.renderableType).toBe('axis');
    expect(result.getProperty('orientation')).toBe('bottom');
    expect(result.getProperty('length')).toBe(500);
    expect(result.getProperty('values')).toEqual([0, 25, 50, 75, 100]);
  });

  test('should match the exported axis definition', () => {
    // Register the axis component
    buildViz(axisDefinition);

    // Verify that the exported axis definition matches what's registered
    expect(axisDefinition.type).toBe('define');
    expect(axisDefinition.name).toBe('axis');
    expect(axisDefinition.properties).toBeDefined();
    expect(axisDefinition.implementation).toBeDefined();

    // Compare with the registered type
    const registeredType = getType('axis');
    expect(registeredType?.properties).toEqual(axisDefinition.properties);
  });

  test('should create an axis with a scale', () => {
    // Register the axis component
    buildViz(axisDefinition);

    // Create a scale directly (not using createScale)
    const scale = buildViz({
      type: 'linearScale',
      domain: [0, 100],
      range: [0, 500]
    });

    // Create an axis with the scale
    const result = buildViz({
      type: 'axis',
      orientation: 'bottom',
      length: 500,
      values: [0, 25, 50, 75, 100],
      scale: scale
    });

    // Check basic properties without rendering
    expect(result).toBeDefined();
    expect(result.renderableType).toBe('axis');
    expect(result.getProperty('scale')).toBe(scale);
  });

  test('should register the axis type', () => {
    // Check if the axis type is registered
    expect(hasType('axis')).toBe(true);

    // Get the axis type definition
    const axisType = getType('axis');
    expect(axisType).toBeDefined();

    // Check properties
    expect(axisType?.properties.orientation.default).toBe('bottom');
    expect(axisType?.properties.length.required).toBe(true);
    expect(axisType?.properties.values.required).toBe(true);
  });

  test('should create a horizontal axis with provided values', () => {
    // Create a simple axis
    const result = buildViz({
      type: 'axis',
      orientation: 'bottom',
      length: 500,
      values: [0, 25, 50, 75, 100]
    });

    // Check basic properties without rendering
    expect(result).toBeDefined();
    expect(result.renderableType).toBe('axis');
    expect(result.getProperty('orientation')).toBe('bottom');
    expect(result.getProperty('length')).toBe(500);
    expect(result.getProperty('values')).toEqual([0, 25, 50, 75, 100]);
  });

  test('should create an axis with a scale', () => {
    // Create a scale directly
    const scale = buildViz({
      type: 'linearScale',
      domain: [0, 100],
      range: [0, 500]
    });

    // Create an axis with the scale
    const result = buildViz({
      type: 'axis',
      orientation: 'bottom',
      length: 500,
      values: [0, 25, 50, 75, 100],
      scale: scale
    });

    // Check basic properties without rendering
    expect(result).toBeDefined();
    expect(result.renderableType).toBe('axis');
    expect(result.getProperty('scale')).toBe(scale);
  });

  test('should create a vertical axis', () => {
    // Create a vertical axis
    const result = buildViz({
      type: 'axis',
      orientation: 'left',
      length: 300,
      values: [0, 25, 50, 75, 100]
    });

    // Check orientation
    expect(result.getProperty('orientation')).toBe('left');
    expect(result.getProperty('length')).toBe(300);
  });

  test('should create an axis with a title', () => {
    // Create an axis with a title
    const result = buildViz({
      type: 'axis',
      orientation: 'bottom',
      length: 500,
      values: [0, 25, 50, 75, 100],
      title: 'X Axis'
    });

    // Check title
    expect(result.getProperty('title')).toBe('X Axis');
  });

  test('should create an axis with custom formatting', () => {
    // Create a custom format function
    const formatFunc = (value) => `${value}%`;

    // Create an axis with custom formatting
    const result = buildViz({
      type: 'axis',
      orientation: 'bottom',
      length: 500,
      values: [0, 25, 50, 75, 100],
      format: formatFunc
    });

    // Check format function
    expect(result.getProperty('format')).toBe(formatFunc);
  });

  test('should create an axis with custom styling', () => {
    // Create an axis with custom styling
    const result = buildViz({
      type: 'axis',
      orientation: 'bottom',
      length: 500,
      values: [0, 25, 50, 75, 100],
      stroke: 'red',
      strokeWidth: 2,
      fontSize: '14px',
      fontFamily: 'Helvetica'
    });

    // Check styling properties
    expect(result.getProperty('stroke')).toBe('red');
    expect(result.getProperty('strokeWidth')).toBe(2);
    expect(result.getProperty('fontSize')).toBe('14px');
    expect(result.getProperty('fontFamily')).toBe('Helvetica');
  });

  test('should create an axis with a scale type and domain', () => {
    // Create an axis with scale type and domain
    const result = buildViz({
      type: 'axis',
      orientation: 'bottom',
      length: 500,
      values: [],
      scaleType: 'linear',
      domain: [0, 100],
      tickCount: 5
    });

    // Check scale properties
    expect(result.getProperty('scaleType')).toBe('linear');
    expect(result.getProperty('domain')).toEqual([0, 100]);
    expect(result.getProperty('tickCount')).toBe(5);
  });

  test('should create an axis with custom tick properties', () => {
    // Create an axis with custom tick properties
    const result = buildViz({
      type: 'axis',
      orientation: 'bottom',
      length: 500,
      values: [0, 25, 50, 75, 100],
      tickLength: 10,
      tickLabelOffset: 8
    });

    // Check tick properties
    expect(result.getProperty('tickLength')).toBe(10);
    expect(result.getProperty('tickLabelOffset')).toBe(8);
  });

  test('should create an axis with provided positions', () => {
    // Create an axis with provided positions
    const result = buildViz({
      type: 'axis',
      orientation: 'bottom',
      length: 500,
      values: [0, 25, 50, 75, 100],
      positions: [0, 100, 200, 300, 400]
    });

    // Check positions
    expect(result.getProperty('positions')).toEqual([0, 100, 200, 300, 400]);
  });

  test('should match the exported axis definition', () => {
    // Verify that the exported axis definition matches what's registered
    expect(axisDefinition.type).toBe('define');
    expect(axisDefinition.name).toBe('axis');
    expect(axisDefinition.properties).toBeDefined();
    expect(axisDefinition.implementation).toBeDefined();

    // Compare with the registered type
    const registeredType = getType('axis');
    expect(registeredType?.properties).toEqual(axisDefinition.properties);
  });


  test('should register the axis type', () => {
    expect(hasType('axis')).toBe(true);

    const axisType = getType('axis');
    expect(axisType).toBeDefined();
    expect(axisType?.properties.orientation.default).toBe('bottom');
    expect(axisType?.properties.length.required).toBe(true);
    expect(axisType?.properties.values.required).toBe(true);
  });

  test('should create a horizontal axis with provided values', () => {
    const result = buildViz({
      type: 'axis',
      orientation: 'bottom',
      length: 500,
      values: [0, 25, 50, 75, 100]
    });

    expect(result).toBeDefined();
    expect(result.renderableType).toBe('axis');
    expect(result.getProperty('orientation')).toBe('bottom');
    expect(result.getProperty('length')).toBe(500);
    expect(result.getProperty('values')).toEqual([0, 25, 50, 75, 100]);
  });

  test('should create a vertical axis with provided values', () => {
    const result = buildViz({
      type: 'axis',
      orientation: 'left',
      length: 300,
      values: [0, 20, 40, 60, 80, 100]
    });

    expect(result).toBeDefined();
    expect(result.renderableType).toBe('axis');
    expect(result.getProperty('orientation')).toBe('left');
    expect(result.getProperty('length')).toBe(300);
    expect(result.getProperty('values')).toEqual([0, 20, 40, 60, 80, 100]);
  });

  test('should create an axis with a scale', () => {
    // Ensure required primitives are registered
    ensurePrimitivesRegistered(['line', 'text']);

    // Create a scale
    const scale = createScale('linear', {
      domain: [0, 100],
      range: [0, 500]
    });

    // Create an axis with the scale
    const result = buildViz({
      type: 'axis',
      orientation: 'bottom',
      length: 500,
      values: [0, 25, 50, 75, 100],
      scale: scale
    });

    expect(result).toBeDefined();
    expect(result.renderableType).toBe('axis');
    expect(result.getProperty('scale')).toBe(scale);
  });

  test('should create an axis with a scale type and domain', () => {
    // Ensure required primitives are registered
    ensurePrimitivesRegistered(['line', 'text']);

    // Create an axis with scale type and domain
    const result = buildViz({
      type: 'axis',
      orientation: 'bottom',
      length: 500,
      values: [],
      scaleType: 'linear',
      domain: [0, 100],
      tickCount: 5
    });

    expect(result).toBeDefined();
    expect(result.renderableType).toBe('axis');
    expect(result.getProperty('scaleType')).toBe('linear');
    expect(result.getProperty('domain')).toEqual([0, 100]);
  });

  test('should create an axis with custom formatting', () => {
    // Create a custom format function
    const formatFunc = (value) => `${value}%`;

    // Create an axis with custom formatting
    const result = buildViz({
      type: 'axis',
      orientation: 'bottom',
      length: 500,
      values: [0, 25, 50, 75, 100],
      format: formatFunc
    });

    expect(result).toBeDefined();
    expect(result.renderableType).toBe('axis');
    expect(result.getProperty('format')).toBe(formatFunc);
  });

  test('should create an axis with a title', () => {
    // Create an axis with a title
    const result = buildViz({
      type: 'axis',
      orientation: 'bottom',
      length: 500,
      values: [0, 25, 50, 75, 100],
      title: 'X Axis'
    });

    expect(result).toBeDefined();
    expect(result.renderableType).toBe('axis');
    expect(result.getProperty('title')).toBe('X Axis');
  });

  test('should render an axis to SVG without errors', () => {
    // Ensure required primitives are registered
    ensurePrimitivesRegistered(['line', 'text', 'group']);

    // Test visualization rendering
    testVisualizationRendering(
      {
        type: 'axis',
        orientation: 'bottom',
        length: 500,
        values: [0, 25, 50, 75, 100]
      },
      container,
      {
        // Expected attributes on the root element
      },
      'g' // Expected tag name
    );

    // Check that the container has an SVG element
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();

    // Check that the SVG contains a group for the axis
    const axisGroup = svg?.querySelector('g');
    expect(axisGroup).not.toBeNull();
  });

  test('should render an axis with a scale to SVG without errors', () => {
    // Ensure required primitives are registered
    ensurePrimitivesRegistered(['line', 'text', 'group']);

    // Create a scale
    const scale = createScale('linear', {
      domain: [0, 100],
      range: [0, 500]
    });

    // Test visualization rendering
    testVisualizationRendering(
      {
        type: 'axis',
        orientation: 'bottom',
        length: 500,
        values: [0, 25, 50, 75, 100],
        scale: scale
      },
      container,
      {
        // Expected attributes on the root element
      },
      'g' // Expected tag name
    );

    // Check that the container has an SVG element
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();

    // Check that the SVG contains a group for the axis
    const axisGroup = svg?.querySelector('g');
    expect(axisGroup).not.toBeNull();
  });

  test('should not cause infinite loops when rendering', () => {
    // Ensure required primitives are registered
    ensurePrimitivesRegistered(['line', 'text', 'group']);

    // Spy on console.error to catch any errors
    const consoleErrorSpy = vi.spyOn(console, 'error');

    // Create and render an axis
    const result = buildViz({
      type: 'axis',
      orientation: 'bottom',
      length: 500,
      values: [0, 25, 50, 75, 100]
    });

    result.render(container);

    // Check that no errors were logged
    expect(consoleErrorSpy).not.toHaveBeenCalled();

    // Restore the spy
    consoleErrorSpy.mockRestore();
  });

  test('should render nested components correctly', () => {
    // Ensure required primitives are registered
    ensurePrimitivesRegistered(['line', 'text', 'group']);

    // Create a scale
    const scale = createScale('linear', {
      domain: [0, 100],
      range: [0, 500]
    });

    // Create a group containing an axis
    const result = buildViz({
      type: 'group',
      transform: 'translate(50, 50)',
      children: [
        {
          type: 'axis',
          orientation: 'bottom',
          length: 500,
          values: [0, 25, 50, 75, 100],
          scale: scale
        }
      ]
    });

    // Render to the container
    result.render(container);

    // Check that the container has an SVG element
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();

    // Check that the SVG contains a group
    const outerGroup = svg?.querySelector('g');
    expect(outerGroup).not.toBeNull();

    // Check that the outer group has a transform attribute
    expect(outerGroup?.getAttribute('transform')).toBe('translate(0, 0) translate(50, 50)');
  });

  test('should match the exported axis definition', () => {
    // Verify that the exported axis definition matches what's registered
    expect(axisDefinition.type).toBe('define');
    expect(axisDefinition.name).toBe('axis');
    expect(axisDefinition.properties).toBeDefined();
    expect(axisDefinition.implementation).toBeDefined();

    // Compare with the registered type
    const registeredType = getType('axis');
    expect(registeredType?.properties).toEqual(axisDefinition.properties);
  });
});

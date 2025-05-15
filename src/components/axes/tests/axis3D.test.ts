/**
 * 3D Axis Component Tests
 *
 * Purpose: Tests the 3D axis component
 * Author: Devize Team
 * Creation Date: 2023-12-22
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import * as THREE from 'three';
import { registry, hasType, getType } from '../../../core/registry';
import { buildViz } from '../../../core/builder';
import { registerDefineType } from '../../../core/define';

// Import the axis3D definition
import { axis3DDefinition, registerAxis3DComponent } from '../axis3D';

// Import coordinate system
import { Cartesian3DCoordinateSystem, createCartesian3DCoordinateSystem } from '../../coordinates/cartesian3DCoordinateSystem';

// Import scale definitions
import { linearScaleDefinition } from '../../scales/linearScale';

describe('Axis3D Component', () => {
  // Reset registry before each test
  beforeEach(() => {
    // Reset the registry
    (registry as any).types = new Map();

    // Register the define type first
    registerDefineType();

    // Register scales
    buildViz(linearScaleDefinition);

    // Register the axis3D component
    registerAxis3DComponent();

    // Mock THREE.Object3D methods
    vi.spyOn(THREE.Object3D.prototype, 'add');
    vi.spyOn(THREE.Object3D.prototype, 'remove');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('should register the axis3D type', () => {
    // Check if the axis3D type is registered
    expect(hasType('axis3D')).toBe(true);

    // Get the axis3D type definition
    const axis3DType = getType('axis3D');
    expect(axis3DType).toBeDefined();

    // Check properties
    expect(axis3DType?.properties.axisType.required).toBe(true);
    expect(axis3DType?.properties.coordinateSystem.required).toBe(true);
    expect(axis3DType?.properties.color.default).toBe(null);
    expect(axis3DType?.properties.tickSize.default).toBe(5);
    expect(axis3DType?.properties.tickCount.default).toBe(5);
  });

  test('should create an X axis with provided values', () => {
    // Create a coordinate system
    const coordSystem = createCartesian3DCoordinateSystem({
      width: 100,
      height: 100,
      depth: 100,
      xScale: 'linear',
      yScale: 'linear',
      zScale: 'linear',
      xDomain: [0, 100],
      yDomain: [0, 100],
      zDomain: [0, 100]
    });

    // Create a simple axis
    const result = buildViz({
      type: 'axis3D',
      axisType: 'x',
      coordinateSystem: coordSystem,
      color: '#ff0000',
      tickSize: 5,
      tickCount: 5,
      showGrid: false
    });

    // Check basic properties
    expect(result).toBeDefined();
    expect(result.renderableType).toBe('axis3D');
    expect(result.getProperty('axisType')).toBe('x');
    expect(result.getProperty('color')).toBe('#ff0000');
    expect(result.getProperty('tickSize')).toBe(5);
    expect(result.getProperty('tickCount')).toBe(5);
    expect(result.getProperty('showGrid')).toBe(false);
  });

  test('should create a Y axis with provided values', () => {
    // Create a coordinate system
    const coordSystem = createCartesian3DCoordinateSystem({
      width: 100,
      height: 100,
      depth: 100,
      xScale: 'linear',
      yScale: 'linear',
      zScale: 'linear',
      xDomain: [0, 100],
      yDomain: [0, 100],
      zDomain: [0, 100]
    });

    // Create a simple axis
    const result = buildViz({
      type: 'axis3D',
      axisType: 'y',
      coordinateSystem: coordSystem,
      color: '#00ff00',
      tickSize: 8,
      tickCount: 4,
      showGrid: true,
      gridColor: '#cccccc'
    });

    // Check basic properties
    expect(result).toBeDefined();
    expect(result.renderableType).toBe('axis3D');
    expect(result.getProperty('axisType')).toBe('y');
    expect(result.getProperty('color')).toBe('#00ff00');
    expect(result.getProperty('tickSize')).toBe(8);
    expect(result.getProperty('tickCount')).toBe(4);
    expect(result.getProperty('showGrid')).toBe(true);
    expect(result.getProperty('gridColor')).toBe('#cccccc');
  });

  test('should create a Z axis with provided values', () => {
    // Create a coordinate system
    const coordSystem = createCartesian3DCoordinateSystem({
      width: 100,
      height: 100,
      depth: 100,
      xScale: 'linear',
      yScale: 'linear',
      zScale: 'linear',
      xDomain: [0, 100],
      yDomain: [0, 100],
      zDomain: [0, 100]
    });

    // Create a simple axis
    const result = buildViz({
      type: 'axis3D',
      axisType: 'z',
      coordinateSystem: coordSystem,
      color: '#0000ff',
      tickSize: 6,
      tickCount: 10,
      showGrid: false,
      label: 'Z Axis'
    });

    // Check basic properties
    expect(result).toBeDefined();
    expect(result.renderableType).toBe('axis3D');
    expect(result.getProperty('axisType')).toBe('z');
    expect(result.getProperty('color')).toBe('#0000ff');
    expect(result.getProperty('tickSize')).toBe(6);
    expect(result.getProperty('tickCount')).toBe(10);
    expect(result.getProperty('showGrid')).toBe(false);
    expect(result.getProperty('label')).toBe('Z Axis');
  });

  test('should create an axis with custom tick format', () => {
    // Create a coordinate system
    const coordSystem = createCartesian3DCoordinateSystem({
      width: 100,
      height: 100,
      depth: 100,
      xScale: 'linear',
      yScale: 'linear',
      zScale: 'linear',
      xDomain: [0, 100],
      yDomain: [0, 100],
      zDomain: [0, 100]
    });

    // Create a custom format function
    const formatFunc = (value: number) => `$${value}`;

    // Create an axis with custom formatting
    const result = buildViz({
      type: 'axis3D',
      axisType: 'x',
      coordinateSystem: coordSystem,
      tickFormat: formatFunc
    });

    // Check format function
    expect(result.getProperty('tickFormat')).toBe(formatFunc);
  });

  test('should create a THREE.Object3D for the axis', () => {
    // Create a coordinate system
    const coordSystem = createCartesian3DCoordinateSystem({
      width: 100,
      height: 100,
      depth: 100,
      xScale: 'linear',
      yScale: 'linear',
      zScale: 'linear',
      xDomain: [0, 100],
      yDomain: [0, 100],
      zDomain: [0, 100]
    });

    // Create a simple axis
    const result = buildViz({
      type: 'axis3D',
      axisType: 'x',
      coordinateSystem: coordSystem
    });

    // Get the THREE.Object3D
    const object3D = result.getObject3D();

    // Check that it's a THREE.Object3D
    expect(object3D).toBeInstanceOf(THREE.Object3D);
  });

  test('should create axis line, ticks, and labels', () => {
    // Create a coordinate system
    const coordSystem = createCartesian3DCoordinateSystem({
      width: 100,
      height: 100,
      depth: 100,
      xScale: 'linear',
      yScale: 'linear',
      zScale: 'linear',
      xDomain: [0, 100],
      yDomain: [0, 100],
      zDomain: [0, 100]
    });

    // Spy on THREE.Line constructor
    const lineSpy = vi.spyOn(THREE, 'Line');

    // Spy on THREE.Mesh constructor (for text labels)
    const meshSpy = vi.spyOn(THREE, 'Mesh');

    // Create a simple axis
    const result = buildViz({
      type: 'axis3D',
      axisType: 'x',
      coordinateSystem: coordSystem,
      tickCount: 5
    });

    // Get the THREE.Object3D
    const object3D = result.getObject3D();

    // Check that Line was called for the axis line
    expect(lineSpy).toHaveBeenCalled();

    // Check that Mesh was called for the labels
    expect(meshSpy).toHaveBeenCalled();

    // We should have at least tickCount + 1 calls to Mesh (for tick labels)
    expect(meshSpy.mock.calls.length).toBeGreaterThanOrEqual(5);
  });

  test('should create grid lines when showGrid is true', () => {
    // Create a coordinate system
    const coordSystem = createCartesian3DCoordinateSystem({
      width: 100,
      height: 100,
      depth: 100,
      xScale: 'linear',
      yScale: 'linear',
      zScale: 'linear',
      xDomain: [0, 100],
      yDomain: [0, 100],
      zDomain: [0, 100]
    });

    // Spy on THREE.Line constructor
    const lineSpy = vi.spyOn(THREE, 'Line');

    // Create an axis with grid
    const result = buildViz({
      type: 'axis3D',
      axisType: 'x',
      coordinateSystem: coordSystem,
      tickCount: 5,
      showGrid: true,
      gridColor: '#cccccc'
    });

    // Get the THREE.Object3D
    const object3D = result.getObject3D();

    // Check that Line was called for the grid lines
    // We should have at least tickCount + 1 calls to Line (axis line + grid lines)
    expect(lineSpy.mock.calls.length).toBeGreaterThanOrEqual(6);
  });

  test('should update the axis when properties change', () => {
    // Create a coordinate system
    const coordSystem = createCartesian3DCoordinateSystem({
      width: 100,
      height: 100,
      depth: 100,
      xScale: 'linear',
      yScale: 'linear',
      zScale: 'linear',
      xDomain: [0, 100],
      yDomain: [0, 100],
      zDomain: [0, 100]
    });

    // Create a simple axis
    const result = buildViz({
      type: 'axis3D',
      axisType: 'x',
      coordinateSystem: coordSystem,
      color: '#ff0000',
      tickCount: 5
    });

    // Get the original THREE.Object3D
    const originalObject3D = result.getObject3D();

    // Update the axis
    const updatedResult = result.update({
      color: '#00ff00',
      tickCount: 10
    });

    // Get the updated THREE.Object3D
    const updatedObject3D = updatedResult.getObject3D();

    // Check that the properties were updated
    expect(updatedResult.getProperty('color')).toBe('#00ff00');
    expect(updatedResult.getProperty('tickCount')).toBe(10);

    // Check that a new THREE.Object3D was created
    expect(updatedObject3D).not.toBe(originalObject3D);
  });

  test('should match the exported axis3D definition', () => {
    // Verify that the exported axis3D definition matches what's registered
    expect(axis3DDefinition.type).toBe('define');
    expect(axis3DDefinition.name).toBe('axis3D');
    expect(axis3DDefinition.properties).toBeDefined();
    expect(axis3DDefinition.implementation).toBeDefined();

    // Compare with the registered type
    const registeredType = getType('axis3D');
    expect(registeredType?.properties).toEqual(axis3DDefinition.properties);
  });
});

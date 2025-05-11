/**
 * Cartesian Coordinate System Tests
 *
 * Purpose: Tests the Cartesian coordinate system
 * Author: Cody
 * Creation Date: 2023-11-20
 */

import { describe, test, expect, beforeEach } from 'vitest';
import { CartesianCoordinateSystem, createCartesianCoordinateSystem } from './cartesianCoordinateSystem';
import { createScale } from '../scales/scale';

describe('CartesianCoordinateSystem', () => {
  let coordSystem: CartesianCoordinateSystem;

  beforeEach(() => {
    // Create a basic coordinate system for testing
    const xScale = createScale('linear', {
      domain: [0, 10],
      range: [0, 100]
    });

    const yScale = createScale('linear', {
      domain: [0, 10],
      range: [100, 0] // Flipped for SVG
    });

    coordSystem = createCartesianCoordinateSystem({
      width: 100,
      height: 100,
      xScale,
      yScale,
      origin: { x: 0, y: 0 }
    });
  });

  test('should convert domain coordinates to screen coordinates', () => {
    // Test a few points
    const point1 = coordSystem.toScreen({ x: 0, y: 0 });
    expect(point1.x).toBeCloseTo(0);
    // The y value should be 0 + 0 = 0 (not 100)
    expect(point1.y).toBeCloseTo(100); // y=0 in domain maps to y=100 in screen due to flipped Y

    const point2 = coordSystem.toScreen({ x: 5, y: 5 });
    expect(point2.x).toBeCloseTo(50);
    expect(point2.y).toBeCloseTo(50);

    const point3 = coordSystem.toScreen({ x: 10, y: 10 });
    expect(point3.x).toBeCloseTo(100);
    expect(point3.y).toBeCloseTo(0); // y=10 in domain maps to y=0 in screen due to flipped Y
    });


  test('should convert screen coordinates to domain coordinates', () => {
    // Test a few points
    const point1 = coordSystem.fromScreen({ x: 0, y: 0 });
    expect(point1.x).toBeCloseTo(0);
    expect(point1.y).toBeCloseTo(10);

    const point2 = coordSystem.fromScreen({ x: 50, y: 50 });
    expect(point2.x).toBeCloseTo(5);
    expect(point2.y).toBeCloseTo(5);

    const point3 = coordSystem.fromScreen({ x: 100, y: 100 });
    expect(point3.x).toBeCloseTo(10);
    expect(point3.y).toBeCloseTo(0);
  });

  test('should handle origin offset correctly', () => {
  // Create a coordinate system with an offset origin
  const xScale = createScale('linear', {
    domain: [0, 10],
    range: [0, 100]
  });

  const yScale = createScale('linear', {
    domain: [0, 10],
    range: [100, 0]
  });

  const offsetCoordSystem = createCartesianCoordinateSystem({
    width: 100,
    height: 100,
    xScale,
    yScale,
    origin: { x: 10, y: 10 }
  });

  // Test with offset origin
  const point = offsetCoordSystem.toScreen({ x: 5, y: 5 });
  expect(point.x).toBeCloseTo(60); // 10 + 50
  expect(point.y).toBeCloseTo(60); // 10 + 50 (y=5 maps to 50 in screen coordinates)

  // Test inverse with offset origin
  const domainPoint = offsetCoordSystem.fromScreen({ x: 60, y: 60 });
  expect(domainPoint.x).toBeCloseTo(5);
  expect(domainPoint.y).toBeCloseTo(5);
});


  test('should get and set origin', () => {
    // Get initial origin
    const origin = coordSystem.getOrigin();
    expect(origin.x).toBe(0);
    expect(origin.y).toBe(0);

    // Set new origin
    coordSystem.setOrigin({ x: 20, y: 30 });

    // Get updated origin
    const newOrigin = coordSystem.getOrigin();
    expect(newOrigin.x).toBe(20);
    expect(newOrigin.y).toBe(30);
  });

  test('should get dimensions', () => {
    const dimensions = coordSystem.getDimensions();
    expect(dimensions.width).toBe(100);
    expect(dimensions.height).toBe(100);
  });

  test('should get scales', () => {
    const xScale = coordSystem.getXScale();
    const yScale = coordSystem.getYScale();

    expect(xScale).toBeDefined();
    expect(yScale).toBeDefined();

    // Test the scales
    expect(xScale.scale(5)).toBeCloseTo(50);
    expect(yScale.scale(5)).toBeCloseTo(50);
  });
});

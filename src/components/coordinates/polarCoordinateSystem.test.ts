/**
 * Polar Coordinate System Tests
 *
 * Purpose: Tests the Polar coordinate system
 * Author: Cody
 * Creation Date: 2023-11-20
 */

import { describe, test, expect, beforeEach } from 'vitest';
import { PolarCoordinateSystem, createPolarCoordinateSystem } from './polarCoordinateSystem';
import { createScale } from '../scales/scale';

describe('PolarCoordinateSystem', () => {
  let coordSystem: PolarCoordinateSystem;

  beforeEach(() => {
    // Create a basic coordinate system for testing
    const radiusScale = createScale('linear', {
      domain: [0, 1],
      range: [0, 50] // Max radius of 50
    });

    const angleScale = createScale('linear', {
      domain: [0, 1],
      range: [0, Math.PI * 2] // Full circle
    });

    coordSystem = createPolarCoordinateSystem({
      width: 100,
      height: 100,
      radiusScale,
      angleScale,
      origin: { x: 50, y: 50 } // Center of 100x100 area
    });
  });

   test('should convert polar coordinates to screen coordinates', () => {
  // Test center point
  const center = coordSystem.toScreen({ radius: 0, angle: 0 });
  expect(center.x).toBeCloseTo(50);
  expect(center.y).toBeCloseTo(50);

  // Test right point (0 degrees)
  const right = coordSystem.toScreen({ radius: 1, angle: 0 });
  expect(right.x).toBeCloseTo(100);
  expect(right.y).toBeCloseTo(50);

  // Test top point (90 degrees)
  const top = coordSystem.toScreen({ radius: 1, angle: 0.25 });
  expect(top.x).toBeCloseTo(50);
  expect(top.y).toBeCloseTo(0); // Now this should work with our fixed implementation

  // Test left point (180 degrees)
  const left = coordSystem.toScreen({ radius: 1, angle: 0.5 });
  expect(left.x).toBeCloseTo(0);
  expect(left.y).toBeCloseTo(50);

  // Test bottom point (270 degrees)
  const bottom = coordSystem.toScreen({ radius: 1, angle: 0.75 });
  expect(bottom.x).toBeCloseTo(50);
  expect(bottom.y).toBeCloseTo(100);
});

test('should convert screen coordinates to polar coordinates', () => {
  // Test center point
  const center = coordSystem.fromScreen({ x: 50, y: 50 });
  expect(center.radius).toBeCloseTo(0);

  // Test right point
  const right = coordSystem.fromScreen({ x: 100, y: 50 });
  expect(right.radius).toBeCloseTo(1);
  expect(right.angle).toBeCloseTo(0);

  // Test top point
  const top = coordSystem.fromScreen({ x: 50, y: 0 });
  expect(top.radius).toBeCloseTo(1);
  expect(top.angle).toBeCloseTo(0.25); // This should now work with our fixed implementation

  // Test left point
  const left = coordSystem.fromScreen({ x: 0, y: 50 });
  expect(left.radius).toBeCloseTo(1);
  expect(left.angle).toBeCloseTo(0.5);

  // Test bottom point
  const bottom = coordSystem.fromScreen({ x: 50, y: 100 });
  expect(bottom.radius).toBeCloseTo(1);
  expect(bottom.angle).toBeCloseTo(0.75);
});



  test('should create arc paths correctly', () => {
    // Test a quarter circle
    const quarterCircle = coordSystem.createArcPath(0, 0.25);
    expect(quarterCircle).toBeDefined();
    expect(quarterCircle).toContain('M 100 50'); // Start at right point
    expect(quarterCircle).toContain('A 50 50'); // Arc with radius 50

    // Test a full circle
    const fullCircle = coordSystem.createArcPath(0, 1);
    expect(fullCircle).toBeDefined();

    // Test a donut segment
    const donutSegment = coordSystem.createArcPath(0, 0.25, 0.5, 1);
    expect(donutSegment).toBeDefined();
    expect(donutSegment).toContain('M 100 50'); // Start at outer right point
    expect(donutSegment).toContain('A 50 50'); // Outer arc with radius 50
    expect(donutSegment).toContain('A 25 25'); // Inner arc with radius 25
  });

  test('should get and set origin', () => {
    // Get initial origin
    const origin = coordSystem.getOrigin();
    expect(origin.x).toBe(50);
    expect(origin.y).toBe(50);

    // Set new origin
    coordSystem.setOrigin({ x: 60, y: 70 });

    // Get updated origin
    const newOrigin = coordSystem.getOrigin();
    expect(newOrigin.x).toBe(60);
    expect(newOrigin.y).toBe(70);

    // Test that coordinates use the new origin
    const point = coordSystem.toScreen({ radius: 1, angle: 0 });
    expect(point.x).toBeCloseTo(110); // 60 + 50
    expect(point.y).toBeCloseTo(70);
  });

  test('should get dimensions', () => {
    const dimensions = coordSystem.getDimensions();
    expect(dimensions.width).toBe(100);
    expect(dimensions.height).toBe(100);
  });

  test('should get scales and angles', () => {
    const radiusScale = coordSystem.getRadiusScale();
    const angleScale = coordSystem.getAngleScale();

    expect(radiusScale).toBeDefined();
    expect(angleScale).toBeDefined();

    // Test the scales
    expect(radiusScale.scale(0.5)).toBeCloseTo(25);
    expect(angleScale.scale(0.5)).toBeCloseTo(Math.PI);

    // Test angles
    expect(coordSystem.getStartAngle()).toBe(0);
    expect(coordSystem.getEndAngle()).toBeCloseTo(Math.PI * 2);
    expect(coordSystem.getInnerRadius()).toBe(0);
  });
});

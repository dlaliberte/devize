/**
 * Spherical Coordinate System Tests
 *
 * Purpose: Tests the Spherical coordinate system
 * Author: Cody
 * Creation Date: 2023-11-20
 */

import { describe, test, expect, beforeEach } from 'vitest';
import { SphericalCoordinateSystem, createSphericalCoordinateSystem } from './sphericalCoordinateSystem';
import { createScale } from '../scales/scale';

describe('SphericalCoordinateSystem', () => {
  let coordSystem: SphericalCoordinateSystem;

  beforeEach(() => {
    // Create a basic coordinate system for testing
    const radiusScale = createScale('linear', {
      domain: [0, 1],
      range: [0, 50] // Max radius of 50
    });

    const polarAngleScale = createScale('linear', {
      domain: [0, 1],
      range: [0, Math.PI] // 0 to π (top to bottom)
    });

    const azimuthalAngleScale = createScale('linear', {
      domain: [0, 1],
      range: [0, Math.PI * 2] // 0 to 2π (full circle)
    });

    coordSystem = createSphericalCoordinateSystem({
      width: 100,
      height: 100,
      radiusScale,
      polarAngleScale,
      azimuthalAngleScale,
      origin: { x: 50, y: 50 }, // Center of 100x100 area
      projection: 'orthographic'
    });
  });

  test('should convert spherical coordinates to screen coordinates (orthographic)', () => {
    // Test center point
    const center = coordSystem.toScreen({ radius: 0, polarAngle: 0, azimuthalAngle: 0 });
    expect(center.x).toBeCloseTo(50);
    expect(center.y).toBeCloseTo(50);

    // Test top point (polar = 0)
    const top = coordSystem.toScreen({ radius: 1, polarAngle: 0, azimuthalAngle: 0 });
    expect(top.x).toBeCloseTo(50);
    expect(top.y).toBeCloseTo(0);

    // Test right point (polar = π/2, azimuthal = 0)
    const right = coordSystem.toScreen({ radius: 1, polarAngle: 0.5, azimuthalAngle: 0 });
    expect(right.x).toBeCloseTo(100);
    expect(right.y).toBeCloseTo(50);

    // Test bottom point (polar = π)
    const bottom = coordSystem.toScreen({ radius: 1, polarAngle: 1, azimuthalAngle: 0 });
    expect(bottom.x).toBeCloseTo(50);
    expect(bottom.y).toBeCloseTo(100);
  });

  test('should convert screen coordinates to spherical coordinates (orthographic)', () => {
    // Test center point
    const center = coordSystem.fromScreen({ x: 50, y: 50 });
    expect(center.radius).toBeCloseTo(0);

    // Test points on the sphere surface
    // Note: fromScreen is an approximation for spherical coordinates
    // Test points on the sphere surface
    // Note: fromScreen is an approximation for spherical coordinates

    // Right point
    const right = coordSystem.fromScreen({ x: 100, y: 50 });
    expect(right.radius).toBeCloseTo(1);
    expect(right.polarAngle).toBeCloseTo(0.5); // π/2
    expect(right.azimuthalAngle).toBeCloseTo(0);

    // Top point
    const top = coordSystem.fromScreen({ x: 50, y: 0 });
    expect(top.radius).toBeCloseTo(1);
    expect(top.polarAngle).toBeCloseTo(0); // 0

    // Bottom point
    const bottom = coordSystem.fromScreen({ x: 50, y: 100 });
    expect(bottom.radius).toBeCloseTo(1);
    expect(bottom.polarAngle).toBeCloseTo(1); // π
  });

  test('should handle perspective projection', () => {
    // Set projection to perspective
    coordSystem.setProjection('perspective');
    coordSystem.setCameraDistance(200);

    // Test a point in 3D space
    const point = coordSystem.toScreen({ radius: 1, polarAngle: 0.5, azimuthalAngle: 0 });
    expect(point.x).toBeGreaterThan(50); // Should be to the right of center
    expect(point.y).toBeCloseTo(50); // Should be at the same height as center

    // Points further away should appear smaller
    const farPoint = coordSystem.toScreen({ radius: 0.5, polarAngle: 0.5, azimuthalAngle: 0.5 });
    const nearPoint = coordSystem.toScreen({ radius: 1, polarAngle: 0.5, azimuthalAngle: 0.5 });

    // The distance from center for the far point should be less than for the near point
    const farDistance = Math.sqrt(Math.pow(farPoint.x - 50, 2) + Math.pow(farPoint.y - 50, 2));
    const nearDistance = Math.sqrt(Math.pow(nearPoint.x - 50, 2) + Math.pow(nearPoint.y - 50, 2));

    expect(farDistance).toBeLessThan(nearDistance);
  });

  test('should apply rotation matrix', () => {
    // Set a rotation matrix that rotates 90 degrees around the y-axis
    const rotationMatrix = [
      [0, 0, 1],  // x-axis becomes z-axis
      [0, 1, 0],  // y-axis stays the same
      [-1, 0, 0]  // z-axis becomes negative x-axis
    ];

    coordSystem.setRotationMatrix(rotationMatrix);

    // Test a point that should be rotated
    const originalPoint = { radius: 1, polarAngle: 0.5, azimuthalAngle: 0 }; // Right point
    const rotatedPoint = coordSystem.toScreen(originalPoint);

    // After rotation, the right point should now be at the back, so x should be center
    expect(rotatedPoint.x).toBeCloseTo(50);
    expect(rotatedPoint.y).toBeCloseTo(50);
  });

  test('should get and set properties', () => {
    // Test getters
    expect(coordSystem.getProjection()).toBe('orthographic');
    expect(coordSystem.getRadiusScale()).toBeDefined();
    expect(coordSystem.getPolarAngleScale()).toBeDefined();
    expect(coordSystem.getAzimuthalAngleScale()).toBeDefined();

    // Test setters
    coordSystem.setProjection('perspective');
    expect(coordSystem.getProjection()).toBe('perspective');

    coordSystem.setCameraDistance(500);

    // Set a new rotation matrix
    const newMatrix = [
      [0.5, 0, 0.866],
      [0, 1, 0],
      [-0.866, 0, 0.5]
    ];
    coordSystem.setRotationMatrix(newMatrix);

    // Test origin
    const origin = coordSystem.getOrigin();
    expect(origin.x).toBe(50);
    expect(origin.y).toBe(50);

    coordSystem.setOrigin({ x: 60, y: 70 });
    const newOrigin = coordSystem.getOrigin();
    expect(newOrigin.x).toBe(60);
    expect(newOrigin.y).toBe(70);
  });
});

/**
 * Spherical Coordinate System
 *
 * Purpose: Implements a spherical coordinate system for 3D visualizations
 * Author: Cody
 * Creation Date: 2023-11-20
 */

import { CoordinateSystem, CoordinateSystemOptions, Point } from './coordinateSystem';
import { Scale } from '../scales/scale';
import { createScale } from '../scales/scale';
import { buildViz } from '../../core/builder';
import { registerDefineType } from '../../core/define';
import { createRenderableVisualization } from '../../core/componentUtils';

export interface SphericalCoordinateSystemOptions extends CoordinateSystemOptions {
  radiusScale: Scale | string;
  polarAngleScale: Scale | string;  // Theta (θ) - angle from z-axis (0 to π)
  azimuthalAngleScale: Scale | string;  // Phi (φ) - angle in xy-plane (0 to 2π)
  radiusDomain?: [number, number];
  polarAngleDomain?: [number, number];
  azimuthalAngleDomain?: [number, number];
  projection?: 'orthographic' | 'perspective';
  cameraDistance?: number;  // For perspective projection
  rotationMatrix?: number[][];  // 3x3 rotation matrix for viewpoint adjustment
}

// 3D point interface
export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export class SphericalCoordinateSystem implements CoordinateSystem {
  private width: number;
  private height: number;
  private origin: Point;
  private radiusScale: Scale;
  private polarAngleScale: Scale;
  private azimuthalAngleScale: Scale;
  private projection: 'orthographic' | 'perspective';
  private cameraDistance: number;
  private rotationMatrix: number[][];

  constructor(options: SphericalCoordinateSystemOptions) {
    this.width = options.width;
    this.height = options.height;

    // Default origin to center of the area
    this.origin = options.origin || {
      x: this.width / 2,
      y: this.height / 2
    };

    // Default projection
    this.projection = options.projection || 'orthographic';
    this.cameraDistance = options.cameraDistance || 1000;

    // Default rotation matrix (identity)
    this.rotationMatrix = options.rotationMatrix || [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1]
    ];

    // Calculate the maximum radius that fits in the container
    const maxRadius = Math.min(this.width, this.height) / 2;

    // Set up scales
    if (typeof options.radiusScale === 'string') {
      this.radiusScale = createScale(options.radiusScale, {
        domain: options.radiusDomain || [0, 1],
        range: [0, maxRadius]
      });
    } else {
      this.radiusScale = options.radiusScale;
    }

    if (typeof options.polarAngleScale === 'string') {
      this.polarAngleScale = createScale(options.polarAngleScale, {
        domain: options.polarAngleDomain || [0, 1],
        range: [0, Math.PI]
      });
    } else {
      this.polarAngleScale = options.polarAngleScale;
    }

    if (typeof options.azimuthalAngleScale === 'string') {
      this.azimuthalAngleScale = createScale(options.azimuthalAngleScale, {
        domain: options.azimuthalAngleDomain || [0, 1],
        range: [0, Math.PI * 2]
      });
    } else {
      this.azimuthalAngleScale = options.azimuthalAngleScale;
    }
  }

  // Convert from spherical coordinates to screen coordinates
  toScreen(point: { radius: any, polarAngle: any, azimuthalAngle: any }): Point {
    // Convert domain values to actual values
    const radius = this.radiusScale.scale(point.radius);
    const polarAngle = this.polarAngleScale.scale(point.polarAngle);
    const azimuthalAngle = this.azimuthalAngleScale.scale(point.azimuthalAngle);

    // Convert spherical to Cartesian 3D
    const x3d = radius * Math.sin(polarAngle) * Math.cos(azimuthalAngle);
    const y3d = radius * Math.sin(polarAngle) * Math.sin(azimuthalAngle);
    const z3d = radius * Math.cos(polarAngle);

    // Apply rotation
    const rotatedPoint = this.applyRotation({ x: x3d, y: y3d, z: z3d });

    // Project 3D to 2D
    let x2d, y2d;

    if (this.projection === 'perspective') {
      // Perspective projection
      const scale = this.cameraDistance / (this.cameraDistance + rotatedPoint.z);
      x2d = rotatedPoint.x * scale;
      y2d = rotatedPoint.y * scale;
    } else {
      // Orthographic projection (simply ignore z)
      x2d = rotatedPoint.x;
      y2d = rotatedPoint.y;
    }

    // Translate to screen coordinates
    return {
      x: this.origin.x + x2d,
      y: this.origin.y + y2d
    };
  }

  // Convert from screen coordinates to spherical coordinates
  // Note: This is an approximation as the inverse projection is not always unique
  fromScreen(point: Point): { radius: any, polarAngle: any, azimuthalAngle: any } {
    // Translate to origin-centered coordinates
    const x2d = point.x - this.origin.x;
    const y2d = point.y - this.origin.y;

    // For orthographic projection, we assume z = 0 for the inverse
    let x3d = x2d;
    let y3d = y2d;
    let z3d = 0;

    if (this.projection === 'perspective') {
      // For perspective, we need to make assumptions about the z value
      // This is a simplified approach assuming the point is on the unit sphere
      const distanceFromOrigin = Math.sqrt(x2d * x2d + y2d * y2d);
      const maxDistance = Math.min(this.width, this.height) / 2;

      // Normalize to [0, 1] range
      const normalizedDistance = Math.min(distanceFromOrigin / maxDistance, 1);

      // Calculate z based on the unit sphere equation x² + y² + z² = 1
      z3d = Math.sqrt(1 - normalizedDistance * normalizedDistance);

      // Scale back to 3D space
      x3d = x2d * (1 + z3d / this.cameraDistance);
      y3d = y2d * (1 + z3d / this.cameraDistance);
    }

    // Apply inverse rotation
    const point3d = this.applyInverseRotation({ x: x3d, y: y3d, z: z3d });

    // Convert Cartesian 3D to spherical
    const radius = Math.sqrt(
      point3d.x * point3d.x +
      point3d.y * point3d.y +
      point3d.z * point3d.z
    );

    const polarAngle = Math.acos(point3d.z / radius);
    let azimuthalAngle = Math.atan2(point3d.y, point3d.x);

    // Ensure azimuthalAngle is in [0, 2π]
    if (azimuthalAngle < 0) {
      azimuthalAngle += Math.PI * 2;
    }

    // Convert to domain values
    return {
      radius: this.radiusScale.invert(radius),
      polarAngle: this.polarAngleScale.invert(polarAngle),
      azimuthalAngle: this.azimuthalAngleScale.invert(azimuthalAngle)
    };
  }

  getDimensions(): { width: number, height: number } {
    return { width: this.width, height: this.height };
  }

  getOrigin(): Point {
    return { ...this.origin };
  }

  setOrigin(origin: Point): void {
    this.origin = { ...origin };
  }

  getRadiusScale(): Scale {
    return this.radiusScale;
  }

  getPolarAngleScale(): Scale {
    return this.polarAngleScale;
  }

  getAzimuthalAngleScale(): Scale {
    return this.azimuthalAngleScale;
  }

  getProjection(): string {
    return this.projection;
  }

  setProjection(projection: 'orthographic' | 'perspective'): void {
    this.projection = projection;
  }

  setCameraDistance(distance: number): void {
    this.cameraDistance = distance;
  }

  setRotationMatrix(matrix: number[][]): void {
    this.rotationMatrix = matrix;
  }

  // Apply the rotation matrix to a 3D point
  private applyRotation(point: Point3D): Point3D {
    const { x, y, z } = point;
    const m = this.rotationMatrix;

    return {
      x: m[0][0] * x + m[0][1] * y + m[0][2] * z,
      y: m[1][0] * x + m[1][1] * y + m[1][2] * z,
      z: m[2][0] * x + m[2][1] * y + m[2][2] * z
    };
  }

  // Apply the inverse rotation matrix to a 3D point
  private applyInverseRotation(point: Point3D): Point3D {
    // For orthogonal rotation matrices, the inverse is the transpose
    const { x, y, z } = point;
    const m = this.rotationMatrix;

    return {
      x: m[0][0] * x + m[1][0] * y + m[2][0] * z,
      y: m[0][1] * x + m[1][1] * y + m[2][1] * z,
      z: m[0][2] * x + m[1][2] * y + m[2][2] * z
    };
  }
}

// Define the sphericalCoordinateSystem component
export const sphericalCoordinateSystemDefinition = {
  type: "define",
  name: "sphericalCoordinateSystem",
  properties: {
    width: { required: true },
    height: { required: true },
    radiusScale: { required: true },
    polarAngleScale: { required: true },
    azimuthalAngleScale: { required: true },
    radiusDomain: { default: [0, 1] },
    polarAngleDomain: { default: [0, 1] },
    azimuthalAngleDomain: { default: [0, 1] },
    origin: { default: null },
    projection: { default: 'orthographic' },
    cameraDistance: { default: 1000 },
    rotationMatrix: { default: null }
  },
  implementation: function(props: any) {
    // Create the coordinate system
    const options: SphericalCoordinateSystemOptions = {
      width: props.width,
      height: props.height,
      radiusScale: props.radiusScale,
      polarAngleScale: props.polarAngleScale,
      azimuthalAngleScale: props.azimuthalAngleScale,
      radiusDomain: props.radiusDomain,
      polarAngleDomain: props.polarAngleDomain,
      azimuthalAngleDomain: props.azimuthalAngleDomain,
      origin: props.origin,
      projection: props.projection,
      cameraDistance: props.cameraDistance,
      rotationMatrix: props.rotationMatrix || [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1]
      ]
    };

    const coordSystem = new SphericalCoordinateSystem(options);

    // Create and return a renderable visualization
    return createRenderableVisualization(
      'sphericalCoordinateSystem',
      props,
      // SVG rendering function - doesn't render anything directly
      (container: SVGElement): SVGElement => {
        // Just return the container, as coordinate systems don't render visually
        return container;
      },
      // Canvas rendering function - doesn't render anything directly
      (ctx: CanvasRenderingContext2D): boolean => {
        // Coordinate systems don't render visually
        return true;
      },
      // Additional properties
      {
        coordinateSystem: coordSystem
      }
    );
  }
};

// Register the sphericalCoordinateSystem component
export function registerSphericalCoordinateSystem() {
  // Make sure define type is registered
  registerDefineType();

  // Define the sphericalCoordinateSystem type using buildViz
  buildViz(sphericalCoordinateSystemDefinition);
}

// Factory function to create a Spherical coordinate system
export function createSphericalCoordinateSystem(options: SphericalCoordinateSystemOptions): SphericalCoordinateSystem {
  return new SphericalCoordinateSystem(options);
}

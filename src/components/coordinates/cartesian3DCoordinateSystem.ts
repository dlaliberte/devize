/**
 * 3D Cartesian Coordinate System
 *
 * Purpose: Implements a 3D Cartesian coordinate system for data visualization
 * Author: Cody
 * Creation Date: 2023-12-15
 *
 * ## References
 * - **Plans**: /src/components/coordinates/plans/coordinate_system_refactoring.md
 * - **Documentation**: /src/components/coordinates/docs/3d_coordinate_system.md
 * - **Design**: /src/components/coordinates/designs/3d_coordinate_system.md
 * - **Tests**: /src/components/coordinates/tests/3d_coordinate_system_tests.md
 * - **Related Code**: /src/components/coordinates/cartesianCoordinateSystem.ts
 */

import { CoordinateSystem, CoordinateSystemOptions } from './coordinateSystem';
import { Scale } from '../scales/scale';
import { createScale } from '../scales/scale';
import { buildViz } from '../../core/builder';
import { registerDefineType } from '../../core/define';
import { createRenderableVisualization } from '../../core/componentUtils';

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface Point2D {
  x: number;
  y: number;
}

export interface ProjectionOptions {
  type: 'orthographic' | 'perspective' | 'isometric';
  viewPoint?: Point3D;
  distance?: number;
  fov?: number;
  aspectRatio?: number;
}

export interface Cartesian3DCoordinateSystemOptions extends CoordinateSystemOptions {
  width: number;
  height: number;
  depth: number;
  xScale: Scale | string;
  yScale: Scale | string;
  zScale: Scale | string;
  xDomain?: [number, number];
  yDomain?: [number, number];
  zDomain?: [number, number];
  origin?: Point3D;
  flipY?: boolean;
  projection?: ProjectionOptions;
}

export class Cartesian3DCoordinateSystem implements CoordinateSystem {
  private width: number;
  private height: number;
  private depth: number;
  private origin: Point3D;
  private xScale: Scale;
  private yScale: Scale;
  private zScale: Scale;
  private flipY: boolean;
  private projection: ProjectionOptions;

  constructor(options: Cartesian3DCoordinateSystemOptions) {
    this.width = options.width;
    this.height = options.height;
    this.depth = options.depth || this.height;
    this.origin = options.origin || { x: 0, y: 0, z: 0 };
    this.flipY = options.flipY !== undefined ? options.flipY : true;

    // Default projection
    this.projection = options.projection || {
      type: 'orthographic',
      viewPoint: { x: 0, y: 0, z: 1 },
      distance: 1000,
      aspectRatio: this.width / this.height
    };

    // Set up scales
    if (typeof options.xScale === 'string') {
      this.xScale = createScale(options.xScale, {
        domain: options.xDomain || [0, 1],
        range: [0, options.width]
      });
    } else {
      this.xScale = options.xScale;
    }

    if (typeof options.yScale === 'string') {
      this.yScale = createScale(options.yScale, {
        domain: options.yDomain || [0, 1],
        range: this.flipY ? [options.height, 0] : [0, options.height]
      });
    } else {
      this.yScale = options.yScale;
    }

    if (typeof options.zScale === 'string') {
      this.zScale = createScale(options.zScale, {
        domain: options.zDomain || [0, 1],
        range: [0, options.depth]
      });
    } else {
      this.zScale = options.zScale;
    }
  }

  // Convert data coordinates to 3D space coordinates
  toSpace(point: { x: any, y: any, z: any }): Point3D {
    return {
      x: this.xScale.scale(point.x),
      y: this.yScale.scale(point.y),
      z: this.zScale.scale(point.z)
    };
  }

  // Convert 3D space coordinates to data coordinates
  fromSpace(point: Point3D): { x: any, y: any, z: any } {
    return {
      x: this.xScale.invert(point.x),
      y: this.yScale.invert(point.y),
      z: this.zScale.invert(point.z)
    };
  }

  // Project 3D space coordinates to 2D container coordinates
  project(point: Point3D): Point2D {
    let x2d: number, y2d: number;

    switch (this.projection.type) {
      case 'orthographic':
        // Simple orthographic projection
        x2d = point.x;
        y2d = point.y;
        break;

      case 'perspective':
        // Perspective projection
        const distance = this.projection.distance || 1000;
        const scale = distance / (distance + point.z);
        x2d = point.x * scale;
        y2d = point.y * scale;
        break;

      case 'isometric':
        // Isometric projection
        x2d = point.x - point.z;
        y2d = point.y + point.x / 2 + point.z / 2;
        break;

      default:
        // Default to orthographic if unknown projection type
        x2d = point.x;
        y2d = point.y;
    }

    // Apply origin offset
    return {
      x: x2d + this.origin.x,
      y: y2d + this.origin.y
    };
  }

  // Convert from 2D container coordinates to 3D space (with estimated z)
  unproject(point2D: Point2D, estimatedZ: number = 0): Point3D {
    // Remove origin offset
    const x2d = point2D.x - this.origin.x;
    const y2d = point2D.y - this.origin.y;

    let x3d: number, y3d: number, z3d: number = estimatedZ;

    switch (this.projection.type) {
      case 'orthographic':
        // Simple orthographic unprojection
        x3d = x2d;
        y3d = y2d;
        break;

      case 'perspective':
        // Perspective unprojection
        const distance = this.projection.distance || 1000;
        const scale = distance / (distance - estimatedZ);
        x3d = x2d * scale;
        y3d = y2d * scale;
        break;

      case 'isometric':
        // Isometric unprojection (approximate)
        x3d = (2 * x2d + y2d) / 2;
        y3d = y2d - x3d / 2 - estimatedZ / 2;
        break;

      default:
        // Default to orthographic if unknown projection type
        x3d = x2d;
        y3d = y2d;
    }

    return { x: x3d, y: y3d, z: z3d };
  }

  // Convert data coordinates directly to 2D container coordinates
  toContainerCoords(point: { x: any, y: any, z: any }): Point2D {
    const spacePoint = this.toSpace(point);
    return this.project(spacePoint);
  }

  // Convert 2D container coordinates to data coordinates (with estimated z)
  fromContainerCoords(point: Point2D, estimatedZ: number = 0): { x: any, y: any, z: any } {
    const spacePoint = this.unproject(point, estimatedZ);
    return this.fromSpace(spacePoint);
  }

  // For compatibility with the CoordinateSystem interface
  toScreen(point: { x: any, y: any, z: any }): Point2D {
    return this.toContainerCoords(point);
  }

  // For compatibility with the CoordinateSystem interface
  fromScreen(point: Point2D): { x: any, y: any, z: any } {
    return this.fromContainerCoords(point);
  }

  // Get the dimensions of the coordinate system
  getDimensions(): { width: number, height: number, depth: number } {
    return { width: this.width, height: this.height, depth: this.depth };
  }

  // Get the origin point
  getOrigin(): Point3D {
    return { ...this.origin };
  }

  // Set the origin point
  setOrigin(origin: Point3D): void {
    this.origin = { ...origin };
  }

  // Get the dimensionality of the coordinate system
  getDimensionality(): number {
    return 3;
  }

  // Get all scales used by this coordinate system
  getScales(): Record<string, Scale> {
    return {
      x: this.xScale,
      y: this.yScale,
      z: this.zScale
    };
  }

  // Get the x scale
  getXScale(): Scale {
    return this.xScale;
  }

  // Get the y scale
  getYScale(): Scale {
    return this.yScale;
  }

  // Get the z scale
  getZScale(): Scale {
    return this.zScale;
  }

  // Get the current projection settings
  getProjection(): ProjectionOptions {
    return { ...this.projection };
  }

  // Set the projection settings
  setProjection(projection: Partial<ProjectionOptions>): void {
    this.projection = { ...this.projection, ...projection };
  }
}

// Define the cartesian3DCoordinateSystem component
export const cartesian3DCoordinateSystemDefinition = {
  type: "define",
  name: "cartesian3DCoordinateSystem",
  properties: {
    width: { required: true },
    height: { required: true },
    depth: { required: true },
    xScale: { required: true },
    yScale: { required: true },
    zScale: { required: true },
    xDomain: { default: [0, 1] },
    yDomain: { default: [0, 1] },
    zDomain: { default: [0, 1] },
    origin: { default: null },
    flipY: { default: true },
    projection: { default: null }
  },
  implementation: function(props: any) {
    // Create the coordinate system
    const options: Cartesian3DCoordinateSystemOptions = {
      width: props.width,
      height: props.height,
      depth: props.depth,
      xScale: props.xScale,
      yScale: props.yScale,
      zScale: props.zScale,
      xDomain: props.xDomain,
      yDomain: props.yDomain,
      zDomain: props.zDomain,
      origin: props.origin,
      flipY: props.flipY,
      projection: props.projection
    };

    const coordSystem = new Cartesian3DCoordinateSystem(options);

    // Create and return a renderable visualization
    return createRenderableVisualization(
      'cartesian3DCoordinateSystem',
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

// Register the cartesian3DCoordinateSystem component
export function registerCartesian3DCoordinateSystem() {
  // Make sure define type is registered
  registerDefineType();

  // Define the cartesian3DCoordinateSystem type using buildViz
  buildViz(cartesian3DCoordinateSystemDefinition);
}

// Factory function to create a 3D Cartesian coordinate system
export function createCartesian3DCoordinateSystem(options: Cartesian3DCoordinateSystemOptions): Cartesian3DCoordinateSystem {
  return new Cartesian3DCoordinateSystem(options);
}

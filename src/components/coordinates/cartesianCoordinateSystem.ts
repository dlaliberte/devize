/**
 * Cartesian Coordinate System
 *
 * Purpose: Implements a 2D Cartesian coordinate system
 * Author: Cody
 * Creation Date: 2023-11-20
 */

import { CoordinateSystem, CoordinateSystemOptions, Point } from './coordinateSystem';
import { Scale } from '../scales/scale';
import { createScale } from '../scales/scale';
import { buildViz } from '../../core/builder';
import { registerDefineType } from '../../core/define';
import { createRenderableVisualizationEnhanced } from '../../core/componentUtils';

export interface CartesianCoordinateSystemOptions extends CoordinateSystemOptions {
  xScale: Scale | string;
  yScale: Scale | string;
  xDomain?: [number, number];
  yDomain?: [number, number];
  flipY?: boolean; // Whether to flip the Y axis (useful for SVG where 0,0 is top-left)
}

export class CartesianCoordinateSystem implements CoordinateSystem {
  private width: number;
  private height: number;
  private origin: Point;
  private xScale: Scale;
  private yScale: Scale;
  private flipY: boolean;

  constructor(options: CartesianCoordinateSystemOptions) {
    this.width = options.width;
    this.height = options.height;
    this.origin = options.origin || { x: 0, y: options.height }; // Default origin at bottom-left
    this.flipY = options.flipY !== undefined ? options.flipY : true; // Default to flipped Y for SVG

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
  }

  // Convert data coordinates to container coordinates
  toContainerCoords(point: { x: any, y: any; }): Point {
    const containerX = this.xScale.scale(point.x) + this.origin.x;
    const containerY = this.yScale.scale(point.y) + this.origin.y;
    return { x: containerX, y: containerY };
  }

  // Convert container coordinates to data coordinates
  fromContainerCoords(point: Point): { x: any, y: any; } {
    const dataX = this.xScale.invert(point.x - this.origin.x);
    const dataY = this.yScale.invert(point.y - this.origin.y);
    return { x: dataX, y: dataY };
  }

  // Keep the old method names for backward compatibility
  toScreen(point: { x: any, y: any; }): Point {
    return this.toContainerCoords(point);
  }

  fromScreen(point: Point): { x: any, y: any; } {
    return this.fromContainerCoords(point);
  }

  getDimensions(): { width: number, height: number; } {
    return { width: this.width, height: this.height };
  }

  getOrigin(): Point {
    return { ...this.origin };
  }

  setOrigin(origin: Point): void {
    this.origin = { ...origin };
  }

  getXScale(): Scale {
    return this.xScale;
  }

  getYScale(): Scale {
    return this.yScale;
  }
}

// Define the cartesianCoordinateSystem component
export const cartesianCoordinateSystemDefinition = {
  type: "define",
  name: "cartesianCoordinateSystem",
  properties: {
    width: { required: true },
    height: { required: true },
    xScale: { required: true },
    yScale: { required: true },
    xDomain: { default: [0, 1] },
    yDomain: { default: [0, 1] },
    origin: { default: null },
    flipY: { default: true }
  },
  implementation: function (props: any) {
    // Create the coordinate system
    const options: CartesianCoordinateSystemOptions = {
      width: props.width,
      height: props.height,
      xScale: props.xScale,
      yScale: props.yScale,
      xDomain: props.xDomain,
      yDomain: props.yDomain,
      origin: props.origin,
      flipY: props.flipY
    };

    const coordSystem = new CartesianCoordinateSystem(options);

    // Create and return a renderable visualization
    return createRenderableVisualizationEnhanced(
      'cartesianCoordinateSystem',
      props, {
      renderToSvg:
        // SVG rendering function - doesn't render anything directly
        (container: SVGElement): SVGElement => {
          // Just return the container, as coordinate systems don't render visually
          return container;
        },
      renderToCanvas:
        // Canvas rendering function - doesn't render anything directly
        (ctx: CanvasRenderingContext2D): boolean => {
          // Coordinate systems don't render visually
          return true;
        }
    }

    );
  }
};

// Register the cartesianCoordinateSystem component
export function registerCartesianCoordinateSystem() {
  // Make sure define type is registered
  registerDefineType();

  // Define the cartesianCoordinateSystem type using buildViz
  buildViz(cartesianCoordinateSystemDefinition);
}

// Factory function to create a Cartesian coordinate system
export function createCartesianCoordinateSystem(options: CartesianCoordinateSystemOptions): CartesianCoordinateSystem {
  return new CartesianCoordinateSystem(options);
}

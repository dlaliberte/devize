/**
 * Polar Coordinate System
 *
 * Purpose: Implements a polar coordinate system for radial visualizations
 * Author: Cody
 * Creation Date: 2023-11-20
 */

import { CoordinateSystem, CoordinateSystemOptions, Point } from './coordinateSystem';
import { Scale } from '../scales/scale';
import { createScale } from '../scales/scale';
import { buildViz } from '../../core/builder';
import { registerDefineType } from '../../core/define';
import { createRenderableVisualization } from '../../core/componentUtils';

export interface PolarCoordinateSystemOptions extends CoordinateSystemOptions {
  radiusScale: Scale | string;
  angleScale: Scale | string;
  radiusDomain?: [number, number];
  angleDomain?: [number, number];
  startAngle?: number; // Starting angle in radians (default: 0 = right)
  endAngle?: number;   // Ending angle in radians (default: 2π = full circle)
  innerRadius?: number; // Inner radius for donut charts (default: 0)
}

export class PolarCoordinateSystem implements CoordinateSystem {
  private width: number;
  private height: number;
  private origin: Point;
  private radiusScale: Scale;
  private angleScale: Scale;
  private startAngle: number;
  private endAngle: number;
  private innerRadius: number;

  constructor(options: PolarCoordinateSystemOptions) {
    this.width = options.width;
    this.height = options.height;

    // Default origin to center of the area
    this.origin = options.origin || {
      x: this.width / 2,
      y: this.height / 2
    };

    this.startAngle = options.startAngle !== undefined ? options.startAngle : 0;
    this.endAngle = options.endAngle !== undefined ? options.endAngle : Math.PI * 2;
    this.innerRadius = options.innerRadius || 0;

    // Calculate the maximum radius that fits in the container
    const maxRadius = Math.min(this.width, this.height) / 2;

    // Set up scales
    if (typeof options.radiusScale === 'string') {
      this.radiusScale = createScale(options.radiusScale, {
        domain: options.radiusDomain || [0, 1],
        range: [this.innerRadius, maxRadius]
      });
    } else {
      this.radiusScale = options.radiusScale;
    }

    if (typeof options.angleScale === 'string') {
      this.angleScale = createScale(options.angleScale, {
        domain: options.angleDomain || [0, 1],
        range: [this.startAngle, this.endAngle]
      });
    } else {
      this.angleScale = options.angleScale;
    }
  }

    // In PolarCoordinateSystem class
    toScreen(point: { radius: any, angle: any }): Point {
  // Convert domain values to actual values
  const radius = this.radiusScale.scale(point.radius);
  const angle = this.angleScale.scale(point.angle);

  // Convert polar to Cartesian
  // For SVG, positive y is downward, so we need to adjust the sin calculation
  const x = this.origin.x + radius * Math.cos(angle);
  const y = this.origin.y - radius * Math.sin(angle); // Note the negative sign here

  return { x, y };
}

fromScreen(point: Point): { radius: any, angle: any } {
  // Translate to origin-centered coordinates
  const dx = point.x - this.origin.x;
  const dy = this.origin.y - point.y; // Note the reversed order here

  // Convert Cartesian to polar
  const radius = Math.sqrt(dx * dx + dy * dy);
  let angle = Math.atan2(dy, dx);

  // Ensure angle is in the range [0, 2π]
  if (angle < 0) {
    angle += Math.PI * 2;
  }

  // Convert to domain values
  const domainRadius = this.radiusScale.invert(radius);
  const domainAngle = this.angleScale.invert(angle);

  return { radius: domainRadius, angle: domainAngle };
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

  getAngleScale(): Scale {
    return this.angleScale;
  }

  getStartAngle(): number {
    return this.startAngle;
  }

  getEndAngle(): number {
    return this.endAngle;
  }

  getInnerRadius(): number {
    return this.innerRadius;
  }

  // Helper method to create an SVG arc path
  createArcPath(startValue: any, endValue: any, innerRadiusValue: any = 0, outerRadiusValue: any = 1): string {
    const startAngle = this.angleScale.scale(startValue);
    const endAngle = this.angleScale.scale(endValue);
    const innerRadius = this.radiusScale.scale(innerRadiusValue);
    const outerRadius = this.radiusScale.scale(outerRadiusValue);

    // Calculate points
    const startOuter = {
      x: this.origin.x + outerRadius * Math.cos(startAngle),
      y: this.origin.y + outerRadius * Math.sin(startAngle)
    };

    const endOuter = {
      x: this.origin.x + outerRadius * Math.cos(endAngle),
      y: this.origin.y + outerRadius * Math.sin(endAngle)
    };

    const startInner = {
      x: this.origin.x + innerRadius * Math.cos(startAngle),
      y: this.origin.y + innerRadius * Math.sin(startAngle)
    };

    const endInner = {
      x: this.origin.x + innerRadius * Math.cos(endAngle),
      y: this.origin.y + innerRadius * Math.sin(endAngle)
    };

    // Determine if we need to draw a large arc (more than 180 degrees)
    const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;

    // Create the path
    let path = `M ${startOuter.x} ${startOuter.y}`;

    // Outer arc
    path += ` A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${endOuter.x} ${endOuter.y}`;

    if (innerRadius > 0) {
      // Line to inner arc
      path += ` L ${endInner.x} ${endInner.y}`;

      // Inner arc
      path += ` A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${startInner.x} ${startInner.y}`;

      // Close the path
      path += ` L ${startOuter.x} ${startOuter.y}`;
    } else {
      // If no inner radius, just line back to center and then to start
      path += ` L ${this.origin.x} ${this.origin.y}`;
      path += ` L ${startOuter.x} ${startOuter.y}`;
    }

    return path;
  }
}

// Define the polarCoordinateSystem component
export const polarCoordinateSystemDefinition = {
  type: "define",
  name: "polarCoordinateSystem",
  properties: {
    width: { required: true },
    height: { required: true },
    radiusScale: { required: true },
    angleScale: { required: true },
    radiusDomain: { default: [0, 1] },
    angleDomain: { default: [0, 1] },
    origin: { default: null },
    startAngle: { default: 0 },
    endAngle: { default: Math.PI * 2 },
    innerRadius: { default: 0 }
  },
  implementation: function(props: any) {
    // Create the coordinate system
    const options: PolarCoordinateSystemOptions = {
      width: props.width,
      height: props.height,
      radiusScale: props.radiusScale,
      angleScale: props.angleScale,
      radiusDomain: props.radiusDomain,
      angleDomain: props.angleDomain,
      origin: props.origin,
      startAngle: props.startAngle,
      endAngle: props.endAngle,
      innerRadius: props.innerRadius
    };

    const coordSystem = new PolarCoordinateSystem(options);

    // Create and return a renderable visualization
    return createRenderableVisualization(
      'polarCoordinateSystem',
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

// Register the polarCoordinateSystem component
export function registerPolarCoordinateSystem() {
  // Make sure define type is registered
  registerDefineType();

  // Define the polarCoordinateSystem type using buildViz
  buildViz(polarCoordinateSystemDefinition);
}

// Factory function to create a Polar coordinate system
export function createPolarCoordinateSystem(options: PolarCoordinateSystemOptions): PolarCoordinateSystem {
  return new PolarCoordinateSystem(options);
}

/**
 * Polar Coordinate System Component
 *
 * Purpose: Provides a polar coordinate system for circular visualizations
 * Author: Devize Team
 * Creation Date: 2023-12-05
 */

import { createScale } from '../scales/scale';

export interface PolarCoordinateSystemOptions {
  width: number;
  height: number;
  innerRadius?: number | string;
  outerRadius?: number | string;
  startAngle?: number;
  endAngle?: number;
  origin?: { x: number, y: number };
}

export function createPolarCoordinateSystem(options: PolarCoordinateSystemOptions) {
  const width = options.width;
  const height = options.height;

  // Calculate the center point if not provided
  const origin = options.origin || {
    x: width / 2,
    y: height / 2
  };

  // Calculate the maximum radius that fits in the container
  const maxRadius = Math.min(width, height) / 2;

  // Parse radius values
  const parseRadius = (radius: number | string | undefined, defaultValue: number): number => {
    if (radius === undefined) return defaultValue;

    if (typeof radius === 'string' && radius.endsWith('%')) {
      const percentage = parseFloat(radius) / 100;
      return maxRadius * percentage;
    }

    return typeof radius === 'number' ? radius : defaultValue;
  };

  // Set inner and outer radius
  const innerRadius = parseRadius(options.innerRadius, 0);
  const outerRadius = parseRadius(options.outerRadius, maxRadius * 0.8); // Default to 80% of max

  // Set start and end angles
  const startAngle = options.startAngle !== undefined ? options.startAngle : 0;
  const endAngle = options.endAngle !== undefined ? options.endAngle : Math.PI * 2;

  // Create scales for radius and angle
  const radiusScale = createScale('linear', {
    domain: [0, 1],
    range: [innerRadius, outerRadius]
  });

  const angleScale = createScale('linear', {
    domain: [0, 1],
    range: [startAngle, endAngle]
  });

  return {
    width,
    height,
    origin,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    radiusScale,
    angleScale,

    // Convert polar coordinates to cartesian coordinates
    toCartesian: function(polarCoord: { angle: number, radius: number }) {
      return {
        x: origin.x + polarCoord.radius * Math.cos(polarCoord.angle),
        y: origin.y + polarCoord.radius * Math.sin(polarCoord.angle)
      };
    },

    // For backward compatibility - KEEP THIS
    toScreen: function(polarCoord: { angle: number, radius: number }) {
      return {
        x: origin.x + polarCoord.radius * Math.cos(polarCoord.angle),
        y: origin.y + polarCoord.radius * Math.sin(polarCoord.angle)
      };
    },

    // Convert cartesian coordinates to polar coordinates
    toPolar: function(cartesianCoord: { x: number, y: number }) {
      const dx = cartesianCoord.x - origin.x;
      const dy = cartesianCoord.y - origin.y;

      return {
        angle: Math.atan2(dy, dx),
        radius: Math.sqrt(dx * dx + dy * dy)
      };
    },

    // For backward compatibility - KEEP THIS
    fromScreen: function(cartesianCoord: { x: number, y: number }) {
      const dx = cartesianCoord.x - origin.x;
      const dy = cartesianCoord.y - origin.y;

      return {
        angle: Math.atan2(dy, dx),
        radius: Math.sqrt(dx * dx + dy * dy)
      };
    },

    // For backward compatibility - KEEP THIS
    createArcPath: function(startAngle: number, endAngle: number, innerRadius: number, outerRadius: number) {
      const startOuter = {
        x: origin.x + outerRadius * Math.cos(startAngle),
        y: origin.y + outerRadius * Math.sin(startAngle)
      };

      const endOuter = {
        x: origin.x + outerRadius * Math.cos(endAngle),
        y: origin.y + outerRadius * Math.sin(endAngle)
      };

      const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;

      let path = `M ${startOuter.x} ${startOuter.y} `;
      path += `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${endOuter.x} ${endOuter.y} `;

      if (innerRadius > 0) {
        // For donut charts, add the inner arc
        const endInner = {
          x: origin.x + innerRadius * Math.cos(endAngle),
          y: origin.y + innerRadius * Math.sin(endAngle)
        };

        const startInner = {
          x: origin.x + innerRadius * Math.cos(startAngle),
          y: origin.y + innerRadius * Math.sin(startAngle)
        };

        path += `L ${endInner.x} ${endInner.y} `;
        path += `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${startInner.x} ${startInner.y} `;
        path += 'Z';
      } else {
        // For pie charts, just go to the center
        path += `L ${origin.x} ${origin.y} `;
        path += 'Z';
      }

      return path;
    }
  };
}

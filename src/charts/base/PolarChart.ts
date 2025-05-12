/**
 * Polar Chart Base Component
 *
 * Purpose: Provides common functionality for polar coordinate charts
 * Author: Devize Team
 * Creation Date: 2023-12-05
 */

import { createPolarCoordinateSystem } from '../../components/coordinates/polarCoordinateSystem';
import { createScale } from '../../components/scales/scale';
import { buildViz } from '../../core/builder';
import { processAxisChartData } from './AxisChart';

// Process data specifically for polar charts
export function processPolarChartData(data: any[], options: any) {
  // Start with common axis chart data processing
  let processedData = processAxisChartData(data, options);

  // Calculate total for percentage calculations
  const valueField = options.valueField;
  const total = processedData.reduce((sum, d) => sum + d[valueField], 0);

  // Add percentage to each data point
  processedData = processedData.map(d => ({
    ...d,
    _percentage: d[valueField] / total
  }));

  return processedData;
}

// Create a polar coordinate system for charts
export function createPolarChartCoordinateSystem(dimensions: any, options: any) {
  // If the imported function exists, use it
  if (typeof createPolarCoordinateSystem === 'function') {
    return createPolarCoordinateSystem({
      width: dimensions.chartWidth,
      height: dimensions.chartHeight,
      innerRadius: options.innerRadius,
      outerRadius: options.outerRadius,
      startAngle: options.startAngle,
      endAngle: options.endAngle,
      origin: {
        x: dimensions.chartWidth / 2,
        y: dimensions.chartHeight / 2
      }
    });
  }

  // Otherwise, create a simple coordinate system
  const width = dimensions.chartWidth;
  const height = dimensions.chartHeight;
  const origin = {
    x: width / 2,
    y: height / 2
  };

  // Calculate the maximum radius that fits in the container
  const maxRadius = Math.min(width, height) / 2;

  // Parse radius values
  const parseRadius = (radius: any, defaultValue: number): number => {
    if (radius === undefined) return defaultValue;

    if (typeof radius === 'string' && radius.endsWith('%')) {
      const percentage = parseFloat(radius) / 100;
      return maxRadius * percentage;
    }

    return typeof radius === 'number' ? radius : defaultValue;
  };

  // Set inner and outer radius
  const innerRadius = parseRadius(options.innerRadius, 0);
  const outerRadius = parseRadius(options.outerRadius, maxRadius * 0.8);

  // Set start and end angles
  const startAngle = options.startAngle !== undefined ? options.startAngle : 0;
  const endAngle = options.endAngle !== undefined ? options.endAngle : Math.PI * 2;

  // Create a simple coordinate system
  return {
    width,
    height,
    origin,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,

    // Convert polar coordinates to cartesian coordinates
    toCartesian: function(polarCoord: { angle: number, radius: number }) {
      return {
        x: origin.x + polarCoord.radius * Math.cos(polarCoord.angle),
        y: origin.y + polarCoord.radius * Math.sin(polarCoord.angle)
      };
    },

    // Create an arc path
    createArcPath: function(startAngle: number, endAngle: number, innerRadius: number, outerRadius: number) {
      const startOuter = this.toCartesian({ angle: startAngle, radius: outerRadius });
      const endOuter = this.toCartesian({ angle: endAngle, radius: outerRadius });

      const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;

      let path = `M ${startOuter.x} ${startOuter.y} `;
      path += `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${endOuter.x} ${endOuter.y} `;

      if (innerRadius > 0) {
        // For donut charts, add the inner arc
        const endInner = this.toCartesian({ angle: endAngle, radius: innerRadius });
        const startInner = this.toCartesian({ angle: startAngle, radius: innerRadius });

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

// Generate path data for a pie/donut slice
export function generateSlicePath(
    coordSystem: any,
    startAngle: number,
    endAngle: number,
    innerRadius: number = 0,
    outerRadius: number = 1) {

  // Check if we're using the new coordinate system with createArc
  if (coordSystem.createArc) {
    // Use the new arc component
    const arcSpec = coordSystem.createArc(startAngle, endAngle, innerRadius, outerRadius);

    // Create a path element using the arc specification
    return buildViz({
      type: 'path',
      d: generateArcPath(
        arcSpec.centerX,
        arcSpec.centerY,
        arcSpec.innerRadius,
        arcSpec.outerRadius,
        arcSpec.startAngle,
        arcSpec.endAngle
      )
    });
  }
  // Fallback to the old method if it exists
  else if (coordSystem.createArcPath) {
    return coordSystem.createArcPath(startAngle, endAngle, innerRadius, outerRadius);
  }
  // If neither method exists, generate the path manually
  else {
    const origin = coordSystem.origin || { x: coordSystem.width / 2, y: coordSystem.height / 2 };

    // Calculate points
    const startOuter = {
      x: origin.x + outerRadius * Math.cos(startAngle),
      y: origin.y + outerRadius * Math.sin(startAngle)
    };

    const endOuter = {
      x: origin.x + outerRadius * Math.cos(endAngle),
      y: origin.y + outerRadius * Math.sin(endAngle)
    };

    // Determine arc flags
    const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;

    // Start building the path
    let path = `M ${startOuter.x} ${startOuter.y} `;

    // Add outer arc
    path += `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${endOuter.x} ${endOuter.y} `;

    if (innerRadius > 0) {
      // For donut arcs, add the inner arc
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
      // For pie slices, just go to the center
      path += `L ${origin.x} ${origin.y} `;
      path += 'Z';
    }

    return path;
  }
}

// Helper function to generate an arc path
function generateArcPath(
  centerX: number, centerY: number,
  innerRadius: number, outerRadius: number,
  startAngle: number, endAngle: number
): string {
  // Determine arc flags
  const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;

  // Calculate points
  const startOuter = {
    x: centerX + outerRadius * Math.cos(startAngle),
    y: centerY + outerRadius * Math.sin(startAngle)
  };

  const endOuter = {
    x: centerX + outerRadius * Math.cos(endAngle),
    y: centerY + outerRadius * Math.sin(endAngle)
  };

  // Start building the path
  let path = `M ${startOuter.x} ${startOuter.y} `;

  // Add outer arc
  path += `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${endOuter.x} ${endOuter.y} `;

  if (innerRadius > 0) {
    // For donut arcs, add the inner arc
    const endInner = {
      x: centerX + innerRadius * Math.cos(endAngle),
      y: centerY + innerRadius * Math.sin(endAngle)
    };

    const startInner = {
      x: centerX + innerRadius * Math.cos(startAngle),
      y: centerY + innerRadius * Math.sin(startAngle)
    };

    path += `L ${endInner.x} ${endInner.y} `;
    path += `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${startInner.x} ${startInner.y} `;
    path += 'Z';
  } else {
    // For pie slices, just go to the center
    path += `L ${centerX} ${centerY} `;
    path += 'Z';
  }

  return path;
}

// Calculate label position for a slice
export function calculateSliceLabelPosition(coordSystem: any, startAngle: number, endAngle: number, radius: number) {
  const midAngle = startAngle + (endAngle - startAngle) / 2;

  // Use toCartesian if available, fall back to toScreen for backward compatibility
  if (coordSystem.toCartesian) {
    return coordSystem.toCartesian({ angle: midAngle, radius: radius });
  } else if (coordSystem.toScreen) {
    return coordSystem.toScreen({ angle: midAngle, radius: radius });
  } else {
    // Manual calculation as a last resort
    const origin = coordSystem.origin || {
      x: coordSystem.width / 2,
      y: coordSystem.height / 2
    };

    return {
      x: origin.x + radius * Math.cos(midAngle),
      y: origin.y + radius * Math.sin(midAngle)
    };
  }
}

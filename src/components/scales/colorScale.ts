/**
 * Color Scale Component
 *
 * Purpose: Provides color scale functionality for mapping data values to colors
 * Author: Cody
 * Creation Date: 2023-12-22
 */

import { buildViz } from '../../core/builder';
import { registerDefineType } from '../../core/define';
import { Scale } from './scale-interface';
import * as d3 from 'd3-scale-chromatic';
import * as d3Color from 'd3-color';
import * as d3Interpolate from 'd3-interpolate';

// Make sure define type is registered
registerDefineType();

// Helper function to interpolate between two colors
function interpolateColor(color1: string, color2: string, t: number): string {
  try {
    // Parse the colors
    const c1 = d3Color.color(color1);
    const c2 = d3Color.color(color2);

    if (!c1 || !c2) {
      throw new Error('Invalid color');
    }

    // Interpolate between the colors
    const interpolator = d3Interpolate.interpolateRgb(c1, c2);
    return interpolator(t);
  } catch (e) {
    console.warn(`Error interpolating colors: ${e}`);
    return t < 0.5 ? color1 : color2;
  }
}

// Helper function to ensure a valid color string
function ensureValidColor(color: string): string {
  if (!color || typeof color !== 'string') {
    return '#000000';
  }

  try {
    const parsedColor = d3Color.color(color);
    return parsedColor ? parsedColor.toString() : '#000000';
  } catch (e) {
    return '#000000';
  }
}

// Define the colorScale component
export const colorScaleDefinition = {
  type: "define",
  name: "colorScale",
  properties: {
    mappingType: { default: 'linear' },
    domain: { required: true },
    range: { required: true },
    clamp: { default: false }
  },
  implementation: (props) => {
    const { mappingType, domain, range, clamp } = props;

    // Ensure the range contains valid colors
    const validRange = range.map(ensureValidColor);

    // Create the scale function
    const scaleFunc = (value: number) => {
      // Handle edge cases
      if (domain[0] === domain[1]) {
        return validRange[0];
      }

      // Normalize the value to [0, 1]
      let t = (value - domain[0]) / (domain[1] - domain[0]);

      // Apply clamping if specified
      if (clamp) {
        t = Math.max(0, Math.min(1, t));
      }

      // For two-color scales, interpolate directly
      if (validRange.length === 2) {
        return interpolateColor(validRange[0], validRange[1], t);
      }

      // For multi-color scales, find the appropriate segment
      const segments = validRange.length - 1;
      const segmentSize = 1 / segments;
      const segmentIndex = Math.min(Math.floor(t / segmentSize), segments - 1);
      const segmentT = (t - segmentIndex * segmentSize) / segmentSize;

      return interpolateColor(
        validRange[segmentIndex],
        validRange[segmentIndex + 1],
        segmentT
      );
    };

    // Create the scale object
    const scale: Scale = {
      domain,
      range: validRange,
      scale: scaleFunc,
      invert: (color) => {
        // Inversion is not well-defined for colors, but we can approximate
        // by finding the closest color in the range
        try {
          // This is a very simplified approach
          const targetColor = d3Color.color(color);
          if (!targetColor) {
            return domain[0];
          }

          // For two-color scales, we can do a simple linear interpolation
          if (validRange.length === 2) {
            const color1 = d3Color.color(validRange[0]);
            const color2 = d3Color.color(validRange[1]);

            if (!color1 || !color2) {
              return domain[0];
            }

            // Calculate distance to first color (very simplified)
            const dist1 = Math.sqrt(
              Math.pow(targetColor.r - color1.r, 2) +
              Math.pow(targetColor.g - color1.g, 2) +
              Math.pow(targetColor.b - color1.b, 2)
            );

            const dist2 = Math.sqrt(
              Math.pow(targetColor.r - color2.r, 2) +
              Math.pow(targetColor.g - color2.g, 2) +
              Math.pow(targetColor.b - color2.b, 2)
            );

            const t = dist1 / (dist1 + dist2);
            return domain[0] + t * (domain[1] - domain[0]);
          }

          // For multi-color scales, return the domain value at the midpoint
          return (domain[0] + domain[1]) / 2;
        } catch (e) {
          return domain[0];
        }
      },
      ticks: (count = 10) => {
        // Generate evenly spaced ticks in the domain
        const step = (domain[1] - domain[0]) / Math.max(1, count - 1);
        return Array.from({ length: count }, (_, i) => domain[0] + i * step);
      }
    };

    return scale;
  }
};

// Export a function to create a color scale directly
export function createColorScale(
  domain: [number, number],
  range: string[],
  options?: {
    mappingType?: string,
    clamp?: boolean
  }
): Scale {
  // Validate inputs
  if (!Array.isArray(domain) || domain.length !== 2) {
    throw new Error('Domain must be an array of two numbers');
  }

  if (!Array.isArray(range) || range.length < 2) {
    throw new Error('Range must be an array of at least two colors');
  }

  // Ensure all colors in the range are valid
  const validRange = range.map(ensureValidColor);

  return buildViz({
    type: 'colorScale',
    domain,
    range: validRange,
    mappingType: options?.mappingType || 'linear',
    clamp: options?.clamp || false
  }) as Scale;
}

// Register the colorScale component
export function registerColorScaleComponent() {
  buildViz(colorScaleDefinition);
  console.log('Color scale component registered');
}

// Auto-register when imported
registerColorScaleComponent();

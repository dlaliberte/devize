/**
 * Horizontal Line Primitive
 *
 * A line that spans the entire width of its container at a specific y-coordinate
 */

import { buildViz } from '../core/builder';
import { registerDefineType } from '../core/define';

// Make sure define type is registered
registerDefineType();

// Define the horizontalLine component
export const horizontalLineDefinition = {
  type: "define",
  name: "horizontalLine",
  properties: {
    y: { required: true },
    width: { default: '100%' },
    stroke: { default: '#000000' },
    strokeWidth: { default: 1 },
    strokeDasharray: { default: '' },
    opacity: { default: 1 }
  },
  validate: function(props: any) {
    if (props.y === undefined) {
      throw new Error('Y coordinate is required for horizontalLine');
    }
  },
  implementation: function(props: any) {
    const { y, width, stroke, strokeWidth, strokeDasharray, opacity } = props;

    // Create a line element
    return buildViz({
      type: 'path',
      d: `M 0 ${y} H ${width === '100%' ? '100%' : width}`,
      stroke,
      strokeWidth,
      strokeDasharray,
      opacity,
      fill: 'none'
    });
  }
};

// Register the horizontalLine component
buildViz(horizontalLineDefinition);

/**
 * Create a horizontal line
 */
export function createHorizontalLine(options: {
  y: number;
  width?: number | string;
  stroke?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  opacity?: number;
}) {
  return buildViz({
    type: 'horizontalLine',
    ...options
  });
}

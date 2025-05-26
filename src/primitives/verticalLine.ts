/**
 * Vertical Line Primitive
 *
 * A line that spans the entire height of its container at a specific x-coordinate
 */

import { buildViz } from '../core/builder';
import { registerDefineType } from '../core/define';

// Make sure define type is registered
registerDefineType();

// Define the verticalLine component
export const verticalLineDefinition = {
  type: "define",
  name: "verticalLine",
  properties: {
    x: { required: true },
    y1: { default: 0 },
    y2: { default: 100 },
    height: { default: '100%' },
    stroke: { default: '#000000' },
    strokeWidth: { default: 1 },
    strokeDasharray: { default: '' },
    opacity: { default: 1 }
  },
  validate: function(props: any) {
    if (props.x === undefined) {
      throw new Error('X coordinate is required for verticalLine');
    }
  },
  implementation: function(props: any) {
    const { x, y1, y2, height, stroke, strokeWidth, strokeDasharray, opacity } = props;

    // Create a line element
    return buildViz({
      type: 'line',
      x1: x, x2: x,
      y1, y2,
      stroke,
      strokeWidth,
      strokeDasharray,
      opacity,
      fill: 'none'
    });
  }
};

// Register the verticalLine component
buildViz(verticalLineDefinition);

/**
 * Create a vertical line
 */
export function createVerticalLine(options: {
  x: number;
  height?: number | string;
  stroke?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  opacity?: number;
}) {
  return buildViz({
    type: 'verticalLine',
    ...options
  });
}

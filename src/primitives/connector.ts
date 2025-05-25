/**
 * Connector Primitive
 *
 * Draws a connection (line or path) between two points
 */

import { buildViz } from '../core/builder';
import { registerDefineType } from '../core/define';

// Make sure define type is registered
registerDefineType();

// Define the connector component
export const connectorDefinition = {
  type: "define",
  name: "connector",
  properties: {
    x1: { required: true },
    y1: { required: true },
    x2: { required: true },
    y2: { required: true },
    type: { default: 'line' }, // 'line', 'path'
    stroke: { default: '#000000' },
    strokeWidth: { default: 1 },
    strokeDasharray: { default: '' },
    opacity: { default: 1 },
    curvature: { default: 0 } // 0-1, controls path curvature when type='path'
  },
  validate: function(props: any) {
    if (props.x1 === undefined || props.y1 === undefined ||
        props.x2 === undefined || props.y2 === undefined) {
      throw new Error('Both start (x1,y1) and end (x2,y2) coordinates are required for connector');
    }

    if (props.type !== 'line' && props.type !== 'path') {
      throw new Error('Connector type must be either "line" or "path"');
    }
  },
  implementation: function(props: any) {
    const { x1, y1, x2, y2, type, stroke, strokeWidth, strokeDasharray, opacity, curvature } = props;

    let d = '';

    if (type === 'line') {
      // Simple straight line
      d = `M ${x1} ${y1} L ${x2} ${y2}`;
    } else if (type === 'path') {
      // Curved path
      const dx = x2 - x1;
      const dy = y2 - y1;
      const cx = x1 + dx * 0.5;
      const cy = y1 + dy * 0.5;

      // Control point offset based on curvature
      const offset = Math.min(Math.abs(dx), Math.abs(dy)) * curvature;

      // Determine control points based on direction
      let cp1x, cp1y, cp2x, cp2y;

      if (Math.abs(dx) > Math.abs(dy)) {
        // More horizontal movement
        cp1x = x1 + dx / 3;
        cp1y = y1;
        cp2x = x2 - dx / 3;
        cp2y = y2;
      } else {
        // More vertical movement
        cp1x = x1;
        cp1y = y1 + dy / 3;
        cp2x = x2;
        cp2y = y2 - dy / 3;
      }

      d = `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`;
    }

    // Create a path element
    return buildViz({
      type: 'path',
      d,
      stroke,
      strokeWidth,
      strokeDasharray,
      opacity,
      fill: 'none'
    });
  }
};

// Register the connector component
buildViz(connectorDefinition);

/**
 * Create a connector between two points
 */
export function createConnector(options: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  type?: 'line' | 'path';
  stroke?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  opacity?: number;
  curvature?: number;
}) {
  return buildViz({
    type: 'connector',
    ...options
  });
}

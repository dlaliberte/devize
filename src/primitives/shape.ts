/**
 * Shape Primitive Component
 *
 * Purpose: Provides a versatile shape primitive that can render various shapes with different dimensions
 * Author: Devize Team
 * Creation Date: 2023-12-15
 */

import { buildViz } from '../core/builder';
import { registerDefineType } from '../core/define';
import { createRenderableVisualization } from '../core/componentUtils';

// Make sure define type is registered
registerDefineType();

// Define supported shape types
export type ShapeType = 'circle' | 'square' | 'triangle' | 'diamond' | 'cross' | 'star' | 'rect';

// Define the shape component
export const shapeDefinition = {
  type: "define",
  name: "shape",
  properties: {
    shape: { default: 'circle' },
    x: { default: 0 },
    y: { default: 0 },
    width: { default: 10 },
    height: { default: 10 },
    fill: { default: '#3366CC' },
    stroke: { default: '#FFFFFF' },
    strokeWidth: { default: 1 },
    rotation: { default: 0 },
    data: { default: null },
    tooltip: { default: false }
  },
  validate: function(props: any) {
    // Validate shape type
    const validShapes: ShapeType[] = ['circle', 'square', 'triangle', 'diamond', 'cross', 'star', 'rect'];
    if (!validShapes.includes(props.shape)) {
      throw new Error(`Invalid shape type: ${props.shape}. Must be one of: ${validShapes.join(', ')}`);
    }

    // Validate dimensions
    if (props.width <= 0 || props.height <= 0) {
      throw new Error('Width and height must be positive');
    }
  },
  implementation: function(props: any) {
    const {
      shape, x, y, width, height, fill, stroke, strokeWidth, rotation, data, tooltip
    } = props;

    // Generate the appropriate SVG element based on the shape type
    let element;

    if (shape === 'circle') {
      // For circle, use the average of width and height for the radius
      const radius = (width + height) / 4; // Divide by 4 because width/height are diameters
      element = {
        type: 'circle',
        cx: x,
        cy: y,
        r: radius,
        fill,
        stroke,
        strokeWidth,
        data,
        tooltip
      };
    } else if (shape === 'rect') {
      // For rectangle, use width and height directly
      element = {
        type: 'rect',
        x: x - width / 2,
        y: y - height / 2,
        width,
        height,
        fill,
        stroke,
        strokeWidth,
        data,
        tooltip
      };
    } else {
      // For other shapes, generate a path
      const pathData = getShapePath(shape, width, height);
      element = {
        type: 'path',
        d: pathData,
        transform: `translate(${x}, ${y}) rotate(${rotation})`,
        fill,
        stroke,
        strokeWidth,
        data,
        tooltip
      };
    }

    // Process the element specification to create a renderable visualization
    const renderableElement = buildViz(element);

    // Create and return a renderable visualization
    return createRenderableVisualization(
      'shape',
      props,
      // SVG rendering function - delegates to the element's renderToSvg
      (container: SVGElement): SVGElement => {
        if (renderableElement && renderableElement.renderToSvg) {
          return renderableElement.renderToSvg(container);
        }
        throw new Error('Failed to render SVG');
      },
      // Canvas rendering function - delegates to the element's renderToCanvas
      (ctx: CanvasRenderingContext2D): boolean => {
        if (renderableElement && renderableElement.renderToCanvas) {
          return renderableElement.renderToCanvas(ctx);
        }
        return false;
      }
    );
  }
};

/**
 * Register the rectangle primitive
 */
export function registerShapePrimitive() {
  // Make sure define type is registered
  registerDefineType();

  // Define the rectangle type using buildViz
  buildViz(shapeDefinition);
}

// Auto-register when this module is imported
registerShapePrimitive();


/**
 * Generate SVG path data for various shapes
 *
 * @param shape The shape type
 * @param width The width of the shape
 * @param height The height of the shape
 * @returns SVG path data string
 */
export function getShapePath(shape: ShapeType, width: number, height: number): string {
  const halfWidth = width / 2;
  const halfHeight = height / 2;

  switch (shape) {
    case 'square':
      return `M${-halfWidth},${-halfHeight}h${width}v${height}h${-width}z`;
    case 'triangle':
      return `M0,${-halfHeight}L${halfWidth},${halfHeight}L${-halfWidth},${halfHeight}z`;
    case 'diamond':
      return `M0,${-halfHeight}L${halfWidth},0L0,${halfHeight}L${-halfWidth},0z`;
    case 'cross':
      const thirdWidth = halfWidth / 1.5;
      const thirdHeight = halfHeight / 1.5;
      return `M${-thirdWidth},${-halfHeight}h${2*thirdWidth}v${halfHeight-thirdHeight}h${halfWidth-thirdWidth}v${2*thirdHeight}h${-halfWidth+thirdWidth}v${halfHeight-thirdHeight}h${-2*thirdWidth}v${-halfHeight+thirdHeight}h${-halfWidth+thirdWidth}v${-2*thirdHeight}h${halfWidth-thirdWidth}z`;
    case 'star':
      const outerRadiusX = halfWidth;
      const outerRadiusY = halfHeight;
      const innerRadiusX = halfWidth * 0.4;
      const innerRadiusY = halfHeight * 0.4;
      const points = 5;
      let path = `M${0},${-outerRadiusY}`;

      for (let i = 1; i < points * 2; i++) {
        const radius = i % 2 === 0 ?
          { x: outerRadiusX, y: outerRadiusY } :
          { x: innerRadiusX, y: innerRadiusY };
        const angle = (Math.PI * i) / points;
        const x = Math.sin(angle) * radius.x;
        const y = -Math.cos(angle) * radius.y;
        path += `L${x},${y}`;
      }

      return path + 'z';
    case 'rect':
      // This should be handled separately using the rect primitive
      return `M${-halfWidth},${-halfHeight}h${width}v${height}h${-width}z`;
    case 'circle':
      // This should be handled separately using the circle primitive
      return '';
    default:
      return ''; // Empty path for unknown shapes
  }
}

/**
 * Create a shape directly
 *
 * @param options Shape configuration options
 * @returns A renderable shape visualization
 */
export function createShape(options: {
  shape?: ShapeType,
  x?: number,
  y?: number,
  width?: number,
  height?: number,
  fill?: string,
  stroke?: string,
  strokeWidth?: number,
  rotation?: number,
  data?: any,
  tooltip?: boolean
}) {
  return buildViz({
    type: 'shape',
    shape: options.shape || 'star',
    x: options.x || 0,
    y: options.y || 0,
    width: options.width || 10,
    height: options.height || 10,
    fill: options.fill || '#3366CC',
    stroke: options.stroke || '#FFFFFF',
    strokeWidth: options.strokeWidth !== undefined ? options.strokeWidth : 1,
    rotation: options.rotation || 0,
    data: options.data || null,
    tooltip: options.tooltip || false
  });
}

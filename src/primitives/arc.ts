/**
 * Arc Primitive Implementation
 *
 * Purpose: Implements an arc primitive visualization using define
 * Author: Devize Team
 * Creation Date: 2023-12-10
 */

import { registerDefineType } from '../core/define';
import { buildViz } from '../core/builder';
import { createSVGElement, applyAttributes } from '../renderers/svgUtils';
import { createRenderableVisualization } from '../core/componentUtils';

// Arc type definition
export const arcTypeDefinition = {
  type: "define",
  name: "arc",
  properties: {
    centerX: { required: true },
    centerY: { required: true },
    innerRadius: { default: 0 },
    outerRadius: { required: true },
    startAngle: { default: 0 },
    endAngle: { default: Math.PI * 2 },
    cornerRadius: { default: 0 },
    padAngle: { default: 0 },
    fill: { default: "steelblue" },
    stroke: { default: "#fff" },
    strokeWidth: { default: 1 }
  },
  implementation: function(props) {
    // Extract properties
    const {
      centerX, centerY, innerRadius, outerRadius,
      startAngle, endAngle, cornerRadius, padAngle,
      fill, stroke, strokeWidth
    } = props;

    // Generate the arc path
    const path = generateArcPath(
      centerX, centerY, innerRadius, outerRadius,
      startAngle, endAngle, cornerRadius, padAngle
    );

    // Prepare attributes
    const attributes = {
      d: path,
      fill,
      stroke,
      'stroke-width': strokeWidth
    };

    // SVG rendering function
    const renderToSvg = (svg: SVGElement) => {
      // Create a path element with the correct namespace
      const element = createSVGElement('path');

      // Apply attributes
      applyAttributes(element, attributes);

      // Add to the SVG
      if (svg) {
        svg.appendChild(element);
      }

      return element;
    };

    // Canvas rendering function
    const renderToCanvas = (ctx: CanvasRenderingContext2D) => {
      const { d, fill, stroke, 'stroke-width': strokeWidth } = attributes;

      // Save the current context state
      ctx.save();

      try {
        // Create a new path
        ctx.beginPath();

        // Parse the SVG path data and draw to canvas
        const path = new Path2D(d);

        // Apply fill
        if (fill && fill !== 'none') {
          ctx.fillStyle = fill;
          ctx.fill(path);
        }

        // Apply stroke
        if (stroke && stroke !== 'none') {
          ctx.strokeStyle = stroke;
          ctx.lineWidth = strokeWidth;
          ctx.stroke(path);
        }
      } catch (error) {
        console.error('Error rendering arc:', error);
      }

      // Restore the context state
      ctx.restore();

      return true; // Indicate successful rendering
    };

    // Create and return a renderable visualization
    return createRenderableVisualization(
      'arc',
      props,
      renderToSvg,
      renderToCanvas
    );
  }
};

/**
 * Generate an SVG path for an arc
 */
function generateArcPath(
  centerX: number, centerY: number,
  innerRadius: number, outerRadius: number,
  startAngle: number, endAngle: number,
  cornerRadius: number = 0, padAngle: number = 0
): string {
  // Adjust angles for padding
  const effectiveStartAngle = startAngle;
  const effectiveEndAngle = endAngle - padAngle;

  // Calculate points
  const startOuter = {
    x: centerX + outerRadius * Math.cos(effectiveStartAngle),
    y: centerY + outerRadius * Math.sin(effectiveStartAngle)
  };

  const endOuter = {
    x: centerX + outerRadius * Math.cos(effectiveEndAngle),
    y: centerY + outerRadius * Math.sin(effectiveEndAngle)
  };

  // Determine arc flags
  const largeArcFlag = effectiveEndAngle - effectiveStartAngle > Math.PI ? 1 : 0;

  // Start building the path
  let path = `M ${startOuter.x} ${startOuter.y} `;

  // Add outer arc
  if (cornerRadius > 0) {
    // TODO: Implement corner radius for rounded corners
    // This requires more complex path calculations
    path += `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${endOuter.x} ${endOuter.y} `;
  } else {
    path += `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${endOuter.x} ${endOuter.y} `;
  }

  if (innerRadius > 0) {
    // For donut arcs, add the inner arc
    const endInner = {
      x: centerX + innerRadius * Math.cos(effectiveEndAngle),
      y: centerY + innerRadius * Math.sin(effectiveEndAngle)
    };

    const startInner = {
      x: centerX + innerRadius * Math.cos(effectiveStartAngle),
      y: centerY + innerRadius * Math.sin(effectiveStartAngle)
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

/**
 * Register the arc primitive
 */
export function registerArcPrimitive() {
  // Make sure define type is registered
  registerDefineType();

  // Define the arc type using buildViz
  buildViz(arcTypeDefinition);
}

// Auto-register when this module is imported
registerArcPrimitive();

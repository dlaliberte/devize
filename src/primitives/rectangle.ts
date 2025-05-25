/**
 * Rectangle Primitive Implementation
 *
 * Purpose: Implements the rectangle primitive visualization using define
 * Author: [Author Name]
 * Creation Date: [Date]
 * Last Modified: [Date]
 */

import { registerDefineType } from '../core/define';
import { buildViz } from '../core/builder';
import { createSVGElement, applyAttributes } from '../renderers/svgUtils';
import { RenderableVisualization, VisualizationSpec } from '../core/types';
import { createRenderableVisualization, createRenderableVisualizationEnhanced } from '../core/componentUtils';

// Rectangle type definition
export const rectangleTypeDefinition = {
  type: "define",
  name: "rectangle",
  properties: {
    x: { default: 0 },
    y: { default: 0 },
    width: { required: true },
    height: { required: true },
    fill: { default: "none" },
    stroke: { default: "black" },
    strokeWidth: { default: 1 },
    cornerRadius: { default: 0 }
  },
  implementation: props => {
    // Validation
    if (props.width <= 0 || props.height <= 0) {
      throw new Error('Rectangle width and height must be positive');
    }

    // Prepare attributes
    const attributes = {
      x: props.x,
      y: props.y,
      width: props.width,
      height: props.height,
      fill: props.fill,
      stroke: props.stroke,
      'stroke-width': props.strokeWidth,
      rx: props.cornerRadius,
      ry: props.cornerRadius
    };

    // SVG rendering function
    const renderToSvg = (svg: SVGElement) => {
      console.log('Rendering rectangle to SVG:', svg);

      // Create a rectangle element with the correct namespace
      const rect = createSVGElement('rect');

      // Apply attributes
      console.log('Applying attributes to rectangle:', attributes);

      // Explicitly set each attribute to ensure they're applied correctly
      rect.setAttribute('x', attributes.x.toString());
      rect.setAttribute('y', attributes.y.toString());
      rect.setAttribute('width', attributes.width.toString());
      rect.setAttribute('height', attributes.height.toString());
      rect.setAttribute('fill', attributes.fill.toString());
      rect.setAttribute('stroke', attributes.stroke.toString());
      rect.setAttribute('stroke-width', attributes['stroke-width'].toString());
      rect.setAttribute('rx', attributes.rx.toString());
      rect.setAttribute('ry', attributes.ry.toString());

      // Add to the SVG
      if (svg) {
        svg.appendChild(rect);
        console.log('Appended rectangle to SVG, resulting SVG:', svg.outerHTML);
      }

      return rect;
    };

    // Canvas rendering function
    const renderToCanvas = (ctx: CanvasRenderingContext2D) => {
      const { x, y, width, height, fill, stroke, 'stroke-width': strokeWidth, rx: cornerRadius } = attributes;

      ctx.beginPath();

      if (cornerRadius > 0) {
        // Draw rounded rectangle
        ctx.moveTo(x + cornerRadius, y);
        ctx.lineTo(x + width - cornerRadius, y);
        ctx.arcTo(x + width, y, x + width, y + cornerRadius, cornerRadius);
        ctx.lineTo(x + width, y + height - cornerRadius);
        ctx.arcTo(x + width, y + height, x + width - cornerRadius, y + height, cornerRadius);
        ctx.lineTo(x + cornerRadius, y + height);
        ctx.arcTo(x, y + height, x, y + height - cornerRadius, cornerRadius);
        ctx.lineTo(x, y + cornerRadius);
        ctx.arcTo(x, y, x + cornerRadius, y, cornerRadius);
      } else {
        // Draw regular rectangle
        ctx.rect(x, y, width, height);
      }

      if (fill !== 'none') {
        ctx.fillStyle = fill;
        ctx.fill();
      }

      if (stroke !== 'none') {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = strokeWidth;
        ctx.stroke();
      }

      return true; // Indicate successful rendering
    };

    // HTML rendering function
    const renderToHtml = (container?: HTMLElement) => {
      // Create a div element for the rectangle
      const rectElement = document.createElement('div');

      // Apply styles to make it look like a rectangle
      rectElement.style.position = 'absolute';
      rectElement.style.left = `${attributes.x}px`;
      rectElement.style.top = `${attributes.y}px`;
      rectElement.style.width = `${attributes.width}px`;
      rectElement.style.height = `${attributes.height}px`;
      rectElement.style.backgroundColor = attributes.fill !== 'none' ? attributes.fill : 'transparent';

      // Apply border (stroke)
      if (attributes.stroke !== 'none') {
        rectElement.style.border = `${attributes['stroke-width']}px solid ${attributes.stroke}`;
      }

      // Apply corner radius
      if (attributes.rx > 0) {
        rectElement.style.borderRadius = `${attributes.rx}px`;
      }

      // Add to container if provided
      if (container) {
        container.appendChild(rectElement);
      }

      return rectElement;
    };

    // Create and return a renderable visualization using the utility function
    return createRenderableVisualizationEnhanced('rectangle', props, { renderToSvg, renderToCanvas, renderToHtml });
  }
};

/**
 * Register the rectangle primitive
 */
export function registerRectanglePrimitive() {
  // Make sure define type is registered
  registerDefineType();

  // Define the rectangle type using buildViz
  buildViz(rectangleTypeDefinition);
}

// Auto-register when this module is imported
registerRectanglePrimitive();

/**
 * References:
 * - Related File: src/core/define.ts
 * - Related File: src/core/registry.ts
 * - Related File: src/core/builder.ts
 * - Related File: src/core/devize.ts
 * - Related File: src/renderers/svgUtils.ts
 * - Related File: src/primitives/circle.ts
 * - Design Document: design/define.md
 * - Design Document: design/primitives.md
 * - Design Document: design/rendering.md
 * - User Documentation: docs/primitives/shapes.md
 * - Test Cases: src/primitives/rectangle.test.ts
 */

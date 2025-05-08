/**
 * Layer Primitive Implementation
 *
 * Purpose: Implements the layer container primitive using define
 * Author: [Author Name]
 * Creation Date: [Date]
 * Last Modified: [Date]
 */

import { buildViz } from '../core/builder';
import { registerDefineType } from '../core/define';
import { getType } from '../core/registry';

// Export a function to register the layer type
export function registerLayerType() {
  // Make sure define type is registered
  registerDefineType();

  // Define the layer visualization type
  buildViz({
    type: "define",
    name: "layer",
    properties: {
      x: { default: 0 },
      y: { default: 0 },
      opacity: { default: 1 },
      zIndex: { default: 0 },
      children: { default: [] }
    },
    implementation: props => {
      // Ensure numeric values
      const x = Number(props.x) || 0;
      const y = Number(props.y) || 0;
      const opacity = Number(props.opacity) || 1;
      const zIndex = Number(props.zIndex) || 0;

      // Process all children
      const processedChildren = Array.isArray(props.children)
        ? props.children.map(child => {
            // If child is a string or number, convert to a text node
            if (typeof child === 'string' || typeof child === 'number') {
              return {
                type: 'text',
                text: child.toString(),
                x: 0,
                y: 0
              };
            }

            // Process child if it's a specification
            if (child && typeof child === 'object' && 'type' in child) {
              const childType = getType(child.type);
              if (childType) {
                return childType.decompose(child, {});
              }
            }

            return child;
          })
        : [];

      return {
        _renderType: "layer",
        attributes: {
          transform: `translate(${x}, ${y})`,
          opacity,
          style: zIndex !== 0 ? `z-index: ${zIndex}` : undefined
        },
        children: processedChildren,

        renderSVG: container => {
          const group = document.createElementNS("http://www.w3.org/2000/svg", "g");

          // Apply attributes
          group.setAttribute('transform', `translate(${x}, ${y})`);

          if (opacity !== 1) {
            group.setAttribute('opacity', opacity.toString());
          }

          // Set z-index via CSS
          if (zIndex !== 0) {
            group.style.zIndex = zIndex.toString();
          }

          // Render children
          processedChildren.forEach(child => {
            if (child && typeof child === 'object' && 'renderSVG' in child) {
              child.renderSVG(group);
            }
          });

          if (container) {
            container.appendChild(group);
          }

          return group;
        },
        renderCanvas: ctx => {
          // Canvas doesn't have z-index, so we just render in order
          // Save the current context state
          ctx.save();

          // Apply transform
          ctx.translate(x, y);

          // Apply opacity
          if (opacity !== 1 && typeof ctx.globalAlpha !== 'undefined') {
            const originalAlpha = ctx.globalAlpha || 1;
            ctx.globalAlpha = originalAlpha * opacity;
          }

          // Render all children in this context
          processedChildren.forEach(child => {
            if (child && typeof child === 'object' && 'renderCanvas' in child) {
              child.renderCanvas(ctx);
            }
          });

          // Restore the context state
          ctx.restore();

          return true;
        }
      };
    }
  });
}

// Auto-register when imported
registerLayerType();

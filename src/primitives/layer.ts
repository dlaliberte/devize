/**
 * Group Primitive Implementation
 *
 * Purpose: Implements the group container primitive using define
 * Author: [Author Name]
 * Creation Date: [Date]
 * Last Modified: [Date]
 */

import { createViz } from '../core/devize';
import { createSVGElement } from '../renderers/svgUtils';
import { processVisualization } from '../core/processor';


// Layer container (similar to group but with z-index)
createViz({
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
      // Process children
      const processedChildren = Array.isArray(props.children)
        ? props.children.map(child => {
            // If child is a string, convert to text
            if (typeof child === 'string' || typeof child === 'number') {
              return {
                type: 'text',
                text: String(child)
              };
            }
            return child;
          })
        : [];

      return {
        _renderType: "layer",
        children: processedChildren,
        renderSVG: container => {
          const group = document.createElementNS("http://www.w3.org/2000/svg", "g");

          // Apply attributes
          group.setAttribute('transform', `translate(${props.x}, ${props.y})`);

          if (props.opacity !== 1) {
            group.setAttribute('opacity', props.opacity);
          }

          // Set z-index via CSS
          if (props.zIndex !== 0) {
            group.style.zIndex = props.zIndex.toString();
          }

          // Render children
          processedChildren.forEach(child => {
            if (child.renderSVG) {
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
          ctx.translate(props.x, props.y);

          // Apply opacity
          if (props.opacity !== 1) {
            ctx.globalAlpha = props.opacity;
          }

          // Render all children in this context
          processedChildren.forEach(child => {
            if (child.renderCanvas) {
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

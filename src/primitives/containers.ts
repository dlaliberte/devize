// Container primitives
import { VizSpec, VizInstance } from '../core/types';
import { createViz } from '../core/devize';

// Define container primitives
export function defineContainerPrimitives() {
  // Define group primitive
  createViz({
    type: "define",
    name: "group",
    properties: {
      transform: { default: "" },
      children: { default: [] }
    },
    implementation: props => {
      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      if (props.transform) {
        group.setAttribute('transform', props.transform);
      }

      // Process children
      const children = Array.isArray(props.children) ? props.children : [props.children];

      children.forEach(child => {
        if (child) {
          // Create the child visualization element
          const childInstance = createViz(child);

          // Append child element to group
          if (childInstance.element) {
            group.appendChild(childInstance.element);
          }
        }
      });

      return {
        element: group,
        spec: props
      };
    }
  });
}

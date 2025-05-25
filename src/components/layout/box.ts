/**
 * Box Layout Component
 *
 * Purpose: Provides flexbox-style layout component for consistent positioning
 * Author: Cody
 * Creation Date: 2023-11-19
 * Updated: 2023-12-21
 */

import { buildViz } from '../../core/builder';
import { registerDefineType } from '../../core/define';
import { createRenderableVisualizationEnhanced } from '../../core/componentUtils';

// Make sure define type is registered
registerDefineType();

// Box properties
const boxProperties = {
  children: { required: true },
  class: { default: '' },  // Space-separated list of class names
  spacing: { default: 0 }, // gap between items
  padding: { default: 0 }, // padding around items
  position: { default: { x: 0, y: 0 } },
  width: { default: null },
  height: { default: null },
};

// Box validation
const boxValidate = function(props) {
  // Validate children is an array
  if (!Array.isArray(props.children)) {
    throw new Error('Box children must be an array');
  }

  // Validate padding
  if (typeof props.padding !== 'number' && typeof props.padding !== 'object') {
    throw new Error('Padding must be a number or an object with top, right, bottom, left properties');
  }

  // Validate spacing
  if (typeof props.spacing !== 'number') {
    throw new Error('Spacing must be a number');
  }
};

/**
 * Maps class names to CSS styles for flexbox
 */
function getFlexboxStyles(classes: string[]): Record<string, string> {
  const styles: Record<string, string> = {
    display: 'flex',
  };

  // Direction
  if (classes.includes('vertical')) {
    styles.flexDirection = classes.includes('reverse') ? 'column-reverse' : 'column';
  } else {
    // Default to horizontal
    styles.flexDirection = classes.includes('reverse') ? 'row-reverse' : 'row';
  }

  // Wrapping
  if (classes.includes('wrap')) {
    styles.flexWrap = 'wrap';
  }

  // Horizontal alignment for items
  const isHorizontal = !classes.includes('vertical');
  const mainAxisProp = isHorizontal ? 'justifyContent' : 'alignItems';
  const crossAxisProp = isHorizontal ? 'alignItems' : 'justifyContent';

  // Main axis alignment (horizontal in row, vertical in column)
  if (classes.includes('items-halign-center') && isHorizontal) {
    styles[mainAxisProp] = 'center';
  } else if (classes.includes('items-valign-center') && !isHorizontal) {
    styles[mainAxisProp] = 'center';
  } else if (classes.includes('items-halign-end') && isHorizontal) {
    styles[mainAxisProp] = 'flex-end';
  } else if (classes.includes('items-valign-end') && !isHorizontal) {
    styles[mainAxisProp] = 'flex-end';
  } else if (classes.includes('items-halign-space-between') && isHorizontal) {
    styles[mainAxisProp] = 'space-between';
  } else if (classes.includes('items-valign-space-between') && !isHorizontal) {
    styles[mainAxisProp] = 'space-between';
  } else if (classes.includes('items-halign-space-around') && isHorizontal) {
    styles[mainAxisProp] = 'space-around';
  } else if (classes.includes('items-valign-space-around') && !isHorizontal) {
    styles[mainAxisProp] = 'space-around';
  } else if (classes.includes('items-halign-space-evenly') && isHorizontal) {
    styles[mainAxisProp] = 'space-evenly';
  } else if (classes.includes('items-valign-space-evenly') && !isHorizontal) {
    styles[mainAxisProp] = 'space-evenly';
  } else if (classes.includes('items-halign-start') && isHorizontal) {
    styles[mainAxisProp] = 'flex-start';
  } else if (classes.includes('items-valign-start') && !isHorizontal) {
    styles[mainAxisProp] = 'flex-start';
  }

  // Cross axis alignment (vertical in row, horizontal in column)
  if (classes.includes('items-valign-center') && isHorizontal) {
    styles[crossAxisProp] = 'center';
  } else if (classes.includes('items-halign-center') && !isHorizontal) {
    styles[crossAxisProp] = 'center';
  } else if (classes.includes('items-valign-end') && isHorizontal) {
    styles[crossAxisProp] = 'flex-end';
  } else if (classes.includes('items-halign-end') && !isHorizontal) {
    styles[crossAxisProp] = 'flex-end';
  } else if (classes.includes('items-valign-start') && isHorizontal) {
    styles[crossAxisProp] = 'flex-start';
  } else if (classes.includes('items-halign-start') && !isHorizontal) {
    styles[crossAxisProp] = 'flex-start';
  } else if (classes.includes('items-valign-stretch') && isHorizontal) {
    styles[crossAxisProp] = 'stretch';
  } else if (classes.includes('items-halign-stretch') && !isHorizontal) {
    styles[crossAxisProp] = 'stretch';
  }

  return styles;
}

/**
 * Applies styles to an HTML element
 */
function applyStyles(element: HTMLElement, styles: Record<string, string | number>): void {
  Object.entries(styles).forEach(([property, value]) => {
    element.style[property] = value.toString();
  });
}

/**
 * Calculates padding CSS based on the padding property
 */
function getPaddingStyles(padding: number | { top: number, right: number, bottom: number, left: number }): Record<string, string> {
  if (typeof padding === 'number') {
    return { padding: `${padding}px` };
  } else {
    return {
      paddingTop: `${padding.top || 0}px`,
      paddingRight: `${padding.right || 0}px`,
      paddingBottom: `${padding.bottom || 0}px`,
      paddingLeft: `${padding.left || 0}px`
    };
  }
}

// Define the box component
export const boxDefinition = {
  type: "define",
  name: "box",
  properties: boxProperties,
  validate: boxValidate,
  implementation: function (props) {
    const {
      children,
      class: className = '',
      spacing = 0,
      padding = 0,
      position = { x: 0, y: 0 },
      width = null,
      height = null
    } = props;

    // Create a renderable visualization
    return createRenderableVisualizationEnhanced(
      'box',
      props,
      {
        renderToSvg: null, // Not implemented yet
        renderToCanvas: null, // Not implemented yet
        renderToHtml: (container) => {
          // Create the box container element
          const boxElement = document.createElement('div');

          // Add classes
          boxElement.classList.add('box');
          if (className) {
            className.split(' ').forEach(cls => {
              if (cls) boxElement.classList.add(cls);
            });
          }

          // Parse classes for styling
          const classes = ['box', ...(className ? className.split(' ') : [])];

          // Apply flexbox styles based on classes
          const flexStyles = getFlexboxStyles(classes);
          applyStyles(boxElement, flexStyles);

          // Apply spacing (gap)
          if (spacing > 0) {
            boxElement.style.gap = `${spacing}px`;
          }

          // Apply padding
          const paddingStyles = getPaddingStyles(padding);
          applyStyles(boxElement, paddingStyles);

          // Apply position
          if (position) {
            boxElement.style.position = 'absolute';
            boxElement.style.left = `${position.x}px`;
            boxElement.style.top = `${position.y}px`;
          }

          // Apply dimensions if specified
          if (width !== null) {
            boxElement.style.width = typeof width === 'number' ? `${width}px` : width;
          }

          if (height !== null) {
            boxElement.style.height = typeof height === 'number' ? `${height}px` : height;
          }

          // Render children
          children.forEach(child => {
            if (child.renderToHtml) {
              const childElement = child.renderToHtml();
              if (childElement) {
                boxElement.appendChild(childElement);
              }
            } else if (typeof child === 'string') {
              // Handle text nodes
              boxElement.appendChild(document.createTextNode(child));
            } else {
              console.warn('Child does not have renderToHtml method:', child);
            }
          });

          // Add the box to the container if provided
          if (container) {
            container.appendChild(boxElement);
          }

          return boxElement;
        }
      }
    );
  }
};

// Create and register the Box component
export function createBox(options: {
  children: any[],
  class?: string,
  spacing?: number,
  padding?: number | { top: number, right: number, bottom: number, left: number },
  position?: { x: number, y: number },
  width?: number | string,
  height?: number | string
}) {
  return buildViz({
    type: 'box',
    ...options
  });
}

export function registerBoxComponent() {
  // Make sure define type is registered
  registerDefineType();

  // Register the box component with the builder
  buildViz(boxDefinition);

  console.log('Box layout component registered');
}

registerBoxComponent();

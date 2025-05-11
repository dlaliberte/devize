/**
 * Box Layout Components
 *
 * Purpose: Provides flexbox-style layout components for consistent positioning
 * Author: Cody
 * Creation Date: 2023-11-19
 */

import { buildViz } from '../../core/builder';
import { registerDefineType } from '../../core/define';
import { createRenderableVisualization } from '../../core/componentUtils';

// Import required primitives
import '../../primitives/group';

// Make sure define type is registered
registerDefineType();

// Common box properties
const boxProperties = {
  children: { required: true },
  spacing: { default: 0 },
  padding: { default: 0 },
  halign: { default: 'start' }, // start, center, end, space-between, space-around, space-evenly
  valign: { default: 'start' }, // start, center, end, stretch
  wrap: { default: false },
  reverse: { default: false },
  position: { default: { x: 0, y: 0 } },
  transform: { default: '' },
  width: { default: null },
  height: { default: null },
  class: { default: '' }
};

// Common box validation
const boxValidate = function(props) {
  // Validate children is an array
  if (!Array.isArray(props.children)) {
    throw new Error('Box children must be an array');
  }

  // Validate valign
  const validValigns = ['start', 'center', 'end', 'stretch'];
  if (!validValigns.includes(props.valign)) {
    throw new Error(`Invalid valign: ${props.valign}. Must be one of: ${validValigns.join(', ')}`);
  }

  // Validate halign
  const validHaligns = ['start', 'center', 'end', 'space-between', 'space-around', 'space-evenly'];
  if (!validHaligns.includes(props.halign)) {
    throw new Error(`Invalid halign: ${props.halign}. Must be one of: ${validHaligns.join(', ')}`);
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

// Define the HBox component (horizontal layout)
export const hboxDefinition = {
  type: "define",
  name: "hbox",
  properties: boxProperties,
  validate: boxValidate,
  implementation: function(props) {
    const {
      children,
      spacing,
      padding,
      valign, // Cross-axis alignment (vertical for HBox)
      halign, // Main-axis alignment (horizontal for HBox)
      wrap,
      reverse,
      position,
      transform,
      width,
      height,
      class: className
    } = props;

    // Get position coordinates
    let posX = 0;
    let posY = 0;

    if (position && typeof position === 'object') {
      posX = position.x || 0;
      posY = position.y || 0;
    } else if (transform) {
      // Try to extract position from transform attribute if provided
      const translateMatch = transform.match(/translate\(([^,]+),([^)]+)\)/);
      if (translateMatch) {
        posX = parseFloat(translateMatch[1]);
        posY = parseFloat(translateMatch[2]);
      }
    }

    // Calculate padding
    let paddingTop = 0;
    let paddingRight = 0;
    let paddingBottom = 0;
    let paddingLeft = 0;

    if (typeof padding === 'number') {
      paddingTop = paddingRight = paddingBottom = paddingLeft = padding;
    } else if (padding && typeof padding === 'object') {
      paddingTop = padding.top || 0;
      paddingRight = padding.right || 0;
      paddingBottom = padding.bottom || 0;
      paddingLeft = padding.left || 0;
    }

    // Calculate layout for children
    const childElements = [];
    let currentX = paddingLeft;
    let currentY = paddingTop;
    let rowHeight = 0;
    let rowStartIndex = 0;
    let maxRowWidth = 0;
    let totalHeight = 0;

    // First pass: measure children and calculate positions
    children.forEach((child, index) => {
      // Clone the child to avoid modifying the original
      const childClone = { ...child };

      // Add to our list
      childElements.push(childClone);

      // Get child dimensions (if available)
      const childWidth = childClone.width || 0;
      const childHeight = childClone.height || 0;

      // Update row height
      rowHeight = Math.max(rowHeight, childHeight);

      // If wrapping and we would exceed the width, start a new row
      if (wrap && width && currentX + childWidth > width - paddingRight && index > rowStartIndex) {
        // Position children in the current row based on alignment
        positionRowChildren(
          childElements,
          rowStartIndex,
          index - 1,
          paddingLeft,
          width - paddingRight,
          rowHeight,
          valign, // Cross-axis alignment (vertical)
          halign, // Main-axis alignment (horizontal)
          reverse
        );

        // Update max row width
        maxRowWidth = Math.max(maxRowWidth, currentX);

        // Move to the next row
        currentY += rowHeight + spacing;
        totalHeight += rowHeight + spacing;

        // Start a new row
        currentX = paddingLeft;
        rowStartIndex = index;
        rowHeight = childHeight;
      }

      // Update current X position for the next child
      currentX += childWidth + spacing;
    });

    // Position the last row
    if (rowStartIndex < children.length) {
      positionRowChildren(
        childElements,
        rowStartIndex,
        children.length - 1,
        paddingLeft,
        width ? width - paddingRight : currentX - spacing,
        rowHeight,
        valign, // Cross-axis alignment (vertical)
        halign, // Main-axis alignment (horizontal)
        reverse
      );

      // Update total height
      totalHeight += rowHeight;

      // Update max row width
      maxRowWidth = Math.max(maxRowWidth, currentX);
    }

    // Apply Y offset to all children based on their row
    if (wrap) {
      for (let i = 0; i < rowStartIndex; i++) {
        const child = childElements[i];
        // Add the Y offset for the row this child belongs to
        let rowOffset = 0;
        let currentRowStart = 0;

        // Find which row this child belongs to
        for (let j = 0; j < children.length; j++) {
          if (j > 0 && childElements[j].y === paddingTop) {
            // This is the start of a new row
            if (i < j) break; // Found the row
            currentRowStart = j;
            rowOffset += childElements[currentRowStart - 1].height + spacing;
          }
        }

        // Apply the offset
        child.y += rowOffset;
      }
    }

    // Create the group specification
    const groupSpec = {
      type: 'group',
      transform: `translate(${posX},${posY})`,
      class: `hbox ${className}`,
      children: [
        // Add background rectangle to visualize container bounds
        {
          type: 'rectangle',
          x: 0,
          y: 0,
          width: width || maxRowWidth - spacing,
          height: height || (wrap ? totalHeight : rowHeight),
          fill: 'rgba(240, 240, 240, 0.5)',
          stroke: 'none',
          rx: 2,
          ry: 2
        },
        ...childElements
      ]
    };

    // Process the group specification to create a renderable visualization
    const renderableGroup = buildViz(groupSpec);

    // Create and return a renderable visualization
    return createRenderableVisualization(
      'hbox',
      props,
      // SVG rendering function - delegates to the group's renderToSvg
      (container) => {
        if (renderableGroup && renderableGroup.renderToSvg) {
          const element = renderableGroup.renderToSvg(container);
          // Ensure the class is set on the SVG element
          if (element) {
            element.classList.add('hbox');
            if (className) {
              element.classList.add(className);
            }
          }
          return element;
        }
        return null;
      },
      // Canvas rendering function - delegates to the group's renderToCanvas
      (ctx) => {
        if (renderableGroup && renderableGroup.renderToCanvas) {
          return renderableGroup.renderToCanvas(ctx);
        }
        return false;
      }
    );
  }
};

// Define the VBox component (vertical layout)
export const vboxDefinition = {
  type: "define",
  name: "vbox",
  properties: boxProperties,
  validate: boxValidate,
  implementation: function(props) {
    const {
      children,
      spacing,
      padding,
      halign, // Cross-axis alignment (horizontal for VBox)
      valign, // Main-axis alignment (vertical for VBox)
      wrap,
      reverse,
      position,
      transform,
      width,
      height,
      class: className
    } = props;

    // Get position coordinates
    let posX = 0;
    let posY = 0;

    if (position && typeof position === 'object') {
      posX = position.x || 0;
      posY = position.y || 0;
    } else if (transform) {
      // Try to extract position from transform attribute if provided
      const translateMatch = transform.match(/translate\(([^,]+),([^)]+)\)/);
      if (translateMatch) {
        posX = parseFloat(translateMatch[1]);
        posY = parseFloat(translateMatch[2]);
      }
    }

    // Calculate padding
    let paddingTop = 0;
    let paddingRight = 0;
    let paddingBottom = 0;
    let paddingLeft = 0;

    if (typeof padding === 'number') {
      paddingTop = paddingRight = paddingBottom = paddingLeft = padding;
    } else if (padding && typeof padding === 'object') {
      paddingTop = padding.top || 0;
      paddingRight = padding.right || 0;
      paddingBottom = padding.bottom || 0;
      paddingLeft = padding.left || 0;
    }

    // Calculate layout for children
    const childElements = [];
    let currentX = paddingLeft;
    let currentY = paddingTop;
    let columnWidth = 0;
    let columnStartIndex = 0;
    let maxColumnHeight = 0;
    let totalWidth = 0;

    // First pass: measure children and calculate positions
    children.forEach((child, index) => {
      // Clone the child to avoid modifying the original
      const childClone = { ...child };

      // Add to our list
      childElements.push(childClone);

      // Get child dimensions (if available)
      const childWidth = childClone.width || 0;
      const childHeight = childClone.height || 0;

      // Update column width
      columnWidth = Math.max(columnWidth, childWidth);

      // If wrapping and we would exceed the height, start a new column
      if (wrap && height && currentY + childHeight > height - paddingBottom && index > columnStartIndex) {
        // Position children in the current column based on alignment
        positionColumnChildren(
          childElements,
          columnStartIndex,
          index - 1,
          paddingTop,
          height - paddingBottom,
          columnWidth,
          halign, // Cross-axis alignment (horizontal)
          valign, // Main-axis alignment (vertical)
          reverse
        );

        // Update max column height
        maxColumnHeight = Math.max(maxColumnHeight, currentY);

        // Move to the next column
        currentX += columnWidth + spacing;
        totalWidth += columnWidth + spacing;

        // Start a new column
        currentY = paddingTop;
        columnStartIndex = index;
        columnWidth = childWidth;
      }

      // Update current Y position for the next child
      currentY += childHeight + spacing;
    });

    // Position the last column
    if (columnStartIndex < children.length) {
      positionColumnChildren(
        childElements,
        columnStartIndex,
        children.length - 1,
        paddingTop,
        height ? height - paddingBottom : currentY - spacing,
        columnWidth,
        halign, // Cross-axis alignment (horizontal)
        valign, // Main-axis alignment (vertical)
        reverse
      );

      // Update total width
      totalWidth += columnWidth;

      // Update max column height
      maxColumnHeight = Math.max(maxColumnHeight, currentY);
    }

    // Apply X offset to all children based on their column
    if (wrap) {
      for (let i = 0; i < columnStartIndex; i++) {
        const child = childElements[i];
        // Add the X offset for the column this child belongs to
        let columnOffset = 0;
        let currentColumnStart = 0;

        // Find which column this child belongs to
        for (let j = 0; j < children.length; j++) {
          if (j > 0 && childElements[j].x === paddingLeft) {
            // This is the start of a new column
            if (i < j) break; // Found the column
            currentColumnStart = j;
            columnOffset += childElements[currentColumnStart - 1].width + spacing;
          }
        }

        // Apply the offset
        child.x += columnOffset;
      }
    }

    // Create the group specification
    const groupSpec = {
      type: 'group',
      transform: `translate(${posX},${posY})`,
      class: `vbox ${className}`,
      children: [
        // Add background rectangle to visualize container bounds
        {
          type: 'rectangle',
          x: 0,
          y: 0,
          width: width || (wrap ? totalWidth : columnWidth),
          height: height || maxColumnHeight - spacing,
          fill: 'rgba(240, 240, 240, 0.5)',
          stroke: 'none',
          rx: 2,
          ry: 2
        },
        ...childElements
      ]
    };

    // Process the group specification to create a renderable visualization
    const renderableGroup = buildViz(groupSpec);

    // Create and return a renderable visualization
    return createRenderableVisualization(
      'vbox',
      props,
      // SVG rendering function - delegates to the group's renderToSvg
      (container) => {
        if (renderableGroup && renderableGroup.renderToSvg) {
          const element = renderableGroup.renderToSvg(container);
          // Ensure the class is set on the SVG element
          if (element) {
            element.classList.add('vbox');
            if (className) {
              element.classList.add(className);
            }
          }
          return element;
        }
        return null;
      },
      // Canvas rendering function - delegates to the group's renderToCanvas
      (ctx) => {
        if (renderableGroup && renderableGroup.renderToCanvas) {
          return renderableGroup.renderToCanvas(ctx);
        }
        return false;
      }
    );
  }
};

// Helper function to position children in a row
function positionRowChildren(
  children,
  startIndex,
  endIndex,
  startX,
  endX,
  rowHeight,
  valign, // Cross-axis alignment (vertical)
  halign, // Main-axis alignment (horizontal)
  reverse
) {
  const rowChildren = children.slice(startIndex, endIndex + 1);
  const totalWidth = rowChildren.reduce((sum, child) => sum + (child.width || 0), 0);
  const availableSpace = endX - startX;
  const extraSpace = Math.max(0, availableSpace - totalWidth);

  // Calculate spacing based on justify
  let spacing = 0;
  let initialOffset = 0;

  if (halign === 'center') {
    initialOffset = extraSpace / 2;
  } else if (halign === 'end') {
    initialOffset = extraSpace;
  } else if (halign === 'space-between' && rowChildren.length > 1) {
    spacing = extraSpace / (rowChildren.length - 1);
  } else if (halign === 'space-around' && rowChildren.length > 0) {
    spacing = extraSpace / rowChildren.length;
    initialOffset = spacing / 2;
  } else if (halign === 'space-evenly' && rowChildren.length > 0) {
    spacing = extraSpace / (rowChildren.length + 1);
    initialOffset = spacing;
  }

  // Position children
  let currentX = startX + initialOffset;

  // If reverse, we need to position from right to left
  if (reverse) {
    rowChildren.reverse();
  }

  rowChildren.forEach((child) => {
    // Set x position
    child.x = currentX;

    // Set y position based on alignment
    if (valign === 'center') {
      child.y = (rowHeight - (child.height || 0)) / 2;
    } else if (valign === 'end') {
      child.y = rowHeight - (child.height || 0);
    } else if (valign === 'stretch') {
      child.height = rowHeight;
      child.y = 0;
    } else {
      // Default to start
      child.y = 0;
    }

    // Update current X position for the next child
    currentX += (child.width || 0) + spacing;
  });
}

// Helper function to position children in a column
function positionColumnChildren(
  children,
  startIndex,
  endIndex,
  startY,
  endY,
  columnWidth,
  halign, // Cross-axis alignment (horizontal)
  valign, // Main-axis alignment (vertical)
  reverse
) {
  const columnChildren = children.slice(startIndex, endIndex + 1);
  const totalHeight = columnChildren.reduce((sum, child) => sum + (child.height || 0), 0);
  const availableSpace = endY - startY;
  const extraSpace = Math.max(0, availableSpace - totalHeight);

  // Calculate spacing based on justify
  let spacing = 0;
  let initialOffset = 0;

  if (valign === 'center') {
    initialOffset = extraSpace / 2;
  } else if (valign === 'end') {
    initialOffset = extraSpace;
  } else if (valign === 'space-between' && columnChildren.length > 1) {
    spacing = extraSpace / (columnChildren.length - 1);
  } else if (valign === 'space-around' && columnChildren.length > 0) {
    spacing = extraSpace / columnChildren.length;
    initialOffset = spacing / 2;
  } else if (valign === 'space-evenly' && columnChildren.length > 0) {
    spacing = extraSpace / (columnChildren.length + 1);
    initialOffset = spacing;
  }

  // Position children
  let currentY = startY + initialOffset;

  // If reverse, we need to position from bottom to top
  if (reverse) {
    columnChildren.reverse();
  }

  columnChildren.forEach((child) => {
    // Set y position
    child.y = currentY;

    // Set x position based on alignment
    if (halign === 'center') {
      child.x = (columnWidth - (child.width || 0)) / 2;
    } else if (halign === 'end') {
      child.x = columnWidth - (child.width || 0);
    } else if (halign === 'stretch') {
      child.width = columnWidth;
      child.x = 0;
    } else {
      // Default to start
      child.x = 0;
    }

    // Update current Y position for the next child
    currentY += (child.height || 0) + spacing;
  });
}

// Create and register the HBox component
export function createHBox(options: {
  children: any[],
  spacing?: number,
  padding?: number | { top: number, right: number, bottom: number, left: number },
  valign?: 'start' | 'center' | 'end' | 'stretch',
  halign?: 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly',
  wrap?: boolean,
  reverse?: boolean,
  position?: { x: number, y: number },
  transform?: string,
  width?: number,
  height?: number,
  class?: string
}) {
  return buildViz({
    type: 'hbox',
    ...options
  });
}

// Create and register the VBox component
export function createVBox(options: {
  children: any[],
  spacing?: number,
  padding?: number | { top: number, right: number, bottom: number, left: number },
  halign?: 'start' | 'center' | 'end' | 'stretch',
  valign?: 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly',
  wrap?: boolean,
  reverse?: boolean,
  position?: { x: number, y: number },
  transform?: string,
  width?: number,
  height?: number,
  class?: string
}) {
  return buildViz({
    type: 'vbox',
    ...options
  });
}

export function registerBoxComponents() {
  // Make sure define type is registered
  registerDefineType();

  // Register the box components with the builder
  buildViz(hboxDefinition);
  buildViz(vboxDefinition);

  console.log('Box layout components registered');
}

registerBoxComponents();

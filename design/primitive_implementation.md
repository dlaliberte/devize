# Devize Shape Primitives Implementation Design

## Overview

This document outlines the implementation design for primitive shape visualizations in Devize, focusing on how these primitives are defined and implemented using the "define" visualization type. This serves as a guide for developers who need to create or modify primitive visualizations.

## Implementation Architecture

### Core Components

1. **Type Registry**: Central registry for all visualization types
2. **Define Type**: Foundation for creating new visualization types
3. **Primitive Definitions**: Implementation of each primitive shape using "define"
4. **Rendering Functions**: Backend-specific rendering functions defined with each primitive

```
┌─────────────────┐     ┌───────────────┐     ┌────────────────┐
│ Type Registry   │◄───▶│ Define Type   │◄───▶│ Primitive      │
│                 │     │               │     │ Definitions    │
└─────────────────┘     └───────────────┘     └────────────────┘
                                                            │
                                                            ▼
                                                    ┌────────────────┐
                                                    │ Rendering      │
                                                    │ Functions      │
                                                    └────────────────┘
```

## Implementation Principles

### 1. Define-Based Implementation

All primitive shapes are implemented using the "define" visualization type, which provides a consistent way to:
- Define required and optional properties
- Set default values
- Validate property values
- Register the new type with the system

### 2. Functional Implementation Pattern

Each primitive uses a functional implementation approach where:
- A function receives the full set of properties
- The function performs validation on the properties
- The function returns a specification object with attributes and rendering functions

### 3. Rendering Function Pattern

Each primitive returns a specification that includes:
- An internal rendering type identifier (`_renderType`)
- A set of attributes that define the visual properties
- Backend-specific rendering functions for different rendering contexts (SVG, Canvas, WebGL)

### 4. Separation of Definition and Rendering

A key principle is the strict separation between definition and rendering:
- Primitive definitions do not accept container parameters
- Primitive definitions do not perform actual rendering
- Primitive definitions return rendering functions that can be called by a top-level renderer
- Only the top-level rendering function accepts and uses a container

### 5. Utility Function Usage

Implementation leverages utility functions for common operations:
- SVG element creation and attribute application
- Canvas drawing operations
- Style processing

## Common Implementation Patterns

### Property Definition Pattern

```javascript
properties: {
        // Required property
        width: { required: true },

        // Optional property with default
        fill: { default: "none" },

        // Optional property with validation
        cornerRadius: {
          default: 0,
          validate: value => value >= 0
        }
}
```

### Validation Pattern

```javascript
// Validation within implementation function
if (props.width <= 0 || props.height <= 0) {
        throw new Error('Rectangle width and height must be positive');
}
```

### Attribute Preparation Pattern

```javascript
// Prepare attributes object
const attributes = {
        x: props.x,
        y: props.y,
        width: props.width,
        height: props.height,
        fill: props.fill,
        stroke: props.stroke,
        'stroke-width': props.strokeWidth
};
```

### Rendering Function Pattern

```javascript
// SVG rendering function
renderSVG: (container) => {
        const element = createSVGElement('elementType');
        applyAttributes(element, attributes);
        if (container) container.appendChild(element);
        return element;
}

// Canvas rendering function
renderCanvas: (ctx) => {
        // Set up context properties
        ctx.fillStyle = attributes.fill;
        ctx.strokeStyle = attributes.stroke;

        // Draw the shape
        ctx.beginPath();
        // Shape-specific drawing code

        // Apply fill and stroke
        if (attributes.fill !== 'none') ctx.fill();
        if (attributes.stroke !== 'none') ctx.stroke();

        return true; // Indicate successful rendering
}
```

## Primitive Types Overview

### Rectangle

A rectangle primitive with support for:
- Position (x, y)
- Dimensions (width, height)
- Fill and stroke styling
- Rounded corners

### Circle

A circle primitive with support for:
- Center position (cx, cy)
- Radius
- Fill and stroke styling

### Line

A line primitive with support for:
- Start and end points (x1, y1, x2, y2)
- Stroke styling
- Dash patterns

### Text

A text primitive with support for:
- Position (x, y)
- Text content
- Font styling (size, family)
- Text alignment (anchor, baseline)

## Extending Primitives

New primitives can be added by following these steps:

1. Create a new file in the `src/primitives` directory
2. Import the necessary dependencies
3. Use the "define" type to define the new primitive
4. Implement the appropriate rendering functions
5. Include comprehensive references to related files and documentation

## Future Enhancements

1. **Path Primitive**: Add support for complex path shapes
2. **Image Primitive**: Add support for image elements
3. **Group Primitive**: Enhance the group primitive with more layout options
4. **Clipping Support**: Add support for clipping regions
5. **Filter Effects**: Add support for visual filters

## References

- Related File: [src/core/define.ts](../src/core/define.ts)
- Related File: [src/core/registry.ts](../src/core/registry.ts)
- Related File: [src/core/devize.ts](../src/core/devize.ts)
- Related File: [src/primitives/rectangle.ts](../src/primitives/rectangle.ts)
- Related File: [src/primitives/circle.ts](../src/primitives/circle.ts)
- Related File: [src/primitives/line.ts](../src/primitives/line.ts)
- Related File: [src/primitives/text.ts](../src/primitives/text.ts)
- Related File: [src/renderers/svgUtils.js](../src/renderers/svgUtils.js)
- Related File: [src/renderers/canvasUtils.js](../src/renderers/canvasUtils.js)
- Design Document: [design/define.md](define.md)
- Design Document: [design/primitives.md](primitives.md)
- Design Document: [design/rendering.md](rendering.md)
- User Documentation: [docs/primitives/shapes.md](../docs/primitives/shapes.md)

# Define Visualization Type Design

## Overview

The "define" visualization type is a core component of Devize that enables the creation of new visualization types declaratively. This document outlines the design and implementation of this foundational feature.

## Design Principles

1. **Declarative Definition**: Allow new visualization types to be defined using the same declarative syntax as regular visualizations
2. **Self-Registration**: Automatically register new types with the system
3. **Property Validation**: Provide mechanisms for property validation and defaults
4. **Implementation Flexibility**: Support both declarative and functional implementations
5. **Extensibility**: Enable extending existing types

## Architecture

The "define" type serves as a meta-visualization that processes its properties to register a new visualization type:

```
┌─────────────────┐     ┌───────────────┐     ┌────────────────┐
│ Define          │     │ Type          │     │ Visualization  │
│ Specification   │────▶│ Registry      │────▶│ System         │
└─────────────────┘     └───────────────┘     └────────────────┘
```

## Core Components

### 1. Define Type Handler

The define type handler processes visualization definitions and registers them with the type registry.

### 2. Property Processing

The property processor evaluates property values, handles templates, and applies defaults.

### 3. Implementation Evaluation

The implementation evaluator processes the implementation specification based on its type (declarative or functional).

## Implementation Approach

The "define" type is implemented as a special case in the system, using a metacircular definition where it defines itself:

```typescript
createViz({
  type: "define",
  name: "define",
  properties: {
    name: { required: true },
    properties: { required: true },
    implementation: { required: true }
  },
  implementation: props => {
    // Register the new type
    registerType({
      name: props.name,
      // Extract required properties
      requiredProps: Object.entries(props.properties)
        .filter(([_, config]) => (config as any).required)
        .map(([name]) => name),
      // Extract optional properties with defaults
      optionalProps: Object.fromEntries(
        Object.entries(props.properties)
          .filter(([_, config]) => !(config as any).required && (config as any).default !== undefined)
          .map(([name, config]) => [name, (config as any).default])
      ),
      // Implementation details
      // ...
    });

    // Return an empty group as this component doesn't render anything
    return { type: 'group', children: [] };
  }
});
```

## Property Definition

Properties for new visualization types are defined using a structured format:

```javascript
properties: {
  propertyName: {
    required: Boolean,     // Whether the property is required
    default: any,          // Default value if not provided
    type: string,          // Expected type (e.g., "number", "string")
    validate: function     // Optional validation function
  }
}
```

## Implementation Types

### 1. Declarative Implementation

A declarative implementation uses a visualization specification with template notation:

```javascript
implementation: {
  type: "group",
  children: [
    {
      type: "circle",
      cx: "{{cx}}",        // Template notation for property reference
      cy: "{{cy}}",
      r: "{{r}}",
      fill: "{{fill}}"
    }
  ]
}
```

### 2. Functional Implementation

A functional implementation uses a function that receives properties and returns a specification:

```javascript
implementation: props => {
  // Process properties
  const result = doSomethingWith(props);

  // Return a visualization specification
  return {
    type: "someType",
    // ...other properties
  };
}
```

## Type Extension

The "define" type supports extending existing types:

```javascript
createViz({
  type: "define",
  name: "horizontalBarChart",
  extend: "barChart",
  properties: {
    barHeight: { default: 20 }
  },
  implementation: {
    orientation: "horizontal"
  }
});
```

## Property Evaluation

The system evaluates properties in implementations using several mechanisms:

1. **Template Notation**: `{{expression}}` for referencing properties
2. **Property Functions**: Functions that receive the full context
3. **Recursive Evaluation**: Nested property evaluation for complex structures

## Bootstrapping Process

The "define" type presents a bootstrapping challenge since it needs to define itself. The solution involves:

1. Special handling in the core system for the initial "define" type
2. Using this initial implementation to register the full "define" type
3. Using the registered type for all subsequent definitions

## Usage Examples

### Defining a Simple Visualization Type

```javascript
createViz({
  type: "define",
  name: "labeledCircle",
  properties: {
    cx: { required: true },
    cy: { required: true },
    r: { required: true, default: 10 },
    label: { required: true },
    fontSize: { default: 12 }
  },
  implementation: {
    type: "group",
    children: [
      {
        type: "circle",
        cx: "{{cx}}",
        cy: "{{cy}}",
        r: "{{r}}",
        fill: "steelblue"
      },
      {
        type: "text",
        x: "{{cx}}",
        y: "{{cy}}",
        text: "{{label}}",
        fontSize: "{{fontSize}}",
        textAnchor: "middle",
        dominantBaseline: "middle",
        fill: "white"
      }
    ]
  }
});
```

### Using the Defined Type

```javascript
const myCircle = createViz({
  type: "labeledCircle",
  cx: 100,
  cy: 100,
  r: 30,
  label: "Hello!"
});
```

## Primitive Implementation Using Define

Shape primitives should be implemented using the "define" type:

```javascript
// Rectangle primitive
createViz({
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

    // Return a specification that the renderer can process
    return {
      _renderType: "rect",  // Internal rendering type
      attributes: {
        x: props.x,
        y: props.y,
        width: props.width,
        height: props.height,
        fill: props.fill,
        stroke: props.stroke,
        'stroke-width': props.strokeWidth,
        rx: props.cornerRadius,
        ry: props.cornerRadius
      }
    };
  }
});
```

## Future Enhancements

1. **Type Validation**: Enhanced type checking for properties
2. **Documentation Generation**: Automatic documentation from type definitions
3. **Visual Editor**: GUI for creating and editing type definitions
4. **Type Libraries**: Shareable libraries of visualization types
5. **Versioning**: Support for versioning of visualization types

## Conclusion

The "define" visualization type is the foundation of Devize's extensibility. By providing a declarative way to create new visualization types, it enables a consistent approach to building and composing visualizations while maintaining the functional, container-independent design philosophy.

## References

- Related File: [src/core/define.ts](../src/core/define.ts)
- Related File: [src/core/registry.ts](../src/core/registry.ts)
- Related File: [src/core/devize.ts](../src/core/devize.ts)
- Design Document: [design/primitives.md](primitives.md)
- Design Document: [design/primitive_implementation.md](primitive_implementation.md)
- User Documentation: [docs/core/define.md](../docs/core/define.md)
- Examples: [examples/define_examples.js](../examples/define_examples.js)

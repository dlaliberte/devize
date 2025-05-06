# Define Visualization Type

## Overview

The "define" visualization type is a core component of Devize that enables the creation of new visualization types declaratively. It serves as the foundation for extending the library with custom visualizations without writing explicit code.

## Purpose

The "define" type serves several key purposes:
1. Provides a declarative way to create new visualization types
2. Establishes a consistent interface for type definitions
3. Handles property validation and default values
4. Enables composition of visualizations
5. Supports the extension of existing types

## Architecture

The "define" type is a meta-visualization that processes its properties to register a new visualization type:

```
┌─────────────────┐     ┌───────────────┐     ┌────────────────┐
│ Define          │     │ Type          │     │ Visualization  │
│ Specification   │────▶│ Registry      │────▶│ System         │
└─────────────────┘     └───────────────┘     └────────────────┘
```

## Basic Usage

```javascript
createViz({
  type: "define",
  name: "labeledCircle",
  properties: {
    cx: { required: true },
    cy: { required: true },
    r: { required: true, default: 10 },
    fill: { default: "steelblue" },
    stroke: { default: "navy" },
    strokeWidth: { default: 1 },
    label: { required: true },
    fontSize: { default: 12 }
  },
  implementation: props => {
    return {
      type: "group",
      children: [
        {
          type: "circle",
          cx: props.cx,
          cy: props.cy,
          r: props.r,
          fill: props.fill,
          stroke: props.stroke,
          strokeWidth: props.strokeWidth
        },
        {
          type: "text",
          x: props.cx,
          y: props.cy,
          text: props.label,
          fontSize: props.fontSize,
          textAnchor: "middle",
          dominantBaseline: "middle",
          fill: "black"
        }
      ]
    };
  }
});
```

Once defined, the new visualization type can be used like any built-in type:

```javascript
const myCircle = createViz({
  type: "labeledCircle",
  cx: 100,
  cy: 100,
  r: 30,
  fill: "coral",
  label: "Hello!",
  fontSize: 14
});

renderViz(myCircle, document.getElementById("viz-container"));
```

## Properties

| Property | Type | Description | Default |
|----------|------|-------------|---------|
| name | string | Name of the new visualization type | Required |
| properties | object | Property definitions for the new type | Required |
| implementation | function/object | Implementation of the visualization | Required |
| extend | string | Name of a type to extend (inherit from) | None |

## Property Definitions

The `properties` object defines the interface of your visualization type:

```javascript
properties: {
  propertyName: {
    required: Boolean,     // Whether the property is required
    default: any,          // Default value if not provided
    type: string,          // Expected type (e.g., "number", "string", "array")
    validate: function     // Optional validation function
  }
}
```

## Implementation Approaches

### Functional Implementation

The recommended implementation approach uses a function that receives all properties and returns a visualization specification:

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

This approach gives you full control over the implementation and provides better performance, security, and flexibility.

## Extending Existing Types

You can extend an existing visualization type to inherit its properties and behavior:

```javascript
createViz({
  type: "define",
  name: "horizontalBarChart",
  extend: "barChart",
  properties: {
    barHeight: { default: 20 }
  },
  implementation: props => {
    // Create a horizontal bar chart based on the vertical bar chart
    return {
      type: "group",
      children: [
        // Implementation details...
      ]
    };
  }
});
```

When extending a type, you can:
1. Add new properties
2. Override default values
3. Provide a new implementation that builds on the base type

The extension mechanism merges properties from the base type with the new type, with the new type's properties taking precedence.

## Bootstrapping Process

The "define" type presents a bootstrapping challenge since it needs to define itself. The solution involves:

1. Special handling in `createViz` for the initial "define" type
2. Using this initial implementation to register the full "define" type
3. Using the registered type for all subsequent definitions

## Property Evaluation

When processing a visualization defined with the "define" type:

1. Default values are applied for any missing properties
2. Required properties are validated
3. Property types are checked if specified
4. Custom validation functions are executed if provided
5. The implementation function is called with the processed properties

## Implementation Details

The "define" type works by:

1. Registering the new visualization type in the Devize registry
2. Processing property definitions to establish required properties and defaults
3. Creating a type handler that validates properties and processes the implementation
4. Making the new type available for use with `createViz`

This mechanism is the foundation of Devize's extensibility, allowing the library to grow with custom visualizations while maintaining a consistent interface.

## Best Practices

1. **Use Functional Implementations**:
   - Functional implementations provide better performance and flexibility
   - They allow for complex logic and data transformations
   - They make debugging easier with clear property access

2. **Property Naming**:
   - Use consistent naming conventions
   - Match property names with their visual meaning
   - Use descriptive names for clarity

3. **Implementation Structure**:
   - Keep implementations focused on a single responsibility
   - Compose complex visualizations from simpler ones
   - Reuse existing visualization types when possible

4. **Documentation**:
   - Include comments explaining the purpose of the visualization
   - Document any non-obvious property usage
   - Provide examples of how to use the visualization

## References

- Related File: [src/core/define.ts](../src/core/define.ts)
- Related File: [src/core/registry.ts](../src/core/registry.ts)
- Related File: [src/core/creator.ts](../src/core/creator.ts)
- Related File: [src/core/renderer.ts](../src/core/renderer.ts)
- Related File: [src/core/devize.ts](../src/core/devize.ts)
- Design Document: [design/viz_creation_rendering.md](viz_creation_rendering.md)
- Design Document: [design/rendering.md](rendering.md)
- User Documentation: [docs/core/define.md](../docs/core/define.md)
- Examples: [examples/define_examples.js](../examples/define_examples.js)

# Define Visualization Type

## Overview

The `define` visualization type is a core component of Devise that allows you to create new, reusable visualization types declaratively. It serves as the foundation for extending the library with custom visualizations without writing explicit code.

## Basic Usage

```javascript
buildViz({
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
  implementation: {
    type: "group",
    children: [
      {
        type: "circle",
        cx: "{{cx}}",
        cy: "{{cy}}",
        r: "{{r}}",
        fill: "{{fill}}",
        stroke: "{{stroke}}",
        strokeWidth: "{{strokeWidth}}"
      },
      {
        type: "text",
        x: "{{cx}}",
        y: "{{cy}}",
        text: "{{label}}",
        fontSize: "{{fontSize}}",
        textAnchor: "middle",
        dominantBaseline: "middle",
        fill: "black"
      }
    ]
  }
});
```

Once defined, the new visualization type can be used like any built-in type:

```javascript
buildViz({
  type: "labeledCircle",
  cx: 100,
  cy: 100,
  r: 30,
  fill: "coral",
  label: "Hello!",
  fontSize: 14,
  container: document.getElementById("viz-container")
});
```

## Properties

| Property | Type | Description | Default |
|----------|------|-------------|---------|
| name | string | Name of the new visualization type | Required |
| properties | object | Property definitions for the new type | Required |
| implementation | object/function | Implementation of the visualization | Required |
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

### 1. Declarative Implementation with Template Notation

A declarative implementation uses a visualization specification object with template notation to reference properties:

```javascript
implementation: {
  type: "group",
  children: [
    {
      type: "circle",
      cx: "{{cx}}",        // Template notation for property reference
      cy: "{{cy}}",
      r: "{{r * 2}}",      // Simple expressions are supported
      fill: "{{fill}}"
    }
  ]
}
```

#### Template Notation

The template notation `{{expression}}` allows you to:
- Reference properties directly: `{{propertyName}}`
- Use simple expressions: `{{width / 2}}`, `{{height * 0.8}}`
- Access nested properties: `{{data.length}}`, `{{config.colors[0]}}`
- Use conditional expressions: `{{isVisible ? 1 : 0}}`

### 2. Functional Implementation (Full)

A functional implementation uses a function that receives all properties and returns a visualization specification or data:

```javascript
implementation: props => {
  // Process properties
  const result = doSomethingWith(props);

  // Return a visualization specification or data
  return {
    type: "someType",
    // ...other properties
  };
}
```

This approach gives you full control but requires manually handling all properties.

### 3. Structured Functional Implementation

A more structured approach is to define a function that takes the exact parameters defined in the properties:

```javascript
implementation: function(cx, cy, r, fill, stroke, strokeWidth, label, fontSize) {
  // Use parameters directly
  return {
    type: "group",
    children: [
      {
        type: "circle",
        cx: cx,
        cy: cy,
        r: r,
        fill: fill,
        stroke: stroke,
        strokeWidth: strokeWidth
      },
      {
        type: "text",
        x: cx,
        y: cy,
        text: label,
        fontSize: fontSize,
        textAnchor: "middle",
        dominantBaseline: "middle",
        fill: "black"
      }
    ]
  };
}
```

This approach provides better type checking and parameter documentation in IDEs.

## Extending Existing Types

You can extend an existing visualization type to inherit its properties and behavior:

```javascript
buildViz({
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

## Data Transformation Visualizations

To create a data transformation visualization that doesn't render to the DOM:

```javascript
buildViz({
  type: "define",
  name: "dataFilter",
  properties: {
    data: { required: true },
    test: { required: true }
  },
  implementation: props => {
    // Filter the data
    const filteredData = props.data.filter(props.test);

    // Return the filtered data
    return { filteredData };
  }
});
```

## Property Access Patterns

Depending on your implementation approach, you can access properties in different ways:

### 1. Template Notation (Declarative)
```javascript
{
  type: "rectangle",
  width: "{{width}}",
  height: "{{height * 0.5}}"
}
```

### 2. Props Object (Functional)
```javascript
props => ({
  type: "rectangle",
  width: props.width,
  height: props.height * 0.5
})
```

### 3. Named Parameters (Structured Functional)
```javascript
function(width, height, color) {
  return {
    type: "rectangle",
    width: width,
    height: height * 0.5,
    fill: color
  };
}
```

### 4. Property Functions (Dynamic)
```javascript
{
  type: "rectangle",
  width: props => props.width,
  height: props => props.height * 0.5
}
```

## Self-Registration

Visualization types defined with `define` are automatically registered with the Devise system and can be used immediately after definition.

## Best Practices

1. **Choose the Right Implementation Approach**:
   - Use declarative with templates for simple visualizations
   - Use functional for complex logic or data transformations
   - Use structured functional for better IDE support

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

## Example: Creating a Custom Axis with Different Approaches

### Declarative with Template Notation

```javascript
buildViz({
  type: "define",
  name: "customAxis",
  properties: {
    orientation: { required: true },
    length: { required: true },
    values: { required: true },
    title: { default: "" },
    titleFontSize: { default: 12 }
  },
  implementation: {
    type: "group",
    children: [
      {
        type: "line",
        x1: "{{orientation === 'horizontal' ? 0 : 0}}",
        y1: "{{orientation === 'horizontal' ? 0 : 0}}",
        x2: "{{orientation === 'horizontal' ? length : 0}}",
        y2: "{{orientation === 'horizontal' ? 0 : length}}",
        stroke: "black"
      },
      {
        type: "text",
        x: "{{orientation === 'horizontal' ? length/2 : -30}}",
        y: "{{orientation === 'horizontal' ? 30 : length/2}}",
        text: "{{title}}",
        fontSize: "{{titleFontSize}}",
        transform: "{{orientation === 'horizontal' ? '' : 'rotate(-90)'}}"
      }
      // Additional elements would be added here
    ]
  }
});
```

### Structured Functional Implementation

```javascript
buildViz({
  type: "define",
  name: "customAxis",
  properties: {
    orientation: { required: true },
    length: { required: true },
    values: { required: true },
    title: { default: "" },
    titleFontSize: { default: 12 }
  },
  implementation: function(orientation, length, values, title, titleFontSize) {
    const isHorizontal = orientation === 'horizontal';

    // Create the main axis line
    const mainLine = {
      type: "line",
      x1: 0,
      y1: 0,
      x2: isHorizontal ? length : 0,
      y2: isHorizontal ? 0 : length,
      stroke: "black"
    };

    // Create the title
    const titleElement = {
      type: "text",
      x: isHorizontal ? length/2 : -30,
      y: isHorizontal ? 30 : length/2,
      text: title,
      fontSize: titleFontSize,
      transform: isHorizontal ? '' : 'rotate(-90)'
    };

    // Create ticks and labels
    const ticks = values.map((value, i) => {
      const position = i / (values.length - 1) * length;

      return {
        type: "group",
        children: [
          {
            type: "line",
            x1: isHorizontal ? position : 0,
            y1: isHorizontal ? 0 : position,
            x2: isHorizontal ? position : -5,
            y2: isHorizontal ? 5 : position,
            stroke: "black"
          },
          {
            type: "text",
            x: isHorizontal ? position : -10,
            y: isHorizontal ? 15 : position,
            text: value.toString(),
            fontSize: 10,
            textAnchor: isHorizontal ? "middle" : "end",
            dominantBaseline: isHorizontal ? "hanging" : "middle"
          }
        ]
      };
    });

    // Return the complete axis
    return {
      type: "group",
      children: [
        mainLine,
        titleElement,
        ...ticks
      ]
    };
  }
});
```

## Implementation Details

The `define` visualization type works by:

1. Registering the new visualization type in the Devise registry
2. Processing property definitions to establish required properties and defaults
3. Creating a type handler that validates properties and processes the implementation
4. Making the new type available for use with `buildViz`

This mechanism is the foundation of Devise's extensibility, allowing the library to grow with custom visualizations while maintaining a consistent interface.

The `define` type itself is a special case in the Devize system. While it appears to be defined using itself:

```javascript
// In src/core/define.ts
buildViz({
  type: "define",
  name: "define",
  properties: {
    name: { required: true },
    properties: { required: true },
    implementation: { required: true }
  },
  implementation: props => {
    // Implementation details...
  }
}, document.createElement('div'));
```

This creates a metacircular definition where the `define` type is defined using itself. To resolve this bootstrapping issue, the core system has special handling for the `define` type that allows it to be used before it's formally registered.

This self-definition approach demonstrates the power of the system - even its core components can be expressed using the same declarative syntax that users employ to create custom visualizations.

Looking at the code, we can see that the `define` type is indeed being defined using `buildViz` with `type: "define"`. This creates a circular reference where the `define` type is defined using itself.

This is a classic bootstrapping problem in language and system design. Here's what's happening:

1. The `define` type is implemented directly in `src/core/define.ts`
2. It uses `buildViz` to register itself as a visualization type
3. This creates a situation where the `define` type is defined using itself

This approach has some implications:

### Bootstrapping Process

For this to work, there must be a special case in the core `buildViz` function that recognizes and handles the `"define"` type before the type is formally registered. Otherwise, we'd have a chicken-and-egg problem.

### Recursive Definition

Yes, the implementation of `define` is used when processing uses of `define`. When you call:

```javascript
buildViz({
  type: "define",
  name: "myCustomType",
  // ...
});
```


The system uses the registered `define` type handler to process this visualization specification.

### Self-Application

The `define` type is essentially applying itself to define itself. This is a form of metacircular definition, similar to how programming language interpreters can be written in the language they interpret.

### Potential Issues

This approach could lead to some subtle issues:

1. **Initialization Order**: The `define` type must be available before any other custom types are defined
2. **Special Handling**: The core system likely needs special handling for the `define` type
3. **Circular Dependencies**: There's a potential for circular dependencies if not carefully managed

### Better Approach

A cleaner approach might be:

1. Implement the core `define` functionality directly in the system, not as a self-defined type
2. Use this core implementation to register the `define` type
3. Then use the registered `define` type for all subsequent definitions

This would avoid the circular reference and make the bootstrapping process more explicit.

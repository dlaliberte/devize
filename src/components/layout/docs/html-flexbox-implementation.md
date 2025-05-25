# HTML-based Flexbox Layout Implementation

## Overview

This document outlines the approach for implementing a unified flexbox layout component in Devize using HTML's native flexbox capabilities. The implementation will focus exclusively on HTML rendering initially, with a cleaner, more intuitive property naming scheme.

## Current Implementation Issues

The current implementation in `box.ts` has several limitations:

1. Manual calculation of positions is complex and error-prone
2. Separate HBox and VBox components create unnecessary duplication
3. Property naming doesn't clearly distinguish between box properties and item properties
4. CSS flexbox property mapping is confusing and non-intuitive

## Proposed Solution

Create a unified `box` component that leverages the browser's native flexbox implementation with a class-based configuration system. This approach will:

1. Simplify the API with a more intuitive naming scheme
2. Provide full flexbox feature support through HTML
3. Clearly distinguish between box properties and item properties
4. Allow for easy composition and nesting of layouts

## Implementation Details

### 1. Component Structure

We'll replace the separate `HBox` and `VBox` components with a unified `box` component:

```typescript
export const boxDefinition = {
  type: "define",
  name: "box",
  properties: boxProperties,
  validate: boxValidate,
  implementation: function(props) {
    // Implementation will use HTML flexbox
  }
};
```

### 2. Class-based Configuration

Instead of individual properties for alignment, we'll use a class-based system similar to CSS frameworks like Tailwind:

```typescript
const boxProperties = {
  children: { required: true },
  class: { default: '' },  // Space-separated list of class names
  spacing: { default: 0 }, // gap between items
  padding: { default: 0 }, // padding around items
  position: { default: { x: 0, y: 0 } },
  width: { default: null },
  height: { default: null },
};
```

### 3. Class Naming Scheme

The class property will accept a space-separated list of class names that control the box's behavior:

| Class Name | CSS Equivalent | Description |
|------------|----------------|-------------|
| `horizontal` | `flex-direction: row` | Horizontal layout (like HBox) |
| `vertical` | `flex-direction: column` | Vertical layout (like VBox) |
| `reverse` | `flex-direction: row-reverse/column-reverse` | Reverse item order |
| `wrap` | `flex-wrap: wrap` | Allow items to wrap |
| `items-halign-start` | `justify-content: flex-start` (horizontal)<br>`align-items: flex-start` (vertical) | Align items horizontally at start |
| `items-halign-center` | `justify-content: center` (horizontal)<br>`align-items: center` (vertical) | Align items horizontally at center |
| `items-halign-end` | `justify-content: flex-end` (horizontal)<br>`align-items: flex-end` (vertical) | Align items horizontally at end |
| `items-halign-stretch` | `align-items: stretch` (horizontal) | Stretch items horizontally |
| `items-halign-space-between` | `justify-content: space-between` (horizontal) | Space items evenly with no space at ends |
| `items-halign-space-around` | `justify-content: space-around` (horizontal) | Space items evenly with half-space at ends |
| `items-halign-space-evenly` | `justify-content: space-evenly` (horizontal) | Space items evenly with equal space at ends |
| `items-valign-start` | `align-items: flex-start` (horizontal)<br>`justify-content: flex-start` (vertical) | Align items vertically at start |
| `items-valign-center` | `align-items: center` (horizontal)<br>`justify-content: center` (vertical) | Align items vertically at center |
| `items-valign-end` | `align-items: flex-end` (horizontal)<br>`justify-content: flex-end` (vertical) | Align items vertically at end |
| `items-valign-stretch` | `align-items: stretch` (horizontal)<br>`justify-content: stretch` (vertical) | Stretch items vertically |
| `items-valign-space-between` | `justify-content: space-between` (vertical) | Space items evenly with no space at ends |
| `items-valign-space-around` | `justify-content: space-around` (vertical) | Space items evenly with half-space at ends |
| `items-valign-space-evenly` | `justify-content: space-evenly` (vertical) | Space items evenly with equal space at ends |
| `self-halign-start` | `justify-self: start` | Box aligns itself horizontally at start within parent |
| `self-halign-center` | `justify-self: center` | Box aligns itself horizontally at center within parent |
| `self-halign-end` | `justify-self: end` | Box aligns itself horizontally at end within parent |
| `self-valign-start` | `align-self: start` | Box aligns itself vertically at start within parent |
| `self-valign-center` | `align-self: center` | Box aligns itself vertically at center within parent |
| `self-valign-end` | `align-self: end` | Box aligns itself vertically at end within parent |

### 4. Rendering Process

The rendering process will be simplified to focus solely on HTML:

1. Create a container div with flexbox styling based on class names
2. Apply spacing (gap) and padding
3. Apply width and height if specified
4. Append children to the container
5. Return the HTML element

### 5. Class to CSS Mapping

The implementation will map class names to appropriate CSS properties based on whether the box is horizontal or vertical:

```typescript
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

  // Item alignment - horizontal
  if (classes.includes('items-halign-center')) {
    styles[styles.flexDirection.startsWith('row') ? 'justifyContent' : 'alignItems'] = 'center';
  }
  // ... other alignment mappings

  return styles;
}
```

## Implementation Plan

1. Create a new `box.ts` file with the unified box component
2. Implement the class-to-CSS mapping logic
3. Create the HTML rendering implementation
4. Add documentation and examples
5. Implement tests to verify layout behavior

## Future Considerations

1. **Individual Item Properties**: Allow individual items to override box defaults
2. **SVG/Canvas Rendering**: Extract positions from HTML for other rendering targets
3. **Responsive Layouts**: Add support for responsive flexbox layouts
4. **Animation**: Support for layout transitions and animations
5. **Grid Layout**: Implement CSS Grid-based layout components

## Conclusion

By creating a unified box component with a class-based configuration system, we can provide a more intuitive and flexible layout API while leveraging the browser's native flexbox implementation. This approach will make it easier for users to create complex layouts without having to understand the intricacies of CSS flexbox properties.

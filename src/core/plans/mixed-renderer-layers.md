# Mixed Renderer Layers Implementation Plan

## Overview

This plan outlines how to implement support for mixed rendering technologies (SVG and Canvas) within the same visualization, specifically focusing on rendering SVG layers on top of Canvas layers.

## Current Limitations

1. The `render` function only works with a single rendering technology for the entire visualization tree
2. There's no way to specify which renderer to use for specific components
3. Layers are rendered using the same technology as their parent

## Proposed Solution

We'll implement a new "mixed" rendering approach that allows:
1. Specifying renderer type at the layer level
2. Proper z-index ordering across different rendering technologies
3. Efficient updates to individual layers

### Key Components

1. **Renderer Specification**: Add a `renderer` property to layers
2. **Container Management**: Create multiple rendering contexts in the same container
3. **Z-Index Management**: Ensure proper stacking across renderers
4. **Update Mechanism**: Allow updating individual layers without re-rendering everything

## Implementation Plan

### Phase 1: Renderer Property and Detection

1. Add a `renderer` property to the layer primitive:

```typescript
// In src/primitives/layers.ts
export const layerTypeDefinition = {
  type: "define",
  name: "layer",
  extend: "group",
  properties: {
    zIndex: { default: 0 },
    renderer: { default: 'inherit' } // Can be 'svg', 'canvas', or 'inherit'
  },
  // implementation...
};

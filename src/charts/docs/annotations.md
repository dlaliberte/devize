# Chart Annotations Design

## Overview

Annotations allow for rendering additional graphical elements and associated content on charts. This design leverages existing Devize components to create a flexible annotation system that can be applied across different chart types.

## Core Concepts

1. **Component-Based**: Annotations are standard Devize components
2. **Coordinate System Sharing**: Annotations use the same coordinate system as their parent chart
3. **Content Association**: Each annotation can have associated content (labels, descriptions, etc.)
4. **Data Independence**: Annotation data can be separate from or derived from the chart's data

## Implementation Approach

### Annotation Interface

```typescript
interface Annotation {
  // The graphical mark (any Devize component)
  mark: {
    type: string;  // Any valid Devize component type
    [key: string]: any;  // Component-specific properties
  };

  // Optional associated content
  content?: {
    type: string;  // Any valid Devize component type
    [key: string]: any;  // Component-specific properties

    // Positioning relative to the mark
    position: 'top' | 'right' | 'bottom' | 'left' | 'center' | 'auto';
    offset?: { x: number; y: number };

    // Connection options (if content should be connected to mark)
    connect?: {
      type: 'line' | 'path';
      style?: {
        stroke?: string;
        strokeWidth?: number;
        strokeDasharray?: string;
      };
    };
  };

  // Data mapping for the annotation
  data?: any;

  // Coordinate mapping (how to interpret data values)
  coordinates?: {
    x?: string | number | ((data: any) => number | string | Date);
    y?: string | number | ((data: any) => number | string | Date);
  };

  // Optional event handlers
  events?: {
    onClick?: (event: Event, annotation: Annotation) => void;
    onHover?: (event: Event, annotation: Annotation) => void;
  };
}
```

### Chart Property Extension

Charts will be extended with an `annotations` property:

```typescript
{
  annotations: {
    default: [],
    validate: (annotations: Annotation[]) => {
      // Validation logic for annotations
    }
  }
}
```

### Common Annotation Patterns

While any Devize component can be used as an annotation, some common patterns include:

#### Point Annotations
```typescript
{
  mark: {
    type: 'circle',
    r: 5,
    fill: 'red',
    stroke: 'white',
    strokeWidth: 1
  },
  coordinates: {
    x: 'date',
    y: 'value'
  },
  content: {
    type: 'text',
    text: 'Important point',
    position: 'top',
    offset: { x: 0, y: -10 }
  },
  data: { date: '2023-01-15', value: 42 }
}
```

#### Line Annotations
```typescript
// Horizontal line
{
  mark: {
    type: 'horizontalLine',
    y: 50,
    stroke: 'red',
    strokeWidth: 1,
    strokeDasharray: '5,5'
  },
  content: {
    type: 'text',
    text: 'Threshold',
    position: 'right'
  }
}

// Vertical line
{
  mark: {
    type: 'verticalLine',
    x: '2023-01-01',
    stroke: 'blue',
    strokeWidth: 1
  },
  content: {
    type: 'text',
    text: 'Start of year',
    position: 'top'
  }
}
```

#### Area Annotations
```typescript
{
  mark: {
    type: 'rect',
    fill: 'rgba(255, 0, 0, 0.1)',
    stroke: 'none'
  },
  coordinates: {
    x: (d) => [d.start, d.end],
    y: (d) => [d.min, d.max]
  },
  content: {
    type: 'text',
    text: 'Target range',
    position: 'center'
  },
  data: { start: '2023-01-01', end: '2023-03-31', min: 40, max: 60 }
}
```

## New Primitive Components

To support annotations effectively, we'll add a few new primitive components:

### 1. HorizontalLine
A line that spans the entire width of the chart at a specific y-coordinate.

### 2. VerticalLine
A line that spans the entire height of the chart at a specific x-coordinate.

### 3. Connector
A component that draws a line or path between two points, used to connect annotation marks with their content.

## Rendering Process

1. The chart creates its coordinate system as usual
2. After rendering the main chart elements, the chart processes each annotation:
   - Transform the annotation's coordinates using the chart's coordinate system
   - Render the mark component
   - Calculate the position for any associated content
   - Render the content component
   - If specified, render a connector between the mark and content

## Integration with LineChart

The initial implementation will focus on adding annotation support to the LineChart component:

1. Add the `annotations` property to the lineChart definition
2. Extend the implementation function to process annotations after rendering the main chart elements
3. Share the coordinate system (CartesianCoordinateSystem) with the annotations
4. Add helper functions for positioning and connecting annotation content

## Future Extensions

1. **Smart Positioning**: Automatically position content to avoid overlaps
2. **Annotation Groups**: Group related annotations for collective styling or behavior
3. **Interactive Annotations**: Allow users to add/edit annotations through the UI
4. **Annotation Layers**: Control rendering order with z-index or layer concepts
5. **Annotation Templates**: Pre-defined annotation configurations for common use cases

## Implementation Plan

1. Create new primitive components (HorizontalLine, VerticalLine, Connector)
2. Define the annotation interface and property extension
3. Implement annotation rendering in LineChart
4. Create examples demonstrating different annotation patterns
5. Extend to other chart types (BarChart, ScatterPlot, etc.)

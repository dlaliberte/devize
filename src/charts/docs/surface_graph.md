# Surface Graph

The Surface Graph component renders a 3D surface visualization, where data values are represented as heights on a surface with optional color mapping.

## Basic Usage

```javascript
import { createSurfaceGraph } from 'devize';

// Create sample data (a 2D grid of z-values)
const generateData = () => {
  const size = 50;
  const values = [];
  for (let y = 0; y < size; y++) {
    const row = [];
    for (let x = 0; x < size; x++) {
      // Create a simple mathematical surface (e.g., a sine wave)
      const xNorm = x / size * 4 * Math.PI;
      const yNorm = y / size * 4 * Math.PI;
      const z = Math.sin(xNorm) * Math.cos(yNorm) * 2;
      row.push(z);
    }
    values.push(row);
  }
  return { values };
};

// Create the surface graph
const surfaceGraph = createSurfaceGraph({
  width: 800,
  height: 600,
  data: generateData(),
  wireframe: true,
  colorRange: ['blue', 'green', 'yellow', 'red']
});

// Render to a container
const container = document.getElementById('visualization');
surfaceGraph.renderToThreeJS(container);
```

## Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `width` | number | *required* | Width of the visualization in pixels |
| `height` | number | *required* | Height of the visualization in pixels |
| `data` | object | *required* | Data object with a 2D array of z-values and optional x/y coordinates |
| `xScale` | string | 'linear' | Type of scale for the x-axis |
| `yScale` | string | 'linear' | Type of scale for the y-axis |
| `zScale` | string | 'linear' | Type of scale for the z-axis |
| `xDomain` | [number, number] | *auto* | Domain for the x-axis |
| `yDomain` | [number, number] | *auto* | Domain for the y-axis |
| `zDomain` | [number, number] | *auto* | Domain for the z-axis |
| `colorScale` | string | 'linear' | Type of scale for colors |
| `colorDomain` | [number, number] | *auto* | Domain for the color scale |
| `colorRange` | string[] | ['#0000FF', '#FF0000'] | Range of colors for the color scale |
| `wireframe` | boolean | true | Whether to show wireframe |
| `wireframeColor` | string | '#000000' | Color of the wireframe |
| `surfaceOpacity` | number | 0.8 | Opacity of the surface (0-1) |
| `projection` | object | { type: 'perspective', distance: 1000 } | Projection settings |
| `cameraPosition` | object | *auto* | Initial camera position |
| `enableRotation` | boolean | true | Whether to enable rotation |
| `enableZoom` | boolean | true | Whether to enable zooming |
| `enablePan` | boolean | true | Whether to enable panning |

## Data Format

The `data` property should be an object with the following structure:

```javascript
{
  // Required: 2D array of z-values
  values: [
    [z1_1, z1_2, ..., z1_n],
    [z2_1, z2_2, ..., z2_n],
    ...
    [zm_1, zm_2, ..., zm_n]
  ],

  // Optional: array of x-coordinates
  xCoordinates: [x1, x2, ..., xn],

  // Optional: array of y-coordinates
  yCoordinates: [y1, y2, ..., ym]
}
```

If `xCoordinates` or `yCoordinates` are not provided, the component will use the indices (0, 1, 2, ...) as coordinates.

## Projection Types

The component supports three projection types:

1. **perspective**: Standard 3D perspective projection
2. **orthographic**: Orthographic projection (no perspective distortion)
3. **isometric**: Isometric projection (equal scale on all axes)

Example:
```javascript
createSurfaceGraph({
  // ...other properties
  projection: {
    type: 'isometric',
    distance: 1000
  }
});
```

## Interaction

The surface graph supports the following interactions:

- **Rotation**: Click and drag to rotate the view
- **Zooming**: Use the mouse wheel to zoom in and out
- **Panning**: Right-click and drag (or middle-click and drag) to pan

These interactions can be enabled or disabled using the `enableRotation`, `enableZoom`, and `enablePan` properties.

## Examples

### Mathematical Surface

```javascript
const mathSurface = createSurfaceGraph({
  width: 800,
  height: 600,
  data: {
    values: generateMathematicalSurface((x, y) => Math.sin(x) * Math.cos(y))
  },
  colorRange: ['blue', 'cyan', 'green', 'yellow', 'red'],
  wireframe: true,
  wireframeColor: '#333333',
  surfaceOpacity: 0.7
});
```

### Terrain Visualization

```javascript
const terrain = createSurfaceGraph({
  width: 800,
  height: 600,
  data: terrainData,
  colorRange: ['#006400', '#228B22', '#90EE90', '#F5DEB3', '#D2B48C', '#A0522D', '#FFFFFF'],
  wireframe: false,
  surfaceOpacity: 1.0,
  projection: {
    type: 'perspective',
    distance: 1500
  }
});
```

### Heat Map Surface

```javascript
const heatMap = createSurfaceGraph({
  width: 800,
  height: 600,
  data: temperatureData,
  colorRange: ['blue', 'green', 'yellow', 'red'],
  wireframe: true,
  wireframeColor: '#444444',
  surfaceOpacity: 0.8,
  zScale: 'log' // Use logarithmic scale for height
});
```

## Browser Support

This component requires WebGL support in the browser. Most modern browsers support WebGL, but older browsers may not.

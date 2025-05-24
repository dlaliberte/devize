# Mandala Chart Design Document

## Overview

The Mandala Chart is a recursive visualization that creates a central circle surrounded by rings of smaller circles. Each small circle can contain a nested mandala chart, creating a fractal-like pattern. This document describes the design, implementation, and mathematical principles behind the Mandala Chart component.

## Visual Structure

A Mandala Chart consists of:

1. A central circle
2. One or more rings of smaller circles surrounding the central circle
3. Nested mandala charts inside each small circle (for recursion levels > 1)

```mermaid
graph TD
    A[Mandala Chart] --> B[Central Circle]
    A --> C[Ring 1]
    A --> D[Ring 2]
    A --> E[Ring N]

    C --> C1[Small Circle 1]
    C --> C2[Small Circle 2]
    C --> C3[Small Circle N]

    D --> D1[Small Circle 1]
    D --> D2[Small Circle 2]
    D --> D3[Small Circle N]

    C1 --> C1M[Nested Mandala]
    C2 --> C2M[Nested Mandala]
    C3 --> C3M[Nested Mandala]
```

## Recursive Structure

The mandala chart uses a recursive implementation where:

1. Level 0 is just a central circle
2. Level 1 adds a ring of small circles around the central circle
3. Level 2+ adds more rings and also places nested mandalas inside each small circle

```mermaid
graph TD
    A[Level 2 Mandala] --> B[Level 1 Mandala]
    A --> C[Small Circles with Level 1 Mandalas]

    B --> D[Level 0 Mandala]
    B --> E[Small Circles with Level 0 Mandalas]

    D --> F[Central Circle]
    E --> G[Small Circles]
```

## Mathematical Principles

### Circle Packing Geometry

The key mathematical challenge is determining the size and position of small circles so they:

1. Are tangent to each other
2. Are tangent to both the inner and outer circles of the ring
3. Are evenly distributed around the ring

### Calculating Circle Positions

For a ring with `n` small circles:

1. The angular width of each wedge/slice is `θ = 2π/n`
2. The small circles are positioned at angles `θ_i = (i * θ) + π/2 + rotationOffset`
3. The orbit radius (distance from center to small circle centers) is calculated based on the container radius

```mermaid
graph TD
    A[Calculate Wedge Angle] --> B[θ = 2π/n]
    B --> C[Calculate Orbit Radius]
    C --> D[Calculate Small Circle Radius]
    D --> E[Position Small Circles]
    E --> F[Calculate Inner Ring Radius]
```

### Tangent Circle Calculations

For a ring with container radius `r_container`, the key calculations are:

1. The wedge angle: `θ = 2π/n`
2. The sine of half the wedge angle: `sin(θ/2)`
3. The orbit radius: `r_orbit = r_container / (1 + sin(θ/2))`
4. The small circle radius: `r_small = r_orbit * sin(θ/2)`
5. The inner ring radius: `r_inner = r_orbit - r_small`

### Mathematical Proof

To prove this works, we need to show that the small circles are tangent to each other and to both the inner and outer circles.

#### Tangent to Container Circle (Outer Circle)

For a small circle to be tangent to the container circle, the distance between their centers must equal the sum of their radii:

```
|center_container - center_small| = r_container + r_small
```

Since the container circle is centered at the origin and the small circle is at distance `r_orbit` from the origin:

```
r_orbit + r_small = r_container
```

Substituting our formula for `r_orbit`:

```
r_container / (1 + sin(θ/2)) + r_small = r_container
```

And for `r_small`:

```
r_container / (1 + sin(θ/2)) + (r_container / (1 + sin(θ/2))) * sin(θ/2) = r_container
```

Simplifying:

```
r_container / (1 + sin(θ/2)) * (1 + sin(θ/2)) = r_container
```

Which equals `r_container`, proving the small circles are tangent to the container circle.

#### Tangent to Each Other

For two adjacent small circles to be tangent, the distance between their centers must equal the sum of their radii:

```
|center_small1 - center_small2| = 2 * r_small
```

The centers of adjacent small circles are at angle `θ` apart on a circle of radius `r_orbit`. The distance between them is:

```
2 * r_orbit * sin(θ/2)
```

Since `r_small = r_orbit * sin(θ/2)`, we have:

```
2 * r_orbit * sin(θ/2) = 2 * r_small
```

Which proves the small circles are tangent to each other.

#### Tangent to Inner Circle

For a small circle to be tangent to the inner circle, the distance between their centers minus their radii must equal the inner circle radius:

```
|center_inner - center_small| - r_small = r_inner
```

Since both circles are centered on the same axis:

```
r_orbit - r_small = r_inner
```

Substituting our formula for `r_inner`:

```
r_orbit - r_small = r_orbit - r_small
```

Which is trivially true, proving the small circles are tangent to the inner circle.

```mermaid
graph LR
    A[Container Circle] --> B[Small Circles]
    B --> C[Inner Circle]

    A -.tangent.- B
    B -.tangent.- B
    B -.tangent.- C
```

## Implementation Details

### Recursive Algorithm

The implementation uses a bottom-up recursive approach:

1. First recurse down to level 0 (just a central circle)
2. For each higher level:
   - Add a ring of small circles around the previous level
   - For each small circle, recursively create a nested mandala of the previous level

### Direct Radius Specification

Unlike previous versions that used proportional scaling, the current implementation:

1. Directly uses the container radius provided to the recursive function
2. Calculates all other radii based on this container radius
3. This approach ensures more precise control over the sizing of each level

### Drawing Order

The drawing order is critical to ensure proper layering:

1. Draw container circles from innermost to outermost
2. Draw small circles for each ring
3. Draw the central circle
4. Draw nested mandalas inside small circles

This specific order ensures that elements are properly layered and visible.

## Performance Optimizations

### SVG Caching

For higher recursion levels, the number of elements grows exponentially. To optimize performance:

1. The nested mandala for a given level can be cached as an SVG template
2. This template can be reused for all small circles at the same level
3. SVG transformations (scaling, rotation, translation) can be applied to position each instance

```mermaid
graph TD
    A[Generate Level N-1 Mandala] --> B[Cache as SVG Template]
    B --> C[Reuse for All Small Circles]
    C --> D[Apply Transformations]
    D --> E[Scale to Fit Small Circle]
    D --> F[Rotate to Align with Parent]
    D --> G[Translate to Small Circle Position]
```

This approach significantly reduces the number of unique elements that need to be generated:

- Without caching: O(n^r) elements where r is recursion level
- With caching: O(n*r) elements

### SVG vs. Canvas Rendering

For very high recursion levels:

1. SVG rendering may become slow due to the DOM size
2. Canvas rendering can be more efficient for large numbers of elements
3. A hybrid approach could use SVG for lower levels and canvas for higher levels

## Configuration Options

The Mandala Chart supports various configuration options:

| Option | Description | Default |
|--------|-------------|---------|
| centralRadius | Radius of the central circle | '30%' |
| centralColor | Color of the central circle | '#f0f0f0' |
| smallCircleColors | Array of colors for small circles | ['#1f77b4', ...] |
| containerCircleColor | Color of the container circles | 'rgba(0,0,0,0.05)' |
| centralStroke | Stroke color for central circle | '#333' |
| smallCircleStroke | Stroke color for small circles | '#333' |
| containerCircleStroke | Stroke color for container circles | '#999' |
| strokeWidth | Stroke width for central and small circles | 1 |
| containerStrokeWidth | Stroke width for container circles | 1 |
| numPositions | Number of positions in each ring | 10 |
| recursionLevels | Number of recursion levels | 1 |
| innerPadding | Padding inside small circles | 0.1 |
| ringGap | Gap between rings | 0.05 |
| hideZeroPosition | Whether to hide the 0th position | true |

## Usage Examples

### Basic Mandala Chart

```javascript
const basicChart = createMandalaChart({
  width: 500,
  height: 500,
  title: "Mandala Chart",
  margin: { top: 40, right: 40, bottom: 40, left: 40 }
});
```

### Customized Mandala Chart

```javascript
const customChart = createMandalaChart({
  width: 600,
  height: 600,
  title: {
    text: "Customized Mandala Chart",
    fontSize: 20,
    fontWeight: "bold",
    color: "#333"
  },
  margin: { top: 50, right: 50, bottom: 50, left: 50 },
  centralRadius: '25%',
  smallCircleColors: [
    '#1565c0', '#0097a7', '#00796b', '#388e3c',
    '#689f38', '#afb42b', '#fbc02d', '#f57c00', '#e64a19'
  ],
  centralStroke: '#01579b',
  smallCircleStroke: '#01579b',
  strokeWidth: 2,
  recursionLevels: 3,
  numPositions: 8
});
```

## Performance Considerations

The recursive nature of the Mandala Chart can lead to a large number of elements being rendered, especially at higher recursion levels. For example:

- Level 1 with 10 positions: 1 central circle + 1 container circle + 9 small circles = 11 elements
- Level 2 with 10 positions: 11 elements + 9 nested mandalas with 11 elements each = 110 elements
- Level 3 with 10 positions: 110 elements + 9*9 nested mandalas with 11 elements each = 1,001 elements

With SVG caching:
- Level 3 with 10 positions: ~30 unique elements with ~100 instances
- Level 4 with 10 positions: ~40 unique elements with ~1000 instances

To maintain performance:

1. Implement SVG caching for repeated structures
2. Limit recursion levels for large charts
3. Consider reducing the number of positions for higher recursion levels
4. Use efficient rendering techniques (SVG or Canvas)

## Future Enhancements

Potential future enhancements for the Mandala Chart include:

1. Data-driven coloring and sizing of circles
2. Interactive features (hover, click, zoom)
3. Animation capabilities
4. Text labels for circles
5. Variable number of positions per level
6. Support for different shapes beyond circles
7. Implement SVG caching for higher recursion levels
8. Add canvas rendering option for very complex mandalas
9. Provide progressive loading for high recursion levels

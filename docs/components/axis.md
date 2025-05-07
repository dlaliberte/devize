# Axis Component

## Purpose
The `axis` component renders a coordinate axis with ticks, labels, and an optional title. It's a fundamental building block for charts and visualizations that require coordinate systems.

## Properties

| Property | Type | Description | Default | Required |
|----------|------|-------------|---------|----------|
| orientation | string | The orientation of the axis ('top', 'right', 'bottom', 'left') | | Yes |
| length | number | The length of the axis in pixels | | Yes |
| values | array | The values to display as ticks | | Yes |
| positions | array | Custom positions for ticks (overrides automatic positioning) | null | No |
| scale | object | A scale object to use for positioning ticks | null | No |
| scaleType | string | Type of scale to create ('linear', 'band', etc.) if no scale is provided | null | No |
| domain | array | Domain for the scale if creating one on the fly | null | No |
| title | string | Title for the axis | '' | No |
| format | function | Function to format tick labels | value => value.toString() | No |
| transform | string | SVG transform to apply to the axis group | '' | No |
| tickCount | number | Number of ticks to generate when using a scale with a ticks method | 5 | No |

## Examples

### Basic Axis
```javascript
{
  type: 'axis',
  orientation: 'bottom',
  length: 500,
  values: [0, 25, 50, 75, 100],
  title: 'Values'
}
```

### Axis with Scale
```javascript
{
  type: 'axis',
  orientation: 'left',
  length: 300,
  values: [],  // Will be generated from scale
  scale: linearScale,
  title: 'Revenue ($)',
  format: value => '$' + value.toLocaleString()
}
```

### Axis with Custom Tick Positions
```javascript
{
  type: 'axis',
  orientation: 'bottom',
  length: 500,
  values: ['Q1', 'Q2', 'Q3', 'Q4'],
  positions: [50, 150, 350, 450],
  title: 'Quarters'
}
```

## Implementation Details

The axis component renders the following elements:
1. A main axis line
2. Tick marks at specified positions
3. Labels for each tick
4. An optional title

The component handles different orientations by adjusting the positioning and rotation of these elements. For band scales, it automatically positions ticks at the center of each band.

## Usage with Scales

The axis component works seamlessly with scale components:

```javascript
// First create a scale
{
  type: 'linearScale',
  domain: [0, 100],
  range: [0, 500],
  as: 'yScale'
},

// Then use it with an axis
{
  type: 'axis',
  orientation: 'left',
  length: 500,
  scale: props => props.yScale,
  title: 'Values'
}
```

## Customization

The axis appearance can be customized by modifying the implementation or by wrapping it in a custom component:

```javascript
// Define a custom axis with different styling
buildViz({
  type: "define",
  name: "customAxis",
  properties: {
    // Same properties as the standard axis
    orientation: { required: true },
    length: { required: true },
    values: { required: true },
    // Additional styling properties
    tickLength: { default: 6 },
    tickColor: { default: '#333' },
    labelFontSize: { default: 12 }
  },
  implementation: props => ({
    type: 'axis',
    orientation: props.orientation,
    length: props.length,
    values: props.values,
    // Pass through other properties
    ...props,
    // Custom implementation details could be added here
  })
});
```
```

```markdown:docs/components/scales/scale.md
# Scale Components

## Purpose
Scale components transform data values from an input domain to an output range. They are essential for mapping data to visual properties like position, size, and color.

## Types of Scales

### Linear Scale
Maps a continuous input domain to a continuous output range using linear interpolation.

### Band Scale
Maps a discrete input domain to a continuous output range, dividing the range into bands with optional padding.

### Ordinal Scale
Maps a discrete input domain to a discrete output range, useful for categorical data.

## Common Properties

| Property | Type | Description | Default | Required |
|----------|------|-------------|---------|----------|
| domain | array | The input domain (data values) | | Yes |
| range | array | The output range (visual values) | | Yes |
| as | string | Property name to store the scale under | 'scale' | No |

## Scale-Specific Properties

### Linear Scale
| Property | Type | Description | Default | Required |
|----------|------|-------------|---------|----------|
| clamp | boolean | Whether to clamp values outside the domain | false | No |
| nice | boolean | Whether to extend the domain to nice round values | false | No |

### Band Scale
| Property | Type | Description | Default | Required |
|----------|------|-------------|---------|----------|
| padding | number | Shorthand for both inner and outer padding (0-1) | 0.1 | No |
| paddingInner | number | Padding between bands (0-1) | padding | No |
| paddingOuter | number | Padding at the edges (0-1) | padding | No |
| align | number | Alignment of bands within step (0-1) | 0.5 | No |

### Ordinal Scale
| Property | Type | Description | Default | Required |
|----------|------|-------------|---------|----------|
| unknown | any | Value to return for inputs not in the domain | First range value | No |

## Examples

### Linear Scale
```javascript
{
  type: 'linearScale',
  domain: [0, 100],
  range: [0, 500],
  clamp: true,
  as: 'yScale'
}
```

### Band Scale
```javascript
{
  type: 'bandScale',
  domain: ['A', 'B', 'C', 'D'],
  range: [0, 400],
  padding: 0.2,
  as: 'xScale'
}
```

### Ordinal Scale
```javascript
{
  type: 'ordinalScale',
  domain: ['Low', 'Medium', 'High'],
  range: ['#3366CC', '#FF9900', '#DC3912'],
  as: 'colorScale'
}
```

## Scale Methods

All scales provide the following methods:

| Method | Description |
|--------|-------------|
| scale(value) | Maps a value from the domain to the range |
| domain() | Returns the scale's domain |
| range() | Returns the scale's range |

### Scale-Specific Methods

#### Linear Scale
| Method | Description |
|--------|-------------|
| invert(value) | Maps a value from the range back to the domain |
| ticks(count) | Returns approximately `count` representative values from the domain |

#### Band Scale
| Method | Description |
|--------|-------------|
| bandwidth() | Returns the width of each band |
| ticks() | Returns all values in the domain |

## Implementation Details

### Linear Scale
The linear scale implements a simple linear interpolation:
```
y = rangeMin + (x - domainMin) * (rangeMax - rangeMin) / (domainMax - domainMin)
```

### Band Scale
The band scale divides the range into equal-sized bands with optional padding:
1. Calculate the bandwidth based on the range, domain length, and padding
2. Position each band with appropriate inner and outer padding
3. Provide the bandwidth for sizing elements

### Ordinal Scale
The ordinal scale maps each domain value to a corresponding range value:
1. For each domain value, assign a range value
2. If there are more domain values than range values, cycle through the range
3. For unknown values, return a default value

## Usage with Data Visualization

Scales are typically used to map data values to visual properties:

```javascript
// Create scales
{
  type: 'bandScale',
  domain: props => props.data.map(d => d.category),
  range: [0, props => props.width],
  padding: 0.2,
  as: 'xScale'
},
{
  type: 'linearScale',
  domain: [0, props => Math.max(...props.data.map(d => d.value))],
  range: [props => props.height, 0],
  as: 'yScale'
},

// Use scales to position elements
{
  type: 'rectangle',
  x: props => props.xScale.scale(props.data.category),
  y: props => props.yScale.scale(props.data.value),
  width: props => props.xScale.bandwidth(),
  height: props => props.height - props.yScale.scale(props.data.value)
}
```

## Mathematical Foundation

### Band Scale Calculation

The band scale divides the range into bands with padding:

1. For n bands with paddingInner and paddingOuter:
   - Total width = n bands + (n-1) inner paddings + 2 outer paddings
   - Width = n*bandwidth + (n-1)*bandwidth*paddingInner + 2*bandwidth*paddingOuter
   - Solving for bandwidth:
   - bandwidth = width / (n + (n-1)*paddingInner + 2*paddingOuter)

2. The position of band i is:
   - position = start + (bandwidth * paddingOuter) + (i * step)
   - where step = bandwidth * (1 + paddingInner)

This ensures that all bands have equal width and are evenly spaced across the range.
```

```markdown:docs/components/scales/linearScale.md
# Linear Scale

## Purpose
The `linearScale` component creates a scale that maps a continuous input domain to a continuous output range using linear interpolation. It's commonly used for quantitative data.

## Properties

| Property | Type | Description | Default | Required |
|----------|------|-------------|---------|----------|
| domain | array | The input domain [min, max] | | Yes |
| range | array | The output range [min, max] | | Yes |
| clamp | boolean | Whether to clamp values outside the domain | false | No |
| nice | boolean | Whether to extend the domain to nice round values | false | No |
| as | string | Property name to store the scale under | 'scale' | No |

## Examples

### Basic Linear Scale
```javascript
{
  type: 'linearScale',
  domain: [0, 100],
  range: [0, 500],
  as: 'yScale'
}
```

### Clamped Linear Scale
```javascript
{
  type: 'linearScale',
  domain: [0, 100],
  range: [0, 500],
  clamp: true,
  as: 'yScale'
}
```

### Inverted Linear Scale
```javascript
{
  type: 'linearScale',
  domain: [0, 100],
  range: [500, 0],  // Inverted range for y-axis
  as: 'yScale'
}
```

## Methods

The linear scale provides the following methods:

| Method | Description |
|--------|-------------|
| scale(value) | Maps a value from the domain to the range |
| invert(value) | Maps a value from the range back to the domain |
| ticks(count) | Returns approximately `count` representative values from the domain |
| domain() | Returns the scale's domain |
| range() | Returns the scale's range |

## Usage with Axis

Linear scales are commonly used with axis components:

```javascript
// Create a linear scale
{
  type: 'linearScale',
  domain: [0, 100],
  range: [300, 0],  // Inverted for y-axis
  as: 'yScale'
},

// Use it with an axis
{
  type: 'axis',
  orientation: 'left',
  length: 300,
  scale: props => props.yScale,
  title: 'Values'
}
```

## Implementation Details

The linear scale implements a simple linear interpolation:
```
y = rangeMin + (x - domainMin) * (rangeMax - rangeMin) / (domainMax - domainMin)
```

For values outside the domain:
- If `clamp` is true, the output is clamped to the range
- If `clamp` is false, the linear function is extended beyond the domain

The `nice` option extends the domain to nice round values, making the axis labels more readable.

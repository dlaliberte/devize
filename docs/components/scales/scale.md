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

### Linear Scale Calculation

The linear scale uses a simple linear interpolation formula:

1. For a value x in the domain [a, b] to be mapped to the range [c, d]:
   - y = c + (x - a) * (d - c) / (b - a)

2. For the inverse mapping (range to domain):
   - x = a + (y - c) * (b - a) / (d - c)

3. When clamping is enabled:
   - If x < a, then y = c
   - If x > b, then y = d

### Ordinal Scale Calculation

The ordinal scale maps discrete values:

1. For a domain [a, b, c] and range [d, e, f]:
   - scale(a) = d
   - scale(b) = e
   - scale(c) = f

2. If the domain has more values than the range, the range values are cycled:
   - For domain [a, b, c, d] and range [e, f]:
   - scale(a) = e
   - scale(b) = f
   - scale(c) = e
   - scale(d) = f

## Composing Scales

Scales can be composed to create more complex mappings:

```javascript
// Create a linear scale for data values
{
  type: 'linearScale',
  domain: [0, 100],
  range: [0, 1],
  as: 'normalizedScale'
},

// Create a color scale that uses the output of the linear scale
{
  type: 'ordinalScale',
  domain: [0, 0.5, 1],
  range: ['#3366CC', '#FF9900', '#DC3912'],
  as: 'colorScale'
},

// Use the composed scales
{
  type: 'circle',
  cx: 100,
  cy: 100,
  r: 50,
  fill: props => props.colorScale.scale(props.normalizedScale.scale(props.value))
}
```

This approach allows for flexible and powerful data visualizations by separating the concerns of data mapping and visual representation.

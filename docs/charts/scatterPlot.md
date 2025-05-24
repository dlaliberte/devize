# Scatter Plot

The scatter plot is a visualization type that displays the relationship between two numerical variables by plotting data points on a Cartesian coordinate system.

## Basic Usage

```javascript
// Sample data
const data = [
  { country: 'USA', gdp: 21400, population: 331 },
  { country: 'China', gdp: 14300, population: 1400 },
  { country: 'Japan', gdp: 5100, population: 126 },
  { country: 'Germany', gdp: 3800, population: 83 },
  { country: 'UK', gdp: 2800, population: 67 }
];

buildViz({
  type: "scatterPlot",
  data: data,
  x: { field: "gdp", title: "GDP (Billions USD)" },
  y: { field: "population", title: "Population (Millions)" },
  size: 8,
  color: "#3366CC",
  title: "GDP vs Population",
  tooltip: true,
  container: document.getElementById("viz-container")
});
```

TODO: Add examples of scatter plots with trend lines and clustering.

## Properties

| Property | Type | Description | Default |
|----------|------|-------------|---------|
| data | array | Array of data objects | Required |
| x | object | X-axis configuration | Required |
| y | object | Y-axis configuration | Required |
| size | number/object | Point size or size mapping | 6 |
| color | string/object | Point color or color mapping | "#3366CC" |
| shape | string/object | Point shape or shape mapping | "circle" |
| title | string/object | Chart title configuration | None |
| tooltip | boolean/object | Tooltip configuration | false |
| grid | boolean | Whether to show grid lines | false |
| margin | object | Chart margins | `{ top: 40, right: 30, bottom: 60, left: 60 }` |
| width | number | Chart width in pixels | 800 |
| height | number | Chart height in pixels | 400 |
| series | string/array | Series field or array of series configurations | None |
| colorLegend | object | Color legend configuration | `{ enabled: true, position: 'top-right' }` |
| sizeLegend | object | Size legend configuration | `{ enabled: false }` |
| shapeLegend | object | Shape legend configuration | `{ enabled: false }` |

## Axis Configuration

Both `x` and `y` properties accept configuration objects with the following properties:

| Property | Type | Description | Default |
|----------|------|-------------|---------|
| field | string | Data field to use | Required |
| title | string | Axis title | Same as field name |
| type | string | "linear", "log", "time", "ordinal" | "linear" |
| domain | array | Custom domain for the axis | Auto |
| format | function | Function to format axis labels | None |
| grid | boolean | Whether to show grid lines for this axis | false |
| tickCount | number | Approximate number of ticks to show | Auto |
| tickValues | array | Specific tick values to show | Auto |

## Size Configuration

The `size` property can be a simple number for a fixed size, or an object for data-driven sizing:

```javascript
// Fixed size
size: 8

// Size mapping by field
size: {
  field: "gdp",
  range: [5, 20],
  scale: "sqrt"  // "linear", "sqrt", "log"
}
```

## Color Configuration

The `color` property can be a simple string for a single color, or an object for data-driven coloring:

```javascript
// Simple color
color: "#3366CC"

// Color mapping by categorical field
color: {
  field: "region",
  scale: "categorical",
  range: ["#3366CC", "#DC3912", "#FF9900", "#109618"]
}

// Color mapping by numerical field
color: {
  field: "gdp",
  scale: "sequential",
  range: ["#EFEFEF", "#3366CC"]
}
```

## Shape Configuration

The `shape` property can be a simple string for a single shape, or an object for data-driven shapes:

```javascript
// Simple shape
shape: "circle"  // "circle", "square", "triangle", "diamond", "cross", "star"

// Shape mapping by field
shape: {
  field: "region",
  scale: {
    "North America": "circle",
    "Europe": "square",
    "Asia": "triangle",
    "Africa": "diamond",
    "South America": "star"
  }
}
```

## Series Configuration

The `series` property allows you to create multi-series scatter plots:

```javascript
// Group by a categorical field
series: "region"

// Explicit series configurations
series: [
  {
    name: "Population",
    data: data,
    x: { field: "gdp" },
    y: { field: "population" },
    color: "#3366CC",
    shape: "circle"
  },
  {
    name: "Life Expectancy",
    data: data,
    x: { field: "gdp" },
    y: { field: "lifeExpectancy" },
    color: "#DC3912",
    shape: "triangle"
  }
]
```

## Legend Configuration

Configure legends for color, size, and shape encodings:

```javascript
colorLegend: {
  enabled: true,
  position: "top-right",  // "top-right", "top-left", "bottom-right", "bottom-left", or {x, y}
  title: "Region",
  orientation: "vertical"  // "vertical" or "horizontal"
}

sizeLegend: {
  enabled: true,
  position: "bottom-right",
  title: "GDP (Billions USD)",
  orientation: "horizontal"
}

shapeLegend: {
  enabled: true,
  position: "bottom-left",
  title: "Category",
  orientation: "vertical"
}
```

## Tooltip Configuration

The `tooltip` property can be a boolean or an object for more control:

```javascript
// Simple tooltip
tooltip: true

// Detailed tooltip configuration
tooltip: {
  fields: ["country", "gdp", "population"],
  format: {
    gdp: value => `$${value} billion`,
    population: value => `${value} million`
  },
  title: d => d.country
}
```

## Customization Example

```javascript
buildViz({
  type: "scatterPlot",
  data: countryData,
  x: {
    field: "gdp",
    title: "GDP (Billions USD)",
    type: "log"
  },
  y: {
    field: "lifeExpectancy",
    title: "Life Expectancy (Years)"
  },
  size: {
    field: "population",
    range: [5, 30],
    scale: "sqrt"
  },
  color: {
    field: "region",
    scale: "categorical"
  },
  shape: {
    field: "continent",
    scale: {
      "Africa": "diamond",
      "Asia": "triangle",
      "Europe": "square",
      "North America": "circle",
      "South America": "star",
      "Oceania": "cross"
    }
  },
  title: {
    text: "Global Development Indicators",
    fontSize: 18,
    fontWeight: "bold",
    align: "center"
  },
  tooltip: {
    fields: ["country", "gdp", "lifeExpectancy", "population", "region"],
    format: {
      gdp: value => `$${value.toLocaleString()} billion`,
      population: value => `${(value/1000).toFixed(2)} billion`
    }
  },
  grid: true,
  width: 900,
  height: 500,
  colorLegend: {
    enabled: true,
    position: "top-right",
    title: "Region"
  },
  sizeLegend: {
    enabled: true,
    position: "bottom-right",
    title: "Population"
  },
  shapeLegend: {
    enabled: true,
    position: "bottom-left",
    title: "Continent"
  },
  container: document.getElementById("viz-container")
});
```

## Interactions

You can add interactions to the scatter plot:

```javascript
buildViz({
  type: "scatterPlot",
  data: data,
  x: { field: "gdp" },
  y: { field: "population" },
  color: "#3366CC",
  interactions: [
    {
      type: "hover",
      target: "point",
      effect: {
        fill: "#FF9900",
        stroke: "#CC6600",
        strokeWidth: 2,
        r: 10  // Increase point size on hover
      }
    },
    {
      type: "click",
      target: "point",
      action: (data) => {
        console.log("Clicked:", data);
        // You could update other visualizations here
      }
    }
  ],
  container: document.getElementById("viz-container")
});
```

## Implementation Details

The scatter plot is implemented as a composite visualization that includes:

1. A data processing component to prepare the data
2. Axes for the x and y dimensions
3. Point elements for each data point
4. Optional legends for color, size, and shape encodings
5. Optional grid lines and tooltips

Under the hood, it uses the constraint system to position all elements correctly and handle different scales and encodings.

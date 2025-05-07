# Devize Tutorial Part 5: Interaction, Animation, and Accessibility

## Introduction

Welcome to the fifth part of the Devize tutorial series! In this tutorial, we'll explore how to create interactive, animated, and accessible visualizations using Devize's declarative approach.

Interactive visualizations allow users to explore data, discover insights, and engage with the information in a more meaningful way. With Devize, you can add rich interactions without complex imperative code, using the same declarative approach we've used for static visualizations.

## Basic Interactions

### Tooltips

Tooltips are one of the simplest and most useful interactions. They provide additional information when users hover over elements:

```javascript
const barChartWithTooltips = buildViz({
  type: "barChart",
  data: salesData,
  x: { field: "product" },
  y: { field: "revenue" },
  interactions: [
    {
      type: "tooltip",
      trigger: "hover",
      content: item => `
        Product: ${item.product}
        Revenue: $${item.revenue.toLocaleString()}
        Profit: $${item.profit.toLocaleString()}
      `
    }
  ]
}, container);
```

### Highlighting

Highlighting elements on hover or click helps users focus on specific data points:

```javascript
const interactiveScatterPlot = buildViz({
  type: "scatterPlot",
  data: populationData,
  x: { field: "income" },
  y: { field: "lifeExpectancy" },
  size: { field: "population" },
  color: { field: "region" },
  interactions: [
    {
      type: "highlight",
      trigger: "hover",
      style: {
        fill: "orange",
        stroke: "red",
        strokeWidth: 2,
        scale: 1.2
      }
    }
  ]
}, container);
```

## State-Based Interactions

For more complex interactions, Devize uses a state-based approach:

```javascript
const selectableBarChart = buildViz({
  type: "barChart",
  data: salesData,
  x: { field: "product" },
  y: { field: "revenue" },
  states: {
    selected: {
      initial: [],
      transitions: [
        {
          event: "click",
          target: "bar",
          action: (state, event) => {
            // Toggle selection
            const item = event.data;
            if (state.includes(item.product)) {
              return state.filter(p => p !== item.product);
            } else {
              return [...state, item.product];
            }
          }
        }
      ]
    }
  },
  style: {
    bar: {
      fill: (item, states) =>
        states.selected.includes(item.product) ? "orange" : "steelblue",
      stroke: (item, states) =>
        states.selected.includes(item.product) ? "red" : "navy",
      strokeWidth: (item, states) =>
        states.selected.includes(item.product) ? 2 : 1
    }
  }
}, container);
```

## Coordinated Views

Devize makes it easy to coordinate multiple visualizations:

```javascript
// Create a shared state manager
const sharedState = createStateManager({
  brushedRange: null
});

// Create a line chart with brushing
const timeSeriesChart = buildViz({
  type: "lineChart",
  data: timeSeriesData,
  x: { field: "date" },
  y: { field: "value" },
  interactions: [
    {
      type: "brush",
      axis: "x",
      stateManager: sharedState,
      stateKey: "brushedRange"
    }
  ]
}, timeSeriesContainer);

// Create a bar chart that responds to the brush
const filteredBarChart = buildViz({
  type: "barChart",
  data: {
    type: "reference",
    name: "timeSeriesData"
  },
  transforms: [
    {
      type: "filter",
      expr: (d, states) => {
        if (!states.brushedRange) return true;
        const [min, max] = states.brushedRange;
        return d.date >= min && d.date <= max;
      },
      stateManager: sharedState
    }
  ],
  x: { field: "category" },
  y: { field: "value" }
}, barChartContainer);
```

## Animation

### Data Transitions

Animate changes when data updates:

```javascript
const animatedChart = buildViz({
  type: "barChart",
  data: initialData,
  x: { field: "category" },
  y: { field: "value" },
  animations: {
    dataUpdate: {
      duration: 500,
      easing: "easeInOutCubic",
      properties: ["height", "y"]
    }
  }
}, container);

// Later, update with new data
updateViz(animatedChart, {
  data: newData
});
```

### Sequenced Animations

Create sequences of animations:

```javascript
const sequencedChart = buildViz({
  type: "barChart",
  data: salesData,
  x: { field: "product" },
  y: { field: "revenue" },
  animations: {
    onMount: {
      sequence: [
        {
          target: "axis",
          duration: 300,
          properties: ["opacity"],
          from: { opacity: 0 },
          to: { opacity: 1 }
        },
        {
          target: "bar",
          duration: 500,
          stagger: 100,
          properties: ["height"],
          from: { height: 0 },
          to: { height: "final" }
        }
      ]
    }
  }
}, container);
```

## Accessibility

### Screen Reader Support

Make visualizations accessible to screen readers:

```javascript
const accessibleChart = buildViz({
  type: "barChart",
  data: salesData,
  x: { field: "product" },
  y: { field: "revenue" },
  accessibility: {
    title: "Sales Revenue by Product",
    description: "Bar chart showing revenue for each product category",
    keyboardNavigation: true,
    announcements: {
      onHover: item => `${item.product}: $${item.revenue.toLocaleString()} in revenue`
    },
    summaries: {
      chart: data => `This chart shows sales data for ${data.length} products.
                      The highest revenue is ${Math.max(...data.map(d => d.revenue))}
                      for product ${data.find(d => d.revenue === Math.max(...data.map(d => d.revenue))).product}.`
    }
  }
}, container);
```

### Keyboard Navigation

Enable keyboard navigation for interactive elements:

```javascript
const keyboardNavigableChart = buildViz({
  type: "scatterPlot",
  data: populationData,
  x: { field: "income" },
  y: { field: "lifeExpectancy" },
  size: { field: "population" },
  color: { field: "region" },
  accessibility: {
    keyboardNavigation: {
      mode: "sequential",
      focusIndicator: {
        stroke: "black",
        strokeWidth: 2,
        strokeDasharray: "3,3"
      },
      announcements: {
        onFocus: item => `Country: ${item.country}, Income: ${item.income}, Life Expectancy: ${item.lifeExpectancy}`
      }
    }
  }
}, container);
```

## Advanced Interaction Patterns

### Zoom and Pan

Enable zooming and panning for large datasets:

```javascript
const zoomableChart = buildViz({
  type: "scatterPlot",
  data: largeDataset,
  x: { field: "x" },
  y: { field: "y" },
  interactions: [
    {
      type: "zoom",
      trigger: "wheel",
      constraints: {
        scaleExtent: [0.5, 10],
        translateExtent: [[-100, -100], [800, 600]]
      }
    },
    {
      type: "pan",
      trigger: "drag"
    }
  ]
}, container);
```

### Drill-Down

Enable exploring hierarchical data:

```javascript
const drillDownChart = buildViz({
  type: "barChart",
  data: hierarchicalData,
  x: { field: "category" },
  y: { field: "value" },
  states: {
    drillLevel: {
      initial: "top",
      transitions: [
        {
          event: "click",
          target: "bar",
          action: (state, event) => event.data.hasChildren ? event.data.id : state
        },
        {
          event: "click",
          target: "backButton",
          action: (state, event) => event.data.parentId || "top"
        }
      ]
    }
  },
  transforms: [
    {
      type: "filter",
      expr: (d, states) => d.parentId === states.drillLevel || (states.drillLevel === "top" && !d.parentId)
    }
  ],
  components: [
    {
      type: "button",
      visible: state => state.drillLevel !== "top",
      text: "Back",
      id: "backButton",
      data: state => ({ parentId: getParentId(state.drillLevel) })
    }
  ]
}, container);
```

## Next Steps

In this tutorial, we've explored how to create interactive, animated, and accessible visualizations using Devize. We've learned how to add tooltips, highlighting, selection, coordinated views, animations, and accessibility features.

The declarative approach of Devize makes it easier to create complex interactive visualizations without writing imperative code. By specifying what interactions you want rather than how to implement them, you can focus on the user experience rather than the technical details.

## Exercises

1. Create a bar chart with tooltips and click-to-select interaction.
2. Build a scatter plot with zoom and pan capabilities.
3. Create a dashboard with multiple coordinated visualizations.
4. Implement a chart with animated data transitions.
5. Make an accessible visualization with keyboard navigation and screen reader support.

Happy visualizing with Devize!

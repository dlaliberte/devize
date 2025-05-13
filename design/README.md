# Devize: A Declarative, Constraint-Based Data Visualization Library

## 1. Introduction

Devize is a novel data visualization library that takes a declarative, constraint-based approach to creating visualizations. Unlike imperative visualization libraries that require explicit instructions for rendering, Devize allows users to specify *what* they want to visualize rather than *how* to visualize it.

The core philosophy of Devize is to separate the description of visualizations from their implementation, enabling more flexible, reusable, and composable visualization specifications.

## 2. Core Concepts

### 2.1 Declarative Specification

Visualizations in Devize are defined using object structures (similar to JSON) that describe the desired visualization properties. Each visualization has a "type" attribute that determines how the rest of the properties are interpreted.

See [basic_spec.js](../../examples/basic_spec.js) for an example.

### 2.2 Constraint-Based Layout

A key innovation in Devize is its constraint-based layout system. Instead of explicitly positioning elements, users can specify relationships between elements that must be satisfied. The constraint solver will find an optimal layout that satisfies these constraints.

### 2.3 Compositional Model

Visualizations can be composed of other visualizations, creating a hierarchical structure. This allows for complex visualizations to be built from simpler components.

### 2.4 Flexible Data Handling

Devize separates visualization specifications from data, allowing for:
- Embedded data directly in specifications
- Referenced data that can be provided separately
- Data transformations within the visualization pipeline
- Efficient updates when data changes

This separation enables visualization templates that can be applied to different datasets and optimized for performance.

### 2.5 Extension System

Devize provides a powerful extension mechanism that allows:
- Creating new visualization types based on existing ones
- Overriding specific aspects while inheriting others
- Enhancing visualizations with additional features
- Reusing visualization patterns across different contexts

This prototype-based extension model offers more flexibility than classical inheritance while maintaining the benefits of the declarative approach.

## 3. Architecture

### 3.1 High-Level Architecture

```
┌─────────────────┐     ┌───────────────┐     ┌────────────────┐
│ Visualization   │     │ Constraint    │     │ Rendering      │
│ Specification   │───▶│ Solver        │────▶│ Engine         │
└─────────────────┘     └───────────────┘     └────────────────┘
              ▲                       ▲                     ▲
              │                       │                     │
┌─────────────────┐     ┌───────────────┐     ┌────────────────┐
│ Visualization   │     │ Constraint    │     │ Rendering      │
│ Types Library   │     │ Types Library │     │ Backends       │
└─────────────────┘     └───────────────┘     └────────────────┘
```

### 3.2 Core Components

1. **Specification Parser**: Validates and processes visualization specifications
2. **Type Registry**: Manages available visualization types and their extensions
3. **Constraint Solver**: Resolves constraints to determine final layout
4. **Data Transformer**: Processes and transforms input data
5. **Rendering Engine**: Produces the final visualization output

## 4. Constraint System

### 4.1 Constraint Types

- **Positional Constraints**: Relative or absolute positioning of elements
- **Dimensional Constraints**: Size relationships between elements
- **Distributional Constraints**: How elements are distributed in space
- **Aesthetic Constraints**: Visual properties like aspect ratios
- **Data-Driven Constraints**: Relationships derived from the data

### 4.2 Constraint Solver

The constraint solver is the heart of Devize. It takes a set of constraints and finds a solution that satisfies them optimally. The solver will:

1. Parse constraint specifications
2. Build a constraint satisfaction problem (CSP)
3. Apply constraint optimization techniques
4. Resolve conflicts using priority levels
5. Generate a solution that can be rendered

See [constraintSolver.js](../src/core/constraintSolver.js) for implementation details.

```javascript
class ConstraintSolver {
  constructor() {
    this.constraints = [];
    this.variables = new Map();
  }

  addConstraint(constraint) {
    this.constraints.push(constraint);
    // Extract variables from constraint
    this.extractVariables(constraint);
  }

  solve() {
    // Build the constraint satisfaction problem
    const csp = this.buildCSP();

    // Apply solving algorithm (e.g., backtracking, local search)
    const solution = this.solveCSP(csp);

    // Handle any conflicts using priorities
    return this.resolveConflicts(solution);
  }

  // Implementation details for CSP solving...
}
```

### 4.3 Solving Algorithms

The library will implement multiple constraint solving algorithms:

- **Linear constraint solver**: For simple linear relationships
- **Cassowary algorithm**: For hierarchical constraint systems
- **Force-directed layout**: For graph-based visualizations
- **Simulated annealing**: For complex optimization problems

## 5. Visualization Types

### 5.1 Primitive Types

- **Geometric primitives**: Rectangles, circles, lines, paths, etc.
- **Scales**: Continuous, discrete, color scales
- **Text elements**: Basic text rendering
- **Containers**: Groups and layout containers

### 5.2 Composite Types

- **Axes**: Linear, logarithmic, categorical axes (implemented as visualizations)
- **Legends**: Various legend types (implemented as visualizations)
- **Standard charts**: Bar, line, scatter, pie, etc.
- **Statistical visualizations**: Box plots, histograms, etc.
- **Specialized visualizations**: Tree maps, network graphs, etc.
- **Custom composite types**: User-defined combinations

### 5.3 Compositional Approach

Following the principle that everything possible should be implemented as a composite type:

1. **Axes** are visualizations that combine lines, ticks, labels, and grid lines
2. **Legends** are visualizations that combine shapes, text, and layout logic
3. **Charts** are visualizations that combine axes, data marks, legends, and annotations

This compositional approach provides several benefits:
- Consistent programming model across all visualization elements
- Ability to customize any component using the same declarative syntax
- Reusability of constraint patterns and layout logic
- Extensibility through composition rather than inheritance

### 5.4 Type Definition

See [barChart.js](../src/types/barChart.js) for an example of a visualization type definition.

```javascript
const barChartType = {
  name: "barChart",

  // Required properties
  requiredProps: ["data", "x", "y"],

  // Optional properties with defaults
  optionalProps: {
    color: null,
    opacity: 1,
    barWidth: null,
    padding: 0.1
  },

  // Constraint generator
  generateConstraints(spec, context) {
    const constraints = [];

    // Generate basic layout constraints
    constraints.push({
      type: "containerFit",
      element: "chart",
      container: context.container
    });

    // Generate data-driven constraints
    const dataLength = spec.data.length;
    for (let i = 0; i < dataLength; i++) {
      // Bar positioning constraints
      // Bar sizing constraints
      // etc.
    }

    return constraints;
  },

  // Decomposition into primitives
  decompose(spec, solvedConstraints) {
    // Return primitive elements with positions and dimensions
    return {
      type: "group",
      children: [
        // Axes, bars, labels, etc.
      ]
    };
  }
};
```

### 5.5 Type Extension

Devize allows creating new visualization types by extending existing ones:

```javascript
// Extend the bar chart type to create a horizontal bar chart
extendType("barChart", {
  name: "horizontalBarChart",

  // Add new properties
  optionalProps: {
    barHeight: null
  },

  // Override constraint generation
  generateConstraints(spec, context) {
    const constraints = [];

    // Add horizontal-specific constraints
    constraints.push({
      type: "orientation",
      value: "horizontal"
    });

    return constraints;
  },

  // Enhance decomposition
  enhanceDecomposition: true,
  decompose(spec, solvedConstraints, baseResult) {
    // Modify the base result to make it horizontal
    // For example, swap x and y axes

    // Find and modify the axes
    const xAxis = baseResult.children.find(c => c.type === "axis" && c.orientation === "bottom");
    const yAxis = baseResult.children.find(c => c.type === "axis" && c.orientation === "left");

    if (xAxis) xAxis.orientation = "left";
    if (yAxis) yAxis.orientation = "bottom";

    // Modify other components as needed

    return baseResult;
  }
});
```

5.6 Visualization Definition with define
Devize provides a powerful mechanism for defining new visualization types declaratively using the define type. This allows users to create custom visualizations by composing existing ones, without writing explicit code.

5.6.1 Basic Definition

```json
// Define a new visualization type
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

The extend property allows inheriting from an existing visualization type:

```json
buildViz({
  type: "define",
  name: "horizontalBarChart",
  extend: "barChart",
  implementation: {
    // Override specific aspects of the barChart implementation
    orientation: "horizontal",
    // Other properties are inherited from barChart
  }
});
```

5.6.3 Internal Use
The define type is used internally by Devize to implement many of its standard visualizations. For example, axes, legends, and various chart types are all defined using this mechanism, making the library highly extensible and consistent.

This approach provides several benefits:

- Declarative definition of new visualization types
- Reuse of existing components
- Consistent property handling
- Clear separation between interface and implementation
- Easy customization through property overrides



## 6. Data Handling

### 6.1 Data Binding

Data is bound to visual elements through field specifications.

See [data_binding.js](../examples/data_binding.js) for an example.

```javascript
const spec = {
  type: "scatterPlot",
  data: dataset,
  x: { field: "income", type: "quantitative" },
  y: { field: "lifeExpectancy", type: "quantitative" },
  size: { field: "population", type: "quantitative" },
  color: { field: "region", type: "categorical" }
};
```

### 6.2 Data Sources

Devize supports multiple types of data sources:

#### 6.2.1 Inline Data

```javascript
const vizWithInlineData = buildViz({
  type: "barChart",
  data: {
    type: "inline",
    values: [
      { product: "A", revenue: 420 },
      { product: "B", revenue: 650 },
      { product: "C", revenue: 340 }
    ]
  },
  x: { field: "product" },
  y: { field: "revenue" }
}, container);
```

#### 6.2.2 Referenced Data

```javascript
// Register data
registerData("salesData", [
  { product: "A", revenue: 420 },
  { product: "B", revenue: 650 },
  { product: "C", revenue: 340 }
]);

// Create visualization with referenced data
const vizWithReferencedData = buildViz({
  type: "barChart",
  data: {
    type: "reference",
    name: "salesData"
  },
  x: { field: "product" },
  y: { field: "revenue" }
}, container);
```

#### 6.2.3 URL Data

```javascript
const vizWithUrlData = buildViz({
  type: "barChart",
  data: {
    type: "url",
    url: "https://example.com/data/sales.json",
    format: "json"
  },
  x: { field: "product" },
  y: { field: "revenue" }
}, container);
```

### 6.3 Data Transformations

Built-in transformations for common operations:

- Filtering
- Aggregation
- Binning
- Normalization
- Joining

See [data_transform.js](../examples/data_transform.js) for an example.

```javascript
const spec = {
  type: "barChart",
  data: dataset,
  transforms: [
    { type: "filter", test: "d => d.value > 0" },
    { type: "aggregate", groupBy: "category", ops: ["sum"], fields: ["value"] }
  ],
  x: { field: "category" },
  y: { field: "sum_value" }
};
```

### 6.4 Visualization Templates

Visualization templates separate the structure of a visualization from its data:

```javascript
// Create a template
const barChartTemplate = buildVizTemplate({
  type: "barChart",
  data: {
    type: "reference",
    name: "chartData"
  },
  x: { field: "category" },
  y: { field: "value" }
});

// Render with different data sources
const chart1 = renderVizTemplate(
  barChartTemplate,
  document.getElementById("chart1"),
  { chartData: salesData }
);

const chart2 = renderVizTemplate(
  barChartTemplate,
  document.getElementById("chart2"),
  { chartData: marketingData }
);
```

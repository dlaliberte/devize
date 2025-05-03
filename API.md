# Devize API Reference

This document outlines the public API for the Devize library, with a focus on data handling, visualization creation, and extension mechanisms.

## 1. Core API

### 1.1 Creating Visualizations

```typescript
function createViz(
  spec: VisualizationSpec,
  container: HTMLElement
): Visualization;
```

Creates a visualization from a specification and renders it to the specified container.

**Example:**
```typescript
const barChart = createViz({
  type: "barChart",
  data: salesData,
  x: { field: "product" },
  y: { field: "revenue" }
}, document.getElementById("chart-container"));
```

### 1.2 Updating Visualizations

```typescript
function updateViz(
  viz: Visualization,
  newSpec: Partial<VisualizationSpec>
): Visualization;
```

Updates an existing visualization with new specification properties.

**Example:**
```typescript
updateViz(barChart, {
  color: { field: "category" },
  title: "Updated Chart"
});
```

## 2. Data Handling API

### 2.1 Data Sources

Devize supports multiple types of data sources:

#### 2.1.1 Inline Data

Data directly embedded in the visualization specification.

```typescript
const vizWithInlineData = createViz({
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

#### 2.1.2 Referenced Data

Data referenced by name, which must be registered separately.

```typescript
// Register data
registerData("salesData", [
  { product: "A", revenue: 420 },
  { product: "B", revenue: 650 },
  { product: "C", revenue: 340 }
]);

// Create visualization with referenced data
const vizWithReferencedData = createViz({
  type: "barChart",
  data: {
    type: "reference",
    name: "salesData"
  },
  x: { field: "product" },
  y: { field: "revenue" }
}, container);
```

#### 2.1.3 URL Data

Data fetched from a URL.

```typescript
const vizWithUrlData = createViz({
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

#### 2.1.4 Transformed Data

Data derived from another source with transformations applied.

```typescript
const vizWithTransformedData = createViz({
  type: "barChart",
  data: {
    type: "transform",
    source: "salesData",
    transforms: [
      { type: "filter", test: "d => d.revenue > 400" },
      { type: "sort", field: "revenue", order: "descending" }
    ]
  },
  x: { field: "product" },
  y: { field: "revenue" }
}, container);
```

### 2.2 Data Registration

```typescript
function registerData(
  name: string,
  data: any[]
): void;
```

Registers a named data source that can be referenced in visualization specifications.

**Example:**
```typescript
registerData("salesData", salesData);
```

### 2.3 Data Updates

```typescript
function updateData(
  name: string,
  newData: any[]
): void;
```

Updates a registered data source and automatically updates any visualizations using it.

**Example:**
```typescript
updateData("salesData", newSalesData);
```

### 2.4 Data Binding

```typescript
function bindData(
  vizTemplate: VisualizationTemplate,
  data: Record<string, any[]>
): Visualization;
```

Binds data to a visualization template, creating a fully realized visualization.

**Example:**
```typescript
// Create a template
const barChartTemplate = createVizTemplate({
  type: "barChart",
  data: {
    type: "reference",
    name: "salesData"
  },
  x: { field: "product" },
  y: { field: "revenue" }
});

// Bind data to the template
const barChart = bindData(barChartTemplate, {
  salesData: salesData
});

// Render the visualization
renderViz(barChart, container);
```

## 3. Visualization Templates

### 3.1 Creating Templates

```typescript
function createVizTemplate(
  spec: VisualizationSpec
): VisualizationTemplate;
```

Creates a reusable visualization template that can be bound to different data sources.

**Example:**
```typescript
const barChartTemplate = createVizTemplate({
  type: "barChart",
  data: {
    type: "reference",
    name: "chartData"
  },
  x: { field: "category" },
  y: { field: "value" }
});
```

### 3.2 Rendering Templates

```typescript
function renderVizTemplate(
  template: VisualizationTemplate,
  container: HTMLElement,
  data?: Record<string, any[]>
): Visualization;
```

Renders a visualization template to a container, optionally providing data.

**Example:**
```typescript
const chart = renderVizTemplate(
  barChartTemplate,
  document.getElementById("chart-container"),
  { chartData: salesData }
);
```

## 4. Type Registration and Extension API

### 4.1 Registering Visualization Types

```typescript
function registerType(
  typeDefinition: VisualizationType
): void;
```

Registers a custom visualization type.

**Example:**
```typescript
registerType({
  name: "customChart",
  requiredProps: ["data", "x", "y"],
  optionalProps: { color: null, opacity: 1 },
  generateConstraints: (spec, context) => { /* ... */ },
  decompose: (spec, solvedConstraints) => { /* ... */ }
});
```

### 4.2 Extending Visualization Types

```typescript
function extendType(
  baseName: string,
  extension: Partial<VisualizationType> & { name: string }
): void;
```

Creates a new visualization type that extends an existing type.

**Example:**
```typescript
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

### 4.3 Extending Visualization Specifications

```typescript
function createVizFromBase(
  baseSpec: VisualizationSpec,
  extension: Partial<VisualizationSpec>
): VisualizationSpec;
```

Creates a new visualization specification by extending an existing one.

**Example:**
```typescript
// Create a base specification
const baseChartSpec = {
  type: "barChart",
  data: salesData,
  x: { field: "product" },
  y: { field: "revenue" },
  color: "#3366CC"
};

// Create variations by extending the base
const redChart = createViz(
  createVizFromBase(baseChartSpec, { color: "#CC3366" }),
  document.getElementById("red-chart")
);

const filteredChart = createViz(
  createVizFromBase(baseChartSpec, {
    data: {
      type: "transform",
      source: salesData,
      transforms: [{ type: "filter", test: "d => d.revenue > 400" }]
    }
  }),
  document.getElementById("filtered-chart")
);
```

### 4.4 Registering Constraint Types

```typescript
function registerConstraint(
  constraintDefinition: ConstraintDefinition
): void;
```

Registers a custom constraint type.

**Example:**
```typescript
registerConstraint({
  name: "customAlignment",
  requiredProps: ["elements"],
  solve: (constraint, variables) => { /* ... */ }
});
```

## 5. Advanced Features

### 5.1 Composition

```typescript
const compositeViz = createViz({
  type: "group",
  children: [
    {
      type: "barChart",
      data: { type: "reference", name: "salesData" },
      x: { field: "product" },
      y: { field: "revenue" }
    },
    {
      type: "lineChart",
      data: { type: "reference", name: "trendData" },
      x: { field: "month" },
      y: { field: "value" }
    }
  ],
  layout: { type: "vertical", gap: 20 }
}, container);
```

### 5.2 Combining Extension and Composition

```typescript
// First, extend a type
extendType("barChart", {
  name: "annotatedBarChart",

  // Add properties for annotations
  optionalProps: {
    annotations: []
  },

  // Enhance decomposition to include annotations
  enhanceDecomposition: true,
  decompose(spec, solvedConstraints, baseResult) {
    if (!spec.annotations || spec.annotations.length === 0) {
      return baseResult;
    }

    // Add annotation layer to the composition
    return {
      ...baseResult,
      children: [
        ...baseResult.children,
        {
          type: "annotationLayer",
          annotations: spec.annotations,
          // Other properties
        }
      ]
    };
  }
});

// Then use it in a composition
const dashboard = createViz({
  type: "dashboard",
  layout: { type: "grid", columns: 2 },
  views: [
    {
      type: "annotatedBarChart",
      data: salesData,
      x: { field: "product" },
      y: { field: "revenue" },
      annotations: [
        { type: "line", x1: 0, y1: 500, x2: 4, y2: 500, stroke: "red" }
      ]
    },
    {
      type: "pieChart",
      data: salesData,
      value: { field: "revenue" },
      color: { field: "product" }
    }
  ]
}, container);
```

### 5.3 Interactivity

```typescript
const interactiveViz = createViz({
  type: "barChart",
  data: { type: "reference", name: "salesData" },
  x: { field: "product" },
  y: { field: "revenue" },
  interactions: [
    {
      type: "hover",
      target: "bar",
      effect: { fill: "#FF9900" }
    },
    {
      type: "click",
      target: "bar",
      action: (data) => {
        console.log("Clicked:", data);
        // Update other visualizations or trigger events
      }
    }
  ]
}, container);
```

### 5.4 Animation

```typescript
const animatedViz = createViz({
  type: "barChart",
  data: { type: "reference", name: "salesData" },
  x: { field: "product" },
  y: { field: "revenue" },
  animations: {
    enter: { type: "fade", duration: 500 },
    update: { type: "transition", duration: 300 },
    exit: { type: "fade", duration: 200 }
  }
}, container);
```

## 6. Data Types and Interfaces

### 6.1 Data Source Types

```typescript
type DataSourceType = 'inline' | 'reference' | 'url' | 'transform';

interface DataSource {
  type: DataSourceType;
  // Other properties based on type
}

interface InlineDataSource extends DataSource {
  type: 'inline';
  values: any[]; // The actual data array
}

interface ReferenceDataSource extends DataSource {
  type: 'reference';
  name: string; // Reference identifier
}

interface UrlDataSource extends DataSource {
  type: 'url';
  url: string;
  format?: 'json' | 'csv' | 'tsv';
}

interface TransformDataSource extends DataSource {
  type: 'transform';
  source: DataSource | string; // Source data or reference
  transforms: Transform[]; // Array of transformations to apply
}
```

### 6.2 Visualization Specification

```typescript
interface VisualizationSpec {
  type: string;
  data?: DataSource | any[];
  [key: string]: any; // Other properties based on visualization type
}
```

### 6.3 Visualization Type Definition

```typescript
interface VisualizationType {
  name: string;
  requiredProps?: string[];
  optionalProps?: Record<string, any>;
  generateConstraints: (spec: VisualizationSpec, context: any) => Constraint[];
  decompose: (spec: VisualizationSpec, solvedConstraints: any) => VisualizationSpec;
  enhanceDecomposition?: boolean;
}
```

### 6.4 Visualization Template

```typescript
interface VisualizationTemplate {
  spec: VisualizationSpec;
  dataReferences: string[];
  bindData: (data: Record<string, any[]>) => Visualization;
}
```

### 6.5 Visualization

```typescript
interface Visualization {
  spec: VisualizationSpec;
  render: (container: HTMLElement) => void;
  update: (newSpec?: Partial<VisualizationSpec>, newData?: Record<string, any[]>) => void;
  destroy: () => void;
}
```

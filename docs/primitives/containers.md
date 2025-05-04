# Container Components

Container components in Devize allow you to group and organize multiple visualizations.

## Group

The group type allows composing multiple visualizations together:

```javascript
createViz({
  type: "group",
  children: [
    {
      type: "rectangle",
      x: 50,
      y: 50,
      width: 100,
      height: 80,
      fill: "#6699CC"
    },
    {
      type: "circle",
      cx: 250,
      cy: 80,
      r: 40,
      fill: "#CC6666"
    }
  ]
}, document.getElementById("viz-container"));
```

### Properties

| Property | Type | Description | Default |
|----------|------|-------------|---------|
| children | array | Array of child visualization specifications | Required |
| x | number | X coordinate of the group | 0 |
| y | number | Y coordinate of the group | 0 |
| width | number | Width of the group | Auto |
| height | number | Height of the group | Auto |
| clip | boolean | Whether to clip children to the group bounds | false |

## Dashboard

The dashboard type creates a grid layout of visualizations:

```javascript
createViz({
  type: "dashboard",
  layout: { type: "grid", columns: 2, rows: 2, gap: 20 },
  views: [
    {
      id: "view1",
      type: "barChart",
      data: salesData,
      x: { field: "product" },
      y: { field: "revenue" },
      title: "Revenue by Product"
    },
    {
      id: "view2",
      type: "pieChart",
      data: salesData,
      value: { field: "revenue" },
      color: { field: "product" },
      title: "Revenue Distribution"
    },
    {
      id: "view3",
      type: "scatterPlot",
      data: populationData,
      x: { field: "gdp" },
      y: { field: "population" },
      color: { field: "continent" },
      title: "GDP vs Population"
    },
    {
      id: "view4",
      type: "lineChart",
      data: timeSeriesData,
      x: { field: "date" },
      y: { field: "value" },
      title: "Time Series Data"
    }
  ]
}, document.getElementById("dashboard-container"));
```

### Properties

| Property | Type | Description | Default |
|----------|------|-------------|---------|
| layout | object | Layout configuration | Required |
| views | array | Array of visualization specifications | Required |
| width | number | Width of the dashboard | Container width |
| height | number | Height of the dashboard | Container height |

const barChartSpec = {
  type: "barChart",
  data: dataSource,
  x: {
    field: "category",
    type: "ordinal"
  },
  y: {
    field: "value",
    type: "quantitative"
  },
  color: {
    field: "group",
    scale: "categorical"
  },
  constraints: [
    { type: "fitToContainer", priority: "high" },
    { type: "barWidthRatio", value: 0.8 }
  ]
};

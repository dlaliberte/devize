const spec = {
  type: "scatterPlot",
  data: dataset,
  x: { field: "income", type: "quantitative" },
  y: { field: "lifeExpectancy", type: "quantitative" },
  size: { field: "population", type: "quantitative" },
  color: { field: "region", type: "categorical" }
};

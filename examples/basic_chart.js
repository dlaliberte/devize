const barChart = buildViz({
  type: "barChart",
  data: salesData,
  x: { field: "product" },
  y: { field: "revenue" },
  color: { field: "category" }
}, document.getElementById("chart-container"));

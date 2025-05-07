const dashboard = buildViz({
  type: "dashboard",
  layout: { type: "grid", columns: 2 },
  views: [
    {
      type: "lineChart",
      data: timeSeriesData,
      x: { field: "date" },
      y: { field: "value" },
      constraints: [{ type: "aspectRatio", value: 2 }]
    },
    {
      type: "pieChart",
      data: categoryData,
      value: { field: "amount" },
      color: { field: "category" }
    },
    {
      type: "table",
      data: detailData,
      columns: ["date", "category", "value", "growth"]
    }
  ],
  constraints: [
    { type: "equalHeight", elements: ["view0", "view1"] }
  ]
}, document.getElementById("dashboard"));

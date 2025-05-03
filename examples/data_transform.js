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

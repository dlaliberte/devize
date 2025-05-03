// Register the barChart visualization type using a fully declarative implementation
createViz({
  type: "define",
  name: "barChart",
  properties: {
    data: { required: true },
    x: { required: true },
    y: { required: true },
    color: { default: "#3366CC" },
    margin: { default: { top: 40, right: 30, bottom: 60, left: 60 } },
    tooltip: { default: false },
    barPadding: { default: 0.2 },
    title: { default: "" }
  },
  implementation: function(props, container) {
    // Ensure margin exists with defaults
    const margin = props.margin || { top: 40, right: 30, bottom: 60, left: 60 };

    // Create the chart group
    const chartSpec = {
      type: "group",
      transform: `translate(${margin.left}, ${margin.top})`,
      children: []
    };

    const data = props.data;
    const xField = props.x.field;
    const yField = props.y.field;

    // Calculate dimensions
    const width = props.width || 800;
    const height = props.height || 400;
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Create scales
    const xScale = index => index * (chartWidth / data.length) + (chartWidth / data.length) * 0.5;
    const yScale = value => chartHeight - (value / (Math.max(...data.map(d => d[yField])) * 1.1) * chartHeight);

    // Create color scale
    let colorScale;
    let colorField;
    let categories = [];
    const colors = ["#3366CC", "#DC3912", "#FF9900", "#109618", "#990099"];

    if (typeof props.color === 'string') {
      // Single color for all bars
      colorScale = () => props.color;
    } else if (props.color && props.color.field) {
      // Color based on a field
      colorField = props.color.field;
      categories = [...new Set(data.map(d => d[colorField]))];
      const colorMap = {};
      categories.forEach((category, i) => {
        colorMap[category] = colors[i % colors.length];
      });
      colorScale = d => colorMap[d[colorField]];
    } else {
      // Default color with variation
      colorScale = (d, i) => colors[i % colors.length];
    }

    // Generate bars
    data.forEach((d, i) => {
      const barWidth = (chartWidth / data.length) * (1 - (props.barPadding || 0.2));
      const barHeight = chartHeight - yScale(d[yField]);
      const barX = xScale(i) - barWidth / 2;
      const barY = yScale(d[yField]);

      // Add bar
      chartSpec.children.push({
        type: "rectangle",
        x: barX,
        y: barY,
        width: barWidth,
        height: barHeight,
        fill: colorScale(d, i),
        stroke: "#fff",
        strokeWidth: 1,
        data: d,
        tooltip: props.tooltip ? true : false
      });

      // Add x-axis tick
      chartSpec.children.push({
        type: "line",
        x1: xScale(i),
        y1: chartHeight,
        x2: xScale(i),
        y2: chartHeight + 5,
        stroke: "#333",
        strokeWidth: 1
      });

      // Add x-axis label
      chartSpec.children.push({
        type: "text",
        x: xScale(i),
        y: chartHeight + 20,
        text: d[xField],
        fontSize: "12px",
        fontFamily: "Arial",
        fill: "#333",
        textAnchor: "middle"
      });
    });

    // Add axes
    // X-axis
    chartSpec.children.push({
      type: "line",
      x1: 0,
      y1: chartHeight,
      x2: chartWidth,
      y2: chartHeight,
      stroke: "#333",
      strokeWidth: 1
    });

    // Y-axis
    chartSpec.children.push({
      type: "line",
      x1: 0,
      y1: 0,
      x2: 0,
      y2: chartHeight,
      stroke: "#333",
      strokeWidth: 1
    });

    // X-axis label
    chartSpec.children.push({
      type: "text",
      x: chartWidth / 2,
      y: chartHeight + 40,
      text: xField,
      fontSize: "14px",
      fontFamily: "Arial",
      fill: "#333",
      textAnchor: "middle"
    });

    // Y-axis label
    chartSpec.children.push({
      type: "text",
      x: -chartHeight / 2,
      y: -40,
      text: yField,
      fontSize: "14px",
      fontFamily: "Arial",
      fill: "#333",
      textAnchor: "middle",
      transform: "rotate(-90)"
    });

    // Add title
    if (props.title) {
      chartSpec.children.push({
        type: "text",
        x: chartWidth / 2,
        y: -10,
        text: props.title || `${yField} by ${xField}`,
        fontSize: "16px",
        fontFamily: "Arial",
        fontWeight: "bold",
        fill: "#333",
        textAnchor: "middle"
      });
    }

    // Add legend if using categorical colors
    if (colorField) {
      const legendGroup = {
        type: "group",
        transform: `translate(${chartWidth - 120}, 10)`,
        children: []
      };

      categories.forEach((category, i) => {
        // Add legend color box
        legendGroup.children.push({
          type: "rectangle",
          x: 0,
          y: i * 20,
          width: 12,
          height: 12,
          fill: colors[i % colors.length]
        });

        // Add legend text
        legendGroup.children.push({
          type: "text",
          x: 20,
          y: i * 20 + 10,
          text: category,
          fontSize: "12px",
          fontFamily: "Arial",
          fill: "#333"
        });
      });

      chartSpec.children.push(legendGroup);
    }

    // Create the chart
    return createViz(chartSpec, container);
  }
});

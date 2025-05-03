// Create a visualization from a spec
function createViz(spec, container) {
  // For this example, we'll implement a simplified barChart type
  // that handles data binding and transformations
  if (spec.type === "barChart") {
    return createBarChart(spec, container);
  } else if (spec.type === "group") {
    return createGroup(spec, container);
  } else if (spec.type === "rectangle") {
    return createRectangle(spec, container);
  } else if (spec.type === "circle") {
    return createCircle(spec, container);
  } else if (spec.type === "line") {
    return createLine(spec, container);
  } else if (spec.type === "text") {
    return createText(spec, container);
  }

  // Default fallback
  console.error("Unknown visualization type:", spec.type);
  return null;
}

// Create a bar chart with data binding
function createBarChart(spec, container) {
  const svg = ensureSvg(container);

  // Clear existing content
  while (svg.firstChild) {
    svg.removeChild(svg.firstChild);
  }

  // Get data and apply transformations
  let data = [...spec.data]; // Clone the data

  // Apply transforms if specified
  if (spec.transforms && Array.isArray(spec.transforms)) {
    for (const transform of spec.transforms) {
      if (transform.type === "filter" && transform.test) {
        // Convert string test to function if needed
        const testFn = typeof transform.test === 'string'
          ? new Function('d', `return ${transform.test}`)
          : transform.test;
        data = data.filter(testFn);
      } else if (transform.type === "sort" && transform.field) {
        data.sort((a, b) => {
          const aValue = a[transform.field];
          const bValue = b[transform.field];
          const direction = transform.order === "descending" ? -1 : 1;
          return direction * (aValue - bValue);
        });
      }
    }
  }

  // Set up dimensions
  const margin = { top: 40, right: 30, bottom: 60, left: 60 };
  const width = container.clientWidth - margin.left - margin.right;
  const height = container.clientHeight - margin.top - margin.bottom;

  // Create a group for the chart
  const chart = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  chart.setAttribute('transform', `translate(${margin.left}, ${margin.top})`);
  svg.appendChild(chart);

  // Create scales
  const xScale = (index) => index * (width / data.length) + (width / data.length) * 0.5;
  const yScale = (value) => height - (value / 700 * height);

  // Create color scale
  const categories = [...new Set(data.map(d => d[spec.color.field]))];
  const colors = ["#3366CC", "#DC3912", "#FF9900", "#109618", "#990099"];
  const colorScale = {};
  categories.forEach((category, i) => {
    colorScale[category] = colors[i % colors.length];
  });

  // Draw axes
  // X-axis
  const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  xAxis.setAttribute('x1', 0);
  xAxis.setAttribute('y1', height);
  xAxis.setAttribute('x2', width);
  xAxis.setAttribute('y2', height);
  xAxis.setAttribute('stroke', '#333');
  xAxis.setAttribute('stroke-width', 1);
  chart.appendChild(xAxis);

  // X-axis label
  const xAxisLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  xAxisLabel.setAttribute('x', width / 2);
  xAxisLabel.setAttribute('y', height + 40);
  xAxisLabel.setAttribute('text-anchor', 'middle');
  xAxisLabel.setAttribute('font-size', '14px');
  xAxisLabel.textContent = spec.x.field;
  chart.appendChild(xAxisLabel);

  // Y-axis
  const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  yAxis.setAttribute('x1', 0);
  yAxis.setAttribute('y1', 0);
  yAxis.setAttribute('x2', 0);
  yAxis.setAttribute('y2', height);
  yAxis.setAttribute('stroke', '#333');
  yAxis.setAttribute('stroke-width', 1);
  chart.appendChild(yAxis);

  // Y-axis label
  const yAxisLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  yAxisLabel.setAttribute('x', -height / 2);
  yAxisLabel.setAttribute('y', -40);
  yAxisLabel.setAttribute('text-anchor', 'middle');
  yAxisLabel.setAttribute('font-size', '14px');
  yAxisLabel.setAttribute('transform', 'rotate(-90)');
  yAxisLabel.textContent = spec.y.field;
  chart.appendChild(yAxisLabel);

  // Draw bars
  data.forEach((d, i) => {
    const barWidth = (width / data.length) * 0.8;
    const barHeight = height - yScale(d[spec.y.field]);
    const barX = xScale(i) - barWidth / 2;
    const barY = yScale(d[spec.y.field]);

    const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bar.setAttribute('x', barX);
    bar.setAttribute('y', barY);
    bar.setAttribute('width', barWidth);
    bar.setAttribute('height', barHeight);
    bar.setAttribute('fill', colorScale[d[spec.color.field]]);
    bar.setAttribute('stroke', '#fff');
    bar.setAttribute('stroke-width', 1);

    // Store data for tooltip
    bar._data = d;

    // Add event listeners for tooltip
    if (spec.tooltip) {
      bar.addEventListener('mouseover', showTooltip);
      bar.addEventListener('mousemove', moveTooltip);
      bar.addEventListener('mouseout', hideTooltip);
    }

    chart.appendChild(bar);

    // Add x-axis tick
    const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    tick.setAttribute('x1', xScale(i));
    tick.setAttribute('y1', height);
    tick.setAttribute('x2', xScale(i));
    tick.setAttribute('y2', height + 5);
    tick.setAttribute('stroke', '#333');
    tick.setAttribute('stroke-width', 1);
    chart.appendChild(tick);

    // Add x-axis label
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', xScale(i));
    label.setAttribute('y', height + 20);
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('font-size', '12px');
    label.textContent = d[spec.x.field];
    chart.appendChild(label);
  });

  // Add title
  const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  title.setAttribute('x', width / 2);
  title.setAttribute('y', -10);
  title.setAttribute('text-anchor', 'middle');
  title.setAttribute('font-size', '16px');
  title.setAttribute('font-weight', 'bold');
  title.textContent = `${spec.y.field} by ${spec.x.field}`;
  chart.appendChild(title);

  // Add legend
  const legendGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  legendGroup.setAttribute('transform', `translate(${width - 100}, 0)`);
  chart.appendChild(legendGroup);

  categories.forEach((category, i) => {
    const legendItem = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    legendItem.setAttribute('transform', `translate(0, ${i * 20})`);

    const legendColor = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    legendColor.setAttribute('width', 12);
    legendColor.setAttribute('height', 12);
    legendColor.setAttribute('fill', colorScale[category]);
    legendItem.appendChild(legendColor);

    const legendText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    legendText.setAttribute('x', 20);
    legendText.setAttribute('y', 10);
    legendText.setAttribute('font-size', '12px');
    legendText.textContent = category;
    legendItem.appendChild(legendText);

    legendGroup.appendChild(legendItem);
  });

  // Return the visualization instance
  return {
    element: svg,
    spec: spec,
    data: data
  };
}

// Create a rectangle
function createRectangle(spec, container) {
  const svg = ensureSvg(container);

  // Create rectangle element
  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');

  // Set attributes from spec
  rect.setAttribute('x', spec.x || 0);
  rect.setAttribute('y', spec.y || 0);
  rect.setAttribute('width', spec.width || 0);
  rect.setAttribute('height', spec.height || 0);

  // Set style attributes
  if (spec.fill) rect.setAttribute('fill', spec.fill);
  if (spec.stroke) rect.setAttribute('stroke', spec.stroke);
  if (spec.strokeWidth) rect.setAttribute('stroke-width', spec.strokeWidth);
  if (spec.rx) rect.setAttribute('rx', spec.rx);
  if (spec.ry) rect.setAttribute('ry', spec.ry);
  if (spec.opacity) rect.setAttribute('opacity', spec.opacity);

  // Add to SVG
  svg.appendChild(rect);

  // Return the visualization instance
  return {
    element: rect,
    spec: spec
  };
}

// Create a circle
function createCircle(spec, container) {
  const svg = ensureSvg(container);

  // Create circle element
  const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');

  // Set attributes from spec
  circle.setAttribute('cx', spec.cx || 0);
  circle.setAttribute('cy', spec.cy || 0);
  circle.setAttribute('r', spec.r || 0);

  // Set style attributes
  if (spec.fill) circle.setAttribute('fill', spec.fill);
  if (spec.stroke) circle.setAttribute('stroke', spec.stroke);
  if (spec.strokeWidth) circle.setAttribute('stroke-width', spec.strokeWidth);
  if (spec.opacity) circle.setAttribute('opacity', spec.opacity);

  // Store data for interactivity
  if (spec.data) {
    circle._data = spec.data;

    // Add event listeners for tooltip
    circle.addEventListener('mouseover', showTooltip);
    circle.addEventListener('mousemove', moveTooltip);
    circle.addEventListener('mouseout', hideTooltip);
  }

  // Add to SVG
  svg.appendChild(circle);

  // Return the visualization instance
  return {
    element: circle,
    spec: spec
  };
}

// Create a line
function createLine(spec, container) {
  const svg = ensureSvg(container);

  // Create line element
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');

  // Set attributes from spec
  line.setAttribute('x1', spec.x1 || 0);
  line.setAttribute('y1', spec.y1 || 0);
  line.setAttribute('x2', spec.x2 || 0);
  line.setAttribute('y2', spec.y2 || 0);

  // Set style attributes
  if (spec.stroke) line.setAttribute('stroke', spec.stroke);
  if (spec.strokeWidth) line.setAttribute('stroke-width', spec.strokeWidth);
  if (spec.strokeDasharray) line.setAttribute('stroke-dasharray', spec.strokeDasharray);
  if (spec.opacity) line.setAttribute('opacity', spec.opacity);

  // Add to SVG
  svg.appendChild(line);

  // Return the visualization instance
  return {
    element: line,
    spec: spec
  };
}

// Create text
function createText(spec, container) {
  const svg = ensureSvg(container);

  // Create text element
  const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');

  // Set attributes from spec
  text.setAttribute('x', spec.x || 0);
  text.setAttribute('y', spec.y || 0);

  // Set style attributes
  if (spec.fill) text.setAttribute('fill', spec.fill);
  if (spec.fontSize) text.setAttribute('font-size', spec.fontSize);
  if (spec.fontFamily) text.setAttribute('font-family', spec.fontFamily);
  if (spec.fontWeight) text.setAttribute('font-weight', spec.fontWeight);
  if (spec.textAnchor) text.setAttribute('text-anchor', spec.textAnchor);
  if (spec.dominantBaseline) text.setAttribute('dominant-baseline', spec.dominantBaseline);
  if (spec.opacity) text.setAttribute('opacity', spec.opacity);
  if (spec.transform) text.setAttribute('transform', spec.transform);

  // Set the text content
  text.textContent = spec.text || '';

  // Add to SVG
  svg.appendChild(text);

  // Return the visualization instance
  return {
    element: text,
    spec: spec
  };
}

// Create a group
function createGroup(spec, container) {
  const svg = ensureSvg(container);

  // Create group element
  const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');

  // Set transform if provided
  if (spec.transform) {
    group.setAttribute('transform', spec.transform);
  }

  // Add to SVG
  svg.appendChild(group);

  // Create child visualizations
  const children = [];
  if (spec.children && Array.isArray(spec.children)) {
    for (const childSpec of spec.children) {
      // Create a temporary container for the child
      const tempContainer = {
        querySelector: () => svg,
        appendChild: () => {} // No-op since we're using the existing SVG
      };

      // Create the child visualization
      const child = createViz(childSpec, tempContainer);

      // If it's a valid child, add it to our children array
      if (child) {
        children.push(child);
      }
    }
  }

  // Return the visualization instance
  return {
    element: group,
    spec: spec,
    children: children
  };
}

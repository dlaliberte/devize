// Basic Shape Primitives
// =====================

// Define the rectangle primitive
createViz({
  type: "define",
  name: "rectangle",
  properties: {
    x: { default: 0 },
    y: { default: 0 },
    width: { required: true },
    height: { required: true },
    fill: { default: "steelblue" },
    stroke: { default: null },
    strokeWidth: { default: 1 },
    rx: { default: 0 },
    ry: { default: 0 },
    opacity: { default: 1 }
  },
  implementation: function(props, container) {
    const svg = ensureSvg(container);

    // Create rectangle element
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');

    // Set attributes from props
    rect.setAttribute('x', props.x);
    rect.setAttribute('y', props.y);
    rect.setAttribute('width', props.width);
    rect.setAttribute('height', props.height);

    // Set style attributes
    if (props.fill) rect.setAttribute('fill', props.fill);
    if (props.stroke) rect.setAttribute('stroke', props.stroke);
    if (props.strokeWidth) rect.setAttribute('stroke-width', props.strokeWidth);
    if (props.rx) rect.setAttribute('rx', props.rx);
    if (props.ry) rect.setAttribute('ry', props.ry);
    if (props.opacity !== 1) rect.setAttribute('opacity', props.opacity);

    // Store data for tooltip
    if (props.data) {
      rect._data = props.data;

      // Add event listeners for tooltip
      if (props.tooltip) {
        rect.addEventListener('mouseover', showTooltip);
        rect.addEventListener('mousemove', moveTooltip);
        rect.addEventListener('mouseout', hideTooltip);
      }
    }

    // Add to SVG
    svg.appendChild(rect);

    return {
      element: rect,
      spec: props
    };
  }
});

// Define the circle primitive
createViz({
  type: "define",
  name: "circle",
  properties: {
    cx: { required: true },
    cy: { required: true },
    r: { required: true },
    fill: { default: "steelblue" },
    stroke: { default: null },
    strokeWidth: { default: 1 },
    opacity: { default: 1 }
  },
  implementation: function(props, container) {
    const svg = ensureSvg(container);

    // Create circle element
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');

    // Set attributes from props
    circle.setAttribute('cx', props.cx);
    circle.setAttribute('cy', props.cy);
    circle.setAttribute('r', props.r);

    // Set style attributes
    if (props.fill) circle.setAttribute('fill', props.fill);
    if (props.stroke) circle.setAttribute('stroke', props.stroke);
    if (props.strokeWidth) circle.setAttribute('stroke-width', props.strokeWidth);
    if (props.opacity !== 1) circle.setAttribute('opacity', props.opacity);

    // Store data for tooltip
    if (props.data) {
      circle._data = props.data;

      // Add event listeners for tooltip
      if (props.tooltip) {
        circle.addEventListener('mouseover', showTooltip);
        circle.addEventListener('mousemove', moveTooltip);
        circle.addEventListener('mouseout', hideTooltip);
      }
    }

    // Add to SVG
    svg.appendChild(circle);

    return {
      element: circle,
      spec: props
    };
  }
});

// Define the line primitive
createViz({
  type: "define",
  name: "line",
  properties: {
    x1: { required: true },
    y1: { required: true },
    x2: { required: true },
    y2: { required: true },
    stroke: { default: "black" },
    strokeWidth: { default: 1 },
    strokeDasharray: { default: null },
    opacity: { default: 1 }
  },
  implementation: function(props, container) {
    const svg = ensureSvg(container);

    // Create line element
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');

    // Set attributes from props
    line.setAttribute('x1', props.x1);
    line.setAttribute('y1', props.y1);
    line.setAttribute('x2', props.x2);
    line.setAttribute('y2', props.y2);

    // Set style attributes
    if (props.stroke) line.setAttribute('stroke', props.stroke);
    if (props.strokeWidth) line.setAttribute('stroke-width', props.strokeWidth);
    if (props.strokeDasharray) line.setAttribute('stroke-dasharray', props.strokeDasharray);
    if (props.opacity !== 1) line.setAttribute('opacity', props.opacity);

    // Add to SVG
    svg.appendChild(line);

    return {
      element: line,
      spec: props
    };
  }
});

// Define the text primitive
createViz({
  type: "define",
  name: "text",
  properties: {
    x: { default: 0 },
    y: { default: 0 },
    text: { required: true },
    fontSize: { default: "12px" },
    fontFamily: { default: "Arial" },
    fontWeight: { default: "normal" },
    fill: { default: "black" },
    textAnchor: { default: "start" },
    dominantBaseline: { default: "auto" },
    opacity: { default: 1 },
    transform: { default: null }
  },
  implementation: function(props, container) {
    const svg = ensureSvg(container);

    // Create text element
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');

    // Set attributes from props
    text.setAttribute('x', props.x);
    text.setAttribute('y', props.y);

    // Set style attributes
    if (props.fill) text.setAttribute('fill', props.fill);
    if (props.fontSize) text.setAttribute('font-size', props.fontSize);
    if (props.fontFamily) text.setAttribute('font-family', props.fontFamily);
    if (props.fontWeight !== "normal") text.setAttribute('font-weight', props.fontWeight);
    if (props.textAnchor !== "start") text.setAttribute('text-anchor', props.textAnchor);
    if (props.dominantBaseline !== "auto") text.setAttribute('dominant-baseline', props.dominantBaseline);
    if (props.opacity !== 1) text.setAttribute('opacity', props.opacity);
    if (props.transform) text.setAttribute('transform', props.transform);

    // Set the text content
    text.textContent = props.text;

    // Add to SVG
    svg.appendChild(text);

    return {
      element: text,
      spec: props
    };
  }
});

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
  implementation: function(props) {
    // Create SVG rect element
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

    return rect;
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
  implementation: function(props) {
    // Create SVG circle element
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

    return circle;
  }
});

// Define the ellipse primitive
createViz({
  type: "define",
  name: "ellipse",
  properties: {
    cx: { required: true },
    cy: { required: true },
    rx: { required: true },
    ry: { required: true },
    fill: { default: "steelblue" },
    stroke: { default: null },
    strokeWidth: { default: 1 },
    opacity: { default: 1 }
  },
  implementation: function(props) {
    // Create SVG ellipse element
    const ellipse = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');

    // Set attributes from props
    ellipse.setAttribute('cx', props.cx);
    ellipse.setAttribute('cy', props.cy);
    ellipse.setAttribute('rx', props.rx);
    ellipse.setAttribute('ry', props.ry);

    // Set style attributes
    if (props.fill) ellipse.setAttribute('fill', props.fill);
    if (props.stroke) ellipse.setAttribute('stroke', props.stroke);
    if (props.strokeWidth) ellipse.setAttribute('stroke-width', props.strokeWidth);
    if (props.opacity !== 1) ellipse.setAttribute('opacity', props.opacity);

    return ellipse;
  }
});

// Define the polygon primitive
createViz({
  type: "define",
  name: "polygon",
  properties: {
    points: { required: true }, // Array of {x, y} points or string like "0,0 100,0 50,100"
    fill: { default: "steelblue" },
    stroke: { default: null },
    strokeWidth: { default: 1 },
    opacity: { default: 1 }
  },
  implementation: function(props) {
    // Create SVG polygon element
    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');

    // Set points attribute
    let pointsStr = props.points;
    if (Array.isArray(props.points)) {
      pointsStr = props.points.map(p => `${p.x},${p.y}`).join(' ');
    }
    polygon.setAttribute('points', pointsStr);

    // Set style attributes
    if (props.fill) polygon.setAttribute('fill', props.fill);
    if (props.stroke) polygon.setAttribute('stroke', props.stroke);
    if (props.strokeWidth) polygon.setAttribute('stroke-width', props.strokeWidth);
    if (props.opacity !== 1) polygon.setAttribute('opacity', props.opacity);

    return polygon;
  }
});

// Define the arc primitive
createViz({
  type: "define",
  name: "arc",
  properties: {
    cx: { required: true },
    cy: { required: true },
    innerRadius: { default: 0 },
    outerRadius: { required: true },
    startAngle: { default: 0 },
    endAngle: { required: true },
    fill: { default: "steelblue" },
    stroke: { default: null },
    strokeWidth: { default: 1 },
    opacity: { default: 1 }
  },
  implementation: function(props) {
    // Create SVG path element for the arc
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

    // Convert angles from degrees to radians
    const startAngleRad = (props.startAngle * Math.PI) / 180;
    const endAngleRad = (props.endAngle * Math.PI) / 180;

    // Calculate points
    const startOuterX = props.cx + props.outerRadius * Math.cos(startAngleRad);
    const startOuterY = props.cy + props.outerRadius * Math.sin(startAngleRad);
    const endOuterX = props.cx + props.outerRadius * Math.cos(endAngleRad);
    const endOuterY = props.cy + props.outerRadius * Math.sin(endAngleRad);

    // Create path data
    let pathData;

    if (props.innerRadius === 0) {
      // Simple pie slice
      const largeArcFlag = endAngleRad - startAngleRad > Math.PI ? 1 : 0;
      pathData = [
        `M ${props.cx},${props.cy}`,
        `L ${startOuterX},${startOuterY}`,
        `A ${props.outerRadius},${props.outerRadius} 0 ${largeArcFlag} 1 ${endOuterX},${endOuterY}`,
        'Z'
      ].join(' ');
    } else {
      // Donut slice
      const startInnerX = props.cx + props.innerRadius * Math.cos(endAngleRad);
      const startInnerY = props.cy + props.innerRadius * Math.sin(endAngleRad);
      const endInnerX = props.cx + props.innerRadius * Math.cos(startAngleRad);
      const endInnerY = props.cy + props.innerRadius * Math.sin(startAngleRad);

      const largeArcFlag1 = endAngleRad - startAngleRad > Math.PI ? 1 : 0;
      const largeArcFlag2 = endAngleRad - startAngleRad > Math.PI ? 1 : 0;

      pathData = [
        `M ${startOuterX},${startOuterY}`,
        `A ${props.outerRadius},${props.outerRadius} 0 ${largeArcFlag1} 1 ${endOuterX},${endOuterY}`,
        `L ${startInnerX},${startInnerY}`,
        `A ${props.innerRadius},${props.innerRadius} 0 ${largeArcFlag2} 0 ${endInnerX},${endInnerY}`,
        'Z'
      ].join(' ');
    }

    path.setAttribute('d', pathData);

    // Set style attributes
    if (props.fill) path.setAttribute('fill', props.fill);
    if (props.stroke) path.setAttribute('stroke', props.stroke);
    if (props.strokeWidth) path.setAttribute('stroke-width', props.strokeWidth);
    if (props.opacity !== 1) path.setAttribute('opacity', props.opacity);

    return path;
  }
});

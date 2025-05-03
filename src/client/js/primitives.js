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

// Line and Path Primitives
// =======================

// Define the line primitive
createViz({
  type: "define",
  name: "line",
  properties: {
    x1: { required: true },
    y1: { required: true },
    x2: { required: true },
    y2: { required: true },
    stroke: { default: "#333" },
    strokeWidth: { default: 1 },
    strokeDasharray: { default: null },
    opacity: { default: 1 }
  },
  implementation: function(props) {
    // Create SVG line element
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

    return line;
  }
});

// Define the polyline primitive
createViz({
  type: "define",
  name: "polyline",
  properties: {
    points: { required: true }, // Array of {x, y} points or string like "0,0 100,0 50,100"
    fill: { default: "none" },
    stroke: { default: "#333" },
    strokeWidth: { default: 1 },
    strokeDasharray: { default: null },
    opacity: { default: 1 }
  },
  implementation: function(props) {
    // Create SVG polyline element
    const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');

    // Set points attribute
    let pointsStr = props.points;
    if (Array.isArray(props.points)) {
      pointsStr = props.points.map(p => `${p.x},${p.y}`).join(' ');
    }
    polyline.setAttribute('points', pointsStr);

    // Set style attributes
    if (props.fill) polyline.setAttribute('fill', props.fill);
    if (props.stroke) polyline.setAttribute('stroke', props.stroke);
    if (props.strokeWidth) polyline.setAttribute('stroke-width', props.strokeWidth);
    if (props.strokeDasharray) polyline.setAttribute('stroke-dasharray', props.strokeDasharray);
    if (props.opacity !== 1) polyline.setAttribute('opacity', props.opacity);

    return polyline;
  }
});

// Define the path primitive
createViz({
  type: "define",
  name: "path",
  properties: {
    d: { required: true }, // SVG path data
    fill: { default: "none" },
    stroke: { default: "#333" },
    strokeWidth: { default: 1 },
    strokeDasharray: { default: null },
    opacity: { default: 1 }
  },
  implementation: function(props) {
    // Create SVG path element
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

    // Set attributes from props
    path.setAttribute('d', props.d);

    // Set style attributes
    if (props.fill) path.setAttribute('fill', props.fill);
    if (props.stroke) path.setAttribute('stroke', props.stroke);
    if (props.strokeWidth) path.setAttribute('stroke-width', props.strokeWidth);
    if (props.strokeDasharray) path.setAttribute('stroke-dasharray', props.strokeDasharray);
    if (props.opacity !== 1) path.setAttribute('opacity', props.opacity);

    return path;
  }
});

// Text and Label Primitives
// =======================

// Define the text primitive
createViz({
  type: "define",
  name: "text",
  properties: {
    x: { required: true },
    y: { required: true },
    text: { required: true },
    fontSize: { default: '12px' },
    fontFamily: { default: 'Arial' },
    fontWeight: { default: 'normal' },
    fontStyle: { default: 'normal' },
    fill: { default: '#333' },
    textAnchor: { default: 'start' },
    dominantBaseline: { default: 'auto' },
    transform: { default: null },
    opacity: { default: 1 }
  },
  implementation: function(props) {
    // Create SVG text element
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');

    // Set attributes from props
    text.setAttribute('x', props.x);
    text.setAttribute('y', props.y);

    // Set style attributes
    if (props.fontSize) text.setAttribute('font-size', props.fontSize);
    if (props.fontFamily) text.setAttribute('font-family', props.fontFamily);
    if (props.fontWeight) text.setAttribute('font-weight', props.fontWeight);
    if (props.fontStyle) text.setAttribute('font-style', props.fontStyle);
    if (props.fill) text.setAttribute('fill', props.fill);
    if (props.textAnchor) text.setAttribute('text-anchor', props.textAnchor);
    if (props.dominantBaseline !== 'auto') text.setAttribute('dominant-baseline', props.dominantBaseline);
    if (props.transform) text.setAttribute('transform', props.transform);
    if (props.opacity !== 1) text.setAttribute('opacity', props.opacity);

    // Set text content
    text.textContent = props.text;

    return text;
  }
});

// Define the textPath primitive
createViz({
  type: "define",
  name: "textPath",
  properties: {
    path: { required: true }, // Path data or reference to path element
    text: { required: true },
    startOffset: { default: '0%' },
    fontSize: { default: '12px' },
    fontFamily: { default: 'Arial' },
    fill: { default: '#333' },
    method: { default: 'align' }, // 'align' or 'stretch'
    spacing: { default: 'auto' }, // 'auto' or 'exact'
    opacity: { default: 1 }
  },
  implementation: function(props) {
    // Create SVG elements
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    const textPath = document.createElementNS('http://www.w3.org/2000/svg', 'textPath');

    // Create a unique ID for the path
    const pathId = `path-${Math.random().toString(36).substr(2, 9)}`;

    // Create a path element if path data is provided
    if (typeof props.path === 'string' && !props.path.startsWith('#')) {
      const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      pathElement.setAttribute('id', pathId);
      pathElement.setAttribute('d', props.path);
      defs.appendChild(pathElement);
      text.appendChild(defs);
      textPath.setAttribute('href', `#${pathId}`);
    } else {
      // Use existing path reference
      textPath.setAttribute('href', props.path);
    }

    // Set attributes for textPath
    if (props.startOffset) textPath.setAttribute('startOffset', props.startOffset);
    if (props.method !== 'align') textPath.setAttribute('method', props.method);
    if (props.spacing !== 'auto') textPath.setAttribute('spacing', props.spacing);

    // Set text content
    textPath.textContent = props.text;

    // Set style attributes for text
    if (props.fontSize) text.setAttribute('font-size', props.fontSize);
    if (props.fontFamily) text.setAttribute('font-family', props.fontFamily);
    if (props.fill) text.setAttribute('fill', props.fill);
    if (props.opacity !== 1) text.setAttribute('opacity', props.opacity);

    // Append textPath to text
    text.appendChild(textPath);

    return text;
  }
});

// Container and Grouping Primitives
// ===============================

// Define the group primitive
createViz({
  type: "define",
  name: "group",
  properties: {
    transform: { default: null },
    opacity: { default: 1 },
    visible: { default: true },
    children: { default: [] }
  },
  implementation: function(props) {
    // Create SVG group element
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    // Set attributes from props
    if (props.transform) group.setAttribute('transform', props.transform);
    if (props.opacity !== 1) group.setAttribute('opacity', props.opacity);
    if (!props.visible) group.setAttribute('display', 'none');

    // Create and append children
    if (props.children && Array.isArray(props.children)) {
      for (const childSpec of props.children) {
        if (childSpec) {
          const child = createViz(childSpec, { appendChild: (el) => group.appendChild(el) });
          if (child && child.element) {
            // Child already appended in createViz
          }
        }
      }
    }

    return group;
  }
});

// Define the clipPath primitive
createViz({
  type: "define",
  name: "clipPath",
  properties: {
    id: { required: true },
    children: { required: true }

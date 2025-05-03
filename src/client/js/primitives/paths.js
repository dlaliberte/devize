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

// Define the curve primitive (cubic bezier)
createViz({
  type: "define",
  name: "curve",
  properties: {
    x1: { required: true },
    y1: { required: true },
    x2: { required: true },
    y2: { required: true },
    controlPoint1X: { required: true },
    controlPoint1Y: { required: true },
    controlPoint2X: { required: true },
    controlPoint2Y: { required: true },
    stroke: { default: "#333" },
    strokeWidth: { default: 1 },
    strokeDasharray: { default: null },
    fill: { default: "none" },
    opacity: { default: 1 }
  },
  implementation: function(props) {
    // Create SVG path element for the curve
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

    // Create path data for cubic bezier curve
    const pathData = `M ${props.x1},${props.y1} C ${props.controlPoint1X},${props.controlPoint1Y} ${props.controlPoint2X},${props.controlPoint2Y} ${props.x2},${props.y2}`;
    path.setAttribute('d', pathData);

    // Set style attributes
    if (props.fill) path.setAttribute('fill', props.fill);
    if (props.stroke) path.setAttribute('stroke', props.stroke);
    if (props.strokeWidth) path.setAttribute('stroke-width', props.strokeWidth);
    if (props.strokeDasharray) path.setAttribute('stroke-dasharray', props.strokeDasharray);
    if (props.opacity !== 1) path.setAttribute('opacity', props.opacity);

    return path;
  }
});

// Define the quadraticCurve primitive (quadratic bezier)
createViz({
  type: "define",
  name: "quadraticCurve",
  properties: {
    x1: { required: true },
    y1: { required: true },
    x2: { required: true },
    y2: { required: true },
    controlPointX: { required: true },
    controlPointY: { required: true },
    stroke: { default: "#333" },
    strokeWidth: { default: 1 },
    strokeDasharray: { default: null },
    fill: { default: "none" },
    opacity: { default: 1 }
  },
  implementation: function(props) {
    // Create SVG path element for the curve
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

    // Create path data for quadratic bezier curve
    const pathData = `M ${props.x1},${props.y1} Q ${props.controlPointX},${props.controlPointY} ${props.x2},${props.y2}`;
    path.setAttribute('d', pathData);

    // Set style attributes
    if (props.fill) path.setAttribute('fill', props.fill);
    if (props.stroke) path.setAttribute('stroke', props.stroke);
    if (props.strokeWidth) path.setAttribute('stroke-width', props.strokeWidth);
    if (props.strokeDasharray) path.setAttribute('stroke-dasharray', props.strokeDasharray);
    if (props.opacity !== 1) path.setAttribute('opacity', props.opacity);

    return path;
  }
});

// Define the smoothCurve primitive (multiple points with automatic control points)
createViz({
  type: "define",
  name: "smoothCurve",
  properties: {
    points: { required: true }, // Array of {x, y} points
    tension: { default: 0.5 }, // Controls how tight the curve is (0-1)
    closed: { default: false }, // Whether to close the curve
    stroke: { default: "#333" },
    strokeWidth: { default: 1 },
    strokeDasharray: { default: null },
    fill: { default: "none" },
    opacity: { default: 1 }
  },
  implementation: function(props) {
    // Create SVG path element for the curve
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

    // Ensure points is an array
    const points = Array.isArray(props.points) ? props.points : [];

    if (points.length < 2) {
      console.error("smoothCurve requires at least 2 points");
      return path;
    }

    // Helper function to calculate control points
    function getControlPoints(p0, p1, p2, tension) {
      const d01 = Math.sqrt(Math.pow(p1.x - p0.x, 2) + Math.pow(p1.y - p0.y, 2));
      const d12 = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));

      const fa = tension * d01 / (d01 + d12);
      const fb = tension * d12 / (d01 + d12);

      const c1x = p1.x - fa * (p2.x - p0.x);
      const c1y = p1.y - fa * (p2.y - p0.y);
      const c2x = p1.x + fb * (p2.x - p0.x);
      const c2y = p1.y + fb * (p2.y - p0.y);

      return [{ x: c1x, y: c1y }, { x: c2x, y: c2y }];
    }

    // Build the path data
    let pathData = `M ${points[0].x},${points[0].y}`;

    // For a closed curve, we need to wrap around
    const pointsToProcess = props.closed ?
      [...points, points[0], points[1]] :
      points;

    // Calculate control points and add curve segments
    for (let i = 0; i < pointsToProcess.length - 2; i++) {
      const p0 = i === 0 && props.closed ? pointsToProcess[pointsToProcess.length - 2] : pointsToProcess[i];
      const p1 = pointsToProcess[i + 1];
      const p2 = pointsToProcess[i + 2];

      const [c1, c2] = getControlPoints(p0, p1, p2, props.tension);

      if (i === 0) {
        pathData += ` C ${c2.x},${c2.y} ${p2.x},${p2.y}`;
      } else {
        pathData += ` S ${c2.x},${c2.y} ${p2.x},${p2.y}`;
      }
    }

    // Close the path if needed
    if (props.closed) {
      pathData += ' Z';
    }

    path.setAttribute('d', pathData);

    // Set style attributes
    if (props.fill) path.setAttribute('fill', props.fill);
    if (props.stroke) path.setAttribute('stroke', props.stroke);
    if (props.strokeWidth) path.setAttribute('stroke-width', props.strokeWidth);
    if (props.strokeDasharray) path.setAttribute('stroke-dasharray', props.strokeDasharray);
    if (props.opacity !== 1) path.setAttribute('opacity', props.opacity);

    return path;
  }
});

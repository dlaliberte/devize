// Basic visualization types
const VizTypes = {
  RECTANGLE: 'rectangle',
  CIRCLE: 'circle',
  LINE: 'line',
  TEXT: 'text',
  GROUP: 'group'
};

// Create a visualization from a spec
export function createViz(spec, container) {
  // Validate spec
  if (!spec.type) {
    throw new Error('Visualization spec must have a type');
  }

  // Handle different visualization types
  switch (spec.type) {
    case VizTypes.RECTANGLE:
      return createRectangle(spec, container);
    case VizTypes.CIRCLE:
      return createCircle(spec, container);
    case VizTypes.LINE:
      return createLine(spec, container);
    case VizTypes.TEXT:
      return createText(spec, container);
    case VizTypes.GROUP:
      return createGroup(spec, container);
    default:
      throw new Error(`Unknown visualization type: ${spec.type}`);
  }
}

// Update a visualization
export function updateViz(vizInstance, newSpec) {
  if (!vizInstance || !vizInstance.element || !vizInstance.spec) {
    throw new Error('Invalid visualization instance');
  }

  // Remove the old element
  const container = vizInstance.element.parentNode.parentNode;
  const svg = vizInstance.element.parentNode;
  svg.removeChild(vizInstance.element);

  // Create a new visualization with the updated spec
  return createViz({...vizInstance.spec, ...newSpec}, container);
}

// Helper function to ensure SVG exists
function ensureSvg(container) {
  let svg = container.querySelector('svg');
  if (!svg) {
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    container.appendChild(svg);
  }
  return svg;
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
      // Create a temporary div to hold the child's SVG
      const tempContainer = document.createElement('div');
      const child = createViz(childSpec, tempContainer);

      // Move the child element to our group
      const childElement = child.element;
      const childSvg = childElement.parentNode;
      childSvg.removeChild(childElement);
      group.appendChild(childElement);

      // Add to children array
      children.push(child);
    }
  }

  // Return the visualization instance
  return {
    element: group,
    spec: spec,
    children: children
  };
}

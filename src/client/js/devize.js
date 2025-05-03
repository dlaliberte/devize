// Core Devize visualization library

// Registry for visualization types
const typeRegistry = {};

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

// Create a visualization from a spec
function createViz(spec, container) {
  // Handle definition registration
  if (spec.type === "define") {
    registerType(spec.name, spec.properties, spec.implementation);
    return null;
  }

  // Look up the implementation in the registry
  const implementation = typeRegistry[spec.type];

  if (implementation) {
    // Create the visualization using the registered implementation
    if (typeof implementation === 'function') {
      return implementation(spec, container);
    } else if (typeof implementation === 'object') {
      // If implementation is an object spec, use it as a template
      // Create a new spec with the implementation as the base and the original spec's properties overriding
      const mergedSpec = { ...implementation };

      // Only copy properties that don't exist in the implementation or need to be overridden
      for (const key in spec) {
        if (key !== 'type') { // Don't override the type to avoid infinite recursion
          mergedSpec[key] = spec[key];
        }
      }

      // Call createViz with the merged spec
      return createViz(mergedSpec, container);
    }
  }

  // Handle primitive types directly
  switch (spec.type) {
    case 'rectangle':
      return createRectangle(spec, container);
    case 'circle':
      return createCircle(spec, container);
    case 'line':
      return createLine(spec, container);
    case 'text':
      return createText(spec, container);
    case 'group':
      return createGroup(spec, container);
    // Add other primitive types as needed
  }

  // Unknown type
  console.error("Unknown visualization type:", spec.type);
  return null;
}

// Register a visualization type
function registerType(name, properties, implementation) {
  // Check if implementation is a function or an object
  if (typeof implementation === 'function') {
    // Store the implementation function in the registry
    typeRegistry[name] = function(spec, container) {
      // Create a new spec object with defaults applied
      const newSpec = { ...spec };

      // Validate required properties and apply defaults
      if (properties) {
        for (const [key, config] of Object.entries(properties)) {
          if (config.required && !(key in newSpec)) {
            console.error(`Missing required property: ${key} for type ${name}`);
            return null;
          }

          // Apply default values for missing properties
          if (!(key in newSpec) && 'default' in config) {
            newSpec[key] = config.default;
          }
        }
      }

      // Call the implementation with the new spec
      return implementation(newSpec, container);
    };
  } else if (typeof implementation === 'object') {
    // Store the implementation object in the registry
    typeRegistry[name] = implementation;
  } else {
    console.error(`Invalid implementation for type ${name}. Must be a function or an object.`);
  }
}

// Primitive visualization types
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

  // Store data for tooltip
  if (spec.data) {
    rect._data = spec.data;

    // Add event listeners for tooltip
    if (spec.tooltip) {
      rect.addEventListener('mouseover', showTooltip);
      rect.addEventListener('mousemove', moveTooltip);
      rect.addEventListener('mouseout', hideTooltip);
    }
  }

  // Add to SVG
  svg.appendChild(rect);

  return {
    element: rect,
    spec: spec
  };
}

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

  // Store data for tooltip
  if (spec.data) {
    circle._data = spec.data;

    // Add event listeners for tooltip
    if (spec.tooltip) {
      circle.addEventListener('mouseover', showTooltip);
      circle.addEventListener('mousemove', moveTooltip);
      circle.addEventListener('mouseout', hideTooltip);
    }
  }

  // Add to SVG
  svg.appendChild(circle);

  return {
    element: circle,
    spec: spec
  };
}

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

  return {
    element: line,
    spec: spec
  };
}

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

  return {
    element: text,
    spec: spec
  };
}

function createGroup(spec, container) {
  const svg = ensureSvg(container);

  // Create group element
  const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');

  // Set transform if provided
  if (spec.transform) {
    if (typeof spec.transform === 'function') {
      group.setAttribute('transform', spec.transform(spec));
    } else {
      group.setAttribute('transform', spec.transform);
    }
  }

  // Add to SVG
  svg.appendChild(group);

  // Create child visualizations
  const children = [];
  if (spec.children) {
    let childSpecs;

    if (typeof spec.children === 'function') {
      childSpecs = spec.children(spec);
    } else {
      childSpecs = spec.children;
    }

    if (Array.isArray(childSpecs)) {
      for (const childSpec of childSpecs) {
        // Create a temporary container for the child
        const tempContainer = {
          querySelector: () => group,
          appendChild: () => {} // No-op since we're using the existing group
        };

        // Create the child visualization
        const child = createViz(childSpec, tempContainer);

        // If it's a valid child, add it to our children array
        if (child) {
          children.push(child);
        }
      }
    }
  }

  return {
    element: group,
    spec: spec,
    children: children
  };
}

// Export the API
window.createViz = createViz;
window.ensureSvg = ensureSvg;
window.registerType = registerType;

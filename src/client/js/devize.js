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
      const mergedSpec = { ...implementation, ...spec };
      return createViz(mergedSpec, container);
    }
  }

  // Unknown type
  console.error("Unknown visualization type:", spec.type);
  return null;
}

// Register a visualization type
function registerType(name, properties, implementation) {
  // Store the implementation function in the registry
  typeRegistry[name] = function(spec, container) {
    // Validate required properties
    if (properties) {
      for (const [key, config] of Object.entries(properties)) {
        if (config.required && !(key in spec)) {
          console.error(`Missing required property: ${key} for type ${name}`);
          return null;
        }

        // Apply default values for missing properties
        if (!(key in spec) && 'default' in config) {
          spec[key] = config.default;
        }
      }
    }

    // Call the implementation with the spec
    return implementation(spec, container);
  };
}

// Export the API
window.createViz = createViz;
window.ensureSvg = ensureSvg;
window.registerType = registerType;

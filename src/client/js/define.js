// Enhanced define type handler
function handleDefineType(spec, container) {
  const { name, properties, implementation, extend } = spec;

  // Register the new visualization type
  registerType(name, {
    properties,
    extend,
    createVisualization: (props, container) => {
      // Start with base properties if extending another type
      let finalProps = extend ? { ...getTypeDefaults(extend), ...props } : { ...props };

      // Apply property defaults and validations
      finalProps = applyPropertyDefaults(finalProps, properties);
      validateRequiredProperties(finalProps, properties);

      // Handle the implementation
      let implSpec;

      if (typeof implementation === 'function') {
        // Function implementation
        implSpec = implementation(finalProps);
      } else if (typeof implementation === 'object') {
        // Declarative implementation
        implSpec = { ...implementation };

        // Replace template variables with actual values
        implSpec = replaceTemplateVariables(implSpec, finalProps);

        // If extending, merge with base implementation
        if (extend) {
          const baseImpl = getTypeImplementation(extend, finalProps);
          implSpec = mergeImplementations(baseImpl, implSpec);
        }
      } else {
        throw new Error(`Invalid implementation for type ${name}`);
      }

      // Create the visualization from the implementation spec
      return createViz(implSpec, container);
    }
  });

  // Return a reference to the registered type
  return { type: 'typeReference', name };
}

// Helper function to replace template variables in a spec
function replaceTemplateVariables(spec, props) {
  if (typeof spec === 'string') {
    // Handle template strings like "{{propName}}"
    return spec.replace(/\{\{([^}]+)\}\}/g, (match, propName) => {
      return props[propName] !== undefined ? props[propName] : match;
    });
  } else if (Array.isArray(spec)) {
    return spec.map(item => replaceTemplateVariables(item, props));
  } else if (typeof spec === 'object' && spec !== null) {
    const result = {};
    for (const key in spec) {
      result[key] = replaceTemplateVariables(spec[key], props);
    }
    return result;
  }
  return spec;
}

// Helper function to merge implementations when extending
function mergeImplementations(base, override) {
  if (!base) return override;
  if (!override) return base;

  // Start with a copy of the base
  const result = { ...base };

  // Override properties
  for (const key in override) {
    if (key === 'children' && Array.isArray(base.children) && Array.isArray(override.children)) {
      // Special handling for children arrays - append or replace based on ids
      result.children = mergeChildren(base.children, override.children);
    } else if (typeof override[key] === 'object' && override[key] !== null &&
               typeof base[key] === 'object' && base[key] !== null) {
      // Recursively merge nested objects
      result[key] = mergeImplementations(base[key], override[key]);
    } else {
      // Direct override for primitive values
      result[key] = override[key];
    }
  }

  return result;
}

// Helper function to merge children arrays
function mergeChildren(baseChildren, overrideChildren) {
  // Create a map of base children by id
  const baseChildrenMap = {};
  baseChildren.forEach((child, index) => {
    if (child.id) {
      baseChildrenMap[child.id] = { child, index };
    }
  });

  // Create a new array with merged children
  const result = [...baseChildren];

  // Process override children
  overrideChildren.forEach(overrideChild => {
    if (overrideChild.id && baseChildrenMap[overrideChild.id]) {
      // Replace existing child with the same id
      const { index } = baseChildrenMap[overrideChild.id];
      result[index] = overrideChild;
    } else {
      // Add new child
      result.push(overrideChild);
    }
  });

  return result;
}

import { registerType } from './registry';

// Register the "define" type for declarative component definitions
registerType({
  name: 'define',
  requiredProps: ['name', 'implementation'],
  optionalProps: {
    properties: {}
  },
  generateConstraints(_spec, _context) {
    return [];
  },
  decompose(spec, _solvedConstraints) {
    // Register the new component type
    registerType({
      name: spec.name,
      requiredProps: Object.entries(spec.properties || {})
        .filter(([_, config]) => (config as any).required)
        .map(([prop, _]) => prop),
      optionalProps: Object.entries(spec.properties || {})
        .filter(([_, config]) => !(config as any).required)
        .reduce((acc, [prop, config]) => {
          acc[prop] = (config as any).default;
          return acc;
        }, {} as Record<string, any>),
      generateConstraints(_componentSpec, _componentContext) {
        return [];
      },
      decompose(componentSpec, _componentSolvedConstraints) {
        // Create a new spec based on the implementation
        const implementationSpec = typeof spec.implementation === 'function'
          ? spec.implementation(componentSpec)
          : JSON.parse(JSON.stringify(spec.implementation));

        // Process function properties in the implementation
        return processImplementation(implementationSpec, componentSpec);
      }
    });

    // Return an empty group since define doesn't render anything itself
    return { type: 'group', children: [] };
  }
});

// Helper function to process implementation with function properties
function processImplementation(implementation: any, props: any): any {
  if (!implementation) return implementation;

  // If implementation is a function, call it with props
  if (typeof implementation === 'function') {
    return implementation(props);
  }

  // Create a new object to avoid modifying the original
  const result = Array.isArray(implementation) ? [] : {};

  // Process each property
  for (const key in implementation) {
    const value = implementation[key];

    if (typeof value === 'function') {
      // Call the function with props
      result[key] = value(props);
    } else if (typeof value === 'object' && value !== null) {
      // Recursively process nested objects
      result[key] = processImplementation(value, props);
    } else {
      // Copy primitive values
      result[key] = value;
    }
  }

  return result;
}

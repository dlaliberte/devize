// Import only what's needed
import { registerType } from './registry';
import { createViz } from './creator';

console.log('Define module initializing');

// Helper function to evaluate property functions
function evaluateProps(props: any, context: any): any {
  const result: any = {};

  for (const [key, value] of Object.entries(props)) {
    if (typeof value === 'function') {
      // If it's a function property like 'format', 'formatter', etc., preserve it
      if (key === 'format' || key === 'formatter' || key === 'map' ||
          key === 'filter' || key === 'sort' || key.endsWith('Fn')) {
        result[key] = value;
      } else {
        // Otherwise, evaluate the function with the current context
        try {
          result[key] = value(context);
        } catch (error) {
          console.error(`Error evaluating property function for ${key}:`, error);
          result[key] = undefined;
        }
      }
    } else {
      result[key] = value;
    }
  }

  return result;
}


createViz({
    type: "define",
    name: "define",
    properties: {
      name: { required: true },
      properties: { required: true },
      implementation: { required: true }
    },
    implementation: props => {
      // Register the new type
      registerType({
        name: props.name,
        // Extract required properties
        requiredProps: Object.entries(props.properties)
          .filter(([_, config]) => (config as any).required)
          .map(([name]) => name),
        // Extract optional properties with defaults
        optionalProps: Object.fromEntries(
          Object.entries(props.properties)
            .filter(([_, config]) => !(config as any).required && (config as any).default !== undefined)
            .map(([name, config]) => [name, (config as any).default])
        ),
        // Implementation details
        decompose: (spec, solvedConstraints) => {
          // Get the implementation
          const implementation = props.implementation;

          // Apply default values for any missing properties
          const fullSpec = { ...spec };

          for (const [propName, propConfig] of Object.entries(props.properties)) {
            if (!(propName in fullSpec) && (propConfig as any).default !== undefined) {
              fullSpec[propName] = (propConfig as any).default;
            }
          }

          // If implementation is a function, call it with evaluated props
          if (typeof implementation === 'function') {
            return implementation(fullSpec);
          }

          // If implementation is an object, evaluate its properties
          // (Template processing logic)
          return processTemplates(implementation, fullSpec);
        }
      });

      // Return an empty group as this component doesn't render anything
      return { type: 'group', children: [] };
    }
  });

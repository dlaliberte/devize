// Import only what's needed
import { registerType } from './registry';
import { createViz } from './devize';

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

// Define component for creating new component types
console.log('About to define the define type');
createViz({
  type: "define",
  name: "define",
  properties: {
    name: { required: true },
    properties: { required: true },
    implementation: { required: true }
  },
  implementation: props => {
    // Register the new component type
    registerType({
      name: props.name,
      requiredProps: Object.entries(props.properties)
        .filter(([_, config]) => (config as any).required)
        .map(([name]) => name),
      optionalProps: Object.fromEntries(
        Object.entries(props.properties)
          .filter(([_, config]) => !(config as any).required && (config as any).default !== undefined)
          .map(([name, config]) => [name, (config as any).default])
      ),

      generateConstraints: (spec, context) => {
        // Default constraint to fit container
        return [{ type: 'fitToContainer', container: context.container }];
      },
      decompose: (spec, solvedConstraints) => {
        // Get the implementation
        const implementation = props.implementation;

        // Apply default values for any missing properties
        const fullSpec = { ...spec };
        console.log('Original spec:', spec);

        for (const [propName, propConfig] of Object.entries(props.properties)) {
          if (!(propName in fullSpec) && (propConfig as any).default !== undefined) {
            console.log(`Adding default value for ${propName}:`, (propConfig as any).default);
            fullSpec[propName] = (propConfig as any).default;
          }
        }

        console.log('Full spec with defaults:', fullSpec);

        // If implementation is a function, call it with evaluated props
        if (typeof implementation === 'function') {
          const evaluatedProps = evaluateProps(fullSpec, { ...fullSpec, ...solvedConstraints });
          console.log('Evaluated props:', evaluatedProps);
          return implementation(evaluatedProps);
        }

        // If implementation is an object, evaluate its properties
        const result = { ...implementation };

        // Recursively evaluate properties
        const evaluateObject = (obj: any, context: any): any => {
          if (typeof obj !== 'object' || obj === null) {
            return obj;
          }

          if (Array.isArray(obj)) {
            return obj.map(item => evaluateObject(item, context));
          }

          const result: any = {};

          for (const [key, value] of Object.entries(obj)) {
            if (typeof value === 'function') {
              try {
                result[key] = value(context);
              } catch (error) {
                console.error(`Error evaluating property function for ${key}:`, error);
                result[key] = undefined;
              }
            } else if (typeof value === 'object' && value !== null) {
              result[key] = evaluateObject(value, context);
            } else {
              result[key] = value;
            }
          }

          return result;
        };

        return evaluateObject(result, { ...fullSpec, ...solvedConstraints });
      }
    });

    // Return an empty group as this component doesn't render anything
    return { type: 'group', children: [] };
  }
}, document.createElement('div'));
console.log('Define type definition completed');

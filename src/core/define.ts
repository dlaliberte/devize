import { createViz } from './devize';
import { registerType } from './registry';

// Helper function to evaluate property functions
function evaluateProps(props: any, context: any): any {
  const result: any = {};

  for (const [key, value] of Object.entries(props)) {
    if (typeof value === 'function') {
      // Evaluate the function with the current context
      try {
        result[key] = value(context);
      } catch (error) {
        console.error(`Error evaluating property function for ${key}:`, error);
        result[key] = undefined;
      }
    } else {
      result[key] = value;
    }
  }

  return result;
}

// Define component for creating new component types
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

        // If implementation is a function, call it with evaluated props
        if (typeof implementation === 'function') {
          const evaluatedProps = evaluateProps(spec, { ...spec, ...solvedConstraints });
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

        return evaluateObject(result, { ...spec, ...solvedConstraints });
      }
    });

    // Return an empty group as this component doesn't render anything
    return { type: 'group', children: [] };
  }
}, document.createElement('div'));

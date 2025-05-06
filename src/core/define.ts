// Import only what's needed
import { registerType, getType } from './registry';
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

// Helper function to merge implementations
function mergeImplementations(baseImpl: any, extendImpl: any): any {
  if (typeof extendImpl === 'function') {
    // If the extending implementation is a function, use it
    // but provide access to the base implementation
    return (props: any) => {
      // Create a wrapper function that gives access to the base implementation
      const baseResult = typeof baseImpl === 'function'
        ? baseImpl(props)
        : baseImpl;

      // Call the extending implementation with props and base result
      return extendImpl(props, baseResult);
    };
  }

  if (typeof baseImpl === 'object' && typeof extendImpl === 'object') {
    // If both are objects, merge them with the extending implementation taking precedence
    return { ...baseImpl, ...extendImpl };
  }

  // Default to using the extending implementation
  return extendImpl;
}

createViz({
  type: "define",
  name: "define",
  properties: {
    name: { required: true },
    properties: { required: true },
    implementation: { required: true },
    extend: { required: false }  // Add extend property
  },
  implementation: props => {
    // Get the base type if extending
    const baseType = props.extend ? getType(props.extend) : null;

    // Merge properties with base type if extending
    const mergedProperties = props.extend && baseType
      ? { ...baseType.optionalProps, ...props.properties }
      : props.properties;

    // Extract required properties
    const requiredProps = Object.entries(mergedProperties)
      .filter(([_, config]) => (config as any).required)
      .map(([name]) => name);

    // Register the new type
    registerType({
      name: props.name,
      // Store required properties
      requiredProps,
      // Extract optional properties with defaults
      optionalProps: Object.fromEntries(
        Object.entries(mergedProperties)
          .filter(([_, config]) => !(config as any).required && (config as any).default !== undefined)
          .map(([name, config]) => [name, (config as any).default])
      ),
      // Implementation details
      decompose: (spec, solvedConstraints) => {
        // Validate required properties
        for (const requiredProp of requiredProps) {
          if (!(requiredProp in spec)) {
            throw new Error(`Required property '${requiredProp}' is missing for visualization type '${props.name}'`);
          }
        }

        // Validate property types if specified
        for (const [propName, propConfig] of Object.entries(mergedProperties)) {
          if (propName in spec && (propConfig as any).type) {
            const value = spec[propName];
            const expectedType = (propConfig as any).type;

            let isValid = true;
            switch (expectedType) {
              case 'number':
                isValid = typeof value === 'number';
                break;
              case 'string':
                isValid = typeof value === 'string';
                break;
              case 'boolean':
                isValid = typeof value === 'boolean';
                break;
              case 'array':
                isValid = Array.isArray(value);
                break;
              case 'object':
                isValid = typeof value === 'object' && value !== null && !Array.isArray(value);
                break;
              case 'function':
                isValid = typeof value === 'function';
                break;
            }

            if (!isValid) {
              throw new Error(`Property '${propName}' for visualization type '${props.name}' should be of type '${expectedType}'`);
            }
          }

          // Run custom validation if provided
          if (propName in spec && (propConfig as any).validate) {
            try {
              const isValid = (propConfig as any).validate(spec[propName]);
              if (!isValid) {
                throw new Error(`Property '${propName}' for visualization type '${props.name}' failed validation`);
              }
            } catch (error) {
              throw new Error(`Validation error for property '${propName}': ${error.message}`);
            }
          }
        }

        // Get the implementation
        let implementation = props.implementation;

        // If extending, merge with base implementation
        if (props.extend && baseType) {
          implementation = mergeImplementations(
            baseType.decompose,
            implementation
          );
        }

        // Apply default values for any missing properties
        const fullSpec = { ...spec };

        for (const [propName, propConfig] of Object.entries(mergedProperties)) {
          if (!(propName in fullSpec) && (propConfig as any).default !== undefined) {
            fullSpec[propName] = (propConfig as any).default;
          }
        }

        // Call the implementation function with the full spec
        if (typeof implementation === 'function') {
          return implementation(fullSpec);
        }

        // If implementation is not a function, return it directly
        return implementation;
      }
    });

    // Return an empty group as this component doesn't render anything
    return { type: 'group', children: [] };
  }
});

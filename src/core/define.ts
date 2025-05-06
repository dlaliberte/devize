// Import only what's needed
import { registerType, getType, hasType } from './registry';
import { createViz } from './creator';
import { VisualizationType, VizSpec, ConstraintSpec } from './types';

console.log('Define module initializing');

/**
 * Utility function to register the 'define' type
 * This can be used directly for testing or bootstrapping
 */
export function registerDefineType() {
  if (hasType('define')) {
    return; // Already registered
  }

  registerType({
    name: 'define',
    requiredProps: ['name', 'properties', 'implementation'],
    optionalProps: { extend: undefined, generateConstraints: undefined },
    generateConstraints: () => [],
    decompose: (spec, solvedConstraints) => {
      const { name, properties, implementation, extend } = spec;

      // Validate inputs
      if (!name || typeof name !== 'string') {
        throw new Error('A valid name is required for defining a visualization type');
      }

      if (!properties || typeof properties !== 'object') {
        throw new Error('Valid properties object is required for defining a visualization type');
      }

      if (!implementation) {
        throw new Error('Implementation is required for defining a visualization type');
      }

      // Check if we're trying to extend a non-existent type
      if (extend && !hasType(extend)) {
        throw new Error(`Type '${extend}' does not exist and cannot be extended`);
      }

      // Get the base type if extending
      const baseType = extend ? getType(extend) : null;

      // Merge properties with base type if extending
      const mergedProperties = extend && baseType
        ? { ...baseType.optionalProps, ...properties }
        : properties;

      // Extract required properties
      // Include required properties from the base type
      let requiredProps = Object.entries(mergedProperties)
        .filter(([_, config]) => (config as any).required)
        .map(([name]) => name);

      // Add required properties from the base type if extending
      if (extend && baseType) {
        requiredProps = [...baseType.requiredProps, ...requiredProps];
        // Remove duplicates
        requiredProps = [...new Set(requiredProps)];
      }

      // Create a default generateConstraints function
      const generateConstraints = spec.generateConstraints ||
        (baseType?.generateConstraints) ||
        ((spec: VizSpec, context: any): ConstraintSpec[] => []);

      // Extract optional properties with defaults
      // Include optional properties from the base type
      let optionalProps: Record<string, any> = {};

      // First add base type optional properties if extending
      if (extend && baseType && baseType.optionalProps) {
        optionalProps = { ...baseType.optionalProps };
      }

      // Then add this type's optional properties (will override base type if same name)
      const thisTypeOptionalProps = Object.fromEntries(
        Object.entries(properties)
          .filter(([_, config]) => !(config as any).required && (config as any).default !== undefined)
          .map(([name, config]) => [name, (config as any).default])
      );

      optionalProps = { ...optionalProps, ...thisTypeOptionalProps };

      // Register the new type
      registerType({
        name,
        requiredProps,
        optionalProps,
        generateConstraints,
        decompose: (innerSpec, innerSolvedConstraints) => {
          // Validate required properties
          for (const requiredProp of requiredProps) {
            if (!(requiredProp in innerSpec)) {
              throw new Error(`Required property '${requiredProp}' is missing for visualization type '${name}'`);
            }
          }

          // Validate property types if specified
          for (const [propName, propConfig] of Object.entries(mergedProperties)) {
            if (propName in innerSpec && (propConfig as any).type) {
              const value = innerSpec[propName];
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
                throw new Error(`Property '${propName}' for visualization type '${name}' should be of type '${expectedType}'`);
              }
            }

            // Run custom validation if provided
            if (propName in innerSpec && (propConfig as any).validate) {
              try {
                const isValid = (propConfig as any).validate(innerSpec[propName]);
                if (!isValid) {
                  throw new Error(`Property '${propName}' for visualization type '${name}' failed validation`);
                }
              } catch (error) {
                if (error instanceof Error) {
                  throw new Error(`Validation error for property '${propName}': ${error.message}`);
                } else {
                  throw new Error(`Validation error for property '${propName}'`);
                }
              }
            }
          }

          // Get the implementation
          let impl = implementation;

          // If extending, merge with base implementation
          if (extend && baseType) {
            impl = mergeImplementations(
              baseType.decompose,
              impl
            );
          }

          // Apply default values for any missing properties
          const fullSpec = { ...innerSpec };

          for (const [propName, defaultValue] of Object.entries(optionalProps)) {
            if (!(propName in fullSpec)) {
              fullSpec[propName] = defaultValue;
            }
          }

          // Call the implementation function with the full spec
          if (typeof impl === 'function') {
            return impl(fullSpec);
          }

          // If implementation is not a function, return it directly
          return impl;
        }
      });

      // Return an empty group as this component doesn't render anything
      return { type: 'group', children: [] };
    }
  });
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

// Bootstrap the define type
registerDefineType();

// Now use createViz to define the define type (this is for documentation/clarity)
// The actual registration is already done by registerDefineType
createViz({
  type: "define",
  name: "define",
  properties: {
    name: { required: true },
    properties: { required: true },
    implementation: { required: true },
    extend: { required: false },
    generateConstraints: { required: false }
  },
  implementation: props => {
    // The implementation is already handled by registerDefineType
    // This is just for documentation purposes
    return { type: 'group', children: [] };
  }
});

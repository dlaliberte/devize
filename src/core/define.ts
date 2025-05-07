import { TypeDefinition, VisualizationSpec } from './types';
import { registry } from './registry';
import { buildViz } from './builder';

/**
 * Register the define type
 */
export function registerDefineType() {
  if (registry.hasType('define')) {
    return; // Already registered
  }

  const defineTypeSpec = {
    type: "define",
    name: "define",
    properties: {
      name: { required: true },
      properties: { required: true },
      implementation: { required: true },
      extend: { required: false }
    },
    implementation: (props: any) => {
      // Extract properties
      const { name, properties, implementation, extend } = props;

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
      if (extend && !registry.hasType(extend)) {
        throw new Error(`Type '${extend}' does not exist and cannot be extended`);
      }

      // Get the base type if extending
      const baseType = extend ? registry.getType(extend) : null;

      // Merge properties with base type if extending
      const mergedProperties = extend && baseType
        ? { ...baseType.properties, ...properties }
        : properties;

      // Create the type definition
      const typeDefinition: TypeDefinition = {
        name,
        properties: mergedProperties,
        implementation,
        extend
      };

      // Register the type
      registry.registerType(typeDefinition);

      // Return an empty group as this component doesn't render anything
      return { type: 'group', children: [] };
    }
  };

  // Register the define type directly
  registry.registerTypeDirectly(defineTypeSpec);
}

// Bootstrap the define type
registerDefineType();

// Now use buildViz to define the define type (this is for documentation/clarity)
// The actual registration is already done by registerDefineType
buildViz({
  type: "define",
  name: "define",
  properties: {
    name: { required: true },
    properties: { required: true },
    implementation: { required: true },
    extend: { required: false }
  },
  implementation: (props: any) => {
    // The implementation is already handled by registerDefineType
    // This is just for documentation purposes
    return { type: 'group', children: [] };
  }
});

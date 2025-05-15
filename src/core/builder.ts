import { VisualizationSpec, RenderableVisualization, TypeDefinition } from './types';
import { registry } from './registry';

/**
 * Checks if an object is a RenderableVisualization
 */
function isRenderableVisualization(obj: any): boolean {
  return obj &&
         typeof obj === 'object' &&
         typeof obj.renderableType === 'string' &&
         typeof obj.render === 'function' &&
         typeof obj.renderToSvg === 'function' &&
         typeof obj.renderToCanvas === 'function';
}


function isVisualizationSpec(spec: VisualizationSpec | RenderableVisualization): boolean {
  return spec && typeof spec === 'object' && typeof spec.type === 'string';
}

/**
 * Process a specification with type definition
 */
function processSpecification(spec: VisualizationSpec, typeDefinition: TypeDefinition): VisualizationSpec {
  const processed = { ...spec };

  // Apply default values for any missing properties
  if (typeDefinition.properties) {
    for (const [propName, propDef] of Object.entries(typeDefinition.properties)) {
      if (!(propName in processed) && 'default' in propDef) {
        processed[propName] = propDef.default;
      }
    }
  }

  // Validate required properties
  if (typeDefinition.properties) {
    for (const [propName, propDef] of Object.entries(typeDefinition.properties)) {
      if (propDef.required && !(propName in processed)) {
        throw new Error(`Required property '${propName}' missing for visualization type '${typeDefinition.name}'`);
      }
    }
  }

  // Call custom validation function if available
  if (typeDefinition.validate && typeof typeDefinition.validate === 'function') {
    typeDefinition.validate(processed);
  }

  return processed;
}

/**
 * Create a renderable visualization from a processed specification
 */
function createRenderableVisualization(spec: VisualizationSpec): RenderableVisualization {
  const type = spec.type;

  // Create the renderable object
  const renderable: RenderableVisualization = {
    spec,  // Used for rendering.
    type,

    // Render to a DOM container
    render: (container: HTMLElement) => {
      // Create SVG if needed
      let svg = container.querySelector('svg');
      if (!svg) {
        svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
        container.appendChild(svg);
      }

      // Render to SVG
      const element = renderable.renderToSvg(svg as SVGElement);

      // Return result
      return {
        element,
        update: (newSpec: VisualizationSpec) => {
          const updatedViz = renderable.update(newSpec);
          return updatedViz.render(container);
        },
        cleanup: () => {
          if (element.parentNode) {
            element.parentNode.removeChild(element);
          }
        }
      };
    },

    // Render to an SVG element
    renderToSvg: (svg: SVGElement) => {
      // For a renderable visualization, we should already have the processed result
      // and should not need to call the implementation again

      // Create a group element for this visualization
      const element = document.createElementNS("http://www.w3.org/2000/svg", "g");

      // If we have specific rendering logic in the implementation result, use it
      if (spec._renderType && spec.renderToSvg && typeof spec.renderToSvg === 'function') {
        // Use the custom rendering function from the implementation result
        return spec.renderToSvg(svg);
      }

      // Add other type-specific rendering logic here
      throw new Error('we should never get here.  Every viz should have a renderToSvg.');
    },

    // Render to a Canvas context
    renderToCanvas: (ctx: CanvasRenderingContext2D) => {
      // Implementation depends on the type
      // For now, we'll create a placeholder
      ctx.save();

      // If we have specific rendering logic in the implementation result, use it
      if (spec._renderType && spec.renderToCanvas && typeof spec.renderToCanvas === 'function') {
        // Use the custom rendering function from the implementation result
        return spec.renderToCanvas(ctx);
      }

      ctx.restore();
      throw new Error('we should never get here. Every viz should have a renderToCanvas.');
    },

    // Update with a new specification
    update: (newSpec: VisualizationSpec) => {
      return buildViz({ ...spec, ...newSpec });
    },

    // Get a computed property
    getProperty: (name: string) => {
      return spec[name];
    }
  };

  return renderable;
}

/**
 * Build a visualization from a specification
 */
export function buildViz(spec: VisualizationSpec | RenderableVisualization): RenderableVisualization {
  // If already a RenderableVisualization, return it
  if (isRenderableVisualization(spec)) {
    return spec as RenderableVisualization;
  }

  // Handle null or undefined
  if (!spec) {
    throw new Error('Visualization specification cannot be null or undefined');
  }

  // Assert spec is now a VisualizationSpec
  if (!isVisualizationSpec(spec)) {
    throw new Error('Visualization specification must be an object');
  }

  // Handle missing type
  if (!spec.type) {
    throw new Error('Visualization specification must have a type');
  }

  // Special case for "define" type during bootstrapping
  if (spec.type === "define" && !registry.hasType("define")) {
    // Handle bootstrapping case
    const typeDefinition: TypeDefinition = {
      name: spec.name,
      properties: spec.properties,
      implementation: spec.implementation,
      extend: spec.extend
    };

    // Register the type
    registry.registerType(typeDefinition);

    // Create and return a renderable visualization
    return createRenderableVisualization(spec);
  }

  // Normal case - look up the type
  const typeDefinition = registry.getType(spec.type);
  if (!typeDefinition) {
    throw new Error(`Unknown visualization type: ${spec.type}`);
  }

  // Process the specification
  const processedSpec = processSpecification(spec, typeDefinition);

  // For "define" type, execute the implementation to register the new type
  if (spec.type === "define") {
    const impl = typeDefinition.implementation;
    if (typeof impl === 'function') {
      return impl(processedSpec);
    }
    throw new Error('Implementation must be a function for type: ' + spec.type);
  } else {
    // For other types, call the implementation to validate and process
    const impl = typeDefinition.implementation;
    if (typeof impl === 'function') {
      const result = impl(processedSpec);
      if (!result) {
        throw new Error('Implementation must return a specification for type: ' + spec.type);
      }
      result.renderableType = typeDefinition.name;
      // If the implementation returns a spec, process it recursively
      // For recursive processing, the type must be from the result of
      // calling the implementation function or using the implementation object.
      // For now, prohibit direct recursive types.
      if (result.type && result.type == spec.type) {
        throw new Error('This is the start of an infinte loop.')
      }
      if (result.type) {
        return buildViz(result);
      }
      return result;
    }
    throw new Error('Implementation must be a function for type: ' + spec.type);
  }
}

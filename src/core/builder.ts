import { VisualizationSpec, RenderableVisualization, TypeDefinition } from './types';
import { registry } from './registry';

/**
 * Checks if an object is a RenderableVisualization
 */
function isRenderableVisualization(obj: any): boolean {
  return obj &&
         typeof obj === 'object' &&
         obj.spec &&
         typeof obj.render === 'function' &&
         typeof obj.renderToSvg === 'function' &&
         typeof obj.renderToCanvas === 'function';
}

/**
 * Process a specification with type definition
 */
function processSpecification(spec: VisualizationSpec, typeDefinition: TypeDefinition): VisualizationSpec {
  const result = { ...spec };

  // Apply default values for any missing properties
  if (typeDefinition.properties) {
    for (const [propName, propDef] of Object.entries(typeDefinition.properties)) {
      if (!(propName in result) && 'default' in propDef) {
        result[propName] = propDef.default;
      }
    }
  }

  // Validate required properties
  if (typeDefinition.properties) {
    for (const [propName, propDef] of Object.entries(typeDefinition.properties)) {
      if (propDef.required && !(propName in result)) {
        throw new Error(`Required property '${propName}' missing for visualization type '${typeDefinition.name}'`);
      }
    }
  }

  // Call custom validation function if available
  if (typeDefinition.validate && typeof typeDefinition.validate === 'function') {
    typeDefinition.validate(result);
  }

  return result;
}

/**
 * Create a renderable visualization from a processed specification
 */
function createRenderableVisualization(spec: VisualizationSpec): RenderableVisualization {
  const type = spec.type;

  // Create the renderable object
  const renderable: RenderableVisualization = {
    spec,
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
      // Implementation depends on the type
      // For now, we'll create a placeholder
      const element = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      svg.appendChild(element);

      // In a real implementation, we would call the type's rendering function
      const typeDefinition = registry.getType(type);
      if (typeDefinition && typeDefinition.implementation) {
        // Call the implementation
        const impl = typeDefinition.implementation;
        if (typeof impl === 'function') {
          const result = impl(spec);
          // Process the result recursively
          if (result && result.type) {
            const childViz = buildViz(result);
            return childViz.renderToSvg(svg);
          }
        }
      }

      return element;
    },

    // Render to a Canvas context
    renderToCanvas: (ctx: CanvasRenderingContext2D) => {
      // Implementation depends on the type
      // For now, we'll create a placeholder
      ctx.save();

      // In a real implementation, we would call the type's rendering function
      const typeDefinition = registry.getType(type);
      if (typeDefinition && typeDefinition.implementation) {
        // Call the implementation
        const impl = typeDefinition.implementation;
        if (typeof impl === 'function') {
          const result = impl(spec);
          // Process the result recursively
          if (result && result.type) {
            const childViz = buildViz(result);
            childViz.renderToCanvas(ctx);
          }
        }
      }

      ctx.restore();
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
export function buildViz(spec: VisualizationSpec): RenderableVisualization {
  // If already a RenderableVisualization, return it
  if (isRenderableVisualization(spec)) {
    return spec as RenderableVisualization;
  }

  // Handle null or undefined
  if (!spec) {
    throw new Error('Visualization specification cannot be null or undefined');
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
      impl(processedSpec);
    }
  } else {
    // For other types, call the implementation to validate and process
    const impl = typeDefinition.implementation;
    if (typeof impl === 'function') {
      const result = impl(processedSpec);
      // If the implementation returns a new spec, process it recursively
      if (result && result.type && result.type !== spec.type) {
        return buildViz(result);
      }
    }
  }

  // Create and return a renderable visualization
  return createRenderableVisualization(processedSpec);
}

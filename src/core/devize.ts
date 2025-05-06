// Core functionality for the library
import * as THREE from 'three';
import { VizSpec, ConstraintSpec, VizInstance } from './types';
import { getType, hasType, registerType } from './registry';
import { defineShapePrimitives } from '../primitives/shapes';
import { defineTextPrimitives } from '../primitives/text';
import { defineContainerPrimitives } from '../primitives/containers';

console.log('Devize module initializing');

/**
 * Create a visualization from a spec
 * @param spec The visualization specification
 * @param container Optional container element
 * @returns The visualization instance
 */
export function createViz(spec: VizSpec, container?: HTMLElement): VizInstance {
  console.log(`Creating visualization of type: ${spec.type}`);

  // Validate spec
  if (!spec.type) {
    throw new Error('Visualization spec must have a type');
  }

  // Extract container from spec if provided and not passed as parameter
  const containerElement = container || spec.container as HTMLElement;

  // Special handling for the "define" type when it's being bootstrapped
  if (spec.type === "define" && !hasType("define")) {
    console.log('Special handling for define type');
    // This is the initial definition of the "define" type
    // Handle it directly without requiring it to be registered first
    const name = spec.name;
    const properties = spec.properties;
    const implementation = spec.implementation;

    // Register the new type
    registerType({
      name: name,
      requiredProps: Object.entries(properties)
        .filter(([_, config]) => (config as any).required)
        .map(([name]) => name),
      optionalProps: Object.fromEntries(
        Object.entries(properties)
          .filter(([_, config]) => !(config as any).required && (config as any).default !== undefined)
          .map(([name, config]) => [name, (config as any).default])
      ),
      generateConstraints: (innerSpec, innerContext) => {
        // Default constraint to fit container
        return [{ type: 'fitToContainer', container: innerContext.container }];
      },
      decompose: (innerSpec, innerSolvedConstraints) => {
        // Process implementation based on its type
        if (typeof implementation === 'function') {
          return implementation(innerSpec);
        } else {
          return implementation;
        }
      }
    });

    console.log(`Registered ${spec.name} type`);

    // Return a minimal instance since define doesn't render anything
    return {
      spec: spec,
      data: { name, properties, implementation }
    };
  }

  // Check if the type is registered
  if (!hasType(spec.type)) {
    throw new Error(`Unknown visualization type: ${spec.type}`);
  }

  // Get the visualization type
  const vizType = getType(spec.type)!;

  // Check required properties
  for (const prop of vizType.requiredProps) {
    if (!(prop in spec)) {
      throw new Error(`Missing required property: ${prop} for type ${spec.type}`);
    }
  }

  // Apply default values for optional properties
  const fullSpec = { ...spec };
  if (vizType.optionalProps) {
    for (const [key, defaultValue] of Object.entries(vizType.optionalProps)) {
      if (!(key in fullSpec)) {
        fullSpec[key] = defaultValue;
      }
    }
  }

  // For non-rendering visualizations, just process the data and return
  if (vizType.isDataTransformation) {
    const processedResult = vizType.process(fullSpec);
    // Ensure data is returned
    if (!processedResult.data) {
      processedResult.data = { ...fullSpec };
    }
    return processedResult;
  }

  // Generate constraints
  const constraints = vizType.generateConstraints(fullSpec, { container: containerElement });

  // Solve constraints (simplified for now)
  const solvedConstraints = solveConstraints(constraints, fullSpec);

  // Decompose the visualization
  const decomposed = vizType.decompose(fullSpec, solvedConstraints);

  // Create the visualization instance
  const vizInstance = createVizElement(decomposed);

  // If a container is provided, append the element to it (top-level side effect)
  if (containerElement && vizInstance.element) {
    // Ensure we have an SVG container at the top level
    const svg = ensureSvg(containerElement);
    svg.appendChild(vizInstance.element);
  }

  return vizInstance;
}

/**
 * Create a visualization element without side effects
 * @param spec The visualization specification
 * @returns The visualization instance
 */
function createVizElement(spec: VizSpec): VizInstance {
  // Check if we need 3D rendering
  const is3D = (spec.type && spec.type.includes && spec.type.includes('3d')) || spec.dimensions === 3;

  if (is3D) {
    return create3DVizElement(spec);
  } else {
    return create2DVizElement(spec);
  }
}

/**
 * Create a 2D visualization element without side effects
 * @param spec The visualization specification
 * @returns The visualization instance
 */
function create2DVizElement(spec: VizSpec): VizInstance {
  console.log('Creating 2D visualization element:', spec.type);

  // Get the visualization type
  const vizType = getType(spec.type)!;

  // Use the decompose method to get the implementation
  const implementation = vizType.decompose(spec, {});

  // If the implementation returns a VizInstance directly, use it
  if (implementation.element) {
    return implementation;
  }

  // Otherwise, recursively create the visualization from the decomposed spec
  return createVizElement(implementation);
}

/**
 * Create a 3D visualization element without side effects
 * @param spec The visualization specification
 * @returns The visualization instance
 */
function create3DVizElement(spec: VizSpec): VizInstance {
  // Set up Three.js scene
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000); // Default aspect ratio of 1
  const renderer = new THREE.WebGLRenderer({ antialias: true });

  // Set default size
  renderer.setSize(800, 600);

  // Position camera
  camera.position.z = 5;

  // TODO: Implement actual 3D rendering based on spec

  return {
    element: renderer.domElement,
    spec: spec,
    // Add Three.js specific properties
    scene,
    camera,
    renderer,
    data: { ...spec, scene, camera }
  } as VizInstance;
}

/**
 * Update a visualization
 * @param vizInstance The visualization instance to update
 * @param newSpec The new specification
 * @returns The updated visualization instance
 */
export function updateViz(vizInstance: VizInstance, newSpec: VizSpec): VizInstance {
  if (!vizInstance || !vizInstance.spec) {
    throw new Error('Invalid visualization instance');
  }

  // For non-rendering visualizations, just create a new instance
  if (!vizInstance.element) {
    return createViz({ ...vizInstance.spec, ...newSpec });
  }

  // For rendering visualizations, handle DOM updates
  if (!vizInstance.element.parentElement) {
    throw new Error('Visualization element has no parent');
  }

  // Get the container
  const container = vizInstance.element.parentElement as HTMLElement;

  // Remove the old element
  container.removeChild(vizInstance.element);

  // Create a new visualization with the updated spec
  return createViz({ ...vizInstance.spec, ...newSpec, container });
}

/**
 * Simplified constraint solver
 * @param constraints The constraints to solve
 * @param spec The visualization specification
 * @returns The solved constraints
 */
function solveConstraints(constraints: ConstraintSpec[], _spec: VizSpec): any {
  // For now, just handle fitToContainer constraint directly
  const fitConstraint = constraints.find(c => c.type === 'fitToContainer');
  if (fitConstraint && fitConstraint.container) {
    const container = fitConstraint.container as HTMLElement;
    return {
      width: container.clientWidth,
      height: container.clientHeight
    };
  }

  // Default dimensions
  return { width: 800, height: 400 };
}

/**
 * Helper function to ensure an SVG element exists
 * @param container The container element or object
 * @returns The SVG element or parent element
 */
export function ensureSvg(container: HTMLElement | any): SVGElement | Element {
  // Handle different container types
  if (container.element) {
    // If container is an object with an element property
    return container.element;
  } else {
    // If container is a direct DOM element
    const containerElement = container as HTMLElement;

    let svg = containerElement.querySelector('svg');
    if (!svg) {
      svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', '100%');
      svg.setAttribute('height', '100%');
      containerElement.appendChild(svg);
    }
    return svg as SVGElement;
  }
}

// Initialize the library by loading primitive definitions
export function initializeLibrary() {
  // Import and initialize the define module first
  import('./define');

  // Define primitive types
  defineShapePrimitives();
  defineTextPrimitives();
  defineContainerPrimitives();

  // Load component definitions
  import('../components/axis');
  import('../components/legend');

  console.log('Library initialization complete');
}

// Auto-initialize when imported
initializeLibrary();

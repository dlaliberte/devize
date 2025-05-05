// Core functionality for the library
import * as THREE from 'three';
import { VizSpec, ConstraintSpec, VizInstance } from './types';
import { getType, hasType, registerType } from './registry';
import { createRectangle, createCircle, createLine, createText } from '../primitives/shapes';
import { createGroup } from '../primitives/containers';

console.log('Devize module initializing');

/**
 * Create a visualization from a spec
 * @param spec The visualization specification
 * @returns The visualization instance
 */
export function createViz(spec: VizSpec): VizInstance {
  console.log(`Creating visualization of type: ${spec.type}`);

  // Validate spec
  if (!spec.type) {
    throw new Error('Visualization spec must have a type');
  }

  // Extract container from spec if provided
  const container = spec.container as HTMLElement;

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
      data: {}
    };
  }

  // Handle primitive types directly
  switch (spec.type) {
    case 'rectangle':
      return createRectangle(spec, container);
    case 'circle':
      return createCircle(spec, container);
    case 'line':
      return createLine(spec, container);
    case 'text':
      return createText(spec, container);
    case 'group':
      return createGroup(spec, container);
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
    return vizType.process(fullSpec);
  }

  // For rendering visualizations, ensure we have a container
  if (!container && vizType.requiresContainer) {
    throw new Error(`Visualization type ${spec.type} requires a container element`);
  }

  // Generate constraints
  const constraints = vizType.generateConstraints(fullSpec, { container });

  // Solve constraints (simplified for now)
  const solvedConstraints = solveConstraints(constraints, fullSpec);

  // Decompose the visualization
  const decomposed = vizType.decompose(fullSpec, solvedConstraints);

  // Render the decomposed visualization if it requires rendering
  if (container && vizType.requiresContainer) {
    return renderViz(decomposed, container);
  }

  // Otherwise just return the processed result
  return {
    spec: decomposed,
    data: decomposed.data
  };
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
 * Render a visualization
 * @param spec The visualization specification
 * @param container The container element
 * @returns The visualization instance
 */
function renderViz(spec: VizSpec, container: HTMLElement): VizInstance {
  console.log('Rendering visualization:', spec.type, 'to container:', container);

  // Check if we need 3D rendering
  const is3D = spec.type.includes('3d') || spec.dimensions === 3;

  if (is3D) {
    return render3DViz(spec, container);
  } else {
    return render2DViz(spec, container);
  }
}

/**
 * Render a 2D visualization
 * @param spec The visualization specification
 * @param container The container element
 * @returns The visualization instance
 */
function render2DViz(spec: VizSpec, container: HTMLElement | any): VizInstance {
  console.log('Rendering 2D visualization:', spec.type);

  // Handle different container types
  let containerElement: HTMLElement;
  let svgParent: Element;

  if (container.element) {
    // If container is an object with an element property (like { element: group })
    containerElement = container.element;
    svgParent = containerElement;
  } else {
    // If container is a direct DOM element
    containerElement = container as HTMLElement;

    // Create SVG element if it doesn't exist
    let svg = containerElement.querySelector('svg');
    if (!svg) {
      console.log('Creating new SVG element');
      svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', '100%');
      svg.setAttribute('height', '100%');
      containerElement.appendChild(svg);
    } else {
      console.log('Using existing SVG element');
    }

    svgParent = svg;
  }

  // For group types, handle nested components
  if (spec.type === 'group' && spec.children) {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    if (spec.transform) {
      group.setAttribute('transform', spec.transform);
    }
    svgParent.appendChild(group);

    // Render children
    const children = Array.isArray(spec.children) ? spec.children : [spec.children];
    children.forEach(child => {
      if (child) {
        // Pass the group as the container for nested components
        createViz({
          ...child,
          container: { element: group } // Pass the group element as a container-like object
        });
      }
    });

    return {
      element: group,
      spec: spec
    };
  }

  // Handle other primitive types
  switch (spec.type) {
    case 'rectangle':
      return createRectangle(spec, containerElement);
    case 'circle':
      return createCircle(spec, containerElement);
    case 'line':
      return createLine(spec, containerElement);
    case 'text':
      return createText(spec, containerElement);
    default:
      throw new Error(`Unknown visualization type: ${spec.type}`);
  }
}

/**
 * Render a 3D visualization
 * @param spec The visualization specification
 * @param container The container element
 * @returns The visualization instance
 */
function render3DViz(spec: VizSpec, container: HTMLElement): VizInstance {
  // Set up Three.js scene
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ antialias: true });

  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  // Position camera
  camera.position.z = 5;

  // TODO: Implement actual 3D rendering based on spec

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }

  animate();

  // Handle window resize
  window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });

  return {
    element: renderer.domElement,
    spec: spec,
    // Add Three.js specific properties
    scene,
    camera,
    renderer
  } as VizInstance;
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

// Core functionality for the library
import * as THREE from 'three';
import { VizSpec, ConstraintSpec, VizInstance } from './types';
import { getType, hasType } from './registry';
import { createRectangle, createCircle, createLine, createText } from '../primitives/shapes';
import { createGroup } from '../primitives/containers';

/**
 * Create a visualization from a spec
 * @param spec The visualization specification
 * @param container The container element
 * @returns The visualization instance
 */
export function createViz(spec: VizSpec, container: HTMLElement): VizInstance {
  // Validate spec
  if (!spec.type) {
    throw new Error('Visualization spec must have a type');
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
  if (vizType.optionalProps) {
    for (const [key, defaultValue] of Object.entries(vizType.optionalProps)) {
      if (!(key in spec)) {
        spec[key] = defaultValue;
      }
    }
  }

  // Generate constraints
  const constraints = vizType.generateConstraints(spec, { container });

  // Solve constraints (simplified for now)
  const solvedConstraints = solveConstraints(constraints, spec);

  // Decompose the visualization
  const decomposed = vizType.decompose(spec, solvedConstraints);

  // Render the decomposed visualization
  return renderViz(decomposed, container);
}

/**
 * Update a visualization
 * @param vizInstance The visualization instance to update
 * @param newSpec The new specification
 * @returns The updated visualization instance
 */
export function updateViz(vizInstance: VizInstance, newSpec: VizSpec): VizInstance {
  if (!vizInstance || !vizInstance.element || !vizInstance.spec) {
    throw new Error('Invalid visualization instance');
  }

  // Get the container
  const container = vizInstance.element.parentElement as HTMLElement;
  if (!container) {
    throw new Error('Visualization element has no parent');
  }

  // Remove the old element
  container.removeChild(vizInstance.element);

  // Create a new visualization with the updated spec
  return createViz({ ...vizInstance.spec, ...newSpec }, container);
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
function render2DViz(spec: VizSpec, container: HTMLElement): VizInstance {
  // Create SVG element if it doesn't exist
  let svg = container.querySelector('svg');
  if (!svg) {
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    container.appendChild(svg);
  }

  // Handle different visualization types
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
 * @param container The container element
 * @returns The SVG element
 */
export function ensureSvg(container: HTMLElement): SVGElement {
  let svg = container.querySelector('svg');
  if (!svg) {
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    container.appendChild(svg);
  }
  return svg as SVGElement;
}

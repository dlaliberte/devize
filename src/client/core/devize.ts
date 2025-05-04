import { VizSpec, VizInstance, ConstraintSpec } from './types';
import { getType, hasType, registerType } from './registry';
import { applyTransforms } from '../data/transforms';
import { extractData } from '../data/sources';
import * as THREE from 'three';

/**
 * Create a visualization from a spec
 * @param spec The visualization specification
 * @param container The container element
 * @returns The visualization instance
 */
export async function createViz(spec: VizSpec, container: HTMLElement): Promise<VizInstance> {
  // Validate spec
  if (!spec.type) {
    throw new Error('Visualization spec must have a type');
  }

  // Check if the type is registered
  if (hasType(spec.type)) {
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

    // Extract data if needed
    if (spec.data && !Array.isArray(spec.data)) {
      spec.data = await extractData(spec);
    }

    // Apply transforms if specified
    if (spec.data && Array.isArray(spec.data) && spec.transforms && Array.isArray(spec.transforms)) {
      spec.data = applyTransforms(spec.data, spec.transforms);
    }

    // Generate constraints
    const constraints = vizType.generateConstraints(spec, { container });

    // Solve constraints (simplified for now)
    const solvedConstraints = solveConstraints(constraints, spec);

    // Decompose the visualization
    const decomposed = vizType.decompose(spec, solvedConstraints);

    // Render the decomposed visualization
    return renderViz(decomposed, container);
  } else {
    // Handle primitive types directly
    return renderPrimitive(spec, container);
  }
}

/**
 * Update a visualization
 * @param vizInstance The visualization instance to update
 * @param newSpec The new specification
 * @returns The updated visualization instance
 */
export async function updateViz(vizInstance: VizInstance, newSpec: VizSpec): Promise<VizInstance> {
  if (!vizInstance || !vizInstance.element) {
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
  // For now, we'll just handle 2D SVG visualizations
  return render2DViz(spec, container);
}

/**
 * Render a primitive visualization
 * @param spec The visualization specification
 * @param container The container element
 * @returns The visualization instance
 */
function renderPrimitive(spec: VizSpec, container: HTMLElement): VizInstance {
  // Placeholder for primitive rendering
  const div = document.createElement('div');
  div.textContent = `Primitive: ${spec.type}`;
  container.appendChild(div);
  return { element: div, spec };
}

// Render a 2D visualization
function render2DViz(spec: VizSpec, container: HTMLElement): VizInstance {
  // Create SVG element
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  container.appendChild(svg);

  // TODO: Implement actual 2D rendering

  return { element: svg, spec };
}

// Render a 3D visualization
export function render3DViz(spec: VizSpec, container: HTMLElement): VizInstance {
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

  return { element: renderer.domElement, spec, scene, camera, renderer };
}

// Register basic visualization types
// This would be expanded with actual implementations
registerType({
  name: 'pointGroup',
  requiredProps: ['data'],
  optionalProps: {
    x: { field: 'x' },
    y: { field: 'y' },
    color: '#3366CC',
    size: 5
  },
  generateConstraints(_spec, context) {
    return [{ type: 'fitToContainer', container: context.container }];
  },
  decompose(spec, _solvedConstraints) {
    // Simplified implementation
    return {
      type: 'group',
      children: spec.data.map((d: any) => ({
        type: 'circle',
        cx: d[spec.x.field],
        cy: d[spec.y.field],
        r: spec.size,
        fill: spec.color
      }))
    };
  }
});

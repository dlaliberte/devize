import * as THREE from 'three';

// Type definitions
interface VizSpec {
  type: string;
  [key: string]: any;
}

interface ConstraintSpec {
  type: string;
  priority?: 'low' | 'medium' | 'high';
  [key: string]: any;
}

interface VisualizationType {
  name: string;
  requiredProps: string[];
  optionalProps?: Record<string, any>;
  generateConstraints: (spec: VizSpec, context: any) => ConstraintSpec[];
  decompose: (spec: VizSpec, solvedConstraints: any) => VizSpec;
}

// Registry for visualization types
const typeRegistry: Record<string, VisualizationType> = {};

// Register a visualization type
export function registerType(type: VisualizationType): void {
  typeRegistry[type.name] = type;
}

// Create a visualization from a spec
export function createViz(spec: VizSpec, container: HTMLElement): any {
  // Validate spec
  if (!spec.type) {
    throw new Error('Visualization spec must have a type');
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

// Update a visualization
export function updateViz(vizInstance: any, newSpec: VizSpec): void {
  if (!vizInstance || !vizInstance.element || !vizInstance.spec) {
    throw new Error('Invalid visualization instance');
  }

  // Remove the old element
  const container = vizInstance.element.parentNode;
  container.removeChild(vizInstance.element);

  // Create a new visualization with the updated spec
  return createViz({...vizInstance.spec, ...newSpec}, container);
}

// Create a rectangle
function createRectangle(spec: VizSpec, container: HTMLElement): any {
  // Create SVG if it doesn't exist
  let svg = container.querySelector('svg');
  if (!svg) {
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    container.appendChild(svg);
  }

  // Create rectangle element
  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');

  // Set attributes from spec
  rect.setAttribute('x', spec.x?.toString() || '0');
  rect.setAttribute('y', spec.y?.toString() || '0');
  rect.setAttribute('width', spec.width?.toString() || '0');
  rect.setAttribute('height', spec.height?.toString() || '0');

  // Set style attributes
  if (spec.fill) rect.setAttribute('fill', spec.fill);
  if (spec.stroke) rect.setAttribute('stroke', spec.stroke);
  if (spec.strokeWidth) rect.setAttribute('stroke-width', spec.strokeWidth.toString());
  if (spec.rx) rect.setAttribute('rx', spec.rx.toString());
  if (spec.ry) rect.setAttribute('ry', spec.ry.toString());
  if (spec.opacity) rect.setAttribute('opacity', spec.opacity.toString());

  // Add to SVG
  svg.appendChild(rect);

  // Return the visualization instance
  return {
    element: rect,
    spec: spec
  };
}

// Placeholder functions for other visualization types
function createCircle(spec: VizSpec, container: HTMLElement): any {
  // Implementation will be added later
  console.log('Circle creation not yet implemented');
  return { element: null, spec };
}

function createLine(spec: VizSpec, container: HTMLElement): any {
  // Implementation will be added later
  console.log('Line creation not yet implemented');
  return { element: null, spec };
}

function createText(spec: VizSpec, container: HTMLElement): any {
  // Implementation will be added later
  console.log('Text creation not yet implemented');
  return { element: null, spec };
}

function createGroup(spec: VizSpec, container: HTMLElement): any {
  // Implementation will be added later
  console.log('Group creation not yet implemented');
  return { element: null, spec };
}

// Simplified constraint solver
function solveConstraints(constraints: ConstraintSpec[], spec: VizSpec): any {
  // Sort constraints by priority
  const sortedConstraints = [...constraints].sort((a, b) => {
    const priorityMap = { low: 0, medium: 1, high: 2 };
    return (priorityMap[b.priority || 'medium'] - priorityMap[a.priority || 'medium']);
  });

  // TODO: Implement actual constraint solving
  // This is a placeholder for now
  return { width: 500, height: 300 };
}

// Render a visualization
function renderViz(spec: VizSpec, container: HTMLElement): any {
  // Check if we need 3D rendering
  const is3D = spec.type.includes('3d') || spec.dimensions === 3;

  if (is3D) {
    return render3DViz(spec, container);
  } else {
    return render2DViz(spec, container);
  }
}

// Render a 2D visualization
function render2DViz(spec: VizSpec, container: HTMLElement): any {
  // Create SVG element
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  container.appendChild(svg);

  // TODO: Implement actual 2D rendering

  return { element: svg, spec };
}

// Render a 3D visualization
function render3DViz(spec: VizSpec, container: HTMLElement): any {
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

  return { scene, camera, renderer, spec };
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
  generateConstraints(spec, context) {
    return [{ type: 'fitToContainer', container: context.container }];
  },
  decompose(spec, solvedConstraints) {
    // Simplified implementation
    return {
      type: 'group',
      children: spec.data.map(d => ({
        type: 'circle',
        cx: d[spec.x.field],
        cy: d[spec.y.field],
        r: spec.size,
        fill: spec.color
      }))
    };
  }
});

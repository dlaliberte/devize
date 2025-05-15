/**
 * 3D Axis Component
 *
 * Purpose: Renders 3D axes with ticks, labels, and grid lines
 * Author: Devize Team
 * Creation Date: 2023-12-22
 */

import * as THREE from 'three';
import { buildViz } from '../../core/builder';
import { registerDefineType } from '../../core/define';
import { createRenderableVisualization } from '../../core/componentUtils';
import { Scale } from '../scales/scale';
import { Cartesian3DCoordinateSystem } from '../coordinates/cartesian3DCoordinateSystem';

// Interface for axis options
export interface Axis3DOptions {
  // Coordinate system
  coordinateSystem: Cartesian3DCoordinateSystem;

  // Axis type
  axisType: 'x' | 'y' | 'z';

  // Visual options
  color?: string;
  tickSize?: number;
  tickCount?: number;
  showGrid?: boolean;
  gridColor?: string;

  // Label options
  label?: string;
  labelSize?: number;
  labelColor?: string;

  // Tick label options
  tickLabelSize?: number;
  tickLabelColor?: string;
  tickFormat?: (value: number) => string;
}

// Define the axis3D component
export const axis3DDefinition = {
  type: "define",
  name: "axis3D",
  properties: {
    coordinateSystem: { required: true },
    axisType: { required: true },
    color: { default: null },
    tickSize: { default: 5 },
    tickCount: { default: 5 },
    showGrid: { default: false },
    gridColor: { default: '#cccccc' },
    label: { default: null },
    labelSize: { default: 12 },
    labelColor: { default: '#000000' },
    tickLabelSize: { default: 10 },
    tickLabelColor: { default: '#000000' },
    tickFormat: { default: null }
  },
  implementation: function(props: any) {
    // Create a 3D axis object
    const axis3D = createAxis3D(props);

    // Create and return a renderable visualization
    return createRenderableVisualization(
      'axis3D',
      props,
      // SVG rendering function - not used for Three.js visualizations
      (container: SVGElement): SVGElement => {
        // Create a placeholder with a message
        const foreignObject = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
        foreignObject.setAttribute('width', '100%');
        foreignObject.setAttribute('height', '100%');

        const div = document.createElement('div');
        div.style.width = '100%';
        div.style.height = '100%';
        div.style.display = 'flex';
        div.style.alignItems = 'center';
        div.style.justifyContent = 'center';
        div.style.backgroundColor = '#f0f0f0';
        div.textContent = '3D Axis requires Three.js rendering';

        foreignObject.appendChild(div);
        container.appendChild(foreignObject);

        return container;
      },
      // Canvas rendering function - not used for Three.js visualizations
      (ctx: CanvasRenderingContext2D): boolean => {
        // Display a message in the canvas
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, 100, 100);
        ctx.fillStyle = '#333333';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('3D Axis requires Three.js rendering', 50, 50);

        return true;
      },
      // Additional properties
      {
        getObject3D: () => axis3D
      }
    );
  }
};

// Factory function to create a 3D axis
export function createAxis3D(options: Axis3DOptions): THREE.Object3D {
  const {
    coordinateSystem,
    axisType,
    color = '#000000',
    tickSize = 5,
    tickCount = 5,
    showGrid = false,
    gridColor = '#cccccc',
    label,
    labelSize = 12,
    labelColor = '#000000',
    tickLabelSize = 10,
    tickLabelColor = '#000000',
    tickFormat
  } = options;

  // Create a group to hold all axis elements
  const axisGroup = new THREE.Group();

  // Get the dimensions of the coordinate system
  const dimensions = coordinateSystem.getDimensions();
  const { width, height, depth } = dimensions;

  // Get the appropriate scale based on axis type
  let scale: Scale;
  let axisLength: number;
  let axisStart: THREE.Vector3;
  let axisEnd: THREE.Vector3;
  let tickDirection: THREE.Vector3;
  let gridPlane: 'xy' | 'xz' | 'yz';

  switch (axisType) {
    case 'x':
      scale = coordinateSystem.getXScale();
      axisLength = width;
      axisStart = new THREE.Vector3(0, 0, 0);
      axisEnd = new THREE.Vector3(width, 0, 0);
      tickDirection = new THREE.Vector3(0, -1, 0); // Ticks point down
      gridPlane = 'xy'; // Grid in XY plane
      break;
    case 'y':
      scale = coordinateSystem.getYScale();
      axisLength = height;
      axisStart = new THREE.Vector3(0, 0, 0);
      axisEnd = new THREE.Vector3(0, height, 0);
      tickDirection = new THREE.Vector3(-1, 0, 0); // Ticks point left
      gridPlane = 'yz'; // Grid in YZ plane
      break;
    case 'z':
      scale = coordinateSystem.getZScale();
      axisLength = depth;
      axisStart = new THREE.Vector3(0, 0, 0);
      axisEnd = new THREE.Vector3(0, 0, depth);
      tickDirection = new THREE.Vector3(0, -1, 0); // Ticks point down
      gridPlane = 'xz'; // Grid in XZ plane
      break;
    default:
      throw new Error(`Invalid axis type: ${axisType}`);
  }

  // Create the axis line
  const axisGeometry = new THREE.BufferGeometry().setFromPoints([
    axisStart,
    axisEnd
  ]);

  const axisMaterial = new THREE.LineBasicMaterial({ color });
  const axisLine = new THREE.Line(axisGeometry, axisMaterial);
  axisGroup.add(axisLine);

  // Generate tick values
  const domain = scale.domain;
  const tickValues = [];

  // If the scale has a ticks function, use it
  if (typeof scale.ticks === 'function') {
    tickValues.push(...scale.ticks(tickCount));
  } else {
    // Otherwise, generate evenly spaced ticks
    const step = (domain[1] - domain[0]) / (tickCount - 1);
    for (let i = 0; i < tickCount; i++) {
      tickValues.push(domain[0] + i * step);
    }
  }

  // Create ticks and labels
  tickValues.forEach(value => {
    // Skip if the value is outside the domain
    if (value < domain[0] || value > domain[1]) return;

    // Get the position along the axis
    let position: THREE.Vector3;
    switch (axisType) {
      case 'x':
        position = new THREE.Vector3(scale.scale(value), 0, 0);
        break;
      case 'y':
        position = new THREE.Vector3(0, scale.scale(value), 0);
        break;
      case 'z':
        position = new THREE.Vector3(0, 0, scale.scale(value));
        break;
    }

    // Create tick mark
    const tickEnd = position.clone().add(tickDirection.clone().multiplyScalar(tickSize));
    const tickGeometry = new THREE.BufferGeometry().setFromPoints([
      position,
      tickEnd
    ]);

    const tickMaterial = new THREE.LineBasicMaterial({ color });
    const tickLine = new THREE.Line(tickGeometry, tickMaterial);
    axisGroup.add(tickLine);

    // Create tick label
    const labelText = tickFormat ? tickFormat(value) : value.toString();

    // Create text for the tick label
    const tickLabelMesh = createTextMesh(
      labelText,
      tickLabelSize,
      tickLabelColor
    );

    // Position the label based on axis type
    switch (axisType) {
      case 'x':
        tickLabelMesh.position.set(position.x, position.y - tickSize - 5, position.z);
        break;
      case 'y':
        tickLabelMesh.position.set(position.x - tickSize - 10, position.y, position.z);
        tickLabelMesh.rotation.z = -Math.PI / 2; // Rotate for Y axis
        break;
      case 'z':
        tickLabelMesh.position.set(position.x - 5, position.y - tickSize - 5, position.z);
        tickLabelMesh.rotation.y = Math.PI / 2; // Rotate for Z axis
        break;
    }

    axisGroup.add(tickLabelMesh);

    // Create grid lines if enabled
    if (showGrid) {
      let gridStart: THREE.Vector3;
      let gridEnd: THREE.Vector3;

      switch (gridPlane) {
        case 'xy':
          // Grid line along Y axis
          gridStart = new THREE.Vector3(position.x, 0, 0);
          gridEnd = new THREE.Vector3(position.x, height, 0);
          break;
        case 'xz':
          // Grid line along X axis
          gridStart = new THREE.Vector3(0, 0, position.z);
          gridEnd = new THREE.Vector3(width, 0, position.z);
          break;
        case 'yz':
          // Grid line along Z axis
          gridStart = new THREE.Vector3(0, position.y, 0);
          gridEnd = new THREE.Vector3(0, position.y, depth);
          break;
      }

      const gridGeometry = new THREE.BufferGeometry().setFromPoints([
        gridStart,
        gridEnd
      ]);

      const gridMaterial = new THREE.LineBasicMaterial({
        color: gridColor,
        transparent: true,
        opacity: 0.5,
        depthWrite: false // Prevents z-fighting
      });

      const gridLine = new THREE.Line(gridGeometry, gridMaterial);
      axisGroup.add(gridLine);
    }
  });

  // Add axis label if provided
  if (label) {
    const axisMidpoint = axisStart.clone().add(axisEnd).multiplyScalar(0.5);
    const labelMesh = createTextMesh(label, labelSize, labelColor);

    // Position the label based on axis type
    switch (axisType) {
      case 'x':
        labelMesh.position.set(axisMidpoint.x, axisMidpoint.y - 20, axisMidpoint.z);
        break;
      case 'y':
        labelMesh.position.set(axisMidpoint.x - 25, axisMidpoint.y, axisMidpoint.z);
        labelMesh.rotation.z = -Math.PI / 2; // Rotate for Y axis
        break;
      case 'z':
        labelMesh.position.set(axisMidpoint.x - 20, axisMidpoint.y, axisMidpoint.z);
        labelMesh.rotation.y = Math.PI / 2; // Rotate for Z axis
        break;
    }

    axisGroup.add(labelMesh);
  }

  return axisGroup;
}

// Helper function to create text mesh
function createTextMesh(text: string, size: number, color: string): THREE.Mesh {
  // In a real implementation, we would use a TextGeometry or a sprite-based approach
  // For simplicity, we'll create a placeholder cube for now
  const geometry = new THREE.BoxGeometry(text.length * size * 0.5, size, 0.1);
  const material = new THREE.MeshBasicMaterial({ color });
  const mesh = new THREE.Mesh(geometry, material);

  // Store the text for debugging
  (mesh as any).userData = { text };

  return mesh;
}

// Register the axis3D component
export function registerAxis3DComponent() {
  buildViz(axis3DDefinition);
  console.log('3D axis component registered');
}

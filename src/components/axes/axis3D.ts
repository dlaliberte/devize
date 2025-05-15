/**
 * 3D Axis Component
 *
 * Purpose: Renders a 3D axis with ticks and labels using Three.js
 * Author: Devize Team
 * Creation Date: 2023-12-28
 */

import * as THREE from 'three';
import { buildViz } from '../../core/builder';
import { registerDefineType } from '../../core/define';
import { createRenderableVisualizationEnhanced } from '../../core/componentUtils';
import { Cartesian3DCoordinateSystem } from '../coordinates/cartesian3DCoordinateSystem';

// Make sure define type is registered
registerDefineType();

// Define the axis3D component
export const axis3DDefinition = {
  type: "define",
  name: "axis3D",
  properties: {
    axisType: { required: true }, // 'x', 'y', or 'z'
    coordinateSystem: { required: true },
    color: { default: '#000000' },
    tickCount: { default: 5 },
    tickSize: { default: 5 },
    tickFormat: { default: null },
    showGrid: { default: false },
    gridColor: { default: '#cccccc' },
    label: { default: '' },
    labelOffset: { default: 10 },
    fontSize: { default: 12 },
    fontFamily: { default: 'Arial, sans-serif' }
  },
  implementation: function(props: any) {
    const {
      axisType,
      coordinateSystem,
      color,
      tickCount,
      tickSize,
      tickFormat,
      showGrid,
      gridColor,
      label,
      labelOffset,
      fontSize,
      fontFamily
    } = props;

    // Validate axis type
    if (!['x', 'y', 'z'].includes(axisType)) {
      throw new Error(`Invalid axis type: ${axisType}. Must be 'x', 'y', or 'z'.`);
    }

    // Validate coordinate system
    if (!coordinateSystem || coordinateSystem.getDimensionality() !== 3) {
      throw new Error('A valid 3D coordinate system is required for axis3D.');
    }

    // Create a renderable visualization that will use Three.js
    return createRenderableVisualizationEnhanced(
      'axis3D',
      props,
      {
        renderToSvg: (container: SVGElement): SVGElement => {
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
        renderToCanvas: (ctx: CanvasRenderingContext2D): boolean => {
          // Display a message in the canvas
          const width = ctx.canvas.width;
          const height = ctx.canvas.height;

          ctx.fillStyle = '#f0f0f0';
          ctx.fillRect(0, 0, width, height);
          ctx.fillStyle = '#333333';
          ctx.font = '14px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('3D Axis requires Three.js rendering', width / 2, height / 2);

          return true;
        },
        renderToThreeJS: (container: HTMLElement): any => {
          // Get dimensions from the container
          const width = container.clientWidth;
          const height = container.clientHeight;

          // Create Three.js renderer
          const renderer = new THREE.WebGLRenderer({ antialias: true });
          renderer.setSize(width, height);
          renderer.setClearColor(0xf0f0f0);
          container.appendChild(renderer.domElement);

          // Create scene
          const scene = new THREE.Scene();

          // Create camera
          const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
          camera.position.set(100, 100, 100);
          camera.lookAt(0, 0, 0);

          // Create controls
          const controls = new THREE.OrbitControls(camera, renderer.domElement);
          controls.enableDamping = true;
          controls.dampingFactor = 0.25;

          // Get scales from coordinate system
          const xScale = coordinateSystem.getXScale();
          const yScale = coordinateSystem.getYScale();
          const zScale = coordinateSystem.getZScale();

          // Get domains
          const xDomain = xScale.domain;
          const yDomain = yScale.domain;
          const zDomain = zScale.domain;

          // Calculate axis length based on the domain
          const dimensions = coordinateSystem.getDimensions();
          const axisLength = {
            x: dimensions.width,
            y: dimensions.height,
            z: dimensions.depth
          };

          // Create axis line
          const axisGeometry = new THREE.BufferGeometry();
          const axisMaterial = new THREE.LineBasicMaterial({ color: color });

          let axisLine;

          if (axisType === 'x') {
            axisGeometry.setAttribute('position', new THREE.Float32BufferAttribute([
              0, 0, 0,
              axisLength.x, 0, 0
            ], 3));
            axisLine = new THREE.Line(axisGeometry, axisMaterial);
          } else if (axisType === 'y') {
            axisGeometry.setAttribute('position', new THREE.Float32BufferAttribute([
              0, 0, 0,
              0, axisLength.y, 0
            ], 3));
            axisLine = new THREE.Line(axisGeometry, axisMaterial);
          } else { // z
            axisGeometry.setAttribute('position', new THREE.Float32BufferAttribute([
              0, 0, 0,
              0, 0, axisLength.z
            ], 3));
            axisLine = new THREE.Line(axisGeometry, axisMaterial);
          }

          scene.add(axisLine);

          // Create ticks
          const ticks = new THREE.Group();

          // Get tick values
          const scale = axisType === 'x' ? xScale : axisType === 'y' ? yScale : zScale;
          const domain = axisType === 'x' ? xDomain : axisType === 'y' ? yDomain : zDomain;
          const tickValues = scale.ticks ? scale.ticks(tickCount) :
            Array.from({ length: tickCount }, (_, i) => domain[0] + (domain[1] - domain[0]) * i / (tickCount - 1));

          // Create tick formatter
          const formatTick = tickFormat || ((d: number) => d.toString());

          // Add ticks
          tickValues.forEach(value => {
            // Skip the first tick (at origin)
            if (value === domain[0]) return;

            const position = scale.scale(value);
            const tickGeometry = new THREE.BufferGeometry();
            const tickMaterial = new THREE.LineBasicMaterial({ color: color });

            if (axisType === 'x') {
              tickGeometry.setAttribute('position', new THREE.Float32BufferAttribute([
                position, 0, 0,
                position, -tickSize, 0
              ], 3));
            } else if (axisType === 'y') {
              tickGeometry.setAttribute('position', new THREE.Float32BufferAttribute([
                0, position, 0,
                -tickSize, position, 0
              ], 3));
            } else { // z
              tickGeometry.setAttribute('position', new THREE.Float32BufferAttribute([
                0, 0, position,
                0, -tickSize, position
              ], 3));
            }

            const tick = new THREE.Line(tickGeometry, tickMaterial);
            ticks.add(tick);

            // Add tick label
            const canvas = document.createElement('canvas');
            canvas.width = 64;
            canvas.height = 32;
            const ctx = canvas.getContext('2d');

            if (ctx) {
              ctx.fillStyle = 'white';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              ctx.fillStyle = 'black';
              ctx.font = `${fontSize}px ${fontFamily}`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(formatTick(value), canvas.width / 2, canvas.height / 2);

              const texture = new THREE.CanvasTexture(canvas);
              const material = new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
                side: THREE.DoubleSide
              });

              const geometry = new THREE.PlaneGeometry(4, 2);
              const mesh = new THREE.Mesh(geometry, material);

              if (axisType === 'x') {
                mesh.position.set(position, -tickSize - 2, 0);
                mesh.rotation.x = -Math.PI / 2;
              } else if (axisType === 'y') {
                mesh.position.set(-tickSize - 2, position, 0);
                mesh.rotation.y = Math.PI / 2;
              } else { // z
                mesh.position.set(0, -tickSize - 2, position);
                mesh.rotation.x = -Math.PI / 2;
              }

              ticks.add(mesh);
            }
          });

          scene.add(ticks);

          // Add axis label
          if (label) {
            const canvas = document.createElement('canvas');
            canvas.width = 128;
            canvas.height = 64;
            const ctx = canvas.getContext('2d');

            if (ctx) {
              ctx.fillStyle = 'white';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              ctx.fillStyle = 'black';
              ctx.font = `bold ${fontSize * 1.2}px ${fontFamily}`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(label, canvas.width / 2, canvas.height / 2);

              const texture = new THREE.CanvasTexture(canvas);
              const material = new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
                side: THREE.DoubleSide
              });

              const geometry = new THREE.PlaneGeometry(8, 4);
              const mesh = new THREE.Mesh(geometry, material);

              if (axisType === 'x') {
                mesh.position.set(axisLength.x + labelOffset, 0, 0);
                mesh.lookAt(camera.position);
              } else if (axisType === 'y') {
                mesh.position.set(0, axisLength.y + labelOffset, 0);
                mesh.lookAt(camera.position);
              } else { // z
                mesh.position.set(0, 0, axisLength.z + labelOffset);
                mesh.lookAt(camera.position);
              }

              scene.add(mesh);
            }
          }

          // Add grid if enabled
          if (showGrid) {
            const gridMaterial = new THREE.LineBasicMaterial({ color: gridColor, transparent: true, opacity: 0.5 });

            if (axisType === 'x') {
              // Create grid lines parallel to X axis
              const gridGroup = new THREE.Group();

              tickValues.forEach(value => {
                if (value === domain[0]) return;

                const position = scale.scale(value);
                const gridGeometry = new THREE.BufferGeometry();

                gridGeometry.setAttribute('position', new THREE.Float32BufferAttribute([
                  position, 0, 0,
                  position, axisLength.y, 0,
                  position, axisLength.y, axisLength.z,
                  position, 0, axisLength.z,
                  position, 0, 0
                ], 3));

                const grid = new THREE.Line(gridGeometry, gridMaterial);
                gridGroup.add(grid);
              });

              scene.add(gridGroup);
            } else if (axisType === 'y') {
              // Create grid lines parallel to Y axis
              const gridGroup = new THREE.Group();

              tickValues.forEach(value => {
                if (value === domain[0]) return;

                const position = scale.scale(value);
                const gridGeometry = new THREE.BufferGeometry();

                gridGeometry.setAttribute('position', new THREE.Float32BufferAttribute([
                  0, position, 0,
                  axisLength.x, position, 0,
                  axisLength.x, position, axisLength.z,
                  0, position, axisLength.z,
                  0, position, 0
                ], 3));

                const grid = new THREE.Line(gridGeometry, gridMaterial);
                gridGroup.add(grid);
              });

              scene.add(gridGroup);
            } else { // z
              // Create grid lines parallel to Z axis
              const gridGroup = new THREE.Group();

              tickValues.forEach(value => {
                if (value === domain[0]) return;

                const position = scale.scale(value);
                const gridGeometry = new THREE.BufferGeometry();

                gridGeometry.setAttribute('position', new THREE.Float32BufferAttribute([
                  0, 0, position,
                  axisLength.x, 0, position,
                  axisLength.x, axisLength.y, position,
                  0, axisLength.y, position,
                  0, 0, position
                ], 3));

                const grid = new THREE.Line(gridGeometry, gridMaterial);
                gridGroup.add(grid);
              });

              scene.add(gridGroup);
            }
          }

          // Render loop
          const animate = function () {
            requestAnimationFrame(animate);

            controls.update();

            renderer.render(scene, camera);
          };

          animate();
        }
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

/**
 * Surface Graph Component
 *
 * Purpose: Renders a 3D surface graph using Three.js
 * Author: Cody
 * Creation Date: 2023-12-20
 *
 * ## References
 * - **Documentation**: /src/charts/docs/surface_graph.md
 * - **Design**: /src/charts/designs/surface_graph.md
 * - **Tests**: /src/charts/tests/surfaceGraph.test.ts
 * - **Related Code**: /src/components/coordinates/cartesian3DCoordinateSystem.ts
 */

import * as THREE from 'three';
import { buildViz } from '../core/builder';
import { registerDefineType } from '../core/define';
import { createRenderableVisualizationEnhanced } from '../core/componentUtils';
import { Cartesian3DCoordinateSystem, createCartesian3DCoordinateSystem } from '../components/coordinates/cartesian3DCoordinateSystem';
import { Scale } from '../components/scales/scale';
import { createScale } from '../components/scales/scale';
import { ThreeJsRenderer } from '../utils/threeJsRenderer';
import { createColorScale } from '../components/scales/colorScale';

// Make sure define type is registered
registerDefineType();

// Add this to the imports
import { AxesHelper, GridHelper, PlaneGeometry, MeshBasicMaterial, DoubleSide } from 'three';

// Enhanced function to create axes with ticks and values
function createAxes(
  width: number,
  height: number,
  depth: number,
  coordSystem: Cartesian3DCoordinateSystem,
  showGrid: boolean
): THREE.Object3D {
  // Create a group to hold all axis-related objects
  const axesGroup = new THREE.Group();

  // Get scales from coordinate system
  const xScale = coordSystem.getXScale();
  const yScale = coordSystem.getYScale();
  const zScale = coordSystem.getZScale();

  // Get domains
  const xDomain = xScale.domain;
  const yDomain = yScale.domain;
  const zDomain = zScale.domain;

  // Create axes lines
  const axesLines = new THREE.Group();

  // X axis
  const xAxisGeometry = new THREE.BufferGeometry();
  xAxisGeometry.setAttribute('position', new THREE.Float32BufferAttribute([
    0, 0, 0, width, 0, 0
  ], 3));
  const xAxisMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
  const xAxis = new THREE.Line(xAxisGeometry, xAxisMaterial);
  axesLines.add(xAxis);

  // Y axis
  const yAxisGeometry = new THREE.BufferGeometry();
  yAxisGeometry.setAttribute('position', new THREE.Float32BufferAttribute([
    0, 0, 0, 0, height, 0
  ], 3));
  const yAxisMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 });
  const yAxis = new THREE.Line(yAxisGeometry, yAxisMaterial);
  axesLines.add(yAxis);

  // Z axis
  const zAxisGeometry = new THREE.BufferGeometry();
  zAxisGeometry.setAttribute('position', new THREE.Float32BufferAttribute([
    0, 0, 0, 0, 0, depth
  ], 3));
  const zAxisMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff });
  const zAxis = new THREE.Line(zAxisGeometry, zAxisMaterial);
  axesLines.add(zAxis);

  axesGroup.add(axesLines);

  // Create ticks and labels
  const ticksGroup = new THREE.Group();

  // Helper function to create a tick with label
  const createTick = (axis: 'x' | 'y' | 'z', value: number, position: THREE.Vector3) => {
    // Create tick mark
    const tickGeometry = new THREE.BufferGeometry();
    const tickSize = 2;
    let vertices: number[] = [];

    if (axis === 'x') {
      vertices = [
        position.x, position.y, position.z,
        position.x, position.y - tickSize, position.z
      ];
    } else if (axis === 'y') {
      vertices = [
        position.x, position.y, position.z,
        position.x - tickSize, position.y, position.z
      ];
    } else { // z
      vertices = [
        position.x, position.y, position.z,
        position.x, position.y - tickSize, position.z
      ];
    }

    tickGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    const tickMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
    const tick = new THREE.Line(tickGeometry, tickMaterial);

    // Create label
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'black';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(value.toFixed(1), canvas.width / 2, canvas.height / 2);

      const texture = new THREE.CanvasTexture(canvas);
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide
      });
      const geometry = new THREE.PlaneGeometry(4, 2);
      const mesh = new THREE.Mesh(geometry, material);

      // Position the label
      if (axis === 'x') {
        mesh.position.set(position.x, position.y - tickSize - 2, position.z);
        mesh.rotation.x = -Math.PI / 2;
      } else if (axis === 'y') {
        mesh.position.set(position.x - tickSize - 2, position.y, position.z);
        mesh.rotation.y = Math.PI / 2;
      } else { // z
        mesh.position.set(position.x, position.y - tickSize - 2, position.z);
        mesh.rotation.x = -Math.PI / 2;
      }

      const tickGroup = new THREE.Group();
      tickGroup.add(tick);
      tickGroup.add(mesh);
      return tickGroup;
    }

    return tick;
  };

  // Create X axis ticks
  const xTicks = xScale.ticks(5);
  xTicks.forEach(tick => {
    const xPos = xScale.scale(tick);
    const tickObj = createTick('x', tick, new THREE.Vector3(xPos, 0, 0));
    ticksGroup.add(tickObj);
  });

  // Create Y axis ticks
  const yTicks = yScale.ticks(5);
  yTicks.forEach(tick => {
    const yPos = yScale.scale(tick);
    const tickObj = createTick('y', tick, new THREE.Vector3(0, yPos, 0));
    ticksGroup.add(tickObj);
  });

  // Create Z axis ticks
  const zTicks = zScale.ticks(5);
  zTicks.forEach(tick => {
    const zPos = zScale.scale(tick);
    const tickObj = createTick('z', tick, new THREE.Vector3(0, 0, zPos));
    ticksGroup.add(tickObj);
  });

  axesGroup.add(ticksGroup);

  // Create grid helpers
  if (showGrid) {
    // XY plane (bottom)
    const xyGrid = new THREE.GridHelper(width, 10);
    xyGrid.rotation.x = Math.PI / 2;
    xyGrid.position.z = 0;
    axesGroup.add(xyGrid);

    // XZ plane (back)
    const xzGrid = new THREE.GridHelper(width, 10);
    xzGrid.position.y = 0;
    axesGroup.add(xzGrid);

    // YZ plane (left)
    const yzGrid = new THREE.GridHelper(height, 10);
    yzGrid.rotation.z = Math.PI / 2;
    yzGrid.position.x = 0;
    axesGroup.add(yzGrid);
  }

  // Add axis labels
  const createLabel = (text: string, position: THREE.Vector3) => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'black';
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, canvas.width / 2, canvas.height / 2);

      const texture = new THREE.CanvasTexture(canvas);
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide
      });
      const geometry = new THREE.PlaneGeometry(8, 4);
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.copy(position);
      return mesh;
    }
    return null;
  };

  // Add X, Y, Z labels
  const xLabel = createLabel('X', new THREE.Vector3(width + 5, 0, 0));
  const yLabel = createLabel('Y', new THREE.Vector3(0, height + 5, 0));
  const zLabel = createLabel('Z', new THREE.Vector3(0, 0, depth + 5));

  if (xLabel) {
    xLabel.lookAt(new THREE.Vector3(0, 0, 0));
    axesGroup.add(xLabel);
  }
  if (yLabel) {
    yLabel.lookAt(new THREE.Vector3(0, 0, 0));
    axesGroup.add(yLabel);
  }
  if (zLabel) {
    zLabel.lookAt(new THREE.Vector3(0, 0, 0));
    axesGroup.add(zLabel);
  }

  return axesGroup;
}

// Updated function to create 2D projections with better positioning
function createProjections(
  data: SurfaceData,
  coordSystem: Cartesian3DCoordinateSystem,
  colorScale: Scale,
  width: number,
  height: number,
  depth: number
): THREE.Object3D {
  const projectionsGroup = new THREE.Group();

  // Get scales from coordinate system
  const xScale = coordSystem.getXScale();
  const yScale = coordSystem.getYScale();
  const zScale = coordSystem.getZScale();

  // Get domains
  const xDomain = xScale.domain;
  const yDomain = yScale.domain;
  const zDomain = zScale.domain;

  // Calculate the full range in space coordinates
  const xMin = xScale.scale(xDomain[0]);
  const xMax = xScale.scale(xDomain[1]);
  const yMin = yScale.scale(yDomain[0]);
  const yMax = yScale.scale(yDomain[1]);
  const zMin = zScale.scale(zDomain[0]);
  const zMax = zScale.scale(zDomain[1]);

  // Create projection planes
  const createProjectionPlane = (
    planeType: 'xy' | 'xz' | 'yz',
    position: THREE.Vector3,
    dimensions: { width: number, height: number }
  ) => {
    // Create a plane geometry with the exact dimensions needed
    let planeGeometry: THREE.PlaneGeometry;

    if (planeType === 'xy') {
      // XY plane at z=0
      planeGeometry = new THREE.PlaneGeometry(
        dimensions.width,
        dimensions.height,
        data.values[0].length - 1,
        data.values.length - 1
      );
      planeGeometry.rotateX(Math.PI / 2);
    } else if (planeType === 'xz') {
      // XZ plane at y=0
      planeGeometry = new THREE.PlaneGeometry(
        dimensions.width,
        dimensions.height,
        data.values[0].length - 1,
        data.values.length - 1
      );
    } else { // yz
      // YZ plane at x=0
      planeGeometry = new THREE.PlaneGeometry(
        dimensions.width,
        dimensions.height,
        data.values.length - 1,
        data.values[0].length - 1
      );
      planeGeometry.rotateY(Math.PI / 2);
    }

    // Position the plane at the center of its area
    planeGeometry.translate(position.x, position.y, position.z);

    // Create vertex colors for the projection
    const colors: number[] = [];
    const rows = data.values.length;
    const cols = data.values[0].length;

    // Calculate colors based on the projection type
    if (planeType === 'xy') {
      // Project onto XY plane (bottom)
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const zCoord = data.values[y][x];
          const colorValue = colorScale.scale(zCoord) as string;
          const color = new THREE.Color(colorValue);
          colors.push(color.r, color.g, color.b);
        }
      }
    } else if (planeType === 'xz') {
      // Project onto XZ plane (back)
      for (let z = 0; z < rows; z++) {
        for (let x = 0; x < cols; x++) {
          const yCoord = data.values[z][x];
          const colorValue = colorScale.scale(yCoord) as string;
          const color = new THREE.Color(colorValue);
          colors.push(color.r, color.g, color.b);
        }
      }
    } else { // yz
      // Project onto YZ plane (left)
      for (let z = 0; z < rows; z++) {
        for (let y = 0; y < cols; y++) {
          const xCoord = data.values[z][y];
          const colorValue = colorScale.scale(xCoord) as string;
          const color = new THREE.Color(colorValue);
          colors.push(color.r, color.g, color.b);
        }
      }
    }

    // Set colors attribute
    planeGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    // Create material with vertex colors
    const material = new THREE.MeshBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: projectionsOpacity,
      side: THREE.DoubleSide
    });

    // Create and return the mesh
    return new THREE.Mesh(planeGeometry, material);
  };

  // Create projections for each plane
  // XY plane (bottom) - at z=0
  const xyProjection = createProjectionPlane(
    'xy',
    new THREE.Vector3((xMax + xMin) / 2, (yMax + yMin) / 2, 0),
    { width: xMax - xMin, height: yMax - yMin }
  );
  projectionsGroup.add(xyProjection);

  // XZ plane (back) - at y=0
  const xzProjection = createProjectionPlane(
    'xz',
    new THREE.Vector3((xMax + xMin) / 2, 0, (zMax + zMin) / 2),
    { width: xMax - xMin, height: zMax - zMin }
  );
  projectionsGroup.add(xzProjection);

  // YZ plane (left) - at x=0
  const yzProjection = createProjectionPlane(
    'yz',
    new THREE.Vector3(0, (yMax + yMin) / 2, (zMax + zMin) / 2),
    { width: zMax - zMin, height: yMax - yMin }
  );
  projectionsGroup.add(yzProjection);

  return projectionsGroup;
}

// Interface for surface data
export interface SurfaceData {
  // 2D array of z values
  values: number[][];
  // x and y coordinates (optional, will use indices if not provided)
  xCoordinates?: number[];
  yCoordinates?: number[];
}

// Define the surfaceGraph component
export const surfaceGraphDefinition = {
  type: "define",
  name: "surfaceGraph",
  properties: {
    // Container dimensions
    width: { required: true },
    height: { required: true },

    // Data for the surface
    data: { required: true },

    // Coordinate system options
    xScale: { default: 'linear' },
    yScale: { default: 'linear' },
    zScale: { default: 'linear' },
    xDomain: { default: null },
    yDomain: { default: null },
    zDomain: { default: null },

    // Visual options
    colorScale: { default: 'linear' },
    colorDomain: { default: null },
    colorRange: { default: ['#0000FF', '#FF0000'] },
    wireframe: { default: true },
    wireframeColor: { default: '#000000' },
    surfaceOpacity: { default: 0.8 },

    // Projection options
    projection: { default: { type: 'perspective', distance: 1000 } },

    // Camera options
    cameraPosition: { default: null },

    // Interaction options
    enableRotation: { default: true },
    enableZoom: { default: true },
    enablePan: { default: true },

    // New properties for axes and grid
    showAxes: { default: true },
    showGrid: { default: true },
    showProjections: { default: false },
    projectionsOpacity: { default: 0.6 }
  },
  validate: function (props: any) {
    if (props.width <= 0 || props.height <= 0) {
      throw new Error('Width and height must be positive');
    }

    if (!props.data || !Array.isArray(props.data.values)) {
      throw new Error('Data must contain a values array');
    }

    if (!Array.isArray(props.data.values) || !props.data.values.every((row: any) => Array.isArray(row))) {
      throw new Error('Data values must be a 2D array');
    }
  },
  implementation: function(props: any) {
    const {
      width, height, data, xScale, yScale, zScale,
      xDomain, yDomain, zDomain, colorScale, colorDomain, colorRange,
      wireframe, wireframeColor, surfaceOpacity, projection,
      cameraPosition, enableRotation, enableZoom, enablePan,
      showAxes, showGrid, showProjections, projectionsOpacity
    } = props;

    // Create coordinate system
    const coordSystem = createCoordinateSystem({
      width, height, data, xScale, yScale, zScale, xDomain, yDomain, zDomain, projection
    });

    // Create color scale
    const colorScaleObj = createSurfaceColorScale({
      data, colorScale, colorDomain, colorRange
    });

    // Create a renderable visualization that will use Three.js
    return createRenderableVisualizationEnhanced(
      'surfaceGraph',
      props,
      {
        renderToSvg: (container: SVGElement): SVGElement => {
          // Create a placeholder with a message
          const foreignObject = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
          foreignObject.setAttribute('width', width.toString());
          foreignObject.setAttribute('height', height.toString());

          const div = document.createElement('div');
          div.style.width = '100%';
          div.style.height = '100%';
          div.style.display = 'flex';
          div.style.alignItems = 'center';
          div.style.justifyContent = 'center';
          div.style.backgroundColor = '#f0f0f0';
          div.textContent = 'Surface Graph requires Three.js rendering';

          foreignObject.appendChild(div);
          container.appendChild(foreignObject);

          return container;
        },
        renderToCanvas: (ctx: CanvasRenderingContext2D): boolean => {
          // Display a message in the canvas
          ctx.fillStyle = '#f0f0f0';
          ctx.fillRect(0, 0, width, height);
          ctx.fillStyle = '#333333';
          ctx.font = '14px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('Surface Graph requires Three.js rendering', width / 2, height / 2);

          return true;
        },
        renderToThreeJS: (container: HTMLElement): ThreeJsRenderer => {
  // Create Three.js renderer
  const renderer = new ThreeJsRenderer({
    width,
    height,
    backgroundColor: 0xf0f0f0,
    cameraOptions: {
      type: projection.type === 'orthographic' ? 'orthographic' : 'perspective',
      position: cameraPosition || { x: width, y: height, z: width }
    },
    controlsOptions: {
      enableRotate: enableRotation,
      enableZoom: enableZoom,
      enablePan: enablePan,
      dampingFactor: 0.25
    }
  });

  // Get the depth from the coordinate system
  const dimensions = coordSystem.getDimensions();
  const depth = dimensions.depth || Math.min(width, height);

  // Create surface geometry
  const scene = renderer.getScene();
  const surfaceMesh = createSurfaceMesh(data, coordSystem, colorScaleObj, surfaceOpacity);
  scene.add(surfaceMesh);

  // Add wireframe if enabled
  if (wireframe) {
    const wireframeMesh = createWireframeMesh(surfaceMesh.geometry, wireframeColor);
    scene.add(wireframeMesh);
  }

  // Add axes if enabled
  if (showAxes) {
    const axesGroup = createAxes(width, height, depth, coordSystem, showGrid);
    scene.add(axesGroup);
  }

  // Add projections if enabled
  if (showProjections) {
    const projections = createProjections(
      data,
      coordSystem,
      colorScaleObj,
      width,
      height,
      depth
    );
    scene.add(projections);
  }

  // Attach renderer to container
  renderer.attach(container);

  return renderer;
}

      },
      {
        coordinateSystem: coordSystem,
        colorScale: colorScaleObj
      }
    );
  }
};

// Helper function to create coordinate system
function createCoordinateSystem({
  width, height, data, xScale, yScale, zScale, xDomain, yDomain, zDomain, projection
}: any): Cartesian3DCoordinateSystem {
  // Calculate domains if not provided
  const rows = data.values.length;
  const cols = data.values[0].length;

  // Calculate x domain
  const xDomainValue = xDomain || (data.xCoordinates
    ? [Math.min(...data.xCoordinates), Math.max(...data.xCoordinates)]
    : [0, cols - 1]);

  // Calculate y domain
  const yDomainValue = yDomain || (data.yCoordinates
    ? [Math.min(...data.yCoordinates), Math.max(...data.yCoordinates)]
    : [0, rows - 1]);

  // Calculate z domain
  const allZValues = data.values.flat();
  const zDomainValue = zDomain || [Math.min(...allZValues), Math.max(...allZValues)];

  // Create coordinate system
  return createCartesian3DCoordinateSystem({
    width,
    height,
    depth: Math.min(width, height),
    xScale,
    yScale,
    zScale,
    xDomain: xDomainValue,
    yDomain: yDomainValue,
    zDomain: zDomainValue,
    projection
  });
}

// Helper function to create color scale
function createSurfaceColorScale({ data, colorScale, colorDomain, colorRange }: any): Scale {
  // Calculate color domain if not provided
  const allZValues = data.values.flat();
  const colorDomainValue = colorDomain || [Math.min(...allZValues), Math.max(...allZValues)];

  // Default color range (blue to red)
  const colorRangeValue = colorRange || ['#0000FF', '#FF0000'];

  // If colorScale is a string, create a new color scale
  if (typeof colorScale === 'string') {
    return createColorScale(
      colorDomainValue,
      colorRangeValue,
      { mappingType: colorScale, clamp: true }
    );
  }

  // If colorScale is already a Scale object, return it
  return colorScale;
}

// Helper function to create surface mesh
function createSurfaceMesh(
  data: SurfaceData,
  coordSystem: Cartesian3DCoordinateSystem,
  colorScale: Scale,
  opacity: number
): THREE.Mesh {
  const rows = data.values.length;
  const cols = data.values[0].length;

  // Create geometry
  const geometry = new THREE.BufferGeometry();
  const vertices: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];

  // Create vertices and colors
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      // Get coordinates
      const xCoord = data.xCoordinates ? data.xCoordinates[x] : x;
      const yCoord = data.yCoordinates ? data.yCoordinates[y] : y;
      const zCoord = data.values[y][x];

      // Convert to 3D space
      const point3D = coordSystem.toSpace({ x: xCoord, y: yCoord, z: zCoord });

      // Add vertex
      vertices.push(point3D.x, point3D.y, point3D.z);

      // Add color - ensure we get a valid color string
      let colorValue = colorScale.scale(zCoord);

      // Make sure we have a valid color string
      if (typeof colorValue !== 'string') {
        colorValue = '#0000FF';
        console.warn(`Invalid color value for z=${zCoord}, using default color`);
      }

      try {
        const color = new THREE.Color(colorValue);
        colors.push(color.r, color.g, color.b);
      } catch (e) {
        console.warn(`Failed to create color from ${colorValue}, using default color`);
        const defaultColor = new THREE.Color('#0000FF');
        colors.push(defaultColor.r, defaultColor.g, defaultColor.b);
      }
    }
  }

  // Create indices for triangles
  for (let y = 0; y < rows - 1; y++) {
    for (let x = 0; x < cols - 1; x++) {
      const a = y * cols + x;
      const b = y * cols + x + 1;
      const c = (y + 1) * cols + x;
      const d = (y + 1) * cols + x + 1;

      // First triangle
      indices.push(a, b, c);

      // Second triangle
      indices.push(c, b, d);
    }
  }

  // Set attributes
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  // Create surface material
  const material = new THREE.MeshPhongMaterial({
    vertexColors: true,
    side: THREE.DoubleSide,
    transparent: opacity < 1,
    opacity: opacity
  });

  // Create mesh
  return new THREE.Mesh(geometry, material);
}

// Helper function to create wireframe mesh
function createWireframeMesh(geometry: THREE.BufferGeometry, color: string): THREE.LineSegments {
  const wireframeGeometry = new THREE.WireframeGeometry(geometry);
  const wireframeMaterial = new THREE.LineBasicMaterial({ color });
  return new THREE.LineSegments(wireframeGeometry, wireframeMaterial);
}

/**
 * Create a surface graph directly
 *
 * @param options Surface graph configuration options
 * @returns A renderable surface graph visualization
 */
export function createSurfaceGraph(options: {
  width: number,
  height: number,
  data: SurfaceData,
  xScale?: string,
  yScale?: string,
  zScale?: string,
  xDomain?: [number, number],
  yDomain?: [number, number],
  zDomain?: [number, number],
  colorScale?: string,
  colorDomain?: [number, number],
  colorRange?: string[],
  wireframe?: boolean,
  wireframeColor?: string,
  surfaceOpacity?: number,
  projection?: {
    type: 'orthographic' | 'perspective' | 'isometric',
    distance?: number
  },
  cameraPosition?: { x: number, y: number, z: number },
  enableRotation?: boolean,
  enableZoom?: boolean,
  enablePan?: boolean
}) {
  return buildViz({
    type: 'surfaceGraph',
    ...options
  });
}

// Make sure the component is registered when the file is imported
export function registerSurfaceGraph() {
  buildViz(surfaceGraphDefinition);
  console.log('Surface graph component registered');
}

// Auto-register when imported
registerSurfaceGraph();

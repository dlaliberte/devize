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

// Make sure define type is registered
registerDefineType();

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
    enablePan: { default: true }
  },
  implementation: function(props: any) {
    const {
      width, height, data, xScale, yScale, zScale,
      xDomain, yDomain, zDomain, colorScale, colorDomain, colorRange,
      wireframe, wireframeColor, surfaceOpacity, projection,
      cameraPosition, enableRotation, enableZoom, enablePan
    } = props;

    // Create coordinate system
    const coordSystem = createCoordinateSystem({
      width, height, data, xScale, yScale, zScale, xDomain, yDomain, zDomain, projection
    });

    // Create color scale
    const colorScaleObj = createColorScale({
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

          // Create surface geometry
          const scene = renderer.getScene();
          const surfaceMesh = createSurfaceMesh(data, coordSystem, colorScaleObj, surfaceOpacity);
          scene.add(surfaceMesh);

          // Add wireframe if enabled
          if (wireframe) {
            const wireframeMesh = createWireframeMesh(surfaceMesh.geometry, wireframeColor);
            scene.add(wireframeMesh);
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
function createColorScale({ data, colorScale, colorDomain, colorRange }: any): Scale {
  // Calculate color domain if not provided
  const allZValues = data.values.flat();
  const colorDomainValue = colorDomain || [Math.min(...allZValues), Math.max(...allZValues)];

  // Create color scale
  return createScale(colorScale, {
    domain: colorDomainValue,
    range: colorRange
  });
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

      // Add color
      const color = new THREE.Color(colorScale.scale(zCoord) as string);
      colors.push(color.r, color.g, color.b);
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

// Register the surfaceGraph component
buildViz(surfaceGraphDefinition);

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

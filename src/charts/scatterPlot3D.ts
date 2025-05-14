/**
 * 3D Scatter Plot Component
 *
 * Purpose: Provides a three-dimensional scatter plot visualization
 * Author: Devize Team
 * Creation Date: 2023-12-22
 *
 * ## References
 * - **Documentation**: /src/charts/docs/scatter_plot_3d.md
 * - **Design**: /src/charts/designs/scatter_plot_3d.md
 * - **Tests**: /src/charts/tests/scatterPlot3D.test.ts
 * - **Related Code**: /src/charts/surfaceGraph.ts
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { buildViz } from '../core/builder';
import { registerDefineType } from '../core/define';
import { createScale } from '../components/scales/scale';
import { createRenderableVisualizationEnhanced } from '../core/componentUtils';
import { createCartesian3DCoordinateSystem } from '../components/coordinates/cartesian3DCoordinateSystem';
import { ThreeJsRenderer } from '../utils/threeJsRenderer';
import { createColorScale } from '../components/scales/colorScale';

// Make sure define type is registered
registerDefineType();

// Import required components
import '../primitives/circle';
import '../primitives/text';
import '../primitives/group';
import '../components/scales/linearScale';
import '../components/scales/bandScale';

// Define the scatterPlot3D component
export const scatterPlot3DDefinition = {
    type: "define",
    name: "scatterPlot3D",
    properties: {
        data: { required: true },
        x: { required: true },
        y: { required: true },
        z: { required: true },
        color: { default: '#3366CC' },
        size: { default: { value: 5 } }, // Can be a fixed value or a field mapping
        margin: { default: { top: 40, right: 30, bottom: 60, left: 60 } },
        tooltip: { default: false },
        title: { default: '' },
        showAxes: { default: true },
        showGrid: { default: false },
        width: { default: 800 },
        height: { default: 500 },
        depth: { default: 500 },
        pointStyle: { default: null },
        legend: {
            default: {
                enabled: true,
                position: 'top-right',
                orientation: 'vertical'
            }
        },
        series: {
            default: null,
            // Can be a field name to group by, or an array of series definitions
        },
        colorScheme: {
            default: ['#3366CC', '#DC3912', '#FF9900', '#109618', '#990099', '#0099C6', '#DD4477', '#66AA00', '#B82E2E', '#316395']
        },
        shape: {
            default: 'sphere',
            // Can be a fixed shape or a field mapping
            // Supported shapes: 'sphere', 'cube', 'cone', 'cylinder', 'tetrahedron'
        },
        projection: {
            default: {
                type: 'perspective',
                distance: 2000,
                fov: 45
            }
        },
        cameraPosition: {
            default: { x: 1000, y: 1000, z: 1000 }
        },
        cameraTarget: {
            default: { x: 0, y: 0, z: 0 }
        },
        animation: {
            default: {
                enabled: true,
                autoRotate: false,
                rotateSpeed: 1.0
            }
        }
    },
    validate: function (props: any) {
        // Validate data is an array
        if (!Array.isArray(props.data)) {
            throw new Error('Data must be an array');
        }

        // Check if we're using series array
        const usingSeries = Array.isArray(props.series);

        // Validate x, y, and z fields
        if (!usingSeries) {
            if (!props.x || !props.x.field) {
                throw new Error('X field must be specified');
            }
            if (!props.y || !props.y.field) {
                throw new Error('Y field must be specified');
            }
            if (!props.z || !props.z.field) {
                throw new Error('Z field must be specified');
            }
        } else {
            // When using series array, each series should have x, y, and z fields
            props.series.forEach((series, index) => {
                if (!series.x || !series.x.field) {
                    throw new Error(`X field must be specified for series at index ${index}`);
                }
                if (!series.y || !series.y.field) {
                    throw new Error(`Y field must be specified for series at index ${index}`);
                }
                if (!series.z || !series.z.field) {
                    throw new Error(`Z field must be specified for series at index ${index}`);
                }
            });
        }

        // Validate dimensions
        if (props.width <= 0 || props.height <= 0 || props.depth <= 0) {
            throw new Error('Width, height, and depth must be positive');
        }
    },
    implementation: function (props: any) {
        // Extract properties from props
        const {
            data, x, y, z, color, size, margin, tooltip, title,
            showAxes, showGrid, width, height, depth,
            pointStyle, projection, cameraPosition, cameraTarget, animation,
            series, colorScheme, shape
        } = props;

        // Calculate dimensions
        const dimensions = {
            chartWidth: width - margin.left - margin.right,
            chartHeight: height - margin.top - margin.bottom,
            chartDepth: depth
        };

        // Process data based on whether we're using series
        let processedData = [];
        let colorScale;

        if (Array.isArray(series)) {
            // Multiple series defined explicitly
            processedData = series.map((seriesConfig, index) => {
                return {
                    data: data,
                    x: seriesConfig.x,
                    y: seriesConfig.y,
                    z: seriesConfig.z,
                    color: seriesConfig.color || colorScheme[index % colorScheme.length],
                    size: seriesConfig.size || size,
                    shape: seriesConfig.shape || shape,
                    name: seriesConfig.name || `Series ${index + 1}`
                };
            });
        } else if (typeof series === 'string' || (series && series.field)) {
            // Series defined by a field name (grouping)
            const seriesField = typeof series === 'string' ? series : series.field;
            const uniqueSeriesValues = [...new Set(data.map(d => d[seriesField]))];

            // Create color scale for the series
            colorScale = createColorScale(
                uniqueSeriesValues,
                colorScheme,
                { mappingType: 'categorical' }
            );

            processedData = uniqueSeriesValues.map((seriesValue, index) => {
                const seriesData = data.filter(d => d[seriesField] === seriesValue);
                return {
                    data: seriesData,
                    x: x,
                    y: y,
                    z: z,
                    color: colorScale.scale(seriesValue),
                    size: size,
                    shape: shape,
                    name: seriesValue.toString()
                };
            });
        } else {
            // Single series
            processedData = [{
                data: data,
                x: x,
                y: y,
                z: z,
                color: color,
                size: size,
                shape: shape,
                name: 'Data'
            }];
        }

        // Create coordinate system
        const coordSystem = createCartesian3DCoordinateSystem({
            width: dimensions.chartWidth,
            height: dimensions.chartHeight,
            depth: dimensions.chartDepth,
            xScale: 'linear',
            yScale: 'linear',
            zScale: 'linear',
            xDomain: [
                Math.min(...data.map(d => d[x.field])),
                Math.max(...data.map(d => d[x.field]))
            ],
            yDomain: [
                Math.min(...data.map(d => d[y.field])),
                Math.max(...data.map(d => d[y.field]))
            ],
            zDomain: [
                Math.min(...data.map(d => d[z.field])),
                Math.max(...data.map(d => d[z.field]))
            ],
            projection: projection
        });

        // Create a renderable visualization that will use Three.js
        return createRenderableVisualizationEnhanced(
            'scatterPlot3D',
            props,
            {
                // SVG rendering function - not used for Three.js visualizations
                renderToSVG: (container: SVGElement): SVGElement => {
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
                    div.textContent = '3D Scatter Plot requires Three.js rendering';

                    foreignObject.appendChild(div);
                    container.appendChild(foreignObject);

                    return container;
                },
                renderToCanvas:
      // Canvas rendering function - not used for Three.js visualizations
        (ctx: CanvasRenderingContext2D): boolean => {
            // Display a message in the canvas
            ctx.fillStyle = '#f0f0f0';
            ctx.fillRect(0, 0, width, height);
            ctx.fillStyle = '#333333';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('3D Scatter Plot requires Three.js rendering', width / 2, height / 2);

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
                        position: cameraPosition || { x: dimensions.chartWidth, y: dimensions.chartHeight, z: dimensions.chartDepth }
                    },
                    controlsOptions: {
                        enableRotate: animation.enabled,
                        enableZoom: true,
                        enablePan: true,
                        autoRotate: animation.autoRotate,
                        autoRotateSpeed: animation.rotateSpeed,
                        dampingFactor: 0.25
                    }
                });

                // Get the scene
                const scene = renderer.getScene();

                // Add axes if enabled
                if (showAxes) {
                    const axesHelper = createAxesHelper(dimensions.chartWidth, dimensions.chartHeight, dimensions.chartDepth);
                    scene.add(axesHelper);
                }

                // Add grid if enabled
                if (showGrid) {
                    const gridHelper = createGridHelper(dimensions.chartWidth, dimensions.chartHeight, dimensions.chartDepth);
                    scene.add(gridHelper);
                }

                // Create points for each series
                processedData.forEach(series => {
                    const points = createPoints(series, coordSystem);
                    scene.add(points);
                });

                // Add title if specified
                if (title) {
                    const titleElement = createTitle(title, width);
                    container.appendChild(titleElement);
                }

                // Add legend if enabled
                if (props.legend && props.legend.enabled && processedData.length > 1) {
                    const legendElement = createLegend(processedData, props.legend);
                    container.appendChild(legendElement);
                }

                // Attach renderer to container
                renderer.attach(container);

                return renderer;
                }
            },
            {
                coordinateSystem: coordSystem
            }
        );
  }
};

// Helper function to create axes helper
function createAxesHelper(width: number, height: number, depth: number): THREE.Object3D {
  const axesGroup = new THREE.Group();

  // Create axes lines
  const axesHelper = new THREE.AxesHelper(Math.max(width, height, depth));
  axesGroup.add(axesHelper);

  // Create labels for axes
  const createLabel = (text: string, position: THREE.Vector3, color: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = color;
      ctx.font = '48px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, canvas.width / 2, canvas.height / 2);

      const texture = new THREE.CanvasTexture(canvas);
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide
      });
      const geometry = new THREE.PlaneGeometry(10, 5);
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.copy(position);
      return mesh;
    }
    return null;
  };

  // Add X, Y, Z labels
  const xLabel = createLabel('X', new THREE.Vector3(width + 10, 0, 0), '#ff0000');
  const yLabel = createLabel('Y', new THREE.Vector3(0, height + 10, 0), '#00ff00');
  const zLabel = createLabel('Z', new THREE.Vector3(0, 0, depth + 10), '#0000ff');

  if (xLabel) axesGroup.add(xLabel);
  if (yLabel) axesGroup.add(yLabel);
  if (zLabel) axesGroup.add(zLabel);

  return axesGroup;
}

// Helper function to create grid helper
function createGridHelper(width: number, height: number, depth: number): THREE.Object3D {
  const gridGroup = new THREE.Group();

  // XY plane (bottom)
  const xyGrid = new THREE.GridHelper(width, 10);
  xyGrid.rotation.x = Math.PI / 2;
  xyGrid.position.z = 0;
  gridGroup.add(xyGrid);

  // XZ plane (back)
  const xzGrid = new THREE.GridHelper(width, 10);
  xzGrid.position.y = 0;
  gridGroup.add(xzGrid);

  // YZ plane (left)
  const yzGrid = new THREE.GridHelper(height, 10);
  yzGrid.rotation.z = Math.PI / 2;
  yzGrid.position.x = 0;
  gridGroup.add(yzGrid);

  return gridGroup;
}

// Helper function to create points
function createPoints(series: any, coordSystem: any): THREE.Object3D {
  const pointsGroup = new THREE.Group();
  const { data, x, y, z, color, size, shape, name } = series;

  // Determine size function
  const getSize = typeof size === 'object' && size.field
    ? (d: any) => d[size.field] * (size.scale || 1)
    : (d: any) => (typeof size === 'object' ? size.value : size);

  // Create points
  data.forEach((d: any) => {
    // Get coordinates
    const point = coordSystem.toSpace({
      x: d[x.field],
      y: d[y.field],
      z: d[z.field]
    });

    // Determine point size
    const pointSize = getSize(d);

    // Create geometry based on shape
    let geometry;
    switch (shape) {
      case 'cube':
        geometry = new THREE.BoxGeometry(pointSize, pointSize, pointSize);
        break;
      case 'cone':
        geometry = new THREE.ConeGeometry(pointSize / 2, pointSize, 16);
        break;
      case 'cylinder':
        geometry = new THREE.CylinderGeometry(pointSize / 2, pointSize / 2, pointSize, 16);
        break;
      case 'tetrahedron':
        geometry = new THREE.TetrahedronGeometry(pointSize / 2);
        break;
      case 'sphere':
      default:
        geometry = new THREE.SphereGeometry(pointSize / 2, 16, 16);
        break;
    }

    // Create material
    const material = new THREE.MeshPhongMaterial({
      color: new THREE.Color(color),
      shininess: 30,
      transparent: true,
      opacity: 0.8
    });

    // Create mesh
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(point.x, point.y, point.z);

    // Add to group
    pointsGroup.add(mesh);
  });

  // Add lighting for better 3D appearance
  const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
  pointsGroup.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(1, 1, 1).normalize();
  pointsGroup.add(directionalLight);

  return pointsGroup;
}

// Helper function to create title
function createTitle(title: string, width: number): HTMLElement {
  const titleElement = document.createElement('div');
  titleElement.style.position = 'absolute';
  titleElement.style.top = '10px';
  titleElement.style.left = '0';
  titleElement.style.width = '100%';
  titleElement.style.textAlign = 'center';
  titleElement.style.fontSize = '16px';
  titleElement.style.fontWeight = 'bold';
  titleElement.style.color = '#333';
  titleElement.textContent = title;

  return titleElement;
}

// Helper function to create legend
function createLegend(processedData: any[], legendOptions: any): HTMLElement {
  const legendElement = document.createElement('div');
  legendElement.style.position = 'absolute';

  // Set position based on options
  switch (legendOptions.position) {
    case 'top-left':
      legendElement.style.top = '10px';
      legendElement.style.left = '10px';
      break;
    case 'top-right':
      legendElement.style.top = '10px';
      legendElement.style.right = '10px';
      break;
    case 'bottom-left':
      legendElement.style.bottom = '10px';
      legendElement.style.left = '10px';
      break;
    case 'bottom-right':
      legendElement.style.bottom = '10px';
      legendElement.style.right = '10px';
      break;
    default:
      legendElement.style.top = '10px';
      legendElement.style.right = '10px';
  }

  legendElement.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
  legendElement.style.padding = '10px';
  legendElement.style.borderRadius = '5px';
  legendElement.style.boxShadow = '0 0 5px rgba(0, 0, 0, 0.2)';

  // Create legend items
  const isVertical = legendOptions.orientation !== 'horizontal';
  legendElement.style.display = 'flex';
  legendElement.style.flexDirection = isVertical ? 'column' : 'row';
  legendElement.style.gap = '8px';

  processedData.forEach(series => {
    const itemElement = document.createElement('div');
    itemElement.style.display = 'flex';
    itemElement.style.alignItems = 'center';
    itemElement.style.gap = '5px';

    const colorBox = document.createElement('div');
    colorBox.style.width = '12px';
    colorBox.style.height = '12px';
    colorBox.style.backgroundColor = series.color;
    colorBox.style.borderRadius = '2px';

    const nameElement = document.createElement('span');
    nameElement.textContent = series.name;
    nameElement.style.fontSize = '12px';

    itemElement.appendChild(colorBox);
    itemElement.appendChild(nameElement);
    legendElement.appendChild(itemElement);
  });

  return legendElement;
}

// Register the scatterPlot3D component
buildViz(scatterPlot3DDefinition);

// Export the component
export default scatterPlot3DDefinition;

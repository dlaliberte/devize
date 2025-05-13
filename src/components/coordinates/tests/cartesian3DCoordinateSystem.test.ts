/**
 * Tests for 3D Cartesian Coordinate System
 *
 * Test cases:
 *
 * 1. Constructor Tests
 *    - Create with minimal options
 *    - Create with full options
 *    - Verify default values are applied correctly
 *
 * 2. Scale Tests
 *    - Test string scale creation
 *    - Test scale objects passed directly
 *    - Test domain and range settings
 *
 * 3. Coordinate Conversion Tests
 *    - Data to space conversion
 *    - Space to data conversion
 *    - Round-trip conversions (data → space → data)
 *
 * 4. Projection Tests
 *    - Orthographic projection
 *    - Perspective projection
 *    - Isometric projection
 *    - Custom projection settings
 *
 * 5. Container Coordinate Tests
 *    - Data to container coordinates
 *    - Container to data coordinates
 *    - Round-trip conversions (data → container → data)
 *
 * 6. Origin Tests
 *    - Default origin behavior
 *    - Custom origin settings
 *    - Origin modification
 *
 * 7. Utility Method Tests
 *    - getDimensions()
 *    - getOrigin() / setOrigin()
 *    - getDimensionality()
 *    - getScales()
 *    - getXScale() / getYScale() / getZScale()
 *    - getProjection() / setProjection()
 */

import { expect } from 'chai';
import { Cartesian3DCoordinateSystem, createCartesian3DCoordinateSystem, Point3D, Point2D } from '../cartesian3DCoordinateSystem';
import { LinearScale } from '../../scales/linearScale';

describe('Cartesian3DCoordinateSystem', () => {
   // Test constructor
   describe('constructor', () => {
      it('should create with minimal options', () => {
         const coords = new Cartesian3DCoordinateSystem({
            width: 100,
            height: 100,
            depth: 100,
            xScale: 'linear',
            yScale: 'linear',
            zScale: 'linear'
         });

         expect(coords).to.be.an.instanceOf(Cartesian3DCoordinateSystem);
         expect(coords.getDimensionality()).to.equal(3);

         const dimensions = coords.getDimensions();
         expect(dimensions.width).to.equal(100);
         expect(dimensions.height).to.equal(100);
         expect(dimensions.depth).to.equal(100);
      });

      it('should create with full options', () => {
         const xScale = new LinearScale({ domain: [0, 10], range: [0, 100] });
         const yScale = new LinearScale({ domain: [0, 20], range: [0, 200] });
         const zScale = new LinearScale({ domain: [0, 30], range: [0, 300] });

         const coords = new Cartesian3DCoordinateSystem({
            width: 100,
            height: 200,
            depth: 300,
            xScale: xScale,
            yScale: yScale,
            zScale: zScale,
            xDomain: [0, 10],
            yDomain: [0, 20],
            zDomain: [0, 30],
            origin: { x: 10, y: 20, z: 30 },
            flipY: false,
            projection: {
               type: 'perspective',
               distance: 500,
               viewPoint: { x: 1, y: 1, z: 1 }
            }
         });

         expect(coords).to.be.an.instanceOf(Cartesian3DCoordinateSystem);

         const dimensions = coords.getDimensions();
         expect(dimensions.width).to.equal(100);
         expect(dimensions.height).to.equal(200);
         expect(dimensions.depth).to.equal(300);

         const origin = coords.getOrigin();
         expect(origin.x).to.equal(10);
         expect(origin.y).to.equal(20);
         expect(origin.z).to.equal(30);

         const projection = coords.getProjection();
         expect(projection.type).to.equal('perspective');
         expect(projection.distance).to.equal(500);
      });

      it('should apply default values correctly', () => {
         const coords = new Cartesian3DCoordinateSystem({
            width: 100,
            height: 100,
            depth: 100,
            xScale: 'linear',
            yScale: 'linear',
            zScale: 'linear'
         });

         const origin = coords.getOrigin();
         expect(origin.x).to.equal(0);
         expect(origin.y).to.equal(0);
         expect(origin.z).to.equal(0);

         const projection = coords.getProjection();
         expect(projection.type).to.equal('orthographic');

         // Test flipY default (should be true)
         const scales = coords.getScales();
         const yScale = scales.y;
         // Check if y scale is flipped (range[0] > range[1])
         expect(yScale.scale(0)).to.be.greaterThan(yScale.scale(1));
      });
   });

   // Test scale creation and usage
   describe('scales', () => {
      it('should create scales from strings', () => {
         const coords = new Cartesian3DCoordinateSystem({
            width: 100,
            height: 100,
            depth: 100,
            xScale: 'linear',
            yScale: 'linear',
            zScale: 'linear',
            xDomain: [0, 10],
            yDomain: [0, 20],
            zDomain: [0, 30]
         });

         const scales = coords.getScales();
         expect(scales.x).to.exist;
         expect(scales.y).to.exist;
         expect(scales.z).to.exist;

         // Test scale domains
         expect(scales.x.scale(0)).to.equal(0);
         expect(scales.x.scale(10)).to.equal(100);
         expect(scales.y.scale(0)).to.equal(100); // Flipped by default
         expect(scales.y.scale(20)).to.equal(0);
         expect(scales.z.scale(0)).to.equal(0);
         expect(scales.z.scale(30)).to.equal(100);
      });

      it('should use scale objects passed directly', () => {
         const xScale = new LinearScale({ domain: [0, 10], range: [0, 100] });
         const yScale = new LinearScale({ domain: [0, 20], range: [200, 0] });
         const zScale = new LinearScale({ domain: [0, 30], range: [0, 300] });

         const coords = new Cartesian3DCoordinateSystem({
            width: 100,
            height: 200,
            depth: 300,
            xScale: xScale,
            yScale: yScale,
            zScale: zScale
         });

         expect(coords.getXScale()).to.equal(xScale);
         expect(coords.getYScale()).to.equal(yScale);
         expect(coords.getZScale()).to.equal(zScale);
      });
   });

   // Test coordinate conversions
   describe('coordinate conversions', () => {
      let coords: Cartesian3DCoordinateSystem;

      beforeEach(() => {
         coords = new Cartesian3DCoordinateSystem({
            width: 100,
            height: 100,
            depth: 100,
            xScale: 'linear',
            yScale: 'linear',
            zScale: 'linear',
            xDomain: [0, 10],
            yDomain: [0, 10],
            zDomain: [0, 10]
         });
      });

      it('should convert data to space coordinates', () => {
         const dataPoint = { x: 5, y: 5, z: 5 };
         const spacePoint = coords.toSpace(dataPoint);

         expect(spacePoint.x).to.equal(50);
         expect(spacePoint.y).to.equal(50);
         expect(spacePoint.z).to.equal(50);
      });

      it('should convert space to data coordinates', () => {
         const spacePoint: Point3D = { x: 50, y: 50, z: 50 };
         const dataPoint = coords.fromSpace(spacePoint);

         expect(dataPoint.x).to.equal(5);
         expect(dataPoint.y).to.equal(5);
         expect(dataPoint.z).to.equal(5);
      });

      it('should perform round-trip conversions correctly', () => {
         const originalPoint = { x: 3.5, y: 7.2, z: 9.1 };
         const spacePoint = coords.toSpace(originalPoint);
         const roundTripPoint = coords.fromSpace(spacePoint);

         expect(roundTripPoint.x).to.be.closeTo(originalPoint.x, 0.001);
         expect(roundTripPoint.y).to.be.closeTo(originalPoint.y, 0.001);
         expect(roundTripPoint.z).to.be.closeTo(originalPoint.z, 0.001);
      });
   });

   // Test projections
   describe('projections', () => {
      let coords: Cartesian3DCoordinateSystem;
      const point3D: Point3D = { x: 50, y: 50, z: 50 };

      it('should apply orthographic projection correctly', () => {
         coords = new Cartesian3DCoordinateSystem({
            width: 100,
            height: 100,
            depth: 100,
            xScale: 'linear',
            yScale: 'linear',
            zScale: 'linear',
            projection: { type: 'orthographic' }
         });

         const projected = coords.project(point3D);

         // In orthographic, x and y should be unchanged
         expect(projected.x).to.equal(50);
         expect(projected.y).to.equal(50);
      });

      it('should apply perspective projection correctly', () => {
         coords = new Cartesian3DCoordinateSystem({
            width: 100,
            height: 100,
            depth: 100,
            xScale: 'linear',
            yScale: 'linear',
            zScale: 'linear',
            projection: {
               type: 'perspective',
               distance: 100
            }
         });

         const projected = coords.project(point3D);

         // In perspective, points should be scaled based on z distance
         // With distance=100 and z=50, scale factor should be 100/(100+50) = 2/3
         expect(projected.x).to.be.closeTo(50 * (2 / 3), 0.001);
         expect(projected.y).to.be.closeTo(50 * (2 / 3), 0.001);
      });

      it('should apply isometric projection correctly', () => {
         coords = new Cartesian3DCoordinateSystem({
            width: 100,
            height: 100,
            depth: 100,
            xScale: 'linear',
            yScale: 'linear',
            zScale: 'linear',
            projection: { type: 'isometric' }
         });

         const projected = coords.project(point3D);

         // In isometric, x' = x - z, y' = y + x/2 + z/2
         expect(projected.x).to.equal(0); // 50 - 50
         expect(projected.y).to.equal(100); // 50 + 50/2 + 50/2
      });

      it('should allow changing projection settings', () => {
         coords = new Cartesian3DCoordinateSystem({
            width: 100,
            height: 100,
            depth: 100,
            xScale: 'linear',
            yScale: 'linear',
            zScale: 'linear',
            projection: { type: 'orthographic' }
         });

         // Change to perspective
         coords.setProjection({ type: 'perspective', distance: 200 });

         const projection = coords.getProjection();
         expect(projection.type).to.equal('perspective');
         expect(projection.distance).to.equal(200);

         const projected = coords.project(point3D);

         // With distance=200 and z=50, scale factor should be 200/(200+50) = 4/5
         expect(projected.x).to.be.closeTo(50 * (4 / 5), 0.001);
         expect(projected.y).to.be.closeTo(50 * (4 / 5), 0.001);
      });
   });

   // Test container coordinate conversions
   describe('container coordinate conversions', () => {
      let coords: Cartesian3DCoordinateSystem;

      beforeEach(() => {
         coords = new Cartesian3DCoordinateSystem({
            width: 100,
            height: 100,
            depth: 100,
            xScale: 'linear',
            yScale: 'linear',
            zScale: 'linear',
            xDomain: [0, 10],
            yDomain: [0, 10],
            zDomain: [0, 10],
            origin: { x: 10, y: 10, z: 0 },
            projection: { type: 'orthographic' }
         });
      });

      it('should convert data to container coordinates', () => {
         const dataPoint = { x: 5, y: 5, z: 5 };
         const containerPoint = coords.toContainerCoords(dataPoint);

         // With orthographic projection and origin at (10, 10, 0)
         expect(containerPoint.x).to.equal(60); // 50 + 10
         expect(containerPoint.y).to.equal(60); // 50 + 10
      });

      it('should convert container to data coordinates', () => {
         const containerPoint: Point2D = { x: 60, y: 60 };
         const dataPoint = coords.fromContainerCoords(containerPoint);

         expect(dataPoint.x).to.equal(5);
         expect(dataPoint.y).to.equal(5);
         // Z is estimated based on the provided value (default 0)
         expect(dataPoint.z).to.equal(0);
      });

      it('should handle container to data conversion with estimated Z', () => {
         const containerPoint: Point2D = { x: 60, y: 60 };
         const dataPoint = coords.fromContainerCoords(containerPoint, 50);

         expect(dataPoint.x).to.equal(5);
         expect(dataPoint.y).to.equal(5);
         expect(dataPoint.z).to.equal(5);
      });

   });

});

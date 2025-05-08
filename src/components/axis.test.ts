/**
       * Axis Component Tests
       *
       * Purpose: Tests the axis component
       * Author: [Author Name]
       * Creation Date: [Date]
       * Last Modified: [Date]
       */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { buildViz } from '../core/builder';
import { registerDefineType } from '../core/define';
import { createScale } from './scales/scale';
import { renderViz } from '../core/devize';

// Import primitives needed for the axis component
import '../primitives/group';
import '../primitives/line';
import '../primitives/text';

// Import scales
import './scales/linearScale';
import './scales/bandScale';

// Import the axis component
import './axis';

// Reset registry and register define type before each test
beforeEach(() => {
        registerDefineType();
});

describe('Axis Component', () => {
        test('should create a horizontal axis with provided values', () => {
          const axis = buildViz({
            type: 'axis',
            orientation: 'bottom',
            length: 500,
            values: [0, 25, 50, 75, 100]
          });

          expect(axis).toBeDefined();

          // Check that the axis has the correct type
          expect(axis.type).toBe('axis');

          // Check that it has the necessary rendering methods
          expect(typeof axis.renderToSvg).toBe('function');
          expect(typeof axis.renderToCanvas).toBe('function');

          // Check that it has the getProperty method
          expect(typeof axis.getProperty).toBe('function');

          // Check that it has the correct properties
          expect(axis.getProperty('orientation')).toBe('bottom');
          expect(axis.getProperty('length')).toBe(500);
        });

        test('should create a vertical axis with provided values', () => {
          const axis = buildViz({
            type: 'axis',
            orientation: 'left',
            length: 300,
            values: [0, 20, 40, 60, 80, 100]
          });

          expect(axis).toBeDefined();
          expect(axis.type).toBe('axis');

          // Check that it has the necessary rendering methods
          expect(typeof axis.renderToSvg).toBe('function');
          expect(typeof axis.renderToCanvas).toBe('function');

          // Check that it has the correct properties
          expect(axis.getProperty('orientation')).toBe('left');
          expect(axis.getProperty('length')).toBe(300);
        });

        // Add rendering tests
        test('should render an axis to SVG without errors', () => {
          // Create a mock SVG container
          const svgContainer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

          // Create an axis
          const axis = buildViz({
            type: 'axis',
            orientation: 'bottom',
            length: 500,
            values: [0, 25, 50, 75, 100]
          });

          // Check that renderToSvg exists and is a function
          expect(axis.renderToSvg).toBeDefined();
          expect(typeof axis.renderToSvg).toBe('function');

          // Render the axis to the SVG container
          const result = axis.renderToSvg(svgContainer);

          // Check that something was rendered
          expect(result).toBeDefined();
          expect(svgContainer.childNodes.length).toBeGreaterThan(0);

          // Check that the rendered element is a group
          const renderedElement = svgContainer.firstChild;
          expect(renderedElement.nodeName.toLowerCase()).toBe('g');

          // Check that the group contains children (axis line, ticks, etc.)
          expect(renderedElement.childNodes.length).toBeGreaterThan(0);
        });

        test('should render an axis with a scale to SVG without errors', () => {
          // Create a mock SVG container
          const svgContainer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

          // Create a scale
          const scale = createScale('linear', {
            domain: [0, 100],
            range: [0, 500]
          });

          // Create an axis with the scale
          const axis = buildViz({
            type: 'axis',
            orientation: 'bottom',
            length: 500,
            values: [0, 25, 50, 75, 100],
            scale: scale
          });

          // Render the axis to the SVG container
          const result = axis.renderToSvg(svgContainer);

          // Check that something was rendered
          expect(result).toBeDefined();
          expect(svgContainer.childNodes.length).toBeGreaterThan(0);
        });

        test('should render an axis using renderViz function', () => {
          // Create a mock container
          const container = document.createElement('div');

          // Create an axis
          const axis = buildViz({
            type: 'axis',
            orientation: 'bottom',
            length: 500,
            values: [0, 25, 50, 75, 100]
          });

          // Use renderViz to render the axis
          const result = renderViz(axis, container);

          // Check that something was rendered
          expect(result).toBeDefined();
          expect(container.childNodes.length).toBeGreaterThan(0);

          // Check that an SVG element was created
          const svgElement = container.firstChild;
          expect(svgElement.nodeName).toBe('svg');

          // Check that the SVG contains a group for the axis
          expect(svgElement.childNodes.length).toBeGreaterThan(0);
          const axisGroup = svgElement.firstChild;
          expect(axisGroup.nodeName).toBe('g');
        });

        test('should not cause infinite loops when rendering', () => {
          // Create a mock container
          const container = document.createElement('div');

          // Spy on console.error to catch any errors
          const consoleErrorSpy = vi.spyOn(console, 'error');

          // Create an axis
          const axis = buildViz({
            type: 'axis',
            orientation: 'bottom',
            length: 500,
            values: [0, 25, 50, 75, 100]
          });

          // Use renderViz to render the axis
          renderViz(axis, container);

          // Check that no errors were logged
          expect(consoleErrorSpy).not.toHaveBeenCalled();

          // Restore the spy
          consoleErrorSpy.mockRestore();
        });

        test('should render nested components correctly', () => {
          // Create a mock container
          const container = document.createElement('div');

          // Create a scale
          const scale = createScale('linear', {
            domain: [0, 100],
            range: [0, 500]
          });

          // Create a group containing an axis
          const group = buildViz({
            type: 'group',
            transform: 'translate(50, 50)',
            children: [
              {
                type: 'axis',
                orientation: 'bottom',
                length: 500,
                values: [0, 25, 50, 75, 100],
                scale: scale
              }
            ]
          });

          // Use renderViz to render the group
          const result = renderViz(group, container);

          // Check that something was rendered
          expect(result).toBeDefined();
          expect(container.childNodes.length).toBeGreaterThan(0);

          // Check that an SVG element was created
          const svgElement = container.firstChild;
          expect(svgElement.nodeName).toBe('svg');

          // Check that the SVG contains a group
          expect(svgElement.childNodes.length).toBeGreaterThan(0);
          const outerGroup = svgElement.firstChild;
          expect(outerGroup.nodeName).toBe('g');

          // Check that the outer group has a transform attribute
          expect(outerGroup.getAttribute('transform')).toBe('translate(50, 50)');

          // Check that the outer group contains an inner group for the axis
          expect(outerGroup.childNodes.length).toBeGreaterThan(0);
        });
});

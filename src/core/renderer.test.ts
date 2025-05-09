import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderViz, ensureSvg } from './renderer';
import { buildViz } from './builder';
import {
  resetRegistry,
  createTestContainer,
  cleanupTestContainer,
  testRendererOutput
} from '../test/testUtils';
import { initializeTestEnvironment, ensurePrimitivesRegistered } from '../test/testSetup';

describe('Renderer', () => {
  let container: HTMLElement;

  beforeEach(() => {
    // Initialize the test environment with all primitives
    initializeTestEnvironment();

    // Create a fresh container for each test
    container = createTestContainer();
  });

  afterEach(() => {
    // Clean up after each test
    cleanupTestContainer(container);
  });

  it('should render a rectangle to a container', () => {
    // Ensure rectangle primitive is registered
    ensurePrimitivesRegistered(['rectangle']);

    // Use a simpler approach for now
    const result = renderViz({
      type: 'rectangle',
      x: 10,
      y: 20,
      width: 100,
      height: 50,
      fill: 'blue'
    }, container);

    // Check that an SVG was created
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();

    // Check that a rectangle was created
    const rect = svg?.querySelector('rect');
    expect(rect).not.toBeNull();
    expect(rect?.getAttribute('x')).toBe('10');
    expect(rect?.getAttribute('y')).toBe('20');
    expect(rect?.getAttribute('width')).toBe('100');
    expect(rect?.getAttribute('height')).toBe('50');
    expect(rect?.getAttribute('fill')).toBe('blue');

    // Check that the result has the expected properties
    expect(result.element).toBeDefined();
    expect(typeof result.update).toBe('function');
    expect(typeof result.cleanup).toBe('function');
  });

  it('should render a simple group with a rectangle', () => {
    // Ensure needed primitives are registered
    ensurePrimitivesRegistered(['group', 'rectangle']);

    // Use a simpler approach for now
    const result = renderViz({
      type: 'group',
      children: [
        {
          type: 'rectangle',
          x: 10,
          y: 10,
          width: 80,
          height: 40,
          fill: 'green'
        }
      ]
    }, container);

    // Check that an SVG was created
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();

    // Check that a group was created
    const group = svg?.querySelector('g');
    expect(group).not.toBeNull();

    // Check that the rectangle was created
    const rect = svg?.querySelector('rect');
    expect(rect).not.toBeNull();
    expect(rect?.getAttribute('x')).toBe('10');
    expect(rect?.getAttribute('y')).toBe('10');
    expect(rect?.getAttribute('width')).toBe('80');
    expect(rect?.getAttribute('height')).toBe('40');
    expect(rect?.getAttribute('fill')).toBe('green');
  });

  it('should render a group with multiple elements', () => {
    // Ensure needed primitives are registered
    ensurePrimitivesRegistered(['group', 'rectangle', 'circle', 'text']);

    // Use a simpler approach for now
    const result = renderViz({
      type: 'group',
      children: [
        {
          type: 'rectangle',
          x: 10,
          y: 10,
          width: 80,
          height: 40,
          fill: 'green'
        },
        {
          type: 'circle',
          cx: 120,
          cy: 30,
          r: 20,
          fill: 'purple'
        },
        {
          type: 'text',
          x: 50,
          y: 80,
          text: 'Hello, Devize!',  // Make sure to include the required 'text' property
          fontSize: '16px',
          fill: 'black'
        }
      ]
    }, container);

    // Check that an SVG was created
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();

    // Check that a group was created
    const group = svg?.querySelector('g');
    expect(group).not.toBeNull();

    // Check that all children were created
    const rect = svg?.querySelector('rect');
    expect(rect).not.toBeNull();
    expect(rect?.getAttribute('fill')).toBe('green');

    const circle = svg?.querySelector('circle');
    expect(circle).not.toBeNull();
    expect(circle?.getAttribute('fill')).toBe('purple');

    const text = svg?.querySelector('text');
    expect(text).not.toBeNull();
    expect(text?.textContent).toBe('Hello, Devize!');
  });

  it('should update an existing visualization', () => {
    // Ensure rectangle primitive is registered
    ensurePrimitivesRegistered(['rectangle']);

    // Create a visualization
    const viz = buildViz({
      type: 'rectangle',
      x: 10,
      y: 20,
      width: 100,
      height: 50,
      fill: 'red'
    });

    // Render it
    const result = renderViz(viz, container);

    // Verify initial state
    expect(container.innerHTML).toContain('x="10"');
    expect(container.innerHTML).toContain('y="20"');
    expect(container.innerHTML).toContain('fill="red"');

    // Update it
    result.update({
      x: 30,
      y: 40,
      fill: 'blue'
    });

    // Verify updated state
    expect(container.innerHTML).toContain('x="30"');
    expect(container.innerHTML).toContain('y="40"');
    expect(container.innerHTML).toContain('fill="blue"');
  });

  it('should ensure an SVG element exists in a container', () => {
    // Test with an empty container
    const svg = ensureSvg(container);
    expect(svg.tagName.toLowerCase()).toBe('svg');
    expect(svg.getAttribute('width')).toBe('100%');
    expect(svg.getAttribute('height')).toBe('100%');

    // Test with a container that already has an SVG
    const existingSvg = ensureSvg(container);
    expect(existingSvg).toBe(svg); // Should return the same SVG element
  });

  it('should clean up a rendered visualization', () => {
    // Ensure rectangle primitive is registered
    ensurePrimitivesRegistered(['rectangle']);

    // Render a visualization
    const result = renderViz({
      type: 'rectangle',
      x: 10,
      y: 20,
      width: 100,
      height: 50,
      fill: 'green'
    }, container);

    // Verify it was rendered
    expect(container.innerHTML).toContain('<rect');

    // Clean up
    result.cleanup();

    // Verify it was removed
    expect(container.querySelector('rect')).toBeNull();
  });
});

/**
 * Test Utilities for Devize
 *
 * Provides common utilities for testing visualization components
 */

import { registry } from '../core/registry';
import { buildViz } from '../core/builder';
import { renderViz } from '../core/renderer';
import { VisualizationSpec } from '../core/types';

import { getByTestId, queryByTestId } from '@testing-library/dom';

/**
 * Reset the registry to a clean state
 */
export function resetRegistry() {
  (registry as any).types = new Map();
}

/**
 * Create a test container and add it to the document
 */
export function createTestContainer(): HTMLElement {
  const container = document.createElement('div');
  document.body.appendChild(container);
  return container;
}

/**
 * Clean up a test container
 */
export function cleanupTestContainer(container: HTMLElement) {
  if (container && container.parentNode) {
    container.parentNode.removeChild(container);
  }
}

/**
 * Get an element from the container by selector
 */
export function getElementFromContainer(container: HTMLElement, selector: string): Element | null {
  return container.querySelector(selector);
}

/**
 * Verify attributes of an element
 */
export function verifyElementAttributes(element: Element | null, attributes: Record<string, string>) {
  expect(element).not.toBeNull();

  if (!element) return;

  for (const [attr, value] of Object.entries(attributes)) {
    expect(element.getAttribute(attr)).toBe(value);
  }
}

/**
 * Test a visualization's rendering with DOM queries
 */
export function testVisualizationRenderingDOM(
  spec: VisualizationSpec,
  container: HTMLElement,
  selector: string,
  expectedAttributes: Record<string, string>
) {
  // Build and render the visualization
  const viz = buildViz(spec);
  viz.render(container);

  // Get the element
  const element = getElementFromContainer(container, selector);

  // Verify attributes
  verifyElementAttributes(element, expectedAttributes);
}

/**
 * Test a visualization's rendering with a hybrid approach
 */
export function testVisualizationRendering(
    spec: VisualizationSpec,
    container: HTMLElement,
    expectedAttributes: Record<string, string>,
    selector: string = 'svg > *'
) {
    // Build and render the visualization
    const viz = buildViz(spec);
    viz.render(container);

    // Get the HTML for debugging
    const html = container.innerHTML;
    console.log('Container HTML after rendering:', html);

    // Try DOM-based testing first
    const element = container.querySelector(selector);

    if (element) {
        console.log('✅ DOM Testing: Found element with selector:', selector);
        // If we found the element, verify attributes directly
        for (const [attr, value] of Object.entries(expectedAttributes)) {
            const attrValue = element.getAttribute(attr);
            console.log(`Checking attribute ${attr}, expected: ${value}, actual: ${attrValue}`);
            expect(attrValue).toBe(value);
        }
    } else {
        console.warn('⚠️ DOM Testing Failed: Element not found with selector:', selector);
        console.warn('⚠️ Falling back to string matching (less reliable)');
        console.log('HTML content:', html);

        // Fall back to string-based testing
        for (const [attr, value] of Object.entries(expectedAttributes)) {
            const attrPattern = `${attr}="${value}"`;
            console.log(`Checking for attribute pattern: ${attrPattern}`);
            expect(html).toContain(attrPattern);
        }
    }
}



/**
 * Test updating a visualization
 */
export function testVisualizationUpdate(
  initialSpec: any,
  updateSpec: any,
  container: HTMLElement,
  initialAttributes: Record<string, string>,
  updatedAttributes: Record<string, string>,
  selector: string
) {
  // Render the initial visualization
  const result = renderViz(initialSpec, container);

  // Check initial attributes
  const initialElement = container.querySelector(selector);
  expect(initialElement).not.toBeNull();

  for (const [attr, value] of Object.entries(initialAttributes)) {
    expect(initialElement?.getAttribute(attr)).toBe(value);
  }

  // Update the visualization
  result.update(updateSpec);

  // Check updated attributes
  const updatedElement = container.querySelector(selector);
  expect(updatedElement).not.toBeNull();

  for (const [attr, value] of Object.entries(updatedAttributes)) {
    expect(updatedElement?.getAttribute(attr)).toBe(value);
  }
}


/**
 * Test a visualization's properties
 */
export function testVisualizationProperties(
  spec: VisualizationSpec,
  expectedProperties: Record<string, any>
) {
  // Build the visualization
  const viz = buildViz(spec);

  // Verify properties
  for (const [prop, value] of Object.entries(expectedProperties)) {
    expect(viz.getProperty(prop)).toEqual(value);
  }
}

/**
 * Create a mock canvas context for testing
 */
export function createMockCanvasContext() {
  return {
    beginPath: vi.fn(),
    rect: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    arcTo: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 0,
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    scale: vi.fn(),
    clearRect: vi.fn(),
    setLineDash: vi.fn()
  };
}

/**
 * Test canvas rendering
 */
export function testCanvasRendering(
  spec: VisualizationSpec,
  expectedOperations: {
    beginPath?: boolean;
    rect?: [number, number, number, number] | boolean;
    arc?: [number, number, number, number, number] | boolean;
    fillStyle?: string;
    strokeStyle?: string;
    lineWidth?: number;
    fill?: boolean;
    stroke?: boolean;
    setLineDash?: any[] | boolean; // Update this line to handle setLineDash
    [key: string]: any;
  }
) {
  // Create a mock canvas context
  const ctx = createMockCanvasContext();

  // Build and render the visualization
  const viz = buildViz(spec);
  viz.renderToCanvas(ctx);

  // Verify expected operations
  if (expectedOperations.beginPath !== undefined) {
    if (expectedOperations.beginPath) {
      expect(ctx.beginPath).toHaveBeenCalled();
    } else {
      expect(ctx.beginPath).not.toHaveBeenCalled();
    }
  }

  if (expectedOperations.rect !== undefined) {
    if (typeof expectedOperations.rect === 'boolean') {
      if (expectedOperations.rect) {
        expect(ctx.rect).toHaveBeenCalled();
      } else {
        expect(ctx.rect).not.toHaveBeenCalled();
      }
    } else {
      expect(ctx.rect).toHaveBeenCalledWith(...expectedOperations.rect);
    }
  }

  if (expectedOperations.arc !== undefined) {
    if (typeof expectedOperations.arc === 'boolean') {
      if (expectedOperations.arc) {
        expect(ctx.arc).toHaveBeenCalled();
      } else {
        expect(ctx.arc).not.toHaveBeenCalled();
      }
    } else {
      expect(ctx.arc).toHaveBeenCalledWith(...expectedOperations.arc);
    }
  }

  if (expectedOperations.fillStyle !== undefined) {
    expect(ctx.fillStyle).toBe(expectedOperations.fillStyle);
  }

  if (expectedOperations.strokeStyle !== undefined) {
    expect(ctx.strokeStyle).toBe(expectedOperations.strokeStyle);
  }

  if (expectedOperations.lineWidth !== undefined) {
    expect(ctx.lineWidth).toBe(expectedOperations.lineWidth);
  }

  if (expectedOperations.fill !== undefined) {
    if (expectedOperations.fill) {
      expect(ctx.fill).toHaveBeenCalled();
    } else {
      expect(ctx.fill).not.toHaveBeenCalled();
    }
  }

  if (expectedOperations.stroke !== undefined) {
    if (expectedOperations.stroke) {
      expect(ctx.stroke).toHaveBeenCalled();
    } else {
      expect(ctx.stroke).not.toHaveBeenCalled();
    }
  }

  // Add specific handling for setLineDash
  if (expectedOperations.setLineDash !== undefined) {
    if (typeof expectedOperations.setLineDash === 'boolean') {
      if (expectedOperations.setLineDash) {
        expect(ctx.setLineDash).toHaveBeenCalled();
      } else {
        expect(ctx.setLineDash).not.toHaveBeenCalled();
      }
    } else if (Array.isArray(expectedOperations.setLineDash)) {
      // If it's an array of arrays, check each call
      if (Array.isArray(expectedOperations.setLineDash[0])) {
        expectedOperations.setLineDash.forEach(dashArray => {
          expect(ctx.setLineDash).toHaveBeenCalledWith(dashArray);
        });
      } else {
        // If it's a single array, check just one call
        expect(ctx.setLineDash).toHaveBeenCalledWith(expectedOperations.setLineDash);
      }
    }
  }

  // Check any other operations
  for (const [key, value] of Object.entries(expectedOperations)) {
    if (!['beginPath', 'rect', 'arc', 'fillStyle', 'strokeStyle', 'lineWidth', 'fill', 'stroke', 'setLineDash'].includes(key)) {
      if (typeof value === 'boolean') {
        if (value) {
          expect(ctx[key]).toHaveBeenCalled();
        } else {
          expect(ctx[key]).not.toHaveBeenCalled();
        }
      } else if (Array.isArray(value)) {
        expect(ctx[key]).toHaveBeenCalledWith(...value);
      } else {
        expect(ctx[key]).toBe(value);
      }
    }
  }

  return ctx;
}


/**
 * Test a visualization's rendering with Testing Library
 */
/**
 * Test a visualization's rendering with regex matching
 */
export function testVisualizationRenderingRegex(
  spec: VisualizationSpec,
  container: HTMLElement,
  expectedAttributes: Record<string, string>
) {
  // Build and render the visualization
  const viz = buildViz(spec);
  viz.render(container);

  // Get the HTML
  const html = container.innerHTML;

  // Verify attributes with regex
  for (const [attr, value] of Object.entries(expectedAttributes)) {
    const regex = new RegExp(`${attr}="(${value})"`, 'i');
    expect(html).toMatch(regex);
  }
}

/**
 * Test a visualization's rendering with a hybrid approach
 */
export function testVisualizationRenderingHybrid(
  spec: VisualizationSpec,
  container: HTMLElement,
  selector: string,
  expectedAttributes: Record<string, string>
) {
  // Build and render the visualization
  const viz = buildViz(spec);
  viz.render(container);

  // Try DOM-based testing first
  const element = container.querySelector(selector);

  if (element) {
    // If we found the element, verify attributes directly
    for (const [attr, value] of Object.entries(expectedAttributes)) {
      const attrValue = element.getAttribute(attr);
      expect(attrValue).toBe(value);
    }
  } else {
    // Fall back to regex-based testing
    const html = container.innerHTML;
    console.log('Falling back to regex testing, HTML:', html);

    for (const [attr, value] of Object.entries(expectedAttributes)) {
      const regex = new RegExp(`${attr}="(${value})"`, 'i');
      expect(html).toMatch(regex);
    }
  }
}


/**
 * Test the output of renderViz function
 */
export function testRendererOutput(
  spec: any,
  container: HTMLElement,
  expectedSelectors: Record<string, Record<string, string>>
) {
  // Render the visualization
  renderViz(spec, container);

  // Check the HTML output
  const html = container.innerHTML;
  console.log('Rendered HTML:', html);

  // Check each selector and its expected attributes
  for (const [selector, attributes] of Object.entries(expectedSelectors)) {
    const element = container.querySelector(selector);

    if (element) {
      console.log(`✅ Found element with selector: ${selector}`);

      // Check attributes
      for (const [attr, value] of Object.entries(attributes)) {
        const attrValue = element.getAttribute(attr);
        console.log(`Checking attribute ${attr}, expected: ${value}, actual: ${attrValue}`);
        expect(attrValue).toBe(value);
      }
    } else {
      console.warn(`⚠️ Element not found with selector: ${selector}`);
      console.warn(`⚠️ Falling back to string matching (less reliable)`);

      // Fall back to string-based testing
      for (const [attr, value] of Object.entries(attributes)) {
        const attrPattern = `${attr}="${value}"`;
        console.log(`Checking for attribute pattern: ${attrPattern}`);
        expect(html).toContain(attrPattern);
      }
    }
  }
}

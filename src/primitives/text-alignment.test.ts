/**
 * Text Primitive Alignment Tests
 *
 * Purpose: Tests the text primitive visualization
 * Author: [Author Name]
 * Creation Date: [Date]
 * Last Modified: [Date]
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { registry, hasType, getType } from '../core/registry';
import { textTypeDefinition, registerTextPrimitive } from './text';
import { buildViz } from '../core/builder';

// Mock the svgUtils module
vi.mock('../renderers/svgUtils', () => ({
  createSVGElement: vi.fn((tagName) => ({
    tagName: tagName.toUpperCase(),
    setAttribute: vi.fn(),
    appendChild: vi.fn(),
    textContent: ''
  })),
  applyAttributes: vi.fn()
}));

// Import the mocked functions
import { createSVGElement, applyAttributes } from '../renderers/svgUtils';

describe('Text Alignment', () => {
  // Reset registry before each test
  beforeEach(() => {
    // Reset the registry for clean tests
    (registry as any).types = new Map();

    // Register the text primitive
    registerTextPrimitive();

    // Reset mocks
    vi.clearAllMocks();
  });

  test('should handle text-anchor in canvas rendering', () => {
    // Test 'start' alignment (default)
    const startImpl = textTypeDefinition.implementation({
      text: 'Left aligned',
      textAnchor: 'start',
      x: 0,
      y: 0,
      fontSize: 12,
      fontFamily: 'sans-serif',
      fontWeight: 'normal',
      fill: 'black',
      dominantBaseline: 'auto',
      opacity: 1,
      transform: ''
    });

    const startCtx = {
      save: vi.fn(),
      restore: vi.fn(),
      fillText: vi.fn(),
      textAlign: 'unset'
    };

    startImpl.renderToCanvas(startCtx);
    expect(startCtx.textAlign).toBe('left');

    // Test 'middle' alignment
    const middleImpl = textTypeDefinition.implementation({
      text: 'Center aligned',
      textAnchor: 'middle',
      x: 0,
      y: 0,
      fontSize: 12,
      fontFamily: 'sans-serif',
      fontWeight: 'normal',
      fill: 'black',
      dominantBaseline: 'auto',
      opacity: 1,
      transform: ''
    });

    const middleCtx = {
      save: vi.fn(),
      restore: vi.fn(),
      fillText: vi.fn(),
      textAlign: 'unset'
    };

    middleImpl.renderToCanvas(middleCtx);
    expect(middleCtx.textAlign).toBe('center');

    // Test 'end' alignment
    const endImpl = textTypeDefinition.implementation({
      text: 'Right aligned',
      textAnchor: 'end',
      x: 0,
      y: 0,
      fontSize: 12,
      fontFamily: 'sans-serif',
      fontWeight: 'normal',
      fill: 'black',
      dominantBaseline: 'auto',
      opacity: 1,
      transform: ''
    });

    const endCtx = {
      save: vi.fn(),
      restore: vi.fn(),
      fillText: vi.fn(),
      textAlign: 'unset'
    };

    endImpl.renderToCanvas(endCtx);
    expect(endCtx.textAlign).toBe('right');
  });

  test('should handle dominant-baseline in canvas rendering', () => {
    // Test 'auto' baseline (default)
    const autoImpl = textTypeDefinition.implementation({
      text: 'Default baseline',
      dominantBaseline: 'auto',
      x: 0,
      y: 0,
      fontSize: 12,
      fontFamily: 'sans-serif',
      fontWeight: 'normal',
      fill: 'black',
      textAnchor: 'start',
      opacity: 1,
      transform: ''
    });

    const autoCtx = {
      save: vi.fn(),
      restore: vi.fn(),
      fillText: vi.fn(),
      textBaseline: 'unset'
    };

    autoImpl.renderToCanvas(autoCtx);
    expect(autoCtx.textBaseline).toBe('alphabetic');

    // Test 'middle' baseline
    const middleImpl = textTypeDefinition.implementation({
      text: 'Middle baseline',
      dominantBaseline: 'middle',
      x: 0,
      y: 0,
      fontSize: 12,
      fontFamily: 'sans-serif',
      fontWeight: 'normal',
      fill: 'black',
      textAnchor: 'start',
      opacity: 1,
      transform: ''
    });

    const middleCtx = {
      save: vi.fn(),
      restore: vi.fn(),
      fillText: vi.fn(),
      textBaseline: 'unset'
    };

    middleImpl.renderToCanvas(middleCtx);
    expect(middleCtx.textBaseline).toBe('middle');

    // Test 'hanging' baseline
    const hangingImpl = textTypeDefinition.implementation({
      text: 'Hanging baseline',
      dominantBaseline: 'hanging',
      x: 0,
      y: 0,
      fontSize: 12,
      fontFamily: 'sans-serif',
      fontWeight: 'normal',
      fill: 'black',
      textAnchor: 'start',
      opacity: 1,
      transform: ''
    });

    const hangingCtx = {
      save: vi.fn(),
      restore: vi.fn(),
      fillText: vi.fn(),
      textBaseline: 'unset'
    };

    hangingImpl.renderToCanvas(hangingCtx);
    expect(hangingCtx.textBaseline).toBe('top');

    // Test 'alphabetic' baseline
    const alphabeticImpl = textTypeDefinition.implementation({
      text: 'Alphabetic baseline',
      dominantBaseline: 'alphabetic',
      x: 0,
      y: 0,
      fontSize: 12,
      fontFamily: 'sans-serif',
      fontWeight: 'normal',
      fill: 'black',
      textAnchor: 'start',
      opacity: 1,
      transform: ''
    });

    const alphabeticCtx = {
      save: vi.fn(),
      restore: vi.fn(),
      fillText: vi.fn(),
      textBaseline: 'unset'
    };

    alphabeticImpl.renderToCanvas(alphabeticCtx);
    expect(alphabeticCtx.textBaseline).toBe('alphabetic');
  });

  test('should handle text-anchor in SVG rendering', () => {
    // Create a mock SVG element
    const mockElement = {
      setAttribute: vi.fn(),
      appendChild: vi.fn(),
      textContent: null
    };

    // Mock the createSVGElement function to return our mock
    (createSVGElement as any).mockReturnValue(mockElement);

    // Create a mock container with appendChild
    const mockContainer = { appendChild: vi.fn() };

    // Test 'start' alignment
    const startImpl = textTypeDefinition.implementation({
      text: 'Left aligned',
      textAnchor: 'start',
      x: 0,
      y: 0,
      fontSize: 12,
      fontFamily: 'sans-serif',
      fontWeight: 'normal',
      fill: 'black',
      dominantBaseline: 'auto',
      opacity: 1,
      transform: ''
    });

    startImpl.renderToSvg(mockContainer);
    expect(applyAttributes).toHaveBeenCalled();
    expect(mockContainer.appendChild).toHaveBeenCalled();

    // Reset mocks
    vi.clearAllMocks();
    (createSVGElement as any).mockReturnValue(mockElement);

    // Test 'middle' alignment
    const middleImpl = textTypeDefinition.implementation({
      text: 'Center aligned',
      textAnchor: 'middle',
      x: 0,
      y: 0,
      fontSize: 12,
      fontFamily: 'sans-serif',
      fontWeight: 'normal',
      fill: 'black',
      dominantBaseline: 'auto',
      opacity: 1,
      transform: ''
    });

    middleImpl.renderToSvg(mockContainer);
    expect(applyAttributes).toHaveBeenCalled();
    expect(mockContainer.appendChild).toHaveBeenCalled();

    // Reset mocks
    vi.clearAllMocks();
    (createSVGElement as any).mockReturnValue(mockElement);

    // Test 'end' alignment
    const endImpl = textTypeDefinition.implementation({
      text: 'Right aligned',
      textAnchor: 'end',
      x: 0,
      y: 0,
      fontSize: 12,
      fontFamily: 'sans-serif',
      fontWeight: 'normal',
      fill: 'black',
      dominantBaseline: 'auto',
      opacity: 1,
      transform: ''
    });

    endImpl.renderToSvg(mockContainer);
    expect(applyAttributes).toHaveBeenCalled();
    expect(mockContainer.appendChild).toHaveBeenCalled();

    // Since we're mocking applyAttributes, we can't directly test that it's called with specific attributes
    // Instead, we'll verify that the attributes object contains the correct values
    expect(endImpl.attributes['text-anchor']).toBe('end');
    expect(middleImpl.attributes['text-anchor']).toBe('middle');
    expect(startImpl.attributes['text-anchor']).toBe('start');
  });

  test('should handle dominant-baseline in SVG rendering', () => {
    // Create a mock SVG element
    const mockElement = {
      setAttribute: vi.fn(),
      appendChild: vi.fn(),
      textContent: null
    };

    // Mock the createSVGElement function to return our mock
    (createSVGElement as any).mockReturnValue(mockElement);

    // Create a mock container with appendChild
    const mockContainer = { appendChild: vi.fn() };

    // Test 'auto' baseline
    const autoImpl = textTypeDefinition.implementation({
      text: 'Default baseline',
      dominantBaseline: 'auto',
      x: 0,
      y: 0,
      fontSize: 12,
      fontFamily: 'sans-serif',
      fontWeight: 'normal',
      fill: 'black',
      textAnchor: 'start',
      opacity: 1,
      transform: ''
    });

    autoImpl.renderToSvg(mockContainer);
    expect(applyAttributes).toHaveBeenCalled();
    expect(mockContainer.appendChild).toHaveBeenCalled();

    // Reset mocks
    vi.clearAllMocks();
    (createSVGElement as any).mockReturnValue(mockElement);

    // Test 'middle' baseline
    const middleImpl = textTypeDefinition.implementation({
      text: 'Middle baseline',
      dominantBaseline: 'middle',
      x: 0,
      y: 0,
      fontSize: 12,
      fontFamily: 'sans-serif',
      fontWeight: 'normal',
      fill: 'black',
      textAnchor: 'start',
      opacity: 1,
      transform: ''
    });

    middleImpl.renderToSvg(mockContainer);
    expect(applyAttributes).toHaveBeenCalled();
    expect(mockContainer.appendChild).toHaveBeenCalled();

    // Reset mocks
    vi.clearAllMocks();
    (createSVGElement as any).mockReturnValue(mockElement);

    // Test 'hanging' baseline
    const hangingImpl = textTypeDefinition.implementation({
      text: 'Hanging baseline',
      dominantBaseline: 'hanging',
      x: 0,
      y: 0,
      fontSize: 12,
      fontFamily: 'sans-serif',
      fontWeight: 'normal',
      fill: 'black',
      textAnchor: 'start',
      opacity: 1,
      transform: ''
    });

    hangingImpl.renderToSvg(mockContainer);
    expect(applyAttributes).toHaveBeenCalled();
    expect(mockContainer.appendChild).toHaveBeenCalled();

    // Since we're mocking applyAttributes, we can't directly test that it's called with specific attributes
    // Instead, we'll verify that the attributes object contains the correct values
    expect(autoImpl.attributes['dominant-baseline']).toBe('auto');
    expect(middleImpl.attributes['dominant-baseline']).toBe('middle');
    expect(hangingImpl.attributes['dominant-baseline']).toBe('hanging');
  });
});

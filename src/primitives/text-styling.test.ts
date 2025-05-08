import { describe, test, expect, vi, beforeEach } from 'vitest';
import { getType, _resetRegistryForTesting } from '../core/registry';
import { registerDefineType } from '../core/define';
import { buildViz } from '../core/builder';

// Mock buildViz to capture calls
vi.mock('../core/builder', () => ({
  buildViz: vi.fn()
}));

// Reset registry and register define type before each test
beforeEach(() => {
  _resetRegistryForTesting();
  registerDefineType();

  // Import the text type implementation
  require('./text');
});

describe('Text Styling', () => {
  test('should set font properties in canvas rendering', () => {
    const textType = getType('text');

    const result = textType?.decompose({
      text: 'Styled text',
      fontSize: 24,
      fontFamily: 'Arial',
      fontWeight: 'bold'
    }, {});

    const ctx = {
      save: vi.fn(),
      restore: vi.fn(),
      fillText: vi.fn(),
      font: 'unset'
    };

    result?.renderCanvas(ctx);

    expect(ctx.font).toBe('bold 24px Arial');
  });

  test('should set fill color in canvas rendering', () => {
    const textType = getType('text');

    const result = textType?.decompose({
      text: 'Colored text',
      fill: 'blue'
    }, {});

    const ctx = {
      save: vi.fn(),
      restore: vi.fn(),
      fillText: vi.fn(),
      fillStyle: 'unset'
    };

    result?.renderCanvas(ctx);

    expect(ctx.fillStyle).toBe('blue');
  });

  test('should set opacity in canvas rendering', () => {
    const textType = getType('text');

    const result = textType?.decompose({
      text: 'Semi-transparent text',
      opacity: 0.5
    }, {});

    const ctx = {
      save: vi.fn(),
      restore: vi.fn(),
      fillText: vi.fn(),
      globalAlpha: 1
    };

    result?.renderCanvas(ctx);

    expect(ctx.globalAlpha).toBe(0.5);
  });

  test('should set font properties in SVG rendering', () => {
    const textType = getType('text');

    // Mock SVG element creation
    const mockElement = {
      setAttribute: vi.fn(),
      appendChild: vi.fn(),
      textContent: null
    };

    global.document = {
      createElementNS: vi.fn(() => mockElement)
    } as any;

    const result = textType?.decompose({
      text: 'Styled text',
      fontSize: 24,
      fontFamily: 'Arial',
      fontWeight: 'bold'
    }, {});

    result?.renderToSvg({} as any);

    expect(mockElement.setAttribute).toHaveBeenCalledWith('font-size', '24');
    expect(mockElement.setAttribute).toHaveBeenCalledWith('font-family', 'Arial');
    expect(mockElement.setAttribute).toHaveBeenCalledWith('font-weight', 'bold');
  });

  test('should set fill color in SVG rendering', () => {
    const textType = getType('text');

    // Mock SVG element creation
    const mockElement = {
      setAttribute: vi.fn(),
      appendChild: vi.fn(),
      textContent: null
    };

    global.document = {
      createElementNS: vi.fn(() => mockElement)
    } as any;

    const result = textType?.decompose({
      text: 'Colored text',
      fill: 'blue'
    }, {});

    result?.renderToSvg({} as any);

    expect(mockElement.setAttribute).toHaveBeenCalledWith('fill', 'blue');
  });

  test('should set opacity in SVG rendering', () => {
    const textType = getType('text');

    // Mock SVG element creation
    const mockElement = {
      setAttribute: vi.fn(),
      appendChild: vi.fn(),
      textContent: null
    };

    global.document = {
      createElementNS: vi.fn(() => mockElement)
    } as any;

    const result = textType?.decompose({
      text: 'Semi-transparent text',
      opacity: 0.5
    }, {});

    result?.renderToSvg({} as any);

    expect(mockElement.setAttribute).toHaveBeenCalledWith('opacity', '0.5');
  });

  test('should handle default font weight', () => {
    const textType = getType('text');

    const result = textType?.decompose({
      text: 'Normal weight text'
      // No fontWeight specified, should use default 'normal'
    }, {});

    const ctx = {
      save: vi.fn(),
      restore: vi.fn(),
      fillText: vi.fn(),
      font: 'unset'
    };

    result?.renderCanvas(ctx);

    expect(ctx.font).toBe('normal 12px sans-serif');
  });

  test('should handle different font weights', () => {
    const textType = getType('text');

    // Test bold
    const boldResult = textType?.decompose({
      text: 'Bold text',
      fontWeight: 'bold'
    }, {});

    const boldCtx = {
      save: vi.fn(),
      restore: vi.fn(),
      fillText: vi.fn(),
      font: 'unset'
    };

    boldResult?.renderCanvas(boldCtx);
    expect(boldCtx.font).toBe('bold 12px sans-serif');

    // Test numeric weight
    const numericResult = textType?.decompose({
      text: 'Numeric weight text',
      fontWeight: '700'
    }, {});

    const numericCtx = {
      save: vi.fn(),
      restore: vi.fn(),
      fillText: vi.fn(),
      font: 'unset'
    };

    numericResult?.renderCanvas(numericCtx);
    expect(numericCtx.font).toBe('700 12px sans-serif');
  });
});

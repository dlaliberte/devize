import { describe, test, expect, vi, beforeEach } from 'vitest';
import { getType, _resetRegistryForTesting } from '../core/registry';
import { registerDefineType } from '../core/define';
import { createViz } from '../core/creator';

// Mock createViz to capture calls
vi.mock('../core/creator', () => ({
  createViz: vi.fn()
}));

// Reset registry and register define type before each test
beforeEach(() => {
  _resetRegistryForTesting();
  registerDefineType();

  // Import the text type implementation
  require('./text');
});

describe('Text Alignment', () => {
  test('should handle text-anchor in canvas rendering', () => {
    const textType = getType('text');

    // Test 'start' alignment (default)
    const startResult = textType?.decompose({
      text: 'Left aligned',
      textAnchor: 'start'
    }, {});

    const startCtx = {
      save: vi.fn(),
      restore: vi.fn(),
      fillText: vi.fn(),
      textAlign: 'unset'
    };

    startResult?.renderCanvas(startCtx);
    expect(startCtx.textAlign).toBe('left');

    // Test 'middle' alignment
    const middleResult = textType?.decompose({
      text: 'Center aligned',
      textAnchor: 'middle'
    }, {});

    const middleCtx = {
      save: vi.fn(),
      restore: vi.fn(),
      fillText: vi.fn(),
      textAlign: 'unset'
    };

    middleResult?.renderCanvas(middleCtx);
    expect(middleCtx.textAlign).toBe('center');

    // Test 'end' alignment
    const endResult = textType?.decompose({
      text: 'Right aligned',
      textAnchor: 'end'
    }, {});

    const endCtx = {
      save: vi.fn(),
      restore: vi.fn(),
      fillText: vi.fn(),
      textAlign: 'unset'
    };

    endResult?.renderCanvas(endCtx);
    expect(endCtx.textAlign).toBe('right');
  });

  test('should handle dominant-baseline in canvas rendering', () => {
    const textType = getType('text');

    // Test 'auto' baseline (default)
    const autoResult = textType?.decompose({
      text: 'Default baseline',
      dominantBaseline: 'auto'
    }, {});

    const autoCtx = {
      save: vi.fn(),
      restore: vi.fn(),
      fillText: vi.fn(),
      textBaseline: 'unset'
    };

    autoResult?.renderCanvas(autoCtx);
    expect(autoCtx.textBaseline).toBe('alphabetic');

    // Test 'middle' baseline
    const middleResult = textType?.decompose({
      text: 'Middle baseline',
      dominantBaseline: 'middle'
    }, {});

    const middleCtx = {
      save: vi.fn(),
      restore: vi.fn(),
      fillText: vi.fn(),
      textBaseline: 'unset'
    };

    middleResult?.renderCanvas(middleCtx);
    expect(middleCtx.textBaseline).toBe('middle');

    // Test 'hanging' baseline
    const hangingResult = textType?.decompose({
      text: 'Hanging baseline',
      dominantBaseline: 'hanging'
    }, {});

    const hangingCtx = {
      save: vi.fn(),
      restore: vi.fn(),
      fillText: vi.fn(),
      textBaseline: 'unset'
    };

    hangingResult?.renderCanvas(hangingCtx);
    expect(hangingCtx.textBaseline).toBe('top');

    // Test 'alphabetic' baseline
    const alphabeticResult = textType?.decompose({
      text: 'Alphabetic baseline',
      dominantBaseline: 'alphabetic'
    }, {});

    const alphabeticCtx = {
      save: vi.fn(),
      restore: vi.fn(),
      fillText: vi.fn(),
      textBaseline: 'unset'
    };

    alphabeticResult?.renderCanvas(alphabeticCtx);
    expect(alphabeticCtx.textBaseline).toBe('alphabetic');
  });

  test('should handle text-anchor in SVG rendering', () => {
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

    // Test 'start' alignment
    const startResult = textType?.decompose({
      text: 'Left aligned',
      textAnchor: 'start'
    }, {});

    startResult?.renderSVG({} as any);
    expect(mockElement.setAttribute).toHaveBeenCalledWith('text-anchor', 'start');

    // Reset mock
    mockElement.setAttribute.mockClear();

    // Test 'middle' alignment
    const middleResult = textType?.decompose({
      text: 'Center aligned',
      textAnchor: 'middle'
    }, {});

    middleResult?.renderSVG({} as any);
    expect(mockElement.setAttribute).toHaveBeenCalledWith('text-anchor', 'middle');

    // Reset mock
    mockElement.setAttribute.mockClear();

    // Test 'end' alignment
    const endResult = textType?.decompose({
      text: 'Right aligned',
      textAnchor: 'end'
    }, {});

    endResult?.renderSVG({} as any);
    expect(mockElement.setAttribute).toHaveBeenCalledWith('text-anchor', 'end');
  });

  test('should handle dominant-baseline in SVG rendering', () => {
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

    // Test 'auto' baseline
    const autoResult = textType?.decompose({
      text: 'Default baseline',
      dominantBaseline: 'auto'
    }, {});

    autoResult?.renderSVG({} as any);
    expect(mockElement.setAttribute).toHaveBeenCalledWith('dominant-baseline', 'auto');

    // Reset mock
    mockElement.setAttribute.mockClear();

    // Test 'middle' baseline
    const middleResult = textType?.decompose({
      text: 'Middle baseline',
      dominantBaseline: 'middle'
    }, {});

    middleResult?.renderSVG({} as any);
    expect(mockElement.setAttribute).toHaveBeenCalledWith('dominant-baseline', 'middle');

    // Reset mock
    mockElement.setAttribute.mockClear();

    // Test 'hanging' baseline
    const hangingResult = textType?.decompose({
      text: 'Hanging baseline',
      dominantBaseline: 'hanging'
    }, {});

    hangingResult?.renderSVG({} as any);
    expect(mockElement.setAttribute).toHaveBeenCalledWith('dominant-baseline', 'hanging');
  });
});

function createMinimalBandScale(options) {
  const {
    domain, range, padding = 0.1, paddingInner = padding, paddingOuter = padding, align = 0.5
  } = options;

  const [r0, r1] = range;
  const n = domain.length;
  const step = n ? (r1 - r0) / (n - paddingInner + paddingOuter * 2) : 0;
  const bandWidth = step * (1 - paddingInner);
  const start = r0 + (r1 - r0 - step * (n - paddingInner)) * align;

  return {
    domain,
    range,
    scale: (value) => {
      const index = domain.indexOf(value);
      if (index === -1) return NaN;
      return start + paddingOuter * step + index * step;
    },
    bandwidth: () => bandWidth,
    ticks: () => domain
  };
}

window.runValidationTests = function() {
  const errors = [];
  let allTestsPassed = true;

  function test(name, testFn) {
    try {
      testFn();
      console.log(`✓ ${name}`);
    } catch (error) {
      console.error(`✗ ${name}: ${error.message}`);
      errors.push(`${name}: ${error.message}`);
      allTestsPassed = false;
    }
  }

  function assertEqual(actual, expected, message) {
    if (Math.abs(actual - expected) > 0.001) {
      throw new Error(`${message}: expected ${expected}, got ${actual}`);
    }
  }

  // Test 1: Basic functionality
  test('Basic scale functionality', () => {
    const scale = createMinimalBandScale({
      domain: ['A', 'B', 'C'],
      range: [0, 300]
    });

    assertEqual(scale.bandwidth(), 80, 'Bandwidth calculation');
    assertEqual(scale.scale('A'), 20, 'First band position');
    assertEqual(scale.scale('B'), 110, 'Second band position');
    assertEqual(scale.scale('C'), 200, 'Third band position');
  });

  // Test 2: No padding
  test('No padding', () => {
    const scale = createMinimalBandScale({
      domain: ['A', 'B', 'C'],
      range: [0, 300],
      padding: 0
    });

    assertEqual(scale.bandwidth(), 100, 'Bandwidth with no padding');
    assertEqual(scale.scale('A'), 0, 'First band with no padding');
    assertEqual(scale.scale('B'), 100, 'Second band with no padding');
  });

  // Test 3: Edge case - empty domain
  test('Empty domain', () => {
    const scale = createMinimalBandScale({
      domain: [],
      range: [0, 300]
    });

    assertEqual(scale.bandwidth(), 0, 'Bandwidth for empty domain');
    assertEqual(scale.domain.length, 0, 'Domain length');
  });

  // Test 4: Single item
  test('Single item domain', () => {
    const scale = createMinimalBandScale({
      domain: ['A'],
      range: [0, 300]
    });

    const bandwidth = scale.bandwidth();
    const position = scale.scale('A');

    if (bandwidth <= 0) {
      throw new Error('Bandwidth should be positive for single item');
    }
    if (isNaN(position)) {
      throw new Error('Position should not be NaN for valid domain value');
    }
  });

  // Test 5: Alignment
  test('Left alignment', () => {
    const scale = createMinimalBandScale({
      domain: ['A', 'B'],
      range: [0, 200],
      align: 0
    });

    const firstPos = scale.scale('A');
    if (firstPos < 0) {
      throw new Error('Left-aligned scale should not have negative positions');
    }
  });

  return {
    allTestsPassed,
    errors
  };
};

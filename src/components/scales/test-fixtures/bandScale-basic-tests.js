// Band scale implementation
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

// Visualization helper
function createVisualization(title, scale, options = {}) {
  const container = document.getElementById('test-container');
  const div = document.createElement('div');
  div.className = 'test-container';

  const titleEl = document.createElement('div');
  titleEl.className = 'title';
  titleEl.textContent = title;
  div.appendChild(titleEl);

  // Add debug information
  const debugEl = document.createElement('div');
  debugEl.className = 'debug-info';
  debugEl.innerHTML = `
    Domain: [${scale.domain.join(', ')}]<br>
    Range: [${scale.range.join(', ')}]<br>
    Bandwidth: ${scale.bandwidth().toFixed(2)}<br>
    ${options.description || ''}
  `;
  div.appendChild(debugEl);

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '500');
  svg.setAttribute('height', '150');

  // Draw range line
  const rangeLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  rangeLine.setAttribute('x1', scale.range[0]);
  rangeLine.setAttribute('y1', '100');
  rangeLine.setAttribute('x2', scale.range[1]);
  rangeLine.setAttribute('y2', '100');
  rangeLine.setAttribute('class', 'range-line');
  svg.appendChild(rangeLine);

  // Draw bands
  scale.domain.forEach((value, i) => {
    const x = scale.scale(value);
    const width = scale.bandwidth();

    // Band rectangle
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', x);
    rect.setAttribute('y', '80');
    rect.setAttribute('width', width);
    rect.setAttribute('height', '40');
    rect.setAttribute('class', 'band-rect');
    svg.appendChild(rect);

    // Center tick line
    const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    tick.setAttribute('x1', x + width/2);
    tick.setAttribute('y1', '75');
    tick.setAttribute('x2', x + width/2);
    tick.setAttribute('y2', '125');
    tick.setAttribute('class', 'tick-line');
    svg.appendChild(tick);

    // Label
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', x + width/2);
    text.setAttribute('y', '140');
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('class', 'tick-text');
    text.textContent = value;
    svg.appendChild(text);

    // Debug info
    const debugText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    debugText.setAttribute('x', x + width/2);
    debugText.setAttribute('y', '65');
    debugText.setAttribute('text-anchor', 'middle');
    debugText.setAttribute('class', 'tick-text');
    debugText.setAttribute('font-size', '9');
    debugText.textContent = `x:${x.toFixed(1)} w:${width.toFixed(1)}`;
    svg.appendChild(debugText);
  });

  div.appendChild(svg);
  container.appendChild(div);
}

// Run all test cases
const testCases = [
  {
    title: 'Default Padding (0.1)',
    options: { domain: ['A', 'B', 'C', 'D', 'E'], range: [50, 450] },
    description: 'paddingInner: 0.1, paddingOuter: 0.1, align: 0.5'
  },
  {
    title: 'No Padding (0.0)',
    options: { domain: ['A', 'B', 'C', 'D', 'E'], range: [50, 450], padding: 0 },
    description: 'paddingInner: 0, paddingOuter: 0'
  },
  {
    title: 'High Padding (0.3)',
    options: { domain: ['A', 'B', 'C', 'D', 'E'], range: [50, 450], padding: 0.3 },
    description: 'paddingInner: 0.3, paddingOuter: 0.3'
  },
  {
    title: 'Different Inner/Outer Padding',
    options: { domain: ['A', 'B', 'C', 'D', 'E'], range: [50, 450], paddingInner: 0.2, paddingOuter: 0.1 },
    description: 'paddingInner: 0.2, paddingOuter: 0.1'
  },
  {
    title: 'Left Alignment',
    options: { domain: ['A', 'B', 'C', 'D', 'E'], range: [50, 450], align: 0 },
    description: 'align: 0 (left-aligned)'
  },
  {
    title: 'Right Alignment',
    options: { domain: ['A', 'B', 'C', 'D', 'E'], range: [50, 450], align: 1 },
    description: 'align: 1 (right-aligned)'
  }
];

testCases.forEach(testCase => {
  const scale = createMinimalBandScale(testCase.options);
  createVisualization(testCase.title, scale, { description: testCase.description });
});

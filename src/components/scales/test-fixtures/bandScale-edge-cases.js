// Same createMinimalBandScale function as above...
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

// Edge case visualization function
function createEdgeCaseVisualization(title, scale, description) {
  const container = document.getElementById('test-container');
  const div = document.createElement('div');
  div.className = 'test-container';

  const titleEl = document.createElement('div');
  titleEl.className = 'title';
  titleEl.textContent = title;
  div.appendChild(titleEl);

  const descEl = document.createElement('div');
  descEl.textContent = description;
  descEl.style.fontSize = '12px';
  descEl.style.color = '#666';
  descEl.style.marginBottom = '10px';
  div.appendChild(descEl);

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

  // Handle empty domain case
  if (scale.domain.length === 0) {
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', '250');
    text.setAttribute('y', '100');
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('class', 'tick-text');
    text.textContent = 'No data';
    svg.appendChild(text);
  } else {
    // Draw bands for non-empty domains
    scale.domain.forEach((value, i) => {
      const x = scale.scale(value);
      const width = scale.bandwidth();

      if (!isNaN(x) && !isNaN(width)) {
        // Band rectangle
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', x);
        rect.setAttribute('y', '80');
        rect.setAttribute('width', width);
        rect.setAttribute('height', '40');
        rect.setAttribute('class', 'band-rect');
        svg.appendChild(rect);

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
      }
    });
  }

  div.appendChild(svg);
  container.appendChild(div);
}

// Run edge case tests
const edgeCases = [
  {
    title: 'Empty Domain',
    options: { domain: [], range: [50, 450] },
    description: 'Testing with no domain values'
  },
  {
    title: 'Single Item',
    options: { domain: ['Single'], range: [50, 450] },
    description: 'Testing with only one domain value'
  },
  {
    title: 'Narrow Range',
    options: { domain: ['A', 'B', 'C'], range: [200, 220] },
    description: 'Testing with very small range'
  },
  {
    title: 'Reversed Range',
    options: { domain: ['A', 'B', 'C'], range: [450, 50] },
    description: 'Testing with reversed range [450, 50]'
  },
  {
    title: 'Large Domain',
    options: { domain: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'], range: [50, 450] },
    description: 'Testing with many domain values'
  },
  {
    title: 'Zero Range',
    options: { domain: ['A', 'B', 'C'], range: [200, 200] },
    description: 'Testing with zero-width range'
  }
];

edgeCases.forEach(testCase => {
  const scale = createMinimalBandScale(testCase.options);
  createEdgeCaseVisualization(testCase.title, scale, testCase.description);
});

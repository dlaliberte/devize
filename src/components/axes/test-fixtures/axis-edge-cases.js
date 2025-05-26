// Test helper function (same as other files)
function createAxisTest(title, description, axisOptions) {
  const container = document.getElementById('test-container');
  const div = document.createElement('div');
  div.className = 'test-container';

  const titleEl = document.createElement('div');
  titleEl.className = 'title';
  titleEl.textContent = title;
  div.appendChild(titleEl);

  const descEl = document.createElement('div');
  descEl.className = 'description';
  descEl.textContent = description;
  div.appendChild(descEl);

  try {
    const axis = window.createAxis(axisOptions);

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const width = axisOptions.orientation === 'bottom' || axisOptions.orientation === 'top' ?
                  axisOptions.length + 100 : 200;
    const height = axisOptions.orientation === 'left' || axisOptions.orientation === 'right' ?
                   axisOptions.length + 100 : 150;

    svg.setAttribute('width', width);
    svg.setAttribute('height', height);

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const isHorizontal = axisOptions.orientation === 'bottom' || axisOptions.orientation === 'top';
    const translateX = isHorizontal ? 50 : (axisOptions.orientation === 'right' ? 20 : 150);
    const translateY = isHorizontal ? (axisOptions.orientation === 'bottom' ? 50 : 100) : 50;
    g.setAttribute('transform', `translate(${translateX}, ${translateY})`);

    if (axis && axis.renderToSvg) {
      axis.renderToSvg(g);
    }

    svg.appendChild(g);
    div.appendChild(svg);

  } catch (error) {
    console.error('Error creating axis:', error);
    const errorDiv = document.createElement('div');
    errorDiv.style.color = 'red';
    errorDiv.textContent = `Error: ${error.message}`;
    div.appendChild(errorDiv);
  }

  container.appendChild(div);
}

// Edge case tests
const edgeCaseTests = [
  {
    title: 'Empty Domain',
    description: 'Band scale with empty domain',
    options: {
      orientation: 'bottom',
      length: 300,
      scaleType: 'band',
      domain: [],
      values: [],
      title: 'Empty Domain'
    }
  },
  {
    title: 'Single Item',
    description: 'Band scale with only one item',
    options: {
      orientation: 'bottom',
      length: 300,
      values: ['Single'],
      scale: window.createMinimalBandScale({
        domain: ['Single'],
        range: [0, 300]
      }),
      title: 'Single Item'
    }
  },
  {
    title: 'Very Short Axis',
    description: 'Axis with very small length',
    options: {
      orientation: 'bottom',
      length: 50,
      scaleType: 'linear',
      domain: [0, 100],
      title: 'Short',
      tickCount: 3
    }
  },
  {
    title: 'Very Long Axis',
    description: 'Axis with very large length',
    options: {
      orientation: 'bottom',
      length: 800,
      scaleType: 'linear',
      domain: [0, 1000],
      title: 'Very Long Axis',
      tickCount: 10
    }
  },
  {
    title: 'Negative Domain',
    description: 'Linear scale with negative values',
    options: {
      orientation: 'left',
      length: 300,
      scaleType: 'linear',
      domain: [-50, 50],
      title: 'Negative to Positive',
      tickCount: 6
    }
  },
  {
    title: 'Large Numbers',
    description: 'Linear scale with large numbers',
    options: {
      orientation: 'bottom',
      length: 400,
      scaleType: 'linear',
      domain: [1000000, 2000000],
      title: 'Large Numbers',
      tickCount: 5
    }
  },
  {
    title: 'Many Categories',
    description: 'Band scale with many categories',
    options: {
      orientation: 'bottom',
      length: 600,
      scaleType: 'band',
      domain: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'],
      values: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'],
      title: 'Many Categories'
    }
  },
  {
    title: 'Long Category Names',
    description: 'Band scale with very long category names',
    options: {
      orientation: 'bottom',
      length: 500,
      values: ['Very Long Category Name 1', 'Another Extremely Long Category Name', 'Short'],
      scale: window.createMinimalBandScale({
        domain: ['Very Long Category Name 1', 'Another Extremely Long Category Name', 'Short'],
        range: [0, 500]
      }),
      title: 'Long Names'
    }
  }
];

edgeCaseTests.forEach(test => {
  createAxisTest(test.title, test.description, test.options);
});

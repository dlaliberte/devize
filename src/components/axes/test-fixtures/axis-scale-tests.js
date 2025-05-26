// Test helper function
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
    // Use the actual axis implementation
    const axis = window.createAxis(axisOptions);

    // Create SVG container
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const width = axisOptions.orientation === 'bottom' || axisOptions.orientation === 'top' ?
                  axisOptions.length + 100 : 200;
    const height = axisOptions.orientation === 'left' || axisOptions.orientation === 'right' ?
                   axisOptions.length + 100 : 150;

    svg.setAttribute('width', width);
    svg.setAttribute('height', height);

    // Create a group for positioning
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const isHorizontal = axisOptions.orientation === 'bottom' || axisOptions.orientation === 'top';
    const translateX = isHorizontal ? 50 : (axisOptions.orientation === 'right' ? 20 : 150);
    const translateY = isHorizontal ? (axisOptions.orientation === 'bottom' ? 50 : 100) : 50;
    g.setAttribute('transform', `translate(${translateX}, ${translateY})`);

    // Render the axis using its actual renderToSvg method
    if (axis && axis.renderToSvg) {
      axis.renderToSvg(g);
    } else {
      console.error('Axis does not have renderToSvg method');
      const errorText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      errorText.setAttribute('x', 10);
      errorText.setAttribute('y', 20);
      errorText.setAttribute('fill', 'red');
      errorText.textContent = 'Error: Could not render axis';
      g.appendChild(errorText);
    }

    svg.appendChild(g);
    div.appendChild(svg);

  } catch (error) {
    console.error('Error creating axis:', error);
    const errorDiv = document.createElement('div');
    errorDiv.style.color = 'red';
    errorDiv.style.padding = '10px';
    errorDiv.style.border = '1px solid red';
    errorDiv.textContent = `Error: ${error.message}`;
    div.appendChild(errorDiv);
  }

  container.appendChild(div);
}

// Test cases with different scale types
const scaleTests = [
  {
    title: 'Linear Scale - Bottom Axis',
    description: 'Bottom axis with linear scale from 0 to 100',
    options: {
      orientation: 'bottom',
      length: 400,
      scaleType: 'linear',
      domain: [0, 100],
      title: 'Linear Scale (0-100)',
      tickCount: 6
    }
  },
  {
    title: 'Linear Scale - Left Axis',
    description: 'Left axis with linear scale from 0 to 50',
    options: {
      orientation: 'left',
      length: 300,
      scaleType: 'linear',
      domain: [0, 50],
      title: 'Linear Scale (0-50)',
      tickCount: 6
    }
  },
  {
    title: 'Band Scale - Bottom Axis',
    description: 'Bottom axis with band scale for categories',
    options: {
      orientation: 'bottom',
      length: 400,
      scaleType: 'band',
      domain: ['Category A', 'Category B', 'Category C', 'Category D', 'Category E'],
      values: ['Category A', 'Category B', 'Category C', 'Category D', 'Category E'],
      title: 'Band Scale Categories'
    }
  },
  {
    title: 'Band Scale - Left Axis',
    description: 'Left axis with band scale for categories',
    options: {
      orientation: 'left',
      length: 300,
      scaleType: 'band',
      domain: ['Item 1', 'Item 2', 'Item 3', 'Item 4'],
      values: ['Item 1', 'Item 2', 'Item 3', 'Item 4'],
      title: 'Band Scale Items'
    }
  },
  {
    title: 'Band Scale with Custom Values',
    description: 'Band scale with specific values provided',
    options: {
      orientation: 'bottom',
      length: 350,
      values: ['Q1', 'Q2', 'Q3', 'Q4'],
      scale: window.createMinimalBandScale({
        domain: ['Q1', 'Q2', 'Q3', 'Q4'],
        range: [0, 350],
        padding: 0.1
      }),
      title: 'Quarterly Data'
    }
  },
  {
    title: 'Band Scale with High Padding',
    description: 'Band scale with increased padding between bands',
    options: {
      orientation: 'bottom',
      length: 300,
      values: ['A', 'B', 'C'],
      scale: window.createMinimalBandScale({
        domain: ['A', 'B', 'C'],
        range: [0, 300],
        padding: 0.3
      }),
      title: 'High Padding (0.3)'
    }
  },
  {
    title: 'Band Scale - Left Aligned',
    description: 'Band scale with left alignment',
    options: {
      orientation: 'bottom',
      length: 300,
      values: ['X', 'Y', 'Z'],
      scale: window.createMinimalBandScale({
        domain: ['X', 'Y', 'Z'],
        range: [0, 300],
        padding: 0.2,
        align: 0
      }),
      title: 'Left Aligned (align=0)'
    }
  },
  {
    title: 'Band Scale - Right Aligned',
    description: 'Band scale with right alignment',
    options: {
      orientation: 'bottom',
      length: 300,
      values: ['X', 'Y', 'Z'],
      scale: window.createMinimalBandScale({
        domain: ['X', 'Y', 'Z'],
        range: [0, 300],
        padding: 0.2,
        align: 1
      }),
      title: 'Right Aligned (align=1)'
    }
  }
];

// Run the scale tests
scaleTests.forEach(test => {
  createAxisTest(test.title, test.description, test.options);
});

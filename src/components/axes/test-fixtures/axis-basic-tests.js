// Test helper function - uses actual axis implementation
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

    // Use the actual axis renderToSvg method
    if (axis && axis.renderToSvg) {
      axis.renderToSvg(g);
    } else {
      throw new Error('Axis does not have renderToSvg method');
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

// Run basic orientation tests using actual implementations
const basicTests = [
  {
    title: 'Bottom Axis (Horizontal) - Linear Scale',
    description: 'Standard bottom axis with linear scale using actual implementation',
    options: {
      orientation: 'bottom',
      length: 300,
      scaleType: 'linear',
      domain: [0, 100],
      title: 'X Axis (Linear)',
      tickCount: 6
    }
  },
  {
    title: 'Top Axis (Horizontal) - Linear Scale',
    description: 'Top axis with linear scale using actual implementation',
    options: {
      orientation: 'top',
      length: 300,
      scaleType: 'linear',
      domain: [0, 100],
      title: 'Top X Axis (Linear)',
      tickCount: 6
    }
  },
  {
    title: 'Left Axis (Vertical) - Linear Scale',
    description: 'Standard left axis with linear scale using actual implementation',
    options: {
      orientation: 'left',
      length: 200,
      scaleType: 'linear',
      domain: [0, 50],
      title: 'Y Axis (Linear)',
      tickCount: 6
    }
  },
  {
    title: 'Right Axis (Vertical) - Linear Scale',
    description: 'Right axis with linear scale using actual implementation',
    options: {
      orientation: 'right',
      length: 200,
      scaleType: 'linear',
      domain: [0, 50],
      title: 'Right Y Axis (Linear)',
      tickCount: 6
    }
  },
  {
    title: 'Bottom Axis - Band Scale',
    description: 'Bottom axis with band scale using actual implementation',
    options: {
      orientation: 'bottom',
      length: 400,
      scaleType: 'band',
      domain: ['Category A', 'Category B', 'Category C', 'Category D'],
      values: ['Category A', 'Category B', 'Category C', 'Category D'],
      title: 'Categories (Band Scale)'
    }
  },
  {
    title: 'Left Axis - Band Scale',
    description: 'Left axis with band scale using actual implementation',
    options: {
      orientation: 'left',
      length: 300,
      scaleType: 'band',
      domain: ['Item 1', 'Item 2', 'Item 3'],
      values: ['Item 1', 'Item 2', 'Item 3'],
      title: 'Items (Band Scale)'
    }
  }
];

// Wait a bit for the library to be fully loaded, then run tests
setTimeout(() => {
  basicTests.forEach(test => {
    createAxisTest(test.title, test.description, test.options);
  });
}, 100);

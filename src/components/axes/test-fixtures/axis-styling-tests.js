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

// Styling test cases
const stylingTests = [
  {
    title: 'Custom Colors',
    description: 'Axis with custom stroke color and styling',
    options: {
      orientation: 'bottom',
      length: 300,
      scaleType: 'linear',
      domain: [0, 100],
      title: 'Custom Styled Axis',
      stroke: '#2563eb',
      strokeWidth: 2,
      fontSize: '14px',
      titleFontSize: '16px'
    }
  },
  {
    title: 'Large Ticks',
    description: 'Axis with longer tick marks',
    options: {
      orientation: 'left',
      length: 250,
      scaleType: 'linear',
      domain: [0, 50],
      title: 'Large Ticks',
      tickLength: 12,
      tickLabelOffset: 8,
      stroke: '#dc2626'
    }
  },
  {
    title: 'Custom Font Family',
    description: 'Axis with different font family',
    options: {
      orientation: 'bottom',
      length: 350,
      values: ['Spring', 'Summer', 'Fall', 'Winter'],
      scale: window.createMinimalBandScale({
        domain: ['Spring', 'Summer', 'Fall', 'Winter'],
        range: [0, 350]
      }),
      title: 'Seasons',
      fontFamily: 'Georgia, serif',
      fontSize: '13px',
      titleFontSize: '18px',
      titleFontWeight: 'normal'
    }
  },
  {
    title: 'Minimal Styling',
    description: 'Axis with minimal visual styling',
    options: {
      orientation: 'bottom',
      length: 300,
      scaleType: 'linear',
      domain: [0, 10],
      title: 'Minimal',
      stroke: '#6b7280',
      strokeWidth: 1,
      tickLength: 4,
      fontSize: '11px',
      titleFontSize: '12px'
    }
  }
];

stylingTests.forEach(test => {
  createAxisTest(test.title, test.description, test.options);
});

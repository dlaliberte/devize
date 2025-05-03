// Helper function to ensure SVG exists
function ensureSvg(container) {
  let svg = container.querySelector('svg');
  if (!svg) {
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    container.appendChild(svg);
  }
  return svg;
}

// Tooltip functions
function showTooltip(event) {
  const tooltip = document.getElementById('tooltip');
  const data = event.target._data;

  if (data) {
    let html = '';
    for (const key in data) {
      html += `<strong>${key}:</strong> ${data[key]}<br>`;
    }

    tooltip.innerHTML = html;
    tooltip.style.opacity = 1;
    moveTooltip(event);
  }
}

function moveTooltip(event) {
  const tooltip = document.getElementById('tooltip');
  tooltip.style.left = (event.pageX + 10) + 'px';
  tooltip.style.top = (event.pageY + 10) + 'px';
}

function hideTooltip() {
  const tooltip = document.getElementById('tooltip');
  tooltip.style.opacity = 0;
}

import { buildViz } from '../core/builder';
import '../components/legend';

const triangleLegend = buildViz({
  type: 'legend',
  legendType: 'symbol',
  title: 'Symbol Legend',
  items: [
    { value: 'A', label: 'Triangle Item', symbol: 'triangle', color: '#ff6600' },
    { value: 'B', label: 'Circle Item', symbol: 'circle', color: '#3366cc' },
    { value: 'C', label: 'Square Item', symbol: 'square', color: '#33cc33' }
  ],
  position: { x: 50, y: 50 }
});

// Render to a container
const container = document.getElementById('legend-container');
if (container) {
  container.appendChild(triangleLegend.render());
}

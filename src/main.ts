// Import and export all the necessary components from your library
import * as Devize from './index';

// Make the library available globally for testing in the browser
(window as any).Devize = Devize;

// Basic initialization code
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('app');

  if (container) {
    // Create a simple visualization for testing
    const data = [
      { category: 'A', value: 10 },
      { category: 'B', value: 20 },
      { category: 'C', value: 15 },
      { category: 'D', value: 25 },
      { category: 'E', value: 18 }
    ];

    const spec = {
      type: 'barChart',
      data: data,
      x: { field: 'category' },
      y: { field: 'value' },
      title: 'Simple Bar Chart'
    };

    Devize.createBarChart(spec, container);
  }
});

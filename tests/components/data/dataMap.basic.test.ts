import { createViz } from '../../../src/core/devize';
import '../../../src/components/data/dataMap';

describe('DataMap Basic Tests', () => {
  test('dataMap should run without errors', () => {
    const data = [
      { id: 1, name: 'Alice', score: 85 },
      { id: 2, name: 'Bob', score: 92 },
      { id: 3, name: 'Charlie', score: 78 }
    ];

    const result = createViz({
      type: 'dataMap',
      data: data,
      map: (item) => ({
        type: 'rectangle',
        x: item.id * 100,
        y: 0,
        width: item.score,
        height: 20,
        fill: 'blue'
      })
    });

    // Just check that we get a result without errors
    expect(result).toBeDefined();
    console.log('DataMap result type:', typeof result);
    console.log('DataMap result keys:', Object.keys(result));
  });
});

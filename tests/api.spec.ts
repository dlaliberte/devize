import { test, expect } from '@playwright/test';

test('generate API endpoint works', async ({ request }) => {
  const response = await request.post('/api/generate', {
    data: {
      spec: {
        type: 'pointGroup',
        data: [
          { x: 100, y: 100, label: "Point A" },
          { x: 200, y: 150, label: "Point B" }
        ],
        x: { field: 'x' },
        y: { field: 'y' },
        color: '#3366CC'
      }
    }
  });

  expect(response.ok()).toBeTruthy();
  const data = await response.json();
  expect(data.success).toBeTruthy();
  expect(data.code).toBeDefined();
});

test('render API endpoint works', async ({ request }) => {
  const response = await request.post('/api/render', {
    data: {
      spec: {
        type: 'pointGroup',
        data: [
          { x: 100, y: 100, label: "Point A" },
          { x: 200, y: 150, label: "Point B" }
        ],
        x: { field: 'x' },
        y: { field: 'y' },
        color: '#3366CC'
      }
    }
  });

  expect(response.ok()).toBeTruthy();
  const data = await response.json();
  expect(data.success).toBeTruthy();
  expect(data.imageData).toBeDefined();
});

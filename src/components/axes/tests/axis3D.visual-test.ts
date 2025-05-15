import { test, expect } from '@playwright/test';

test('3D Axis renders correctly', async ({ page }) => {
  // Navigate to the test page
  await page.goto('http://localhost:3000/examples/axis3d-test.html');

  // Wait for the visualization to load
  await page.waitForSelector('#chart canvas');

  // Take a screenshot for visual verification
  await page.screenshot({ path: 'test-results/axis3d-rendering.png' });

  // Check if the canvas is visible and has content
  const canvas = await page.locator('#chart canvas');
  await expect(canvas).toBeVisible();

  // Check if the canvas has a reasonable size
  const boundingBox = await canvas.boundingBox();
  expect(boundingBox?.width).toBeGreaterThan(100);
  expect(boundingBox?.height).toBeGreaterThan(100);
});

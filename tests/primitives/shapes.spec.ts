import { test, expect } from '@playwright/test';

test.describe('Primitive Shapes', () => {
  test('rectangle primitive works', async ({ page }) => {
    await page.goto('/examples/simple-rectangle.html');

    // Check if the rectangle was created
    const rect = await page.locator('svg rect');
    await expect(rect).toBeVisible();

    // Check rectangle attributes
    const fill = await rect.getAttribute('fill');
    expect(fill).toBe('steelblue');

    const stroke = await rect.getAttribute('stroke');
    expect(stroke).toBe('black');

    const strokeWidth = await rect.getAttribute('stroke-width');
    expect(strokeWidth).toBe('2');
  });

  // For other shapes, we'll need to create test pages or find examples
  // Let's check if we can find examples in the existing pages

  test('bar chart contains rectangles', async ({ page }) => {
    await page.goto('/examples/bar-chart.html');

    // Check if rectangles were created
    const rects = await page.locator('svg rect').all();
    expect(rects.length).toBeGreaterThan(1);

    // Check attributes of the first rectangle
    const firstRect = await page.locator('svg rect').first();
    const fill = await firstRect.getAttribute('fill');
    expect(fill).not.toBeNull();

    const width = await firstRect.getAttribute('width');
    expect(width).not.toBeNull();

    const height = await firstRect.getAttribute('height');
    expect(height).not.toBeNull();
  });

  test('text elements work', async ({ page }) => {
    await page.goto('/examples/bar-chart.html');

    // Check if text elements were created
    const texts = await page.locator('svg text').all();
    expect(texts.length).toBeGreaterThan(1);

    // Check attributes of a text element
    const firstText = await page.locator('svg text').first();
    const content = await firstText.textContent();
    expect(content).not.toBeNull();
    expect(content?.length).toBeGreaterThan(0);

    const x = await firstText.getAttribute('x');
    expect(x).not.toBeNull();

    const y = await firstText.getAttribute('y');
    expect(y).not.toBeNull();
  });
});

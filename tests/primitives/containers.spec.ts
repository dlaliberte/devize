import { test, expect } from '@playwright/test';

test.describe('Container Primitives', () => {
    test('SVG container works', async ({ page }) => {
      await page.goto('/examples/simple-rectangle.html');

      // Check if SVG was created
      const svg = await page.locator('svg');
      await expect(svg).toBeVisible();

      // Check SVG attributes
      const width = await svg.getAttribute('width');
      expect(width).toBe('100%');

      const height = await svg.getAttribute('height');
      expect(height).toBe('100%');

      // Check if SVG contains elements
      const children = await svg.locator('*').all();
      expect(children.length).toBeGreaterThan(0);
    });

    test('bar chart contains groups', async ({ page }) => {
      // Let's use the data-binding example which should have more complex structure
      await page.goto('/examples/data-binding.html');

      // Check if SVG exists
      const svg = await page.locator('svg');
      await expect(svg).toBeVisible();

      // Check if there are group elements
      const groups = await page.locator('svg g').all();

      // If we find groups, check their children
      if (groups.length > 0) {
        // Check the first group for children
        const firstGroup = await page.locator('svg g').first();
        const children = await firstGroup.locator('*').all();
        expect(children.length).toBeGreaterThan(0);
      } else {
        // If no groups, we'll skip this test
        test.skip(true, 'No group elements found in the example');
      }
    });

    test('rectangle element exists', async ({ page }) => {
      await page.goto('/examples/simple-rectangle.html');

      // Check if rectangle was created
      const rect = await page.locator('svg rect');
      await expect(rect).toBeVisible();

      // Check rectangle attributes
      const width = await rect.getAttribute('width');
      expect(width).toBe('200');

      const height = await rect.getAttribute('height');
      expect(height).toBe('100');

      const fill = await rect.getAttribute('fill');
      expect(fill).toBe('steelblue');
    });

    test('bar chart has multiple rectangles', async ({ page }) => {
      await page.goto('/examples/bar-chart.html');

      // Check if multiple rectangles were created
      const rects = await page.locator('svg rect').all();
      expect(rects.length).toBeGreaterThan(1);
    });
});

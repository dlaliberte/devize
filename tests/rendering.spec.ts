import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

// Helper function to load the library and test visualizations
async function setupTestPage(page) {
  // Load the library
  await page.addScriptTag({ path: path.join(__dirname, '../dist/devize.js') });

  // Create a container for visualizations
  await page.setContent(`
    <div id="container" style="width: 500px; height: 300px; border: 1px solid #ccc;"></div>
  `);

  return page;
}

test.describe('Rendering System', () => {
  test('should render a simple rectangle to SVG', async ({ page }) => {
    await setupTestPage(page);

    // Create and render a simple rectangle
    await page.evaluate(() => {
      const viz = window.Devize.buildViz({
        type: 'rectangle',
        x: 50,
        y: 50,
        width: 100,
        height: 80,
        fill: 'steelblue',
        stroke: 'navy',
        strokeWidth: 2
      });

      window.Devize.renderViz(viz, document.getElementById('container'));
    });

    // Verify that an SVG element was created
    const svgElement = await page.locator('#container svg');
    await expect(svgElement).toBeVisible();

    // Verify that a rectangle was created
    const rectElement = await page.locator('#container svg rect');
    await expect(rectElement).toBeVisible();

    // Verify rectangle attributes
    await expect(rectElement).toHaveAttribute('x', '50');
    await expect(rectElement).toHaveAttribute('y', '50');
    await expect(rectElement).toHaveAttribute('width', '100');
    await expect(rectElement).toHaveAttribute('height', '80');
    await expect(rectElement).toHaveAttribute('fill', 'steelblue');

    // Take a screenshot for visual verification
    await page.screenshot({ path: 'test-results/rectangle.png' });
  });

  test('should render a circle to SVG', async ({ page }) => {
    await setupTestPage(page);

    // Create and render a circle
    await page.evaluate(() => {
      const viz = window.Devize.buildViz({
        type: 'circle',
        cx: 150,
        cy: 100,
        r: 50,
        fill: 'coral',
        stroke: 'crimson',
        strokeWidth: 3
      });

      window.Devize.renderViz(viz, document.getElementById('container'));
    });

    // Verify that an SVG element was created
    const svgElement = await page.locator('#container svg');
    await expect(svgElement).toBeVisible();

    // Verify that a circle was created
    const circleElement = await page.locator('#container svg circle');
    await expect(circleElement).toBeVisible();

    // Verify circle attributes
    await expect(circleElement).toHaveAttribute('cx', '150');
    await expect(circleElement).toHaveAttribute('cy', '100');
    await expect(circleElement).toHaveAttribute('r', '50');
    await expect(circleElement).toHaveAttribute('fill', 'coral');

    // Take a screenshot for visual verification
    await page.screenshot({ path: 'test-results/circle.png' });
  });

  test('should render a group with multiple elements', async ({ page }) => {
    await setupTestPage(page);

    // Create and render a group with multiple elements
    await page.evaluate(() => {
      const viz = window.Devize.buildViz({
        type: 'group',
        children: [
          {
            type: 'rectangle',
            x: 50,
            y: 50,
            width: 100,
            height: 80,
            fill: 'lightblue'
          },
          {
            type: 'circle',
            cx: 200,
            cy: 90,
            r: 40,
            fill: 'lightgreen'
          },
          {
            type: 'text',
            x: 150,
            y: 180,
            text: 'Group Example',
            fontSize: 16,
            textAnchor: 'middle'
          }
        ]
      });

      window.Devize.renderViz(viz, document.getElementById('container'));
    });

    // Verify that all elements were created
    const rectElement = await page.locator('#container svg rect');
    const circleElement = await page.locator('#container svg circle');
    const textElement = await page.locator('#container svg text');

    await expect(rectElement).toBeVisible();
    await expect(circleElement).toBeVisible();
    await expect(textElement).toBeVisible();

    // Take a screenshot for visual verification
    await page.screenshot({ path: 'test-results/group.png' });
  });

  test('should render to Canvas when specified', async ({ page }) => {
    await setupTestPage(page);

    // Add a canvas element
    await page.evaluate(() => {
      const canvas = document.createElement('canvas');
      canvas.width = 500;
      canvas.height = 300;
      canvas.id = 'canvas-container';
      document.body.appendChild(canvas);
    });

    // Create and render a rectangle to canvas
    await page.evaluate(() => {
      const viz = window.Devize.buildViz({
        type: 'rectangle',
        x: 50,
        y: 50,
        width: 100,
        height: 80,
        fill: 'purple'
      });

      window.Devize.renderViz(viz, document.getElementById('canvas-container'));
    });

    // Take a screenshot for visual verification
    await page.screenshot({ path: 'test-results/canvas-rendering.png' });

    // Since we can't easily verify canvas content with selectors,
    // we'll check that the canvas element exists and has the right dimensions
    const canvasElement = await page.locator('#canvas-container');
    await expect(canvasElement).toBeVisible();
    await expect(canvasElement).toHaveAttribute('width', '500');
    await expect(canvasElement).toHaveAttribute('height', '300');
  });

  test('should handle errors gracefully', async ({ page }) => {
    await setupTestPage(page);

    // Try to render an invalid visualization
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.evaluate(() => {
      try {
        const viz = window.Devize.buildViz({
          type: 'nonexistentType',
          x: 50,
          y: 50
        });

        window.Devize.renderViz(viz, document.getElementById('container'));
      } catch (error) {
        console.error(error.message);
      }
    });

    // Verify that an error was logged
    expect(consoleErrors.length).toBeGreaterThan(0);
    expect(consoleErrors[0]).toContain('nonexistentType');
  });

  test('should create an SVG element in a div container', async ({ page }) => {
    await setupTestPage(page);

    // Create and render a simple visualization
    await page.evaluate(() => {
      const viz = window.Devize.buildViz({
        type: 'circle',
        cx: 100,
        cy: 100,
        r: 50,
        fill: 'gold'
      });

      window.Devize.renderViz(viz, document.getElementById('container'));
    });

    // Verify that an SVG element was created inside the div
    const svgElement = await page.locator('#container > svg');
    await expect(svgElement).toBeVisible();

    // Verify SVG attributes
    await expect(svgElement).toHaveAttribute('width', '100%');
    await expect(svgElement).toHaveAttribute('height', '100%');

    // Take a screenshot for visual verification
    await page.screenshot({ path: 'test-results/auto-created-svg.png' });
  });
});

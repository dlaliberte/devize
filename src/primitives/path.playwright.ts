/**
 * Path Primitive Playwright Tests
 *
 * Purpose: Visual testing for path primitive rendering
 * Author: [Author Name]
 * Creation Date: [Date]
 * Last Modified: [Date]
 */

import { test, expect } from '@playwright/test';
import { join } from 'path';

// Test page URL - adjust based on your dev server setup
const TEST_URL = 'http://localhost:5173/tests/visual/primitives/path.html';

test.describe('Path Primitive Visual Tests', () => {
  test('should render path with SVG correctly', async ({ page }) => {
    // Navigate to the test page
    await page.goto(TEST_URL);

    // Wait for the SVG rendering to complete
    await page.waitForSelector('#svg-container svg');

    // Take a screenshot of the SVG container
    const svgScreenshot = await page.locator('#svg-container').screenshot();

    // Compare with the baseline image
    expect(svgScreenshot).toMatchSnapshot('path-svg.png');
  });

  test('should render path with Canvas correctly', async ({ page }) => {
    // Navigate to the test page
    await page.goto(TEST_URL);

    // Wait for the Canvas rendering to complete
    await page.waitForSelector('#canvas-container canvas');

    // Take a screenshot of the Canvas container
    const canvasScreenshot = await page.locator('#canvas-container').screenshot();

    // Compare with the baseline image
    expect(canvasScreenshot).toMatchSnapshot('path-canvas.png');
  });

  test('should render different path styles correctly', async ({ page }) => {
    // Navigate to the test page
    await page.goto(TEST_URL);

    // Wait for the styles container to be ready
    await page.waitForSelector('#styles-container');

    // Take a screenshot of the styles container
    const stylesScreenshot = await page.locator('#styles-container').screenshot();

    // Compare with the baseline image
    expect(stylesScreenshot).toMatchSnapshot('path-styles.png');
  });
});

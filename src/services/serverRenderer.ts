/**
 * Server Renderer Service
 *
 * Purpose: Provides server-side rendering for Devize visualizations
 * Author: Cody
 * Creation Date: 2023-11-17
 */

import { buildViz } from '../core/builder';
import { VisualizationSpec } from '../core/types';
import * as playwright from 'playwright';

export interface RenderOptions {
  width?: number;
  height?: number;
  format?: 'svg' | 'png' | 'jpeg' | 'html';
  quality?: number; // For jpeg format
  backgroundColor?: string;
  scale?: number; // For png/jpeg
}

/**
 * Renders a visualization specification to the specified format
 */
export async function renderVisualization(
  spec: VisualizationSpec,
  options: RenderOptions = {}
): Promise<Buffer | string> {
  // Default options
  const {
    width = 800,
    height = 600,
    format = 'svg',
    quality = 90,
    backgroundColor = 'transparent',
    scale = 1
  } = options;

  // For SVG format, we can potentially render directly without a browser
  if (format === 'svg') {
    return renderToSVGString(spec, width, height);
  }

  // For other formats, use Playwright
  return renderWithPlaywright(spec, {
    width,
    height,
    format,
    quality,
    backgroundColor,
    scale
  });
}

/**
 * Renders a visualization to SVG string directly
 * Note: This is a simplified implementation and may not work for all visualizations
 */
async function renderToSVGString(
  spec: VisualizationSpec,
  width: number,
  height: number
): Promise<string> {
  // Create a virtual DOM environment
  // This would require a DOM implementation like jsdom in Node.js

  // For now, we'll use Playwright for consistency
  return renderWithPlaywright(spec, {
    width,
    height,
    format: 'svg'
  }) as Promise<string>;
}

/**
 * Renders a visualization using Playwright
 */
async function renderWithPlaywright(
  spec: VisualizationSpec,
  options: RenderOptions
): Promise<Buffer | string> {
  const {
    width,
    height,
    format,
    quality,
    backgroundColor,
    scale
  } = options;

  // Launch a browser
  const browser = await playwright.chromium.launch();
  const page = await browser.newPage();

  // Set viewport size
  await page.setViewportSize({ width, height });

  // Create a minimal HTML page with our visualization
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          margin: 0;
          padding: 0;
          background-color: ${backgroundColor};
          width: ${width}px;
          height: ${height}px;
          overflow: hidden;
        }
        #container {
          width: 100%;
          height: 100%;
        }
      </style>
    </head>
    <body>
      <div id="container"></div>
      <script>
        // Inject the Devize library and visualization spec
        window.devizeSpec = ${JSON.stringify(spec)};
      </script>
      <script src="/path/to/devize.js"></script>
      <script>
        // Render the visualization
        const container = document.getElementById('container');
        const viz = devize.buildViz(window.devizeSpec);
        viz.render(container);
      </script>
    </body>
    </html>
  `;

  // Load the HTML
  await page.setContent(html);

  // Wait for visualization to render
  await page.waitForSelector('#container svg');

  let result: Buffer | string;

  // Capture the output in the requested format
  if (format === 'svg') {
    // Extract SVG content
    result = await page.evaluate(() => {
      const svg = document.querySelector('#container svg');
      return svg ? svg.outerHTML : '';
    });
  } else {
    // For image formats
    const screenshotOptions: any = {
      type: format,
      omitBackground: backgroundColor === 'transparent',
      scale
    };

    if (format === 'jpeg') {
      screenshotOptions.quality = quality;
    }

    result = await page.screenshot(screenshotOptions);
  }

  // Close the browser
  await browser.close();

  return result;
}

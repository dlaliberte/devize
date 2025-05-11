/**
 * Rendering Service
 *
 * Purpose: API service for rendering visualizations
 * Author: Cody
 * Creation Date: 2023-11-17
 */

import express from 'express';
import { renderVisualization, RenderOptions } from './serverRenderer';
import { VisualizationSpec } from '../core/types';
import rateLimit from 'express-rate-limit';
import { v4 as uuidv4 } from 'uuid';

// Create Express app
const app = express();
app.use(express.json({ limit: '10mb' }));

// Set up rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all requests
app.use(limiter);

// Simple in-memory cache for rendered visualizations
// In production, use Redis or another distributed cache
const cache: Record<string, {
  data: Buffer | string,
  timestamp: number,
  format: string
}> = {};

// Endpoint for rendering visualizations
app.post('/api/render', async (req, res) => {
  try {
    const { spec, options } = req.body;

    // Validate input
    if (!spec || typeof spec !== 'object') {
      return res.status(400).json({ error: 'Invalid visualization specification' });
    }

    // Generate cache key based on spec and options
    const cacheKey = JSON.stringify({ spec, options });

    // Check cache
    if (cache[cacheKey] && Date.now() - cache[cacheKey].timestamp < 3600000) { // 1 hour cache
      const { data, format } = cache[cacheKey];

      // Set appropriate content type
      setContentType(res, format);

      // Return cached result
      return format === 'svg' ? res.send(data) : res.send(Buffer.from(data as string, 'base64'));
    }

    // Render the visualization
    const result = await renderVisualization(spec as VisualizationSpec, options as RenderOptions);

    // Cache the result
    cache[cacheKey] = {
      data: result,
      timestamp: Date.now(),
      format: options?.format || 'svg'
    };

    // Set appropriate content type
    setContentType(res, options?.format || 'svg');

    // Send the result
    return typeof result === 'string' ? res.send(result) : res.send(result);
  } catch (error) {
    console.error('Rendering error:', error);
    return res.status(500).json({ error: 'Failed to render visualization' });
  }
});

// Endpoint for generating and storing visualizations
app.post('/api/visualizations', async (req, res) => {
  try {
    const { spec, options } = req.body;

    // Validate input
    if (!spec || typeof spec !== 'object') {
      return res.status(400).json({ error: 'Invalid visualization specification' });
    }

    // Generate a unique ID for this visualization
    const id = uuidv4();

    // Render the visualization
    const result = await renderVisualization(spec as VisualizationSpec, options as RenderOptions);

    // Store the result (in a real implementation, this would go to a database)
    cache[id] = {
      data: result,
      timestamp: Date.now(),
      format: options?.format || 'svg'
    };

    // Return the ID and URLs for accessing the visualization
    return res.status(201).json({
      id,
      urls: {
        direct: `/api/visualizations/${id}`,
        embed: `/embed/${id}`,
        thumbnail: `/thumbnails/${id}`
      }
    });
  } catch (error) {
    console.error('Visualization creation error:', error);
    return res.status(500).json({ error: 'Failed to create visualization' });
  }
});

// Endpoint for retrieving stored visualizations
app.get('/api/visualizations/:id', (req, res) => {
  const { id } = req.params;

  // Check if visualization exists
  if (!cache[id]) {
    return res.status(404).json({ error: 'Visualization not found' });
  }

  const { data, format } = cache[id];

  // Set appropriate content type
  setContentType(res, format);

  // Send the visualization
  return typeof data === 'string' ? res.send(data) : res.send(data);
});

// Helper function to set the appropriate content type
function setContentType(res: express.Response, format: string) {
  switch (format) {
    case 'svg':
      res.setHeader('Content-Type', 'image/svg+xml');
      break;
    case 'png':
      res.setHeader('Content-Type', 'image/png');
      break;
    case 'jpeg':
      res.setHeader('Content-Type', 'image/jpeg');
      break;
    case 'html':
      res.setHeader('Content-Type', 'text/html');
      break;
    default:
      res.setHeader('Content-Type', 'application/octet-stream');
  }
}

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Rendering service running on port ${PORT}`);
});

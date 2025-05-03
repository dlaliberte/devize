import Fastify from 'fastify';
import FastifyStatic from '@fastify/static';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create Fastify instance
const fastify = Fastify({
  logger: true
});

// Start the server
const start = async () => {
  try {
    // Serve static files from the client directory
    await fastify.register(FastifyStatic, {
      root: join(__dirname, '../client'),
      prefix: '/',
      decorateReply: false
    });

    // API endpoint to get examples metadata
    fastify.get('/api/examples', async (request, reply) => {
      const examples = await getExampleMetadata();
      return examples;
    });

    // API routes for code generation and server-side rendering
    fastify.post('/api/generate', {
      schema: {
        body: {
          type: 'object',
          required: ['spec'],
          properties: {
            spec: { type: 'object' }
          }
        }
      }
    }, async (request, reply) => {
      const { spec } = request.body as { spec: any };
      // TODO: Generate visualization code from spec
      return { success: true, code: '// Generated code will go here' };
    });

    fastify.post('/api/render', {
      schema: {
        body: {
          type: 'object',
          required: ['spec'],
          properties: {
            spec: { type: 'object' }
          }
        }
      }
    }, async (request, reply) => {
      const { spec } = request.body as { spec: any };
      // TODO: Server-side rendering logic
      return { success: true, imageData: 'base64-encoded-image' };
    });

    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    console.log(`Server is running at http://localhost:3000`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

// Helper function to get example metadata
async function getExampleMetadata() {
  const examplesDir = join(__dirname, '../client/examples');
  const examples = [];

  // Read all HTML files in the examples directory
  const files = fs.readdirSync(examplesDir).filter(file => file.endsWith('.html') && file !== 'index.html');

  for (const file of files) {
    const filePath = join(examplesDir, file);
    const content = fs.readFileSync(filePath, 'utf8');

    // Extract title and description using simple regex
    const titleMatch = content.match(/<title>(.*?)<\/title>/);
    const title = titleMatch ? titleMatch[1].replace('Devize - ', '') : file.replace('.html', '');

    // Try to find a description in a paragraph
    const descMatch = content.match(/<p>(.*?)<\/p>/);
    const description = descMatch ? descMatch[1] : '';

    examples.push({
      id: file.replace('.html', ''),
      title,
      description,
      url: `/examples/${file}`
    });
  }

  return examples;
}

start();

// Simple HTTP server implementation without express
import http from 'http';
import { LinearTransformation } from '../transformations/linearTransformation';
import { LogTransformation } from '../transformations/logTransformation';
import { DiscreteTransformation } from '../transformations/discreteTransformation';

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/transform') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const { type, data, params } = JSON.parse(body);

        let result;
        switch (type) {
          case 'linear':
            // Use params or default values for slope and intercept
            const slope = params?.slope || 1;
            const intercept = params?.intercept || 0;
            const linearTransformation = new LinearTransformation(slope, intercept);
            result = linearTransformation.transform(data);
            break;
          case 'log':
            // Use params or default value for base
            const base = params?.base || Math.E;
            const logTransformation = new LogTransformation(base);
            result = logTransformation.transform(data);
            break;
          case 'discrete':
            // Create a transformation map from params or use an empty map
            const transformationMap = new Map(params?.mappings || []);
            const discreteTransformation = new DiscreteTransformation(transformationMap);
            result = discreteTransformation.transform(data);
            break;
          default:
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Invalid transformation type' }));
            return;
        }

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ result }));
      } catch (error) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: 'Invalid request' }));
      }
    });
  } else {
    res.statusCode = 404;
    res.end();
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

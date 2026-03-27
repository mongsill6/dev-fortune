import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const definition = {
  openapi: '3.0.3',
  info: {
    title: 'Dev Fortune API',
    version: '1.0.0',
    description:
      'REST API for developer fortune cookies — inspirational, humorous, and motivational quotes for software engineers.',
    license: { name: 'MIT' },
  },
  servers: [{ url: 'http://localhost:3000', description: 'Local development server' }],
  tags: [
    { name: 'Quotes', description: 'Quote retrieval and management' },
    { name: 'Categories', description: 'Category metadata' },
  ],
  components: {
    schemas: {
      Quote: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'Zero-based index within the dataset', example: 0 },
          quote: { type: 'string', example: 'The only way to go fast is to go well.' },
          by: { type: 'string', example: 'Robert C. Martin' },
          category: {
            type: 'string',
            enum: ['debugging', 'architecture', 'teamwork', 'motivation', 'humor'],
            example: 'debugging',
          },
        },
        required: ['id', 'quote', 'by', 'category'],
      },
      NewQuote: {
        type: 'object',
        properties: {
          quote: { type: 'string', example: 'Code is read more often than it is written.' },
          by: { type: 'string', example: 'Guido van Rossum' },
          category: {
            type: 'string',
            enum: ['debugging', 'architecture', 'teamwork', 'motivation', 'humor'],
            example: 'motivation',
          },
        },
        required: ['quote', 'by', 'category'],
      },
      Category: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'debugging' },
          name: { type: 'string', example: 'Debugging' },
          emoji: { type: 'string', example: '🐛' },
          description: { type: 'string', example: 'Quotes about debugging, troubleshooting, and finding bugs' },
        },
        required: ['id', 'name', 'description'],
      },
      QuoteList: {
        type: 'object',
        properties: {
          data: { type: 'array', items: { $ref: '#/components/schemas/Quote' } },
          pagination: {
            type: 'object',
            properties: {
              page: { type: 'integer' },
              limit: { type: 'integer' },
              total: { type: 'integer' },
              totalPages: { type: 'integer' },
              hasNext: { type: 'boolean' },
              hasPrev: { type: 'boolean' },
            },
          },
        },
      },
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string' },
          message: { type: 'string' },
        },
        required: ['error'],
      },
    },
    responses: {
      BadRequest: {
        description: 'Invalid request parameters',
        content: {
          'application/json': { schema: { $ref: '#/components/schemas/Error' } },
        },
      },
      NotFound: {
        description: 'Resource not found',
        content: {
          'application/json': { schema: { $ref: '#/components/schemas/Error' } },
        },
      },
      TooManyRequests: {
        description: 'Rate limit exceeded',
        headers: {
          'Retry-After': { schema: { type: 'integer' }, description: 'Seconds until the rate limit resets' },
        },
        content: {
          'application/json': { schema: { $ref: '#/components/schemas/Error' } },
        },
      },
    },
  },
};

const options = {
  definition,
  // Pick up @swagger JSDoc annotations from the routes directory
  apis: ['./server/routes/*.js'],
};

const spec = swaggerJsdoc(options);

/**
 * Mount Swagger UI and the JSON spec onto the Express app.
 *
 * @param {import('express').Application} app
 */
export function setupSwagger(app) {
  app.get('/api/docs/spec.json', (_req, res) => res.json(spec));
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(spec, { explorer: true }));
}

// MultipleFiles/swagger.js
const swaggerJSDoc = require('swagger-jsdoc');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Finance App API',
      version: '1.0.0',
      description: 'API quản lý tài chính cá nhân',
      contact: {
        name: 'Your Name',
        email: 'your.email@example.com',
        url: 'https://your-website.com',
      },
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' ? 'https://api.your-domain.com/api/v1' : `http://localhost:${process.env.PORT || 5000}/api/v1`,
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT Bearer token **_only_**',
        },
      },
      schemas: {
        // Define common schemas here if needed, e.g., ErrorResponse
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Error message' },
            error: { type: 'string', example: 'Detailed error (dev only)' },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  // Đường dẫn đến các file chứa JSDoc comments
  apis: ['./routes/*.js', './app.js'], // Đảm bảo đường dẫn đúng
};

module.exports = swaggerJSDoc(swaggerOptions);

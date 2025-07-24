const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Finance Management API',
      version: '2.0.0',
      description: 'API for personal finance management application',
      contact: {
        name: 'API Support',
        email: 'support@financeapp.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000/api/v1', // Thêm /api/v1 prefix
        description: 'Development server'
      },
      {
        url: 'https://api.financeapp.com/api/v1',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token'
        }
      },
      schemas: {
        // User schemas
        User: {
          type: 'object',
          required: ['email', 'name'],
          properties: {
            _id: { 
              type: 'string',
              description: 'User ID',
              example: '507f1f77bcf86cd799439011'
            },
            email: { 
              type: 'string', 
              format: 'email',
              description: 'User email address',
              example: 'user@example.com'
            },
            name: { 
              type: 'string',
              description: 'User full name',
              example: 'John Doe'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation date'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update date'
            }
          }
        },

        // Transaction schemas
        Transaction: {
          type: 'object',
          required: ['amount', 'type', 'category', 'date'],
          properties: {
            _id: { 
              type: 'string',
              description: 'Transaction ID',
              example: '507f1f77bcf86cd799439011'
            },
            userId: {
              type: 'string',
              description: 'User ID who owns this transaction'
            },
            amount: { 
              type: 'number',
              minimum: 0.01,
              description: 'Transaction amount',
              example: 50000
            },
            type: { 
              type: 'string', 
              enum: ['income', 'expense'],
              description: 'Transaction type'
            },
            category: { 
              type: 'string',
              description: 'Transaction category',
              example: 'food'
            },
            subcategory: {
              type: 'string',
              description: 'Transaction subcategory',
              example: 'restaurant'
            },
            description: { 
              type: 'string',
              description: 'Transaction description',
              example: 'Lunch at restaurant'
            },
            note: {
              type: 'string',
              description: 'Additional notes'
            },
            date: { 
              type: 'string', 
              format: 'date-time',
              description: 'Transaction date'
            },
            tags: {
              type: 'array',
              items: { type: 'string' },
              description: 'Transaction tags'
            },
            paymentMethod: {
              type: 'string',
              enum: ['cash', 'card', 'bank_transfer', 'e_wallet', 'other'],
              description: 'Payment method used'
            },
            currency: {
              type: 'string',
              enum: ['VND', 'USD', 'EUR'],
              default: 'VND',
              description: 'Transaction currency'
            },
            location: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                address: { type: 'string' },
                coordinates: {
                  type: 'object',
                  properties: {
                    lat: { type: 'number' },
                    lng: { type: 'number' }
                  }
                }
              }
            },
            status: {
              type: 'string',
              enum: ['pending', 'completed', 'cancelled'],
              default: 'completed'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },

        // Request/Response schemas
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com'
            },
            password: {
              type: 'string',
              minLength: 6,
              example: 'password123'
            }
          }
        },

        RegisterRequest: {
          type: 'object',
          required: ['email', 'password', 'name'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com'
            },
            password: {
              type: 'string',
              minLength: 6,
              example: 'password123'
            },
            name: {
              type: 'string',
              example: 'John Doe'
            }
          }
        },

        CreateTransactionRequest: {
          type: 'object',
          required: ['amount', 'type', 'category'],
          properties: {
            amount: {
              type: 'number',
              minimum: 0.01,
              example: 50000
            },
            type: {
              type: 'string',
              enum: ['income', 'expense']
            },
            category: {
              type: 'string',
              example: 'food'
            },
            subcategory: {
              type: 'string',
              example: 'restaurant'
            },
            description: {
              type: 'string',
              example: 'Lunch at restaurant'
            },
            note: {
              type: 'string'
            },
            date: {
              type: 'string',
              format: 'date-time'
            },
            paymentMethod: {
              type: 'string',
              enum: ['cash', 'card', 'bank_transfer', 'e_wallet', 'other'],
              default: 'cash'
            },
            tags: {
              type: 'array',
              items: { type: 'string' }
            }
          }
        },

        // Response schemas
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Operation successful'
            },
            data: {
              type: 'object',
              description: 'Response data'
            }
          }
        },

        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Error message'
            },
            error: {
              type: 'string',
              description: 'Detailed error information'
            }
          }
        },

        // Report schemas
        MonthlyReport: {
          type: 'object',
          properties: {
            month: { type: 'number', example: 12 },
            year: { type: 'number', example: 2024 },
            totalIncome: { type: 'number', example: 5000000 },
            totalExpense: { type: 'number', example: 3000000 },
            balance: { type: 'number', example: 2000000 },
            transactionCount: { type: 'number', example: 45 },
            categoryBreakdown: {
              type: 'object',
              additionalProperties: {
                type: 'object',
                properties: {
                  total: { type: 'number' },
                  count: { type: 'number' }
                }
              }
            }
          }
        }
      },

      // Common parameters
      parameters: {
        PageParam: {
          name: 'page',
          in: 'query',
          description: 'Page number',
          schema: {
            type: 'integer',
            minimum: 1,
            default: 1
          }
        },
        LimitParam: {
          name: 'limit',
          in: 'query',
          description: 'Number of items per page',
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 10
          }
        },
        TransactionIdParam: {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Transaction ID',
          schema: {
            type: 'string'
          }
        }
      },

      // Common responses
      responses: {
        UnauthorizedError: {
          description: 'Authentication required',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        ValidationError: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        }
      }
    },
    
    // Global security
    security: [
      {
        bearerAuth: []
      }
    ],

    // Tags for grouping
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication endpoints'
      },
      {
        name: 'Transactions',
        description: 'Transaction management endpoints'
      },
      {
        name: 'Reports',
        description: 'Financial reports and analytics'
      },
      {
        name: 'Bank Integration',
        description: 'Bank API integration endpoints'
      },
      {
        name: 'Health',
        description: 'System health check endpoints'
      }
    ]
  },
  apis: [
    './routes/*.js',
    './routes/auth.js',
    './routes/transactions.js',
    './routes/reports.js',
    './routes/bankApi.js',
    './models/*.js',
    './app.js'
  ]
};

const specs = swaggerJsdoc(options);

// Debug logging
console.log('Swagger spec generated with paths:', Object.keys(specs.paths || {}));

module.exports = { specs };

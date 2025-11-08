// config/swagger.mjs
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Restaurant Management System API',
      version: '1.0.0',
      description: 'A complete backend system for restaurant operations including order processing, menu management, table reservations, and inventory tracking.',
      contact: {
        name: 'Samuel Gondwe',
        email: 'samuelgondwe741@gmail.com'
      },
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://codealpha-restaurant-management-system-1.onrender.com//api' 
          : 'http://localhost:3001/api',
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
      },
    ],
    tags: [
      { name: 'Menu Items', description: 'Menu items management' }, 
      { name: 'Tables', description: 'Table management' },
      { name: 'Reservations', description: 'Reservation system' },
      { name: 'Orders', description: 'Order processing endpoints' },
      { name: 'Inventory', description: 'Inventory management' }
    ],
  },
  apis: ['./routes.mjs', './controllers/*.mjs'], // paths to files containing OpenAPI definitions
};

const swaggerSpec = swaggerJSDoc(options);

const swaggerDocs = (app) => {
  // Swagger page
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Docs in JSON format
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

};

export default swaggerDocs;
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { connect } = require('./config/mongo');

// Import route factories from each module. Each module exports a
// function that accepts an Express app and attaches its routes under
// a specific path. Keeping this import list at the top makes it
// obvious which modules belong to the API and simplifies wiring.
const patientsRoutes = require('./modules/patients');
const providersRoutes = require('./modules/providers');
const appointmentsRoutes = require('./modules/appointments');
const encountersRoutes = require('./modules/encounters');
const prescriptionsRoutes = require('./modules/prescriptions');
const labsRoutes = require('./modules/labs');
const vitalsRoutes = require('./modules/vitals');
const inventoryRoutes = require('./modules/inventory');
const billingRoutes = require('./modules/billing');
const reportsRoutes = require('./modules/reports');

async function bootstrap() {
  // Connect to MongoDB. In a test environment this will simply log
  // a message since no database is running. In production this
  // establishes a single connection reused throughout the app.
  try {
    await connect();
  } catch (err) {
    console.warn('Warning: failed to connect to MongoDB. Continuing without a DB.', err.message);
  }

  const app = express();
  app.use(express.json());
  app.use(cors());
  app.use(helmet());

  // Swagger definition. This object describes your API and points
  // swagger-jsdoc at the files where it can discover JSDoc
  // annotations for endpoints. Each module file includes detailed
  // comments describing its routes.
  const swaggerDefinition = {
    openapi: '3.0.3',
    info: {
      title: 'Healthcare API',
      version: '1.0.0',
      description: 'A modular monolithic API for healthcare scenarios. Built with Express and MongoDB.'
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ],
  };

  const swaggerSpec = swaggerJsdoc({
    definition: swaggerDefinition,
    apis: [
      './src/modules/patients.js',
      './src/modules/providers.js',
      './src/modules/appointments.js',
      './src/modules/encounters.js',
      './src/modules/prescriptions.js',
      './src/modules/labs.js',
      './src/modules/vitals.js',
      './src/modules/inventory.js',
      './src/modules/billing.js',
      './src/modules/reports.js',
    ],
  });

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Mount each module under its own path. The order of mounting
  // determines the evaluation order. Modules return Express routers.
  app.use('/patients', patientsRoutes);
  app.use('/providers', providersRoutes);
  app.use('/appointments', appointmentsRoutes);
  app.use('/encounters', encountersRoutes);
  app.use('/prescriptions', prescriptionsRoutes);
  app.use('/labs', labsRoutes);
  app.use('/vitals', vitalsRoutes);
  app.use('/inventory', inventoryRoutes);
  app.use('/billing', billingRoutes);
  app.use('/reports', reportsRoutes);

  // Generic 404 handler for unmatched routes.
  app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
  });

  const port = process.env.PORT || 3000;

  // Start the server only when this file is executed directly.
  if (require.main === module) {
    app.listen(port, () => {
      console.log(`API listening on port ${port}`);
    });
  }

  // Export the app for serverless or testing environments
  module.exports = app;
}

// Execute the bootstrap function when the file is loaded. In
// environments like tests this could be conditionally executed.
bootstrap();
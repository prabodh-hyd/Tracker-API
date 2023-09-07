const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'Tracker API',
        version: '1.0.0',
        description: 'API for the Tracker application',
    },
    externalDocs: {
        description: 'swagger.json',
        url: '/swagger.json'
    },
};

const options = {
    swaggerDefinition,
    apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;




'use strict';

import * as cors from "cors";
import * as http from "http";
import * as swaggerTools from "swagger-tools";
import * as jsyaml from "js-yaml";
import * as fs from "fs";
import * as morgan from 'morgan';
import express = require('express');
let app = express();

let serverPort = 8080;

// swaggerRouter configuration
let options = {
    swaggerUi: '/swagger.json',
    controllers: './dist/controllers',
    useStubs: process.env.NODE_ENV === 'development' // Conditionally turn on stubs (mock mode)
};
app.use(cors());

// The Swagger document (require it, build it programmatically, fetch it from a URL, ...)
let spec = fs.readFileSync('./api/swagger.yaml', 'utf8');
let swaggerDoc = jsyaml.safeLoad(spec);

// Initialize the Swagger middleware
swaggerTools.initializeMiddleware(swaggerDoc, function (middleware) {
    //logger
    app.use(morgan('common'));

    // Interpret Swagger resources and attach metadata to request - must be first in swagger-tools middleware chain
    app.use(middleware.swaggerMetadata());

    // Validate Swagger requests
    app.use(middleware.swaggerValidator());


    // Route validated requests to appropriate controller
    app.use(middleware.swaggerRouter(options));

    // Serve the Swagger documents and Swagger UI
    app.use(middleware.swaggerUi());

    //global error handling to catch all remaining errors
    app.use((err, req, res, next) => {
        if(!err) return next();
        res.status(500).send(JSON.stringify({code: 500, message: err}));
    });

    // Start the server
    http.createServer(app).listen(serverPort, '0.0.0.0', function () {
        console.log('Your server is listening on port %d (http://localhost:%d)', serverPort, serverPort);
        console.log('Swagger-ui is available on http://localhost:%d/docs', serverPort);
    });
});

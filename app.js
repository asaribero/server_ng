const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');

// Middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());


// Rutas de Usuario
const userRoute = require('./api/routes/user');
app.use('/user', userRoute);

// Rutas de Proyectos
const projectsRoute = require('./api/routes/projects');
app.use('/projects', projectsRoute);

// Rutas de categorios proyectos
const categoriasRoute = require('./api/routes/categorias');
app.use('/categorias', categoriasRoute);

module.exports = app;

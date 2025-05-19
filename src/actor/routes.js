import express from 'express';
import * as actorController from './actor.controller.js';

const actorRoutes = express.Router();


// POST /api/actores/actor
actorRoutes.post('/actor', actorController.handleInsertActorRequest);

// GET /api/actores/actores
actorRoutes.get('/actores', actorController.handleGetActoresRequest);

// GET /api/actores/actor/:id
actorRoutes.get('/actor/:id', actorController.handleGetActorByIdRequest);

// GET /api/actores/actor/:pelicula
actorRoutes.get('/actor/pelicula/:pelicula', actorController.handleGetActoresByPeliculaIdRequest);


export default actorRoutes;
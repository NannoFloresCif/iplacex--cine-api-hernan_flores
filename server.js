import express from 'express';
import cors from 'cors';
import { client, conectarAtlas } from './src/common/db.js';
import peliculaRoutes from './src/pelicula/routes.js';
import actorRoutes from './src/actor/routes.js';

const PORTS = 3000 || 4000;
const app = express();


// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get('/', (req, res) => {
    res.status(200).json({ mensaje: "Bienvenido al cine Iplacex" });
});

app.use('/api/peliculas', peliculaRoutes);
app.use('/api/actores', actorRoutes);

// Función para iniciar el servidor.
const iniciarServidor = async () => {
    try {

        await conectarAtlas();

        app.listen(PORTS, () => {
            console.log(`Servidor corriendo en el puerto http://localhost:${PORTS}`);
        })
    } catch (error) {
        console.error('Error al iniciar el servidor:', error);
        process.exit(1); // Salimos de la aplicación si no podemos conectar a la BD.
    }
}

// Llamar a la función para iniciar el servidor
iniciarServidor();


export default app;
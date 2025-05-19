import { client } from "../common/db.js";
import { ObjectId } from "mongodb";

const DATABASE_NAME = "cine-db";
const COLLECTION_NAME = "peliculas";

const peliculaCollection = client.db(DATABASE_NAME).collection(COLLECTION_NAME);

// Agregar una pelicula a la base de datos
export const handleInsertPeliculaRequest = async (req, res) => {
  try {
    const { nombre, generos, anioEstreno } = req.body;

    if (!nombre || !generos || !anioEstreno) {
      return res.status(400).json({ error: "Faltan campos por completar" });
    }
    if (!Array.isArray(generos) || typeof anioEstreno !== "number") {
      return res.status(400).json({ error: "Tipos de datos incorrectos." });
    }

    const nuevaPelicula = {
      nombre,
      generos,
      anioEstreno,
    };
    await peliculaCollection
      .insertOne(nuevaPelicula)
      .then((resultado) => {
        if (resultado.insertedId) {
          res.status(201).json({
            mensaje: "Pelicula creada correctamente",
            peliculaId: resultado.insertedId,
            datos: nuevaPelicula,
          });
        } else {
          res.status(400).json({ mensaje: "Error al crear la pelicula" });
        }
      })
      .catch((dbError) => {
        console.error("Error al insertar la pelicula:", dbError);
        res.status(500).json({
          mensaje: "Error al guardar la pelicula en la base de datos",
        });
      });
  } catch (errorGeneral) {
    console.error("Error en handleInsertPeliculaRequest:", errorGeneral);
    res.status(500).json({ mensaje: "Error del servidor" });
  }
};

// Obtener todos los registros de peliculas en la base de datos
export const handleGetPeliculasRequest = async (req, res) => {
  try {
    await peliculaCollection
      .find({})
      .toArray()
      .then((peliculas) => {
        res.status(200).json(peliculas);
      })
      .catch((dbError) => {
        console.error("Error al obtener las peliculas:", dbError);
        res.status(500).json({
          error: "Error: no fue posible obtener el listado de peliculas",
        });
      });
  } catch (errorGeneral) {
    console.error("Error en handleGetPeliculasRequest:", errorGeneral);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

// Obtener una pelicula por ID
export const handleGetPeliculaByIdRequest = async (req, res) => {
  try {
    const idPelicula = req.params.id;
    if (!ObjectId.isValid(idPelicula)) {
      return res
        .status(400)
        .json({ error: "ID de película mal formado o no válido." });
    }
    const objectIdPelicula = new ObjectId(idPelicula);

    
    await peliculaCollection
      .findOne({ _id: objectIdPelicula })
      .then((pelicula) => {
        if (pelicula) {
          res.status(200).json(pelicula); 
        } else {
          res.status(404).json({ error: "Película no encontrada." }); 
        }
      })
      .catch((dbError) => {
        console.error("Error al obtener película por ID de MongoDB:", dbError);
        res
          .status(500)
          .json({ error: "Error interno del servidor al buscar la película." });
      });
  } catch (errorGeneral) {
    
    console.error("Error en handleGetPeliculaByIdRequest:", errorGeneral);
    
    if (
      errorGeneral.message &&
      errorGeneral.message.includes(
        "Argument passed in must be a single String"
      )
    ) {
      return res
        .status(400)
        .json({ error: "ID de película mal formado (error en conversión)." });
    }
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

// Actualiza un registro por ID
export const handleUpdatePeliculaByIdRequest = async (req, res) => {
  try {
    const idPelicula = req.params.id;
    const datosParaActualizar = req.body;

    if (!ObjectId.isValid(idPelicula)) {
      return res
        .status(400)
        .json({ error: "ID de película mal formado o no válido." });
    }
    if (Object.keys(datosParaActualizar).length === 0) {
      return res
        .status(400)
        .json({ error: "No se proporcionaron datos para actualizar." });
    }

    const objectIdPelicula = new ObjectId(idPelicula);
    const updateQuery = { $set: datosParaActualizar }; 

    // Usamos la constante peliculaCollection
    await peliculaCollection
      .updateOne({ _id: objectIdPelicula }, updateQuery)
      .then((resultado) => {
        if (resultado.matchedCount === 0) {
          return res
            .status(404)
            .json({ error: "Película no encontrada para actualizar." }); 
        }
        if (resultado.modifiedCount === 0 && resultado.matchedCount > 0) {
          return res
            .status(200)
            .json({
              mensaje:
                "Película encontrada, pero no se realizaron cambios (datos idénticos).",
              _id: objectIdPelicula,
            });
        }
        res.status(200).json({
          
          mensaje: "Película actualizada exitosamente.",
          _id: objectIdPelicula,
          
        });
      })
      .catch((dbError) => {
        console.error("Error al actualizar película en MongoDB:", dbError);
        res
          .status(500)
          .json({
            error: "Error interno del servidor al actualizar la película.",
          });
      });
  } catch (errorGeneral) {
    console.error("Error en handleUpdatePeliculaByIdRequest:", errorGeneral);
    if (
      errorGeneral.message &&
      errorGeneral.message.includes(
        "Argument passed in must be a single String"
      )
    ) {
      return res
        .status(400)
        .json({ error: "ID de película mal formado (error en conversión)." });
    }
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

// Eliminar un registro por ID
export const handleDeletePeliculaByIdRequest = async (req, res) => {
  try {
    const idPelicula = req.params.id;

    if (!ObjectId.isValid(idPelicula)) {
      return res
        .status(400)
        .json({ error: "ID de película mal formado o no válido." });
    }
    const objectIdPelicula = new ObjectId(idPelicula);

    
    await peliculaCollection
      .deleteOne({ _id: objectIdPelicula })
      .then((resultado) => {
        if (resultado.deletedCount === 1) {
          res
            .status(200)
            .json({
              mensaje: "Película eliminada exitosamente.",
              _id: objectIdPelicula,
            }); 
          
        } else {
          res
            .status(404)
            .json({ error: "Película no encontrada para eliminar." }); 
        }
      })
      .catch((dbError) => {
        console.error("Error al eliminar película de MongoDB:", dbError);
        res
          .status(500)
          .json({
            error: "Error interno del servidor al eliminar la película.",
          });
      });
  } catch (errorGeneral) {
    console.error("Error en handleDeletePeliculaByIdRequest:", errorGeneral);
    if (
      errorGeneral.message &&
      errorGeneral.message.includes(
        "Argument passed in must be a single String"
      )
    ) {
      return res
        .status(400)
        .json({ error: "ID de película mal formado (error en conversión)." });
    }
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

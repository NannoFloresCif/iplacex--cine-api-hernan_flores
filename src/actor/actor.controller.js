import { client } from '../common/db.js';
import { ObjectId } from 'mongodb';

const NOMBRE_DATABASE = 'cine-db';
const ACTOR_COLLECTION_NOMBRE = 'actores';
const PELICULA_COLLECTION_NOMBRE = 'peliculas';
const actorCollection = client.db(NOMBRE_DATABASE).collection(ACTOR_COLLECTION_NOMBRE);
const peliculaCollection = client.db(NOMBRE_DATABASE).collection(PELICULA_COLLECTION_NOMBRE);

// Agregar un actor valida que la película exista.

export const handleInsertActorRequest = async (req, res) => {  
  try {    
    const { nombrePelicula, nombre, edad, estaRetirado, premios } = req.body;    
    if (!nombrePelicula || !nombre || edad === undefined || estaRetirado === undefined) {      
      return res.status(400).json({ error: "Faltan completar campos requeridos" });    
    }    
    if (typeof edad !== 'number' || typeof estaRetirado !== 'boolean' || (premios && !Array.isArray(premios))) {      
      return res.status(400).json({ error: "Tipos de datos ingresados no validos" });    
    }
    
    let peliculaExistente;    
    
    await peliculaCollection.findOne({ nombre: nombrePelicula })
    .then(pelicula => {peliculaExistente = pelicula;      })
    .catch(dbError => {console.error("Error al buscar película por nombre para validación de actor:", dbError);
      throw new Error("Error interno al validar la película para el actor.");});    
      
      if (!peliculaExistente) {
        return res.status(404).json({ error: `Película con nombre "${nombrePelicula}" no encontrada. No se puede agregar el actor.` });
      }        
      
      const nuevoActor = {
        idPelicula: peliculaExistente._id,      
        nombre,      
        edad,      
        estaRetirado,      
        premios: premios || []    };    
        
        await actorCollection.insertOne(nuevoActor)      
        .then(resultado => {        
          if (resultado.insertedId) {          
            res.status(201).json({            
              mensaje: "Actor agregado exitosamente.",            
              actorId: resultado.insertedId,            
              peliculaAsociadaId: nuevoActor.idPelicula,            
              datos: nuevoActor          
            });        
          } else {          
            res.status(400).json({ error: "No se pudo agregar el actor." });        
          }      
        })      
        .catch(dbError => {        
          console.error("Error al insertar actor en MongoDB:", dbError);        
          res.status(500).json({ error: "Error interno del servidor al guardar el actor." });      
        });  
      } catch (errorGeneral) {    
        console.error("Error en handleInsertActorRequest:", errorGeneral);    
        if (errorGeneral.message === "Error interno al validar la película para el actor.") {      
          return res.status(500).json({ error: "Fallo al verificar la película asociada." });    
        }    
        res.status(500).json({ error: "Error interno del servidor procesando la petición del actor." });  
      }};


//Obtiene todos los registros de actores.
export const handleGetActoresRequest = async (req, res) => {
  try {
    await actorCollection.find({}).toArray()
      .then(actores => {
        res.status(200).json(actores);
      })
      .catch(dbError => {
        console.error("Error al obtener actores de MongoDB:", dbError);
        res.status(500).json({ error: "Error interno del servidor al obtener los actores." });
      });
  } catch (errorGeneral) {
    console.error("Error en handleGetActoresRequest:", errorGeneral);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

//Obtiener un actor en base a su id.
export const handleGetActorByIdRequest = async (req, res) => {  
  try {    
    const idActor = req.params.id;    
    if (!ObjectId.isValid(idActor)) {      
      return res.status(400).json({ error: "ID de actor mal formado o no válido." });    
    }    
    const objectIdActor = new ObjectId(idActor);    
    await actorCollection.findOne({ _id: objectIdActor })      
    .then(actor => {        if (actor) {          
      res.status(200).json(actor);        
    } else {          
      res.status(404).json({ error: "Actor no encontrado." });        
    }      
  })      
  .catch(dbError => {        
    console.error("Error al obtener actor por ID de MongoDB:", dbError);        
    res.status(500).json({ error: "Error interno del servidor al buscar el actor." });      
  });  
} catch (errorGeneral) {    
  console.error("Error en handleGetActorByIdRequest:", errorGeneral);    
  if (errorGeneral.message && errorGeneral.message.includes("Argument passed in must be a single String")) {      
    return res.status(400).json({ error: "ID de actor mal formado (error en conversión)." });    
  }    
  res.status(500).json({ error: "Error interno del servidor." });  
}};





//Obtiener los actores de una película en base al id de la película.
export const handleGetActoresByPeliculaIdRequest = async (req, res) => {
  try {
    const idPelicula = req.params.pelicula;
    if (!ObjectId.isValid(idPelicula)) {
      return res
        .status(400)
        .json({
          error: "ID de película mal formado o no válido para buscar actores.",
        });
    }
    const objectIdPelicula = new ObjectId(idPelicula);
    await actorCollection
      .find({ idPelicula: objectIdPelicula })
      .toArray()
      .then((actores) => {
        res.status(200).json(actores);
      })
      .catch((dbError) => {
        console.error(
          "Error al obtener actores por ID de película de MongoDB:",
          dbError
        );
        res
          .status(500)
          .json({
            error:
              "Error interno del servidor al buscar actores de la película.",
          });
      });
  } catch (errorGeneral) {
    console.error(
      "Error en handleGetActoresByPeliculaIdRequest:",
      errorGeneral
    );
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
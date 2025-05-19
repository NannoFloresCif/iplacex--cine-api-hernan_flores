import { MongoClient, ServerApiVersion } from 'mongodb';


const MONGO_URI = "mongodb+srv://eva3_express:N27KytAWKI9GQXI4@cluster-express.wdj0xvv.mongodb.net/?retryWrites=true&w=majority&appName=cluster-express"

const client = new MongoClient(MONGO_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Encapsular la Conexión a la base de datos de MongoDB Atlas
async function conectarAtlas() {
  try {

    await client.connect();

    await client.db("admin").command({ ping: 1 });
    console.log("Conexión a MongoDB Atlas correctamente");
  } catch (error) {

    console.error("Error al conectar con MongoDB Atlas:", error);

    throw error;
  }
}

export { client, conectarAtlas };
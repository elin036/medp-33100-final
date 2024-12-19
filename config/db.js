const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.url;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  autoSelectFamily: false
});

async function connectToDatabase() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    const db = client.db("memories"); 
    return db;
  } catch (error) {
    console.error("Error connecting to the database:", error);
    throw error; 
  }
}

module.exports = connectToDatabase;
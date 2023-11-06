// Import the MongoDB client
const { MongoClient } = require('mongodb');

// Connection URL
const url = 'mongodb://127.0.0.1:27017';
// Replace the above URL with your MongoDB URI if it's different

// Database Name
const dbName = 'gameLobbyDB'; // Replace with the name of the database you want to delete

// Create a new MongoClient
const client = new MongoClient(url);

async function deleteDatabase() {
  try {
    // Use connect method to connect to the server
    await client.connect();
    console.log('Connected successfully to server');

    // Get reference to the database
    const db = client.db(dbName);

    // Delete the database
    await db.dropDatabase();
    console.log(`Database ${dbName} deleted successfully`);
  } catch (err) {
    console.error('An error occurred:', err);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

// Run the deleteDatabase function
deleteDatabase();

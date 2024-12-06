const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors())
app.use(express.json())

// MongoDB Connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ixbaqca.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // Database Collection
    const booksCollection = client.db('StoryStacks').collection('books')

    // Insert a New Book
    app.post("/upload-book", async(req, res) => {
        const data = req.body;
        const result = await booksCollection.insertOne(data);
        res.send(result);
    })

    // Update Book Data
    app.patch('/book/:id', async(req, res) => {
        const id = req.params.id;
        const bookData = req.body;
        const filter = { _id: new ObjectId(id) };
        const options = { upsert: true };
        const updateBookData = {
            $set: {
                ...bookData
            }
        }
        const result = await booksCollection.updateOne(filter, updateBookData, options);
        res.send(result);
    })

    // Delete Book
    app.delete('/book/:id', async(req, res) => {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const result = await booksCollection.deleteOne(filter);
        res.send(result);
    })

    // Find By Category
    app.get('/all-books', async(req, res) => {
        let query = {};
        if(req.query?.category){
            query = {category: req.query.category}
        }
        const result = await booksCollection.find(query).toArray();
        res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// Server APIs
app.get('/', (req, res) => {
    res.send("Story Stacks server is running")
})
app.listen(port, () => {
    console.log(`This server is running on port: ${port}`);
})
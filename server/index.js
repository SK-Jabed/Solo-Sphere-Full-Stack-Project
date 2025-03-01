const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const port = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.baizo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
})

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    // Collections on DataBase
    const jobsCollection = client.db("soloSphereDB").collection("jobs");

    // Save a Job Data in DB (POST Operation)
    app.post("/add-job", async (req, res) => {
      const jobData = req.body;
      const addedJob = await jobsCollection.insertOne(jobData);
      res.send(addedJob);
    });

    // Get All Jobs Data from DB (GET Operation)
    app.get("/jobs", async (req, res) => {
      const result = await jobsCollection.find().toArray();
      res.send(result);
    });

    // Get All Jobs Posted by a Specific User
    app.get("/jobs/:email", async (req, res) => {
      const email = req.params.email;
      const query = { "buyer.email": email };
      const postedJobs = await jobsCollection.find(query).toArray();
      res.send(postedJobs);
    });

    // Get a Single Job Data by Id from DB
    app.get("/job/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const singleJob = await jobsCollection.findOne(query);
      res.send(singleJob);
    });

    // Update a Job Data in DB (PUT Operation)
    app.put("/update-job/:id", async (req, res) => {
      const jobData = req.body;
      const id = req.params.id;
      const updatedDoc = {
        $set: jobData,
      }
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true }
      const updatedJob = await jobsCollection.updateOne(query, updatedDoc, options);
      res.send(updatedJob);
    });

    // Delete a Job from DB (DELETE Operation)
    app.delete("/job/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const deletedJob = await jobsCollection.deleteOne(query);
      res.send(deletedJob);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir)


app.get('/', (req, res) => {
  res.send('Hello from SoloSphere Server...');
})

app.listen(port, () => console.log(`Server running on port ${port}`))
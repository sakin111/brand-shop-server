const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;



if (!process.env.BS_brand || !process.env.BS_pass) {
  console.error('Missing environment variables. Check your .env file.');
  process.exit(1); 
}

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.BS_brand}:${process.env.BS_pass}@cluster0.ubtwufv.mongodb.net/brandDB?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function connectToMongoDB() {
  try {
    await client.connect();
    console.log('MongoDB is running');

    const brandCollection = client.db('brandDB').collection('brandedShop');

    app.get('/brand', async (req, res) => {
      try {
        const cursor = brandCollection.find();
        const result = await cursor.toArray();
        res.json(result); 
      } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ error: "Error fetching data" }); 
      }
    });

   
    app.post('/brand', async (req, res) => {
      const brand = req.body;
      console.log(brand);
      try {
        // Validate and sanitize 'brand' data here if needed
        const result = await brandCollection.insertOne(brand);
        res.status(201).json({ _id: result.insertedId }); // Send the inserted ID as JSON
      } catch (error) {
        console.error("Error inserting data:", error);
        res.status(500).json({ error: "Error inserting data" }); // Send error as JSON
      }
    });

    



    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

app.get('/', (req, res) => {
  res.send("The server is running on port " + port);
});

// Start the server after connecting to MongoDB
connectToMongoDB().then(() => {
  app.listen(port, () => {
    console.log(`The server is ready to go on port ${port}`);
  });
});

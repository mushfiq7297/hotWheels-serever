const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

console.log(process.env.DB_PASS);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.em0grxr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const productCollection = client.db("hotWheels").collection("products");

    // Implementing pagination in the /products route
    app.get("/products", async (req, res) => {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 9;
      const skip = (page - 1) * limit;
      const searchQuery = req.query.search || '';
      const brandName = req.query.brandName || '';
      const category = req.query.category || '';
      const minPrice = parseFloat(req.query.minPrice) || 0;
      const maxPrice = parseFloat(req.query.maxPrice) || Number.MAX_VALUE;
      const sortBy = req.query.sortBy || 'dateAdded'; // Default to dateAdded
      const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1; // Default to descending
  
      let query = {};
      if (searchQuery) {
          query.productName = { $regex: searchQuery, $options: 'i' };
      }
      if (brandName) {
          query.brandName = brandName;
      }
      if (category) {
          query.category = category;
      }
      if (minPrice || maxPrice) {
          query.price = { $gte: minPrice, $lte: maxPrice };
      }
  
      const totalProducts = await productCollection.countDocuments(query);
      const totalPages = Math.ceil(totalProducts / limit);
  
      const products = await productCollection.find(query)
          .sort({ [sortBy]: sortOrder })
          .skip(skip)
          .limit(limit)
          .toArray();
  
      res.send({
          products,
          currentPage: page,
          totalPages,
      });
  });
  
  

    // Connect the client to the server (optional starting in v4.7)
    await client.connect();

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("my website server is running");
});

app.listen(port, () => {
  console.log(`Car server is running on port: ${port}`);
});

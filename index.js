const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const uri =
  "mongodb+srv://food:68mPPW7TD0xfU5UZ@duasmasi.bhtinpf.mongodb.net/?appName=Duasmasi";

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
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection

    //Database
    const db = client.db("food-db");
    const foodCollection = db.collection("foods");

    //To show Home Page
    app.get("/foods-home", async (req, res) => {
      const result = await foodCollection
        .find({ food_status: "Available" })
        .sort({ quantity: -1 })
        .limit(6)
        .toArray();
      res.send(result);
    });

    // To Show Available Foods
    app.get("/foods", async (req, res) => {
      const result = await foodCollection
        .find({ food_status: "Available" })
        .toArray();

      res.send(result);
    });
    // To Show Food Details
    app.get("/food-details/:id", async (req, res) => {
      const { id } = req.params;
      const objectId = new ObjectId(id);

      const result = await foodCollection.findOne({ _id: objectId });

      res.send(result);
    });

    // To Show That types of foods What are managed by User

    app.get("/manage-foods", async (req, res) => {
      const email = req.query.email;
      const result = await foodCollection
        .find({
          donatorEmail: email,
        })
        .toArray();
      res.send(result);
    });

    // To Add food in server
    app.post("/add-food", async (req, res) => {
      console.log("Hittng the Users Post APi");
      const newFood = req.body;
      console.log("User Info", newFood);
      newFood.quantity = Number(newFood.quantity);
      const result = await foodCollection.insertOne(newFood);
      res.send(result);
    });

    //Update Food API

    app.put("/update-food/:id", async(req, res) =>{
      const id = req.params.id;
      const data = req.body;
      const query = {_id: new ObjectId(id)};
      const UpdateFood = {
        $set: data
      };
      const result = await foodCollection.updateOne(query, UpdateFood);
      res.send(result);
    });
    
    // Deteel Food APi

    app.delete("/delete-food", async (req , res)=>{
      const {id} = req.query;
      const query = {_id: new ObjectId(id)};
      const result = await foodCollection.deleteOne(query);
      res.send(result);
    })

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server Working!");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

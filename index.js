require('dotenv').config();
const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express()
const port = process.env.PORT || 3000

//middleware//
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fu1n5ti.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

app.get('/', (req, res) => {
    res.send('GarmentOps is running')
})

async function run() {
    try {
        await client.connect();

        const garmentOpsDB = client.db('garmentOps')
        const userCollection = garmentOpsDB.collection('users')


        // POST user
        app.post("/users", async (req, res) => {
            const user = req.body;
            if (!user.email) {
                return res.status(400).send({ message: "Email is required" });
            }
            // Check if user already exists
            const existingUser = await userCollection.findOne({ email: user.email });
            if (existingUser) {
                return res.status(409).send({ message: "User already exists" });
            }
            // Insert new user
            const result = await userCollection.insertOne({
                ...user,
                status: "pending",
                createdAt: new Date(),
            });
            res.send(result);
        });

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {

    }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

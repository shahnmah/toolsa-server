const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


// connection uri
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster2.ic3nj.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
  try {
    await client.connect();
    const toolCollection = client.db('toolCollection').collection('tools');
    const reviewCollection = client.db('reviewCollection').collection('reviews');
    const purchaseCollection = client.db('purchaseCollection').collection('purchases');
    const userCollection = client.db('userCollection').collection('users');

    // get api for load all tools
    app.get('/tool', async (req, res) => {
      const query = {};
      const cursor = toolCollection.find(query);
      const tools = await cursor.toArray();
      res.send(tools);
    });

    // 
    app.put('/user/:email', async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      res.send(result)
    })

    // get api for load all reviews
    app.get('/review', async (req, res) => {
      const query = {};
      const cursor = reviewCollection.find(query);
      const reviews = await cursor.toArray();
      res.send(reviews);
    });

    //   load tool data using id
    app.get('/buyNow/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) }
      const tool = await toolCollection.findOne(query)
      res.send(tool)
    })
    // add review api
    app.post('/addreview', async (req, res) => {
      const data = req.body;
      const newReview = await reviewCollection.insertOne(data)
      res.send(newReview)
    })

    // post api for add purchase

    app.post('/purchase', async (req, res) => {
      const purchase = req.body;
      const result = await purchaseCollection.insertOne(purchase);
      res.send(result);
    });


    // api for update using id
    app.patch('/buyNow/:id', async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      const filter = { _id: ObjectId(id) };
      const updateDoc = {
        $set: {
          available: data.available
        },
      };
      const result = await toolCollection.updateOne(filter, updateDoc);
      res.send(result)
    })

    // load data for specific user using email
    app.get('/purchase', async (req, res) => {
      const email = req.query.email;
      const query = { email: email }
      const purchaseItems = await purchaseCollection.find(query).toArray();
      res.send(purchaseItems)
    })

    // *********
    // delete order api using id
    app.delete('/purchase/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const deleteItem = await purchaseCollection.deleteOne(query);
      res.send(deleteItem)
    })

    // add product api 
    app.post('/addproduct', async (req, res) => {
      const data = req.body;
      const newProduct = await toolCollection.insertOne(data)
      res.send(newProduct)
    });
  }
  finally {

  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Okay with toolsa')
})

app.listen(port, () => {
  console.log(`Toolsa ${port}`)
})
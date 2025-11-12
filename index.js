const express = require('express');
require('dotenv').config();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({origin: ["http://localhost:5173"],credentials: true,}));
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ielazur.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});



async function run() {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db('skillbay_db');
    const usersCollection = db.collection('users');
    const applicationCollection = db.collection('applications');


    // app.get('/users', async (req, res) => {
    //   const users = await usersCollection.find().toArray();
    //   res.send(users);
    // });


    app.get('/', (req, res) => {
      res.send('Server is running properly 🚀');
    });

app.get("/users", async (req, res) => {
  try {
    // const email = req.query.email;
    const query = {  };
    if (req?.query.email){
      query.userEmail=req.query.email
    }
    console.log(query)
    const jobs = await usersCollection.find(query).toArray();
    res.send(jobs);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Failed to fetch jobs" });
  }
});


    app.get('/users/:id', async (req, res) => {
  //  try {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  console.log('query', query)
  const result = await usersCollection.findOne(query);
 
    if (!result) {
      return res.status(404).send({ message: "Job not found" });
    }

    res.send(result);
  // } catch (error) {
    // res.status(500).send({ message: 'Error fetching job', error });
  // }
});

 


// ✅ Delete one job by ID
app.delete("/users/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await usersCollection.deleteOne(query);
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Failed to delete job" });
  }
});

// ✅ Update job info

app.put("/users/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const updatedData = req.body;

    
    delete updatedData._id;

    const query = { _id: new ObjectId(id) };
    const updateDoc = {
      $set: updatedData,
    };

    const result = await usersCollection.updateOne(query, updateDoc);
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Failed to update user" });
  }
});



app.post('/users', async (req, res) => {
  try {
    const newUser = req.body;
    const { email } = req.body;
    newUser.postedDate = new Date();
    // Check for existing user
    const existingUser = await usersCollection.findOne({ userEmail: email});
    console.log(existingUser)
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists' 
      });
    }
    
    const result = await usersCollection.insertOne(newUser);
    res.status(201).json({ 
      success: true, 
      message: 'User created successfully', 
      result 
    });
    
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create user' 
    });
  }
});



app.post('/applications', async (req, res) => {
  try {
    const application = req.body; // form data from frontend
    const result = await applicationCollection.insertOne(application);
    res.status(201).send(result);
  } catch (error) {
    console.error('Error saving application:', error);
    res.status(500).send({ message: 'Failed to save application' });
  }
});


app.get("/applications", async (req, res) => {
  try {
    const applications = await applicationCollection.find().toArray();
    res.send(applications);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Failed to fetch applications" });
  }
});

// ✅ Delete application by id
app.delete("/applications/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const result = await applicationCollection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 1) {
      res.send({ success: true });
    } else {
      res.status(404).send({ message: "Application not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Failed to delete" });
  }
});



 } catch (err) {
    console.error(err);
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
});

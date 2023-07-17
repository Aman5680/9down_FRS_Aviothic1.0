const express = require('express');
const session = require('express-session');


const app = express();
const port = 3000;

const bodyParser = require('body-parser');

app.use(express.static('public'));
app.set('view engine', 'ejs');

// Parse incoming request bodies with JSON payloads
app.use(bodyParser.json());

// Parse incoming request bodies with URL-encoded payloads
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: '5Rlqop7HnZZ7fT0pjDiXF0F60SRZDEQ7sanjay',
  resave: false,
  saveUninitialized: true
}));


const { MongoClient, ObjectId } = require('mongodb');
// or as an es module:
// import { MongoClient } from 'mongodb'

// Connection URL
const url = 'mongodb+srv://220159:220159password@cluster0.0ipredr.mongodb.net/?retryWrites=true&w=majority';
const client = new MongoClient(url);

// Database Name
const dbName = 'FRS';

async function main() {
  // Use connect method to connect to the server
  await client.connect();
  console.log('Connected successfully to server');
  const db = client.db(dbName);
  //const collection = db.collection('students');

  // const findResult = await collection.find({}).toArray();
  // console.log(findResult);

  return 'done.';
}

main()
  .then(console.log)
  .catch(console.error)





// Define routes
app.get('/', (req, res) => {
  res.send("Welcome to FRS Web Application !");
});

app.get('/home', (req, res)=>{
  res.render('home', {session: req.session});
});

app.get('/register', (req, res)=>{
  res.render('register');
});


app.post('/register', async (req, res) =>{

  const db = client.db(dbName);
  const collection = db.collection('students');

  const { username, email, password, cpassword} = req.body;

  if(password != cpassword)
    return res.send("Password and Confirm Password did not matched !");

  data = await collection.findOne({"username" : username});   console.log(data);

  if(data)
    return res.send("You have already registered !");

  const insertResult = await collection.insertOne({ 
    "username": username, 
    "email": email,
    "password": password
  });

  console.log('Inserted documents =>', insertResult);

  // req.session._id = data._id;
  // req.session.username = data.username;

  // res.redirect('feedback');
  
     res.send("Registered Successfully !");

});


app.get('/login', (req, res)=>{

  if(req.session._id)
    return res.redirect('feedback');

  res.render('login');

});


app.post('/login', async (req, res) =>{

  const { username, password } = req.body;

  const db = client.db(dbName);
  const collection = db.collection('students');
  data = await collection.findOne({"username" : username});   console.log(data);

  if(data)
  {
    if(data.password == password)
    {
      req.session._id = data._id;
      req.session.username = data.username;

      res.redirect('feedback');
    }
    else{
      res.send("Your Username or Password is Incorrect !");
    }
  }else{
    res.send("Your Username or Password is Incorrect !");
  }
});



app.get('/reviews', async (req, res)=>{

  const db = client.db(dbName);
  const faccollection = db.collection('faculties');
  const faculties = await faccollection.find({}).toArray();

  const revcollection = db.collection('reviews');
  const reviews = await revcollection.find({}).toArray();

  // const temp = await faccollection.aggregate([{
  //   $lookup :
  //   {
  //     from: "reviews",
  //     localField: "_id",
  //     foreignField: "faculty_id",
  //     as : "COMMON "
  //   } 
  // }]).toArray();
  // console.log(temp);

  faculties.forEach(function(f){
    let rating = 0;
    let review_count = 0;
    let rate5 = 0;

    reviews.forEach(function(r){
        const fObjId = Object(f._id);
        const rObjFacId = Object(r.faculty_id);
        
        if(fObjId.equals(rObjFacId))
        {
          review_count++;
          rating += parseInt(r.rating);
        }
      })
    
    // rating
    rate5 = rating ? rating / (review_count * 5) * 5 : 0;
    f.rating = parseInt(rate5);
  });

  //res.sendStatus(200);
  res.render('reviews', {faculties, reviews, session: req.session});
});

app.get('/feedback', async (req, res)=>{
  const _id = req.session._id;
  const username = req.session.username;

  if(!username)
  {
    return res.redirect("/login");
  }
  const db = client.db(dbName);
  const collection = db.collection('faculties');
  const faculties = await collection.find({}).toArray();

  res.render('feedback', {_id, username, faculties, session: req.session});
});

app.post('/giveFeedback', async (req, res) =>{
  const s_id = req.session._id;
  const { f_id, feedback_text, rating } = req.body;

  const db = client.db(dbName);
  const collection = db.collection('reviews');
  
  const rev = await collection.findOne({"faculty_id" : f_id, "student_id": s_id});

  if(rev)
    return res.send("You already reviewed the faculty !");

  const fac = await collection.insertOne(
    { 
      "student_id": new ObjectId(s_id), 
      "faculty_id": new ObjectId(f_id),
      "rating": parseInt(rating),
      "feedback": feedback_text.trim()
  });


  res.send("Feedback Successfully sent!")

});

app.get('/logout', (req, res) => {
  // Destroy the session
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      res.sendStatus(500);
      return;
    }

    // Redirect to the login page or any other page
    res.redirect('/login');
  });
});

app.get('/about', (req,res)=>{
res.render('about');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

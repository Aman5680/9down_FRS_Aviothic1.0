const express = require('express');
const session = require('express-session');
const Connect = require('./db/mongoConnection');
const Student = require('./models/Student');
const Faculty = require('./models/Faculty');
const Review = require('./models/Review');
const checkLogin = require('./middleware/checkLogin');

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use(session({
  secret: '5Rlqop7HnZZ7fT0pjDiXF0F60SRZDEQ7sanjay',
  resave: false,
  saveUninitialized: true
}));


// Connect Monogodb
Connect()


// Define routes
app.get('/', (req, res) => {
  res.send("Welcome to FRS Web Application !");
});

app.get('/home', (req, res) => {
  res.render('home', { session: req.session });
});

app.get('/register', (req, res) => {
  res.render('register');
});


app.post('/register', async (req, res) => {

  const { username, email, password, cpassword } = req.body;

  if (password != cpassword)
    return res.send("Password and Confirm Password did not matched !");

  data = await Student.findOne({ "username": username });

  if (data)
    return res.send("You have already registered !");

  const student = new Student({
    "username": username,
    "email": email,
    "password": password
  });

  student.save();

  console.log('Inserted documents =>', student);

  // req.session._id = data._id;
  // req.session.username = data.username;

  // res.redirect('feedback');

  res.send("Registered Successfully !");

});


// Test data added to database
app.get('/add', async (req, res) => {

  try {
    await Faculty.create([
      { name: "Ahinandan Shukla", department: "MCA", position: "Assitant Professor" },
      { name: "Ajeet Singh", department: "MCA", position: "Assitant Professor" },
      { name: "Neha Patel", department: "MCA", position: "Assitant Professor" }
    ]);

    console.log("Faculty Added");
    res.send("OK");

  } catch (error) {
    console.log("Something went wrong:", error);
  }
});


app.get('/login', (req, res) => {

  if (req.session._id)
    return res.redirect('feedback');

  res.render('login');

});


app.post('/login', async (req, res) => {

  const { username, password } = req.body;

  data = await Student.findOne({ "username": username });

  if (data) {
    if (data.password == password) {
      req.session._id = data._id;
      req.session.username = data.username;

      res.redirect('feedback');
    }
    else {
      res.send("Your Username or Password is Incorrect !");
    }
  } else {
    res.send("Your Username or Password is Incorrect !");
  }
});



app.get('/reviews', async (req, res) => {

  const faculties = await Faculty.find();
  const reviews = await Review.find();

  faculties.forEach(function (f) {
    let rating = 0;
    let review_count = 0;
    let rate5 = 0;

    reviews.forEach(function (r) {
      const fObjId = Object(f._id);
      const rObjFacId = Object(r.faculty);

      if (fObjId.equals(rObjFacId)) {
        review_count++;
        rating += parseInt(r.rating);
      }
    })

    // rating
    rate5 = rating ? rating / (review_count * 5) * 5 : 0;
    f.rating = parseInt(rate5);
  });

  res.render('reviews', { faculties, reviews, session: req.session });
});

app.get('/feedback', checkLogin, async (req, res) => {

  const _id = req.session._id;
  const username = req.session.username;
  
  const faculties = await Faculty.find();

  res.render('feedback', { _id, username, faculties, session: req.session });
});


app.post('/giveFeedback', async (req, res) => {
  const s_id = req.session._id;
  const { f_id, feedback_text, rating } = req.body;

  const existingReview = await Review.findOne({ "faculty": f_id, "student": s_id });

  if (existingReview)
    return res.send("You already reviewed the faculty !");

  try {
    const newReview = await Review(
      {
        "student": s_id,
        "faculty": f_id,
        "rating": parseInt(rating),
        "feedback": feedback_text.trim()
      });
  
    newReview.save();
  
    res.send("Feedback Successfully sent!")
  } catch (error) {
    res.send(error);
  }
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


app.get('/about', (req, res) => {
  res.render('about');
});


// Start the server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

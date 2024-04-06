const express = require('express');
const session = require('express-session');
const Connect = require('./db/mongoConnection');
const Student = require('./models/Student');
const Faculty = require('./models/Faculty');
const Review = require('./models/Review');
const checkLogin = require('./middleware/checkLogin');

const passport =require("passport")
require('./passport');

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

app.use(passport.initialize());
app.use(passport.session());


// Connect Monogodb
Connect()


// Auth route

app.get("/auth/google/success", async (req, res) => {
  // console.log(req.user)

  const email = req.user.email;

  data = await Student.findOne({ email });

  if (data)
  {
    console.log("Student Details fetched from database")
    req.session._id = data._id;
    req.session.username = data.username;
  }else{
    console.log("New Student Registered!")
    const student = new Student({
      "username": req.user.email,
      "email": req.user.email,
      "password": ""
    });
  
    await student.save();

    req.session._id = student._id;
    req.session.username = student.username;

  }

  res.redirect('/feedback');
})


app.get('/auth/google',
  passport.authenticate('google', {
          scope: ['email', 'profile'],
          prompt: ['select_account']
      }
  ));

app.get( '/auth/google/callback',
    passport.authenticate( 'google', {
        successRedirect: '/auth/google/success',
        failureRedirect: '/login'
}));


// Define routes
app.get('/', (req, res) => {
  res.redirect("/home");
});


app.get('/home', (req, res) => {
  res.render('home', { session: req.session });
});


app.get('/register', (req, res) => {
  res.render('register', {error: null });
});


app.get('/services', (req, res) => {
  res.render('services');
});


app.get('/contact', (req, res) => {
  res.render('contact');
});


app.get('/team', (req, res) => {
  res.render('team');
});

app.get('/facultyreview', (req, res) => {
  res.render('facultyreview');
});


app.post('/register', async (req, res) => {

  const { username, email, password } = req.body;

  // if (password != cpassword)
  //   return res.send("Password and Confirm Password did not matched !");

  data = await Student.findOne({ email });

  if (data)
    return res.render("register", { error: "You have already registered !"});

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

  res.render('login', {error: null });

});


app.post('/login', async (req, res) => {

  // const { username, password } = req.body;
  const { email, password } = req.body;
  console.log(req.body);
  data = await Student.findOne({ "email": email });

  if (data) {
    if (data.password == password) {
      req.session._id = data._id;
      req.session.username = data.username;

      res.redirect('feedback');
    }
    else {
      // res.send("Your Username or Password is Incorrect !");
      return res.render("login", { error: "Your Username or Password is Incorrect !"})
    }
  } else {
    return res.render("login", { error: "Your Username or Password is Incorrect !"})
  }
});



app.get('/reviews', async (req, res) => {

  const faculties = await Faculty.find();
  res.render('reviews', { faculties, session: req.session });
  
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

  if(!feedback_text) return res.send("Please fill feedback text!")
  if(!rating) return res.send("Please provide rating!")

  // Find review of the student for the faculty
  const existingReview = await Review.findOne({ "faculty": f_id, "student": s_id });

  // Return because he already reviewed the faculty
  if (existingReview)
    return res.send("You already reviewed the faculty !");

  try {
    // Make new Review
    const newReview = await Review(
      {
        "student": s_id,
        "faculty": f_id,
        "rating": parseInt(rating),
        "feedback": feedback_text.trim()
      });
    
    // Update faculty rating and increment the total review count
    const facultyData = await Faculty.findOne({_id: f_id});
    facultyData.totalRating += parseInt(rating);
    facultyData.totalReviews =  facultyData.totalReviews + 1; 
  
    // Save the changes
    newReview.save();
    facultyData.save();

    res.send("Feedback Successfully sent!")
  } catch (error) {
    res.send(error);
  }
});


app.get('/logout', (req, res) => {

    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
        return res.sendStatus(500); 
      } 
        res.redirect('/login');
      });
});



app.get('/about', (req, res) => {
  res.render('about');
});


// Handle Errors

// Error handling middleware for all errors, including 404 (page not found)
app.use((req, res, next) => {
  const error = new Error('Page Not Found');
  error.status = 404;
  next(error);
});

// Custom error handler middleware
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send(err.message || 'Internal Server Error');
  // Or render a specific error page:
  // res.render('error', { error: err }); // Assuming you have an 'error.ejs' or similar file
});



// Start the server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

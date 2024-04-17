const express = require('express');
const session = require('express-session');
const Connect = require('./db/mongoConnection');
const Student = require('./models/Student');
const Faculty = require('./models/Faculty');
const Review = require('./models/Review');
const checkLogin = require('./middleware/checkLogin');

const passport =require("passport")
require('./auth/google-auth');
require('./auth/local-auth');
const flash = require('connect-flash');

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
app.use(flash());

// Connect Monogodb
Connect()


// Auth route



app.get('/auth/google',
  passport.authenticate('google', {
          scope: ['email', 'profile'],
          prompt: ['select_account']
      }
  ));

app.get( '/auth/google/callback',
    passport.authenticate( 'google', {
        successRedirect: '/feedback',
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

  existingUser = await Student.findOne({ email });

  if (existingUser)
    return res.render("register", { error: "You have already registered !"});

  const student = await Student.createUser(username, email, password);

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

  if (req.user)
    return res.redirect('feedback');

  res.render('login', { error: req.flash('error') });

});


app.post('/login', passport.authenticate('local', {
  successRedirect: '/feedback',
  failureRedirect: '/login',
  failureFlash: true
}));



app.get('/reviews', async (req, res) => {

  const faculties = await Faculty.find();
  res.render('reviews', { faculties, user: req.user });
  
});

app.get('/feedback', isAuthenticated, async (req, res) => {

  const _id = req.user._id;
  const username = req.user.username;
  
  const faculties = await Faculty.find();

  res.render('feedback', { _id, username, faculties, user: req.user });
});


app.post('/giveFeedback', async (req, res) => {


  const s_id = req.user._id;
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
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/login');
  });
});


function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
      return next();
  }
  res.redirect('/login');
}


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

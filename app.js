const express = require('express');
const app = express();
const port = 3000;

app.use(express.static('public'));
app.set('view engine', 'ejs');


// Define routes
app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/home', (req, res)=>{
  res.render('home');
});

app.get('/register', (req, res)=>{
  res.render('register');
});

app.get('/login', (req, res)=>{
  res.render('login');
});

app.get('/reviews', (req, res)=>{
  res.render('reviews');
});



// Start the server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

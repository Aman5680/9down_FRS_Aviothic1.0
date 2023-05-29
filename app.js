const express = require('express');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');


// Define routes
app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/home', (req, res)=>{
  res.render('home');
});
// Start the server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

const mongoose = require('mongoose');


const dbURI = `mongodb+srv://220159:220159password@cluster0.0ipredr.mongodb.net/frs_app?retryWrites=true&w=majority`;


async function Connect() {

    try{
        await mongoose.connect(dbURI);
        console.log("Connected to mongodb frs_app database!")
    }
    catch(err)
    {
        console.log("Database error: ",err);
    }
}

module.exports = Connect;
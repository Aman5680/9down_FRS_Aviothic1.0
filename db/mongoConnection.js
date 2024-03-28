require('dotenv').config();
const mongoose = require('mongoose');


const dbURI = process.env.MONGO_DBURL


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
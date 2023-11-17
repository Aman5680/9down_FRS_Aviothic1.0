const mongoose = require('mongoose');


const dbURI = `mongodb+srv://220159:220159password@cluster0.0ipredr.mongodb.net/frs_app?retryWrites=true&w=majority`;


async function Connect() {
    await mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true });

    const db = mongoose.connection;

    db.on('connected', () => {
        console.log(`Connected to frs_app database`);
    });

    db.on('error', (err) => {
        console.error(`Connection error: ${err}`);
    });
}

module.exports = Connect;
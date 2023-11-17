const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema({
    name: String,
    department: String
},{ timestamps: true });


const Faculty = mongoose.model('Faculty', facultySchema);

module.exports = Faculty;
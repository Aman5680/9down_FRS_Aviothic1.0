const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema({
    name: String,
    department: String,
    position: String,
    totalRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 } 
},{ timestamps: true });


const Faculty = mongoose.model('Faculty', facultySchema);

module.exports = Faculty;
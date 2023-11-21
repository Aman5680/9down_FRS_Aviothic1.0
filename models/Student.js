const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String

},{ timestamps: true });


// Create a model based on the schema
const Student = mongoose.model('Student', studentSchema);

// Export the model
module.exports = Student;
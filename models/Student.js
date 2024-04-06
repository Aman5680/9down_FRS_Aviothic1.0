const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const studentSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String

},{ timestamps: true });


studentSchema.statics.createUser = async function(username, email, password) {
    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
    const newUser = new this({ username, email, password: hashedPassword });
    return newUser.save();
};


studentSchema.statics.findByEmail = function(username) {
    return this.findOne({ email: username });
};

studentSchema.methods.verifyPassword = function(password) {
    return bcrypt.compare(password, this.password);
};

// Create a model based on the schema
const Student = mongoose.model('Student', studentSchema);

// Export the model
module.exports = Student;
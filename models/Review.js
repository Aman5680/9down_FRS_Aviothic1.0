const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    faculty: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty',
        required: true,
      },
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
      },
      rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
      },
      feedback: {
        type: String,
        required: true,
      },

},{ timestamps: true });


// Create a model based on the schema
const Review = mongoose.model('Review', reviewSchema);

// Export the model
module.exports = Review;
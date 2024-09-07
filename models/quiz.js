const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
  createdBy: {
    type: mongoose.Schema.Types.ObjectId, 
    required: true, 
  }, 
  quizName: {
    type: String,
    required: true,
    unique: true,
  },
  questions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
    },
  ],
  createAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Quiz", quizSchema);

const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
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
  maxScore: {
    type: Number,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  totalQuestion: {
    type: Number,
    required: true,
  },
  difficulty: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Quiz", quizSchema);

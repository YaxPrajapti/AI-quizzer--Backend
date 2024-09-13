const mongoose = require("mongoose");
const submissionSchema = new mongoose.Schema({
  quizId: {
    type: String,
    ref: "Quiz",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  attempt: {
    type: Number,
    default: 1,
  },
  completedDate: {
    type: Date,
    default: Date.now(),
  },
  suggestions: [
    {
      type: String,
      required: true,
    },
  ],
});

module.exports = mongoose.model("Submission", submissionSchema);

const { default: mongoose } = require("mongoose");
const groqService = require("../services/groqService");
const utility = require("../utility/quizUtility");
const Question = require("../models/question");
const Quiz = require("../models/quiz");

module.exports.newQuiz = async (req, res, next) => {
  const { qiuzDetails, quizName } = req.body;
  const user = req.user;
  try {
    const isExist = await Quiz.findOne({ quizName: quizName });
    if (isExist) {
      return res
        .status(409)
        .send({ message: "Quiz with this name already exists." });
    }
  } catch (error) {
    return res
      .status(500)
      .send({ message: "Error checking for existing quiz." });
  }
  try {
    const quizString = await groqService.generateNewQuiz(qiuzDetails);
    const quiz = utility.extractQuizJSON(quizString);
    const mongoSession = await mongoose.startSession();
    mongoSession.startTransaction();
    let questionIds = [];
    for (const que of quiz) {
      const new_question = new Question({
        question: que.question,
        options: que.options,
        answer: que.answer,
      });
      const savedQuestion = await new_question.save();
      questionIds.push(savedQuestion._id);
    }
    const new_quiz = new Quiz({
      createdBy: user._id,
      quizName: quizName,
      questions: questionIds,
    });
    const saved_quiz = await new_quiz.save();
    await mongoSession.commitTransaction();
    mongoSession.endSession();
    return res
      .status(200)
      .send({ message: "Quiz generated successfully", quiz: saved_quiz });
  } catch (error) {
    return res
      .status(500)
      .send({ message: "Error occured while generating quiz" });
  }
};

const { default: mongoose, mongo } = require("mongoose");
const groqService = require("../services/groqService");
const utility = require("../utility/quizUtility");
const Question = require("../models/question");
const Quiz = require("../models/quiz");
const Submission = require("../models/submission");
const emailService = require("../services/emailService");

module.exports.newQuiz = async (req, res, next) => {
  const { qiuzDetails, quizName } = req.body;
  console.log(req.body);
  const user = req.user;
  try {
    const isExist = await Quiz.findOne({ quizName: quizName });
    if (isExist) {
      return res
        .status(409)
        .send({ message: "Quiz with this name already exists." });
    }
  } catch (error) {
    return res.status(500).send({
      message: "Error checking for existing quiz.",
      error: error.message,
    });
  }
  try {
    const quizString = await groqService.generateNewQuiz(qiuzDetails);
    const quiz = utility.extractQuizJSON(quizString);
    console.log(quiz);
    const mongoSession = await mongoose.startSession();
    mongoSession.startTransaction();
    let questionIds = [];
    for (const que of quiz) {
      const new_question = new Question({
        question: que.question,
        options: que.options,
        answer: que.answer,
        hint: que.hint,
      });
      const savedQuestion = await new_question.save();
      // console.log(savedQuestion);
      questionIds.push(savedQuestion._id);
    }
    const new_quiz = new Quiz({
      createdBy: user._id,
      quizName: quizName,
      questions: questionIds,
      maxScore: qiuzDetails.maxScore,
      subject: qiuzDetails.subject,
      totalQuestion: qiuzDetails.totalQuestions,
      difficulty: qiuzDetails.difficulty,
    });
    console.log("new_quiz: ", new_quiz);
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

module.exports.submitQuiz = async (req, res, next) => {
  const { quizName, responses } = req.body;
  try {
    const quiz = await Quiz.findOne({ quizName: quizName }).populate(
      "questions"
    );
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }
    let questionId_to_questionString = new Map();
    quiz.questions.forEach((question) => {
      questionId_to_questionString.set(
        question._id.toString(),
        question.question
      );
    });
    let payload = []; //we have qestion to ans.
    const maxScore = quiz.maxScore;
    const totalQuestion = quiz.totalQuestion;
    payload.push({ maxScore: maxScore, totalQuestion: totalQuestion });
    responses.forEach((response) => {
      // console.log(response.questionId, response.userResponse);
      const pair = {
        question: questionId_to_questionString.get(response.questionId),
        userResponse: response.userResponse,
      };
      payload.push(pair);
    });
    const evaluation = await groqService.scoreQuiz(payload);
    const prev_attempt = await Submission.findOne({
      quizId: quizName,
      userId: req.user._id,
    })
      .sort({ _id: -1 })
      .exec();
    let attempt = 1;
    if (prev_attempt) {
      attempt = prev_attempt.attempt + 1;
    }
    const new_submission = new Submission({
      quizId: quizName,
      userId: new mongoose.Types.ObjectId(`${req.user._id}`),
      score: evaluation.finalScore,
      attempt: attempt,
      suggestions: evaluation.suggestions,
    });
    const saved_submission = await new_submission.save();
    emailService.sendMail(evaluation, quizName, req.user.email);
    const all_submissions = await Submission.find({
      quizId: quizName,
      userId: req.user._id,
    })
      .sort({ attempt: -1 })
      .exec();
    return res.status(200).send({
      message: "Quiz submitted successfully",
      score: saved_submission.score,
      all_attempts: all_submissions,
    });
  } catch (error) {
    return res.status(500).send({
      message: "an error occured while submitting the quiz",
      error: error.message,
    });
  }
};

module.exports.retrieveQuiz = async (req, res, next) => {
  const filter = utility.getFilter(req);
  try {
    const quizHistory = await Submission.find(filter).sort({
      completedDate: -1,
    });
    return res
      .status(200)
      .json({ message: "Quiz history retrieved successfully", quizHistory });
  } catch (error) {
    return res.status(500).send({
      message: "An error occurred while retrieving quiz history",
      error: error.message,
    });
  }
};

module.exports.getHints = async (req, res, next) => {
  const questionId = req.params.questionId;
  try {
    const question = await Question.findById(questionId);
    const hint = question.hint;
    res.status(200).send({ message: "Hint fetched successfully", hint: hint });
  } catch (error) {
    res
      .status(500)
      .send({ message: "An error occured while generating hints" });
  }
};

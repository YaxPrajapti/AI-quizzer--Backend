const { default: mongoose, mongo } = require("mongoose");
const groqService = require("../services/groqService");
const utility = require("../utility/quizUtility");
const Question = require("../models/question");
const Quiz = require("../models/quiz");
const Submission = require("../models/submission");
const emailService = require("../services/emailService");
const redisCache = require("../cache/quizCache");

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
    const quizWithQuestion = await Quiz.findById(saved_quiz._id).populate(
      "questions"
    );
    await redisCache.save_quiz(quizName, quizWithQuestion);
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
      questionId_to_questionString.set(question._id.toString(), {
        questionText: question.question,
        options: question.options,
        answer: question.answer,
      });
    });
    let payload = []; // this will be sent to groq AI.
    const maxScore = quiz.maxScore;
    const totalQuestion = quiz.totalQuestion;
    payload.push({ maxScore: maxScore, totalQuestion: totalQuestion });
    let submissionQuestions = [];
    responses.forEach((response) => {
      const questionDetails = questionId_to_questionString.get(
        response.questionId
      );
      //add question details to array to add into submission schema.
      submissionQuestions.push({
        questionText: questionDetails.questionText,
        options: questionDetails.options,
        answer: questionDetails.answer,
      });
      const pair = {
        question: questionDetails.questionText,
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
      questions: submissionQuestions,
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
      total_attempts: all_submissions.length,
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
    const quizHistory = await Submission.find(filter)
      .sort({
        score: -1,
      })
      .skip(1)
      .limit(1);
    console.log(quizHistory);
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

module.exports.getQuiz = async (req, res, next) => {
  try {
    console.log("Getting quiz from redis cache");
    let cached_quiz = await redisCache.get_quiz(req.params.quizName);
    cached_quiz = JSON.parse(cached_quiz);
    if (cached_quiz) {
      console.log("Quiz found in Redis cache.");
      return res
        .status(200)
        .send({ message: "Quiz fetched successfull", cached_quiz });
    }
    const quiz = await Quiz.findOne({ quizName: req.params.quizName }).populate(
      "questions"
    );
    if (!quiz) {
      return res.status(404).send({ message: "Quiz not found." });
    }
    await redisCache.save_quiz(req.params.quizName, JSON.stringify(quiz), {
      EX: 3600,
    });
    console.log("Quiz stored in Redis cache.");
    return res.status(200).send({
      message: "Quiz fetched from database",
      quiz,
    });
  } catch (error) {
    console.error("Error fetching quiz:", error.message);
    return res.status(500).send({
      message: "Error occurred while fetching quiz",
      error: error.message,
    });
  }
};

module.exports.getAll = async (req, res, next) => {
  // console.log(req.pageFormat);
  const pageFormat = req.pageFormat;
  const { skip, limit } = pageFormat;
  try {
    const quizzes = await Quiz.find()
      .populate("questions")
      .skip(skip)
      .limit(limit)
      .sort({ createAt: -1 });
    console.log(quizzes.length);
    return res.status(200).send({
      message: "Quizzes fetched successfully",
      quizzes,
      pageFormat,
      length: quizzes.length,
    });
  } catch (error) {
    console.error("Error fetching all quizzes:", error.message);
    return res.status(500).send({
      message: "Error occurred while fetching all quizzes",
      error: error.message,
    });
  }
};

module.exports.editQuestion = async (req, res, next) => {
  const questionId = req.params.questionId;
  const new_question = req.body;
  try {
    const oldQuestion = await Question.findById(questionId);
    const new_updated_question = await Question.findByIdAndUpdate(
      questionId,
      {
        question: new_question.question,
        options: new_question.options,
        answer: new_question.answer,
        hint: new_question.hint,
      },
      { new: true }
    );
    await new_updated_question.save();
    res
      .status(200)
      .send({ message: "Question updated successfully", new_updated_question });
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error while updating the question", error: error });
  }
};

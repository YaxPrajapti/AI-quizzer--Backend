const express = require("express");
const quizController = require("../controller/quizController");
const authMiddleWare = require("../middleware/authMiddleWare");
const redisCache = require("../cache/quizCache");
const rateLimiter = require("../middleware/rateLimiter");

const router = express.Router();

router.post("/new", authMiddleWare.isAuthenticated, quizController.newQuiz);
router.post(
  "/submit",
  authMiddleWare.isAuthenticated,
  quizController.submitQuiz
);
router.get(
  "/quiz-history",
  authMiddleWare.isAuthenticated,
  rateLimiter.allowUser,
  quizController.retrieveQuiz
);
router.post(
  "/quiz-retry",
  authMiddleWare.isAuthenticated,
  quizController.submitQuiz
);
router.get(
  "/hints/:questionId",
  authMiddleWare.isAuthenticated,
  quizController.getHints
);
router.get(
  "/getAllQuiz",
  authMiddleWare.isAuthenticated,
  quizController.getAll
);
router.get(
  "/:quizName",
  authMiddleWare.isAuthenticated,
  quizController.getQuiz
);

module.exports = router;

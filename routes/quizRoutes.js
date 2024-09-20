const express = require("express");
const quizController = require("../controller/quizController");
const authMiddleWare = require("../middleware/authMiddleWare");
const rateLimiter = require("../middleware/rateLimiter");
const paginationFormat = require("../middleware/paginationFormat");

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
  rateLimiter.tokenBucket,
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
  paginationFormat.contructPage,
  quizController.getAll
);
router.get(
  "/:quizName",
  authMiddleWare.isAuthenticated,
  quizController.getQuiz
);
router.put(
  "/edit/:questionId",
  authMiddleWare.isAuthenticated,
  quizController.editQuestion
);

module.exports = router;

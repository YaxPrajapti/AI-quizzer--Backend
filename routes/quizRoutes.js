const express = require("express");
const quizController = require("../controller/quizController");
const authMiddleWare = require('../middleware/authMiddleWare'); 

const router = express.Router();

router.post("/new", authMiddleWare.isAuthenticated, quizController.newQuiz);
router.post('/submit', authMiddleWare.isAuthenticated, quizController.submitQuiz);

module.exports = router;

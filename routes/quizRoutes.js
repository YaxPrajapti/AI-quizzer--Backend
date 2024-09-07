const express = require("express");
const quizController = require("../controller/quizController");
const authMiddleWare = require('../middleware/authMiddleWare'); 

const router = express.Router();

router.post("/new", authMiddleWare.isAuthenticated, quizController.newQuiz);

module.exports = router;

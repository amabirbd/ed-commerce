const express = require("express");
const router = express.Router();

const {
    getQuizzes,
    getQuiz,
    addQuiz,
    updateQuiz,
    deleteQuiz,
    getAllQuizzesHistory,
    getQuizzesHistoryByUser,
    quizAttempt,
    getRandomQuiz,
} = require("../controllers/quizzes.controller");

router.get("/quizzes", getQuizzes);
router.get("/quiz/:uuid", getQuiz);
router.post("/quiz", addQuiz);
router.put("/quiz/:uuid", updateQuiz);
router.delete("/quiz/:uuid", deleteQuiz);

router.get("/quizzes_history", getAllQuizzesHistory);
router.get("/quizzes_history/:id", getQuizzesHistoryByUser);

router.get("/random_quiz", getRandomQuiz);
router.post("/quiz_attempt", quizAttempt);

module.exports = router;

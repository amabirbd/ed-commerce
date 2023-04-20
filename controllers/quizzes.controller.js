const httpStatus = require("http-status");

const catchAsync = require("../utils/catchAsync");
const apiResponse = require("../utils/apiResponse");

const Quizzes = require("../models/quizzes.model");
const QuizzesHistory = require("../models/quizzesHistory.model");
const EcAccount = require("../models/ecAccount.model");

const getQuizzes = catchAsync(async (req, res) => {

    // const data = await Quizzes.findAll();

    const data = await Quizzes.findAll({
        order: [['created_at', 'DESC']]
    });

    return apiResponse(res, httpStatus.OK, { data, message: "Successfully retrieved all quizzes." });
});

const getQuiz = catchAsync(async (req, res) => {

    const { uuid } = req.params;

    const data = await Quizzes.findOne({
        where: {
            uuid: uuid,
        }
    });

    if (data === null) {
        return apiResponse(res, httpStatus.NOT_FOUND, { message: "No quiz found." });
    }

    return apiResponse(res, httpStatus.OK, { data, message: "Quiz successfully retrieved." });
});

const addQuiz = catchAsync(async (req, res) => {

    const { question, option_1, option_2, option_3, option_4, answer, explanation, category, language } = req.body;

    const data = await Quizzes.create({ question, option_1, option_2, option_3, option_4, answer, explanation, category, language });

    return apiResponse(res, httpStatus.OK, { data, message: "Quiz successfully added." });
});

const updateQuiz = catchAsync(async (req, res) => {
    const { uuid } = req.params;
    const { question, option_1, option_2, option_3, option_4, answer, explanation, category, language } = req.body;

    const data = await Quizzes.update(
        { question, option_1, option_2, option_3, option_4, answer, explanation, category, language },
        {
            where: {
                uuid: uuid,
            }
        }
    );

    if (data == 0) {
        return apiResponse(res, httpStatus.NOT_FOUND, { message: "Quiz not found, update failed." });
    }

    return apiResponse(res, httpStatus.OK, { data, message: "Quiz successfully updated." });
});

const deleteQuiz = catchAsync(async (req, res) => {
    const { uuid } = req.params;

    const data = await Quizzes.destroy({
        where: {
            uuid: uuid,
        },
    });

    if (data === 0) {
        return apiResponse(res, httpStatus.NOT_FOUND, { message: "Quiz not found, deletion failed." });
    }

    return apiResponse(res, httpStatus.OK, { message: "Quiz successfully deleted." });
});

const getAllQuizzesHistory = catchAsync(async (req, res) => {

    // const data = await QuizzesHistory.findAll();

    const data = await QuizzesHistory.findAll({
        order: [['created_at', 'DESC']]
    });

    return apiResponse(res, httpStatus.OK, { data, message: "Successfully retrieved all quizzes history." });
});

const getQuizzesHistoryByUser = catchAsync(async (req, res) => {

    const { id } = req.params;

    const data = await QuizzesHistory.findAll({
        where: {
            ec_account_id: id,
        },
        order: [['created_at', 'DESC']]
    });

    if (data == 0) {
        return apiResponse(res, httpStatus.NOT_FOUND, { message: "No user found." });
    }

    return apiResponse(res, httpStatus.OK, { data, message: "Successfully retrieved all quizzes history of a specific user." });
});

const getRandomQuiz = catchAsync(async (req, res) => {

    const { ec_account_id } = req.body;

    const count = await Quizzes.count();
    if (count === 0) {
        return apiResponse(res, httpStatus.NOT_FOUND, { message: "No quiz found." });
    }

    let firstItemId = await Quizzes.findOne({ order: [['id', 'ASC']] });
    let lastItemId = await Quizzes.findOne({ order: [['id', 'DESC']] });
    firstItemId = firstItemId.id;
    lastItemId = lastItemId.id;

    let randomId = Math.floor(Math.random() * (lastItemId - firstItemId + 1) + firstItemId);

    let data = await Quizzes.findOne({ where: { id: randomId } });
    let hasAttempted = await QuizzesHistory.findOne({ where: { ec_account_id, quiz_id: randomId } });

    while (!data || hasAttempted) {
        randomId = Math.floor(Math.random() * (lastItemId - firstItemId + 1) + firstItemId);
        data = await Quizzes.findOne({ where: { id: randomId } });
        hasAttempted = await QuizzesHistory.findOne({ where: { ec_account_id, quiz_id: randomId } });
    }

    return apiResponse(res, httpStatus.OK, { data, message: "Random quiz successfully retrieved." });
});

const quizAttempt = catchAsync(async (req, res) => {

    const { ec_account_id, quiz_id, answer } = req.body;

    const quiz = await Quizzes.findOne({ where: { id: quiz_id } });

    const is_correct = quiz.answer === answer ? true : false;

    const data = await QuizzesHistory.create({ ec_account_id, quiz_id, answer, is_correct });

    const ecAccount = await EcAccount.findOne({ where: { id: ec_account_id } });
    if (is_correct) {
        await ecAccount.increment("points", { by: 2 });
    } else {
        await ecAccount.decrement("points", { by: 1 });
    }

    return apiResponse(res, httpStatus.OK, { data, message: "Successfully recorded quiz attempt." });
});

module.exports = {
    getQuizzes, getQuiz, addQuiz, updateQuiz, deleteQuiz,
    getAllQuizzesHistory, getQuizzesHistoryByUser,
    getRandomQuiz, quizAttempt,
}

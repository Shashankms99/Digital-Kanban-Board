const express = require('express');
const router = express.Router();
const ensureAuthenticated = require('../Middlewares/Auth');
const { getUsertasks } = require('../Controllers/UserTaskController');

router.get('/tasks', ensureAuthenticated, getUsertasks);

module.exports = router;
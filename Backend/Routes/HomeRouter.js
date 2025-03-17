const { getUserProjects } = require('../Controllers/HomeController');
const { getUserProjectsValidation } = require('../Middlewares/HomeValidation');
const ensureAuthenticated = require('../Middlewares/Auth'); 

const router = require('express').Router();

router.get('/projects', ensureAuthenticated, getUserProjectsValidation, getUserProjects);

module.exports = router;
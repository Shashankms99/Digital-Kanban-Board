const { createProject } = require('../Controllers/CreateProjectController');
const { createProjectValidation } = require('../Middlewares/CreateProjectValidation');
const ensureAuthenticated = require('../Middlewares/Auth'); 

const router = require('express').Router();

router.post('/create', ensureAuthenticated, createProjectValidation, createProject);

module.exports = router;
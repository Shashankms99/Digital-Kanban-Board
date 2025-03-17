const { addUserToProject } = require('../Controllers/AddUserController');
const { addUserValidation } = require('../Middlewares/AddUserValidation');
const ensureAuthenticated = require('../Middlewares/Auth'); 

const router = require('express').Router();

router.post('/add', ensureAuthenticated, addUserValidation, addUserToProject);

module.exports = router;

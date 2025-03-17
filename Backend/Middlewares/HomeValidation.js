const Joi = require('joi');

const getUserProjectsValidation = (req, res, next) => {
    const schema = Joi.object({
        employeeId: Joi.string().alphanum().min(1).max(50).optional(), 
    });

    const { error } = schema.validate(req.query); 
    if (error) {
        return res.status(400).json({
            message: 'Bad request. Invalid input parameters.',
            error: error.details,
        });
    }
    next();
};

module.exports = { getUserProjectsValidation };
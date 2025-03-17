const Joi = require('joi');

const sprintValidation = (req, res, next) => {
    const schema = Joi.object({
        projectId: Joi.string().required(),
        name: Joi.string().min(3).max(100).required(),
        startDate: Joi.date().optional(),
        endDate: Joi.date().optional(),
        duration: Joi.string().valid('2 weeks', '3 weeks', '4 weeks').optional(),
        status: Joi.string().valid('created', 'started', 'completed').optional(),
        sprintItems: Joi.array().items(Joi.string()).optional(),
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: 'Bad request', error: error.details });
    }
    next();
};

module.exports = { sprintValidation };
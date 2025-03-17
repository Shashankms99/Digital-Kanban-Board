const Joi = require('joi');

const addUserValidation = (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string().email().required().messages({
            'string.empty': 'Email is required.',
            'string.email': 'Invalid email format.',
        }),
        projectId: Joi.string().alphanum().length(24).required().messages({
            'string.empty': 'Project ID is required.',
            'string.alphanum': 'Invalid Project ID format.',
            'string.length': 'Project ID must be a 24-character string.',
        }),
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({
            message: "Bad request. Please provide valid email and project ID.",
            error: error.details,
        });
    }
    next();
};

module.exports = {addUserValidation,};
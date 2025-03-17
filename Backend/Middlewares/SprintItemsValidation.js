const Joi = require('joi');

const sprintItemsValidation = (req, res, next) => {
    const schema = Joi.object({
        projectId: Joi.string().required().messages({
            'string.empty': 'Project ID is required.',
            'any.required': 'Project ID is missing.',
        }),
        sprintId: Joi.string().required().messages({
            'string.empty': 'Sprint ID is required.',
            'any.required': 'Sprint ID is missing.',
        }),
        summary: Joi.string().min(3).max(100).required().messages({
            'string.empty': 'Summary is required.',
            'string.min': 'Summary must be at least 3 characters long.',
            'string.max': 'Summary cannot exceed 100 characters.',
            'any.required': 'Summary is missing.',
        }),
        issueType: Joi.string().valid('Epic', 'Bug', 'Story', 'Task').required().messages({
            'any.only': 'Issue type must be one of Epic, Bug, Story, or Task.',
            'any.required': 'Issue type is required.',
        }),
        description: Joi.string().allow('').messages({
            'string.base': 'Description must be a string.',
        }),
        priority: Joi.string().valid('Low', 'Medium', 'High').default('Medium').messages({
            'any.only': 'Priority must be one of Low, Medium, or High.',
        }),
        reporter: Joi.string().email().required().messages({
            'string.empty': 'Reporter email is required.',
            'string.email': 'Reporter must be a valid email address.',
            'any.required': 'Reporter email is missing.',
        }),
        assignee: Joi.string().email().optional().allow('').messages({
            'string.email': 'Assignee must be a valid email address.',
        }),
        storyPoints: Joi.number().min(0).required().messages({
            'number.base': 'Story Points must be a number.',
            'number.min': 'Story Points cannot be negative.',
            'any.required': 'Story Points are required.',
        }),
        backlogId: Joi.string().optional().allow('').messages({
            'string.base': 'Backlog ID must be a string.',
        }),
        parent: Joi.object({
            id: Joi.string().optional()
                .messages({
                    'string.empty': 'Parent ID cannot be empty.'
                }),
            model: Joi.string().valid('backlogs', 'sprintitems').optional()
                .messages({
                    'any.only': 'Parent model must be one of the following: backlogs, sprintitems.'
                }),
        }).optional(),
        child: Joi.array().items(
            Joi.object({
                id: Joi.string().required()
                    .messages({
                        'string.empty': 'Child ID cannot be empty.',
                        'any.required': 'Each child must have an ID.'
                    }),
                model: Joi.string().valid('backlogs', 'sprintitems').required()
                    .messages({
                        'any.only': 'Child model must be one of the following: backlogs, sprintitems.',
                        'any.required': 'Each child must specify a valid model.'
                    }),
            })
        ).optional()
    });

    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        const errorMessages = error.details.map(err => err.message);
        console.log('Validation Errors:', errorMessages);
        return res.status(400).json({ 
            message: 'Validation failed', 
            errors: errorMessages 
        });
    }
    next();
};

module.exports = { sprintItemsValidation };
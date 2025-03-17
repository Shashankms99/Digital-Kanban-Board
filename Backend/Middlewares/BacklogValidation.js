const Joi = require('joi');

const createBacklogValidation = (req, res, next) => {
    console.log('Request Body:', req.body);

    const schema = Joi.object({
        projectId: Joi.string().required()
            .messages({
                'any.required': 'Project ID is required to associate this backlog item with a project.'
            }),
        summary: Joi.string().min(3).max(100).required()
            .messages({
                'string.empty': 'Summary cannot be empty.',
                'string.min': 'Summary should be at least 3 characters long.',
                'string.max': 'Summary should not exceed 100 characters.',
                'any.required': 'Summary is required as it serves as the unique issue identifier.'
            }),
        issueType: Joi.string().valid('Epic', 'Bug', 'Story', 'Task').required()
            .messages({
                'any.only': 'Issue type must be one of the following: Epic, Bug, Story, or Task.',
                'any.required': 'Issue type is required to categorize the backlog item.'
            }),
        description: Joi.string().max(500).allow('').optional()
            .messages({
                'string.max': 'Description should not exceed 500 characters.'
            }),
        priority: Joi.string().valid('Low', 'Medium', 'High').default('Medium')
            .messages({
                'any.only': 'Priority must be one of the following: Low, Medium, or High.'
            }),
        status: Joi.string().valid('To Do', 'In Progress', 'Done').default('To Do')
            .messages({
                'any.only': 'Status must be one of the following: To Do, In Progress, or Done.'
            }),
        reporter: Joi.string().email().required()
            .messages({
                'string.email': 'Reporter must be a valid email address.',
                'any.required': 'Reporter is required to identify who reported the issue.'
            }),
        assignee: Joi.string().email().allow('').optional()
            .messages({
                'string.email': 'Assignee must be a valid email address.'
            }),
        storyPoints: Joi.number().integer().min(0).required()
            .messages({
                'number.base': 'Story Points must be an integer.',
                'number.min': 'Story Points cannot be negative.',
                'any.required': 'Story Points are required for effort estimation.'
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

    const { error, value } = schema.validate(req.body, { abortEarly: false });

    if (error) {
        return res.status(400).json({
            message: "Validation failed.",
            errors: error.details.map(detail => detail.message)
        });
    }

    req.body = value;
    next();
};

module.exports = {createBacklogValidation};
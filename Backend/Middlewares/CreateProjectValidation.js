const Joi = require('joi');

const createProjectValidation = (req, res, next) => {
    const schema = Joi.object({
        projectName: Joi.string().min(3).max(100).required(),
        key: Joi.string().alphanum().min(1).max(50).required(), 
        lead: Joi.string().email().required(), 
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: "Bad request. Name should be atleast 3 letters", error: error.details });
    }
    next();
};


module.exports = {createProjectValidation};
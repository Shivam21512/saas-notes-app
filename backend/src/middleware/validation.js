const Joi = require('joi');

const validateRequest = (schema) => (req, res, next) => {
  console.log('ValidateRequest body:', req.body);
  console.log('Type of email:', typeof req.body.email, 'Value:', req.body.email);

  const { error } = schema.validate(req.body);
  if (error)
    return res.status(400).json({ success: false, message: 'Validation error', errors: error.details.map(d => d.message) });
  next();
};


const authSchemas = {
  login: Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .trim()
      .required(),
    password: Joi.string().min(8).required(),
  }),
};


const noteSchemas = {
  create: Joi.object({
    title: Joi.string().max(200).required(),
    content: Joi.string().max(10000).required(),
    tags: Joi.array().items(Joi.string().trim()).optional(),
  }),
  update: Joi.object({
    title: Joi.string().max(200).optional(),
    content: Joi.string().max(10000).optional(),
    tags: Joi.array().items(Joi.string().trim()).optional(),
    isArchived: Joi.boolean().optional(),
  }),
};

module.exports = { validateRequest, authSchemas, noteSchemas };

const Joi = require('joi');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(detail => detail.message)
      });
    }
    next();
  };
};

const schemas = {
  transaction: Joi.object({
    amount: Joi.number().required().min(0),
    type: Joi.string().valid('income', 'expense').required(),
    category: Joi.string().required(),
    description: Joi.string().max(500),
    date: Joi.date().default(Date.now)
  }),
  
  user: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    name: Joi.string().min(2).max(50).required()
  })
};

module.exports = { validate, schemas };
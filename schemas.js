const Joi = require('joi');

module.exports.foodSchema = Joi.object({
  food: Joi.object({
    name: Joi.string().required(),
    description: Joi.string().allow(''),
    calories: Joi.number().required().min(0),
    grams: Joi.number().required().min(0),
    image: Joi.string().allow('')
  }).required()
});

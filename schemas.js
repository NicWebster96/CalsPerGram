const Joi = require('joi');

module.exports.foodSchema = Joi.object({
  food: Joi.object({
    name: Joi.string().required(),
    calories: Joi.number().required().min(0),
    grams: Joi.number().required().min(0)
  }).required()
});

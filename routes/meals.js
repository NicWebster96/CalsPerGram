const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/catchAsync');
const Food = require('../models/food');
const Meal = require('../models/meal');

router.get(
  '/',
  catchAsync(async (req, res, next) => {
    const meals = await Meal.find({});
    res.render('meals/index', { meals });
  })
);

router.get('/new', async (req, res) => {
  const foods = await Food.find();
  res.render('meals/new', { foods });
});

router.get(
  '/:id/addToMeal',
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const meals = await Meal.find();
    res.render(`meals/select`, { meals });
  })
);

router.post(
  '/',
  // validateFood,
  catchAsync(async (req, res, next) => {
    const meal = new Meal(req.body.meal);
    await meal.save();
    res.redirect(`/meals/${meal._id}`);
  })
);

router.get(
  '/:id',
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const meal = await Meal.findById(id).populate('ingredients');
    res.render('meals/show', { meal });
  })
);

router.get(
  '/:id/edit',
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const foods = await Food.find();
    const meal = await Meal.findById(id);
    const ingredientsList = meal.ingredients;
    res.render('meals/edit', { meal, foods, ingredientsList });
  })
);

router.put(
  '/:id',
  // validateFood,
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const meal = await Meal.findByIdAndUpdate(id, { ...req.body.meal });
    res.redirect(`/meals/${meal._id}`);
  })
);

router.delete(
  '/:id',
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    await Meal.findByIdAndDelete(id);
    res.redirect(`/meals`);
  })
);

module.exports = router;

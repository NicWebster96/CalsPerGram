const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/expressError');
const Food = require('../models/food');
const { foodSchema } = require('../schemas');

const validateFood = (req, res, next) => {
  const { error } = foodSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(',');
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

router.get(
  '/',
  catchAsync(async (req, res, next) => {
    const foods = await Food.find({});
    res.render('foods/index', { foods });
  })
);

router.get('/new', (req, res) => {
  res.render('foods/new');
});

router.post(
  '/',
  validateFood,
  catchAsync(async (req, res, next) => {
    const food = new Food(req.body.food);
    await food.save();
    req.flash('success', 'Successfully added a new food');
    res.redirect(`/foods/${food._id}`);
  })
);

router.get(
  '/:id',
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const food = await Food.findById(id);
    res.render('foods/show', { food });
  })
);

router.get(
  '/:id/edit',
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const food = await Food.findById(id);
    res.render('foods/edit', { food });
  })
);

router.put(
  '/:id',
  validateFood,
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const food = await Food.findByIdAndUpdate(id, { ...req.body.food });
    res.redirect(`/foods/${food._id}`);
  })
);

router.delete(
  '/:id',
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    await Food.findByIdAndDelete(id);
    res.redirect(`/foods`);
  })
);

module.exports = router;

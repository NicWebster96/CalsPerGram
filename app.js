const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/expressError');
const Food = require('./models/food');
const Meal = require('./models/meal');
const Joi = require('joi');
const { foodSchema } = require('./schemas');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');

mongoose.connect('mongodb://localhost:27017/food-list', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Database connected!');
});

const app = express();

app.engine('ejs', ejsMate);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

const validateFood = (req, res, next) => {
  const { error } = foodSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(',');
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

app.get('/', (req, res) => {
  res.send('Hello from CPG!');
});

app.get(
  '/foods',
  catchAsync(async (req, res, next) => {
    const foods = await Food.find({});
    res.render('foods/index', { foods });
  })
);

app.get(
  '/meals',
  catchAsync(async (req, res, next) => {
    const meals = await Meal.find({});
    res.render('meals/index', { meals });
  })
);

app.get('/foods/new', (req, res) => {
  res.render('foods/new');
});

app.get('/meals/new', async (req, res) => {
  const foods = await Food.find();
  res.render('meals/new', { foods });
});

app.get(
  '/meals/:id/addToMeal',
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const meals = await Meal.find();
    res.render(`meals/select`, { meals });
  })
);

app.post(
  '/foods',
  validateFood,
  catchAsync(async (req, res, next) => {
    const food = new Food(req.body.food);
    await food.save();
    res.redirect(`/foods/${food._id}`);
  })
);

app.post(
  '/meals',
  // validateFood,
  catchAsync(async (req, res, next) => {
    const meal = new Meal(req.body.meal);
    await meal.save();
    res.redirect(`/meals/${meal._id}`);
  })
);

app.get(
  '/foods/:id',
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const food = await Food.findById(id);
    res.render('foods/show', { food });
  })
);

app.get(
  '/meals/:id',
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const meal = await Meal.findById(id).populate('ingredients');
    res.render('meals/show', { meal });
  })
);

app.get(
  '/foods/:id/edit',
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const food = await Food.findById(id);
    res.render('foods/edit', { food });
  })
);

app.get(
  '/meals/:id/edit',
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const foods = await Food.find();
    const meal = await Meal.findById(id);
    const ingredientsList = meal.ingredients;
    res.render('meals/edit', { meal, foods, ingredientsList });
  })
);

app.put(
  '/foods/:id',
  validateFood,
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const food = await Food.findByIdAndUpdate(id, { ...req.body.food });
    res.redirect(`/foods/${food._id}`);
  })
);

app.put(
  '/meals/:id',
  // validateFood,
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const meal = await Meal.findByIdAndUpdate(id, { ...req.body.meal });
    res.redirect(`/meals/${meal._id}`);
  })
);

app.delete(
  '/foods/:id',
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    await Food.findByIdAndDelete(id);
    res.redirect(`/foods`);
  })
);

app.delete(
  '/meals/:id',
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    await Meal.findByIdAndDelete(id);
    res.redirect(`/meals`);
  })
);

app.all('*', (req, res, next) => {
  next(new ExpressError('Page Not Found', 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) {
    err.message = 'Aww man, something went wrong!';
  }
  res.status(statusCode).render('error', { err });
});

app.listen(3000, () => {
  console.log('Serving on port 3000');
});

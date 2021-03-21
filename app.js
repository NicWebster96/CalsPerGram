const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/expressError');
const Food = require('./models/food');
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

app.get('/foods/new', (req, res) => {
  res.render('foods/new');
});

app.post(
  '/foods',
  validateFood,
  catchAsync(async (req, res, next) => {
    const food = new Food(req.body.food);
    await food.save();
    res.redirect(`/foods/${food._id}`);
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
  '/foods/:id/edit',
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const food = await Food.findById(id);
    res.render('foods/edit', { food });
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

app.delete(
  '/foods/:id',
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    await Food.findByIdAndDelete(id);
    res.redirect(`/foods`);
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

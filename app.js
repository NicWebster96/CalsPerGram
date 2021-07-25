const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ExpressError = require('./utils/expressError');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const foods = require('./routes/foods');
const meals = require('./routes/meals');

mongoose.connect('mongodb://localhost:27017/food-list', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false
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
app.use(express.static(path.join(__dirname, 'public')));
app.use('/foods', foods);
app.use('/meals', meals);

// const validateFood = (req, res, next) => {
//   const { error } = foodSchema.validate(req.body);
//   if (error) {
//     const msg = error.details.map((el) => el.message).join(',');
//     throw new ExpressError(msg, 400);
//   } else {
//     next();
//   }
// };

app.get('/', (req, res) => {
  res.send('Hello from CPG!');
});

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

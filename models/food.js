const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FoodSchema = new Schema({
  name: String,
  description: String,
  calories: Number,
  grams: Number,
  image: String
});

module.exports = mongoose.model('Food', FoodSchema);

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MealSchema = new Schema({
  name: String,
  body: String,
  ingredients: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Food'
    }
  ]
});

module.exports = mongoose.model('Meal', MealSchema);

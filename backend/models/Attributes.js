// models/Attributes.js
const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({ name: { type: String, required: true, unique: true } });
const ItemSchema = new mongoose.Schema({ name: { type: String, required: true, unique: true } });
const TypeSchema = new mongoose.Schema({ name: { type: String, required: true, unique: true } });
// const VariantSchema = new mongoose.Schema({ name: { type: String, required: true, unique: true } });

module.exports = {
  Category: mongoose.model('Category', CategorySchema),
  Item: mongoose.model('Item', ItemSchema),
  Type: mongoose.model('Type', TypeSchema),
//   Variant: mongoose.model('Variant', VariantSchema),
};
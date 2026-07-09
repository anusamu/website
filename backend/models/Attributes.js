const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({ 
  name: { type: String, required: true,  } 
});

const ItemSchema = new mongoose.Schema({ 
  name: { type: String, required: true, } 
});

const TypeSchema = new mongoose.Schema({ 
  name: { type: String, required: true,} 
});

const MaterialSchema = new mongoose.Schema({ 
  name: { type: String, required: true,  } 
});

const CollectSchema = new mongoose.Schema({ 
  name: { type: String, required: true,} 
});

// const VariantSchema = new mongoose.Schema({ name: { type: String, required: true, unique: true } });

module.exports = {
  Category: mongoose.model('Category', CategorySchema),
  Item: mongoose.model('Item', ItemSchema),
  Type: mongoose.model('Type', TypeSchema),
  Material: mongoose.model('Material', MaterialSchema),
  Collect: mongoose.model('Collect', CollectSchema),
// Variant: mongoose.model('Variant', VariantSchema),
};
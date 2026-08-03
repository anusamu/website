const mongoose = require('mongoose');

const blogSectionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: false
  },
  imageUrl: {
    type: String,
    required: false
  }
});

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  snippet: {
    type: String,
    required: true
  },
  coverImage: {
    type: String,
    required: true
  },
  readingTime: {
    type: String,
    default: '5 mins'
  },
  sections: [blogSectionSchema],
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'published'
  }
}, { timestamps: true });

module.exports = mongoose.model('Blog', blogSchema);

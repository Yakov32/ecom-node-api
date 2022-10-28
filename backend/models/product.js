const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
   name: {
      type: String,
      required: true
   },
   description: {
      type: String,
      required: true,
   },
   richDescription: {
      type: String,
      default: ''
   },
   image: {
      type: String,
      default: ''
   },
   images: [{
      type: String
   }],
   brand: {
      type: String,
      default: ''
   },
   price : {
      type: Number,
      default: 0
   },
   category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true
   },
   countInStock: {
      type: Number,
      required: true,
      min: 0,
      max: 255
   },
   rating: {
      type: Number,
      default: 0,
   },
   numReviews: {
      type: Number,
      default: 0,
   },
   isFeatured: {
      type: Boolean,
      default: false,
   },
   dateCreated: {
      type: Date,
      default: Date.now(),
   },
});

exports.Product = mongoose.model('Product', productSchema);

/* test product
{
  "name": "zubachistki pachka",
  "description": "pasha abobys",
  "richDescription": "a long item in inverntory that true",
  "image": "some url",
  "images": [],
  "brand": "",
  "price": 0,
  "category": "63553a8d1dd2813457d6f473",
  "countInStock": 51,
  "rating": 0,
  "numReviews": 0,
  "isFeatured": true
}
*/
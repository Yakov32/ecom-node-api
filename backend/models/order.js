const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({

   orderItems: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OrderItem',
      required: true,
   }],

   shippingAddress1: {
      type: String,
      required: true,
   },

   shippingAddress2: {
      type: String,
      default: '',
   },

   city: {
      type: String,
      required: true,
   },

   zip: {
      type: String,
      required: true,
   },

   country: {
      type: String,
      required: true,
   },

   status: {
      type: String,
      required: true,
      default: 'Pending',
   },

   user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
   },

   totalPrice: {
      type: Number,
      required: true,
   },

   phone: {
      type: String,
      required: true,

   },

   dateOrdered: {
      type: Date,
      default: Date.now,
   }
});

orderSchema.virtual('id').get(function () {
   return this._id.toHexString();
});

orderSchema.virtual('id').set('toJSON', {
   virtuals: true,
});


exports.Order = mongoose.model('Order', orderSchema);


/* Order example

{
   "orderItems" : [
      {
         "product" : "63564e51457bf99dee05bc4d",
         "quantity" : 3
      },
      {
         "product": "63569c6254832d36b6653ad2",
         "quantity": 2
      }
   ],
   "shippingAddress1" : "Flower street, 45",
   "city": "London",
   "zip": "00000",
   "country": "Britania", 
   "user": "6358e9eed2c494ae80b60dfa",
   "phone": "3801231231"
}
*/
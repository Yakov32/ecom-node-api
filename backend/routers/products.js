const {Product} = require('./../models/product');
const {Category} = require('./../models/category');
const express = require('express');
const Err = require('./../errors/error');
const router = express.Router();
const mongoose = require('mongoose');

router.get(`/`, async (req, res) => {

   try{
      filter = {};

      if(req.query.category){
         filter.category = req.query.category.split(',');
      }

      const productList = await Product.find(filter).populate('category');
      
      if(!productList){
         res.status(500).json({success: false});
      }
      res.send(productList);
   } catch (err) {
      res.status(500).json(err);
   }
});

router.get('/:id', (req, res) => {
   
   Product.findById(req.params.id).populate('Category').then(product => {
      if(!product) {
         return res.status(404).send({success: false, message: "product not found"})
      }

      res.send(product);
   }).catch(err => res.status(400).json({success:false, error: err}));
});

router.get('/get/count', async (req, res) => {
   const count  = await Product.countDocuments();

   if(count){
      res.json(count)
   } else {
      res.status(500).json(new Err('something wrong'));
   }
   
});

router.get('/get/featured/:count', async (req, res) => {
   const count = req.params.count ? req.params.count : 0;
   const products  = await Product.find({isFeatured: true}).limit(+count);

   if(products){
      res.json(products)
   } else {
      res.status(500).json(new Err('something wrong'));
   }
   
});

router.post(`/`, async (req, res) => {
   try {
      let category = await Category.findById(req.body.category);

      if(!category) {
         return res.status(400).json({success:false, message: 'invalid category'});
      }

      let product = new Product({
         name: req.body.name,
         description: req.body.description,
         richDescription: req.body.richDescription,
         image: req.body.image,
         brand: req.body.brand,
         price: req.body.price,
         category: req.body.category,
         countInStock: req.body.countInStock,
         rating: req.body.rating,
         numReviews: req.body.numReviews,
         isFeatured: req.body.isFeatured
      });

      product = await product.save();

      if(!product) {
         return res.status(500).json({succes: false, message: 'server error'});
      }
      
      res.send(product);

   }catch (err) {
      res.status(400).json({success: false, error: err, aboba: 228});
   }
});

//OLD PUT С вложенными зенами и кетчами, намного запутаннее чем то что ниже.
// router.put('/:id', (req, res) => {

//    Category.findById(req.body.category).then(category => {
//       if(!category) {
//          return res.status(400).json({success:false, message: 'invalid category'});
//       }
//       Product.findByIdAndUpdate(
//          req.params.id,
//          {
//             name: req.body.name,
//             description: req.body.description,
//             richDescription: req.body.richDescription,
//             image: req.body.image,
//             brand: req.body.brand,
//             price: req.body.price,
//             category: req.body.category,
//             countInStock: req.body.countInStock,
//             rating: req.body.rating,
//             numReviews: req.body.numReviews,
//             isFeatured: req.body.isFeatured
//          },
//          {
//             new: true,
//             runValidators: true,
//          }
//       ).then(updatedProduct => {
//          let a = 5;
//          Product.findById('63554cb67c496ec675af37').then(product => {
//             console.log('ABOBA REVERS-PDODUCT-------', product);
            
//          }).catch(err => console.log('aboba-revers-error-----', err));
//          res.json(updatedProduct);
//       }).catch(productErr => res.status(400).json({success: false, error: productErr, type: 'ProductError'}));
//    }).catch(categoryErr => res.status(400).json({success: false, error: categoryErr, type: 'CategoryError'}));

// });

router.put('/:id', async (req, res) => {
   try {
      if(!mongoose.isValidObjectId(req.body.category)) {
         return res.status(400).json(new Err('invalid category id'))
      }

      let category = await Category.findById(req.body.category);

      if(!category) {
         return res.status(400).json(new Err('invalid category'));
      }

      if(!mongoose.isValidObjectId(req.params.id)) {
         return res.status(400).json(new Err('invalid product id'))
      }

      let product = await Product.findByIdAndUpdate(
         req.params.id,
         {
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: req.body.image,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured
         },
         {
            new: true,
            runValidators: true,
         }
      );
      if(!product) {
         return res.status(400).json({success:false, message: 'product not found'});
      }
      
      // let testProduct = await Product.findById('63554cb67c496ec675af39d7')
      // console.log('ABOBA REVERS-PDODUCT-------', testProduct);
      
      res.json(product);
   } catch (err) {
      res.status(400).json({success: false, error: err});
   }
});

router.delete('/:id', async (req, res ) => {
   
   if(!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json(new Err('invalid id'));
   }

   let delProduct = await Product.findByIdAndDelete(req.params.id);

   if(!delProduct) {
      return res.status(404).json(new Err('Not found'));
   }

   res.json(delProduct);
});
module.exports = router;
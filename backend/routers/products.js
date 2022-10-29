const {Product} = require('./../models/product');
const {Category} = require('./../models/category');
const express = require('express');
const Err = require('./../errors/error');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');


const FILE_TYPE_MAP = {
   'image/png' : 'png',
   'image/jpeg' : 'jpeg',
   'image/jpg' : 'jpg',
};

const storage = multer.diskStorage({
   destination: function (req, file, cb) {
      const isValid = FILE_TYPE_MAP[file.mimetype];
      let uploadError = new Error('invalid image format');

      if(isValid) {
         uploadError = null;
      }

     cb(uploadError, 'public/uploads')
   },
   filename: function (req, file, cb) {
     //const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
     const filename = file.originalname.replace(' ', '');
     const extension = FILE_TYPE_MAP[file.mimetype];
     cb(null, `${filename}-${Date.now()}.${extension}`)
   }
 })

const uploadOptions = multer({storage: storage})

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
   
   Product.findById(req.params.id).populate('category').then(product => {
      if(!product) {
         return res.status(404).send({success: false, message: "product not found"})
      }

      res.send(product);
   }).catch(err => res.status(400).json({success:false, message: err.message, error: err}));
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

router.post(`/`, uploadOptions.single('image'), async (req, res) => {
   try {
      let category = await Category.findById(req.body.category);

      if(!category) {
         return res.status(400).json({success:false, message: 'invalid category'});
      }

      if(!req.file) {
         return res.status(400).json(new Err('No image file in request'));
      }
      const filename = `${req.protocol}://${req.get('host')}/public/upload/${req.file.filename}`;
      
      let product = new Product({
         name: req.body.name,
         description: req.body.description,
         richDescription: req.body.richDescription,
         image: filename,
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
      res.status(400).json({success: false, error: err.message, aboba: 228});
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
      if(req.body.category) {

         if(mongoose.isValidObjectId(req.body.category)){
            return res.status(400).json(new Err('invalid category id'))
         }

         const category = await Category.findById(req.body.category);
         if(!category) {
            return res.status(400).json(new Err('invalid category'));
         }
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

router.put('/update-image/:id', uploadOptions.single('image'), async (req, res) => {
   try {
      if(!mongoose.isValidObjectId(req.params.id)) {
         return res.status(400).json(new Err('invalid product id'))
      }

      if(!req.file) {
         return res.status(400).json(new Err('no image in request'));
      }
      
      let product = await Product.findByIdAndUpdate(
         req.params.id,
         {
            image: `${req.protocol}://${req.get('host')}/public/upload/${req.file.filename}`
         },
         {
            new: true,
            runValidators: true,
         }
      );
      if(!product) {
         return res.status(400).json({success:false, message: 'product not found'});
      }
      res.json(product);

   } catch (err) {
      res.status(400).json({success: false, error: err});
   }
});

router.put('/gallery-images/:id', uploadOptions.array('images', 10), async (req, res) => {
   try {
      if(!mongoose.isValidObjectId(req.params.id)) {
         return res.status(400).json(new Err('invalid product id'))
      }

      const files = req.files;
      let imagesPaths = [];
      if(files) {
         files.map(file => {
            imagesPaths.push(`${req.protocol}://${req.get('host')}/public/upload/${file.filename}`)
         })
      }
      let product = await Product.findByIdAndUpdate(
         req.params.id,
         {
            images: imagesPaths
         },
         {
            new: true,
            runValidators: true,
         }
      );
      if(!product) {
         return res.status(400).json({success:false, message: 'product not found'});
      }
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